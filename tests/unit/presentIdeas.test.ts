import "@/testUtils/mocks/mockDb";
import "@/testUtils/mocks/mockEventBridge";
import "@/testUtils/mocks/mockSlackApp";

import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import type { Mock } from "vitest";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { getBirthdays } from "@/db/queries/getBirthdays";
import { type SelectUser, users } from "@/db/schema";
import type { Events } from "@/events";
import { handler } from "@/functions/events/askPresentIdeas";
import { constructAskPresentIdeasMessage } from "@/services/slack/constructAskPresentIdeasMessage";
import { createSlackApp } from "@/services/slack/createSlackApp";
import { callWithMockCronEvent } from "@/testUtils/callWithMockCronEvent";
import { mockEventBridgePayload } from "@/testUtils/mocks/mockEventBridgePayload";
import { sendMockSqsMessage } from "@/testUtils/sendMockSqsMessage";
import { testDb } from "@/testUtils/testDb";

dayjs.extend(utc);

const constants = vi.hoisted(() => ({
  userId: "U001",
  teamId: "T001",
  otherUserIds: ["U002", "U003"],
  eventId: "E001",
  namePostfix: "Name",
}));

vi.mock("@/db/queries/getBirthdays", () => ({
  getBirthdays: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/services/slack/getUserInfo", async () => ({
  getUserInfo: vi.fn().mockImplementation((userId: string) =>
    Promise.resolve({
      user: {
        is_bot: false,
        profile: {
          first_name: userId + constants.namePostfix,
        },
      },
    }),
  ),
}));

describe("Present ideas", () => {
  let eventBridge: EventBridgeClient;
  let getBirthdaysMock: Mock;
  let createSlackAppMock: Mock;

  beforeAll(async () => {
    await testDb.delete(users);
  });

  beforeEach(() => {
    eventBridge = new EventBridgeClient();
    getBirthdaysMock = getBirthdays as Mock;
    createSlackAppMock = createSlackApp as Mock;
  });

  afterEach(async () => {
    vi.clearAllMocks();
    await testDb.delete(users);
  });

  it("Should publish askPresentIdeas event if user has birthday exactly 2 months from now", async () => {
    getBirthdaysMock.mockResolvedValueOnce([
      {
        id: constants.userId,
        teamId: constants.teamId,
        birthday: dayjs.utc().add(2, "month").toDate(),
      },
    ] satisfies SelectUser[]);

    await callWithMockCronEvent(constants.eventId);

    expect(eventBridge.send).toHaveBeenCalledOnce();
    expect(PutEventsCommand).toHaveBeenCalledWith(
      mockEventBridgePayload("askPresentIdeas", {
        team: constants.teamId,
        user: constants.userId,
        eventId: constants.eventId,
      }),
    );
  });

  it("Should publish askPresentIdeas event twice if 2 users have birthday exactly 2 months from now", async () => {
    getBirthdaysMock.mockResolvedValueOnce([
      {
        id: constants.userId,
        teamId: constants.teamId,
        birthday: dayjs.utc().add(2, "month").toDate(),
      },
      {
        id: constants.otherUserIds[0],
        teamId: constants.teamId,
        birthday: dayjs.utc().add(2, "month").toDate(),
      },
    ] satisfies SelectUser[]);

    await callWithMockCronEvent(constants.eventId);

    expect(eventBridge.send).toHaveBeenCalledTimes(2);
    expect(PutEventsCommand).toHaveBeenCalledWith(
      mockEventBridgePayload("askPresentIdeas", {
        team: constants.teamId,
        user: constants.userId,
        eventId: constants.eventId,
      }),
    );
    expect(PutEventsCommand).toHaveBeenCalledWith(
      mockEventBridgePayload("askPresentIdeas", {
        team: constants.teamId,
        user: constants.otherUserIds[0],
        eventId: constants.eventId,
      }),
    );
  });

  it("Should not publish askPresentIdeas event if no user has birthday exactly 2 months from now", async () => {
    await callWithMockCronEvent(constants.eventId);

    expect(eventBridge.send).not.toHaveBeenCalled();
  });

  it("Should send dm to team mates", async () => {
    const event = {
      user: constants.userId,
      team: constants.teamId,
      eventId: constants.eventId,
    } satisfies Events["askPresentIdeas"];

    const sendDMMock = vi.spyOn(
      createSlackAppMock().client.chat,
      "postMessage",
    );

    await Promise.all(
      constants.otherUserIds.map((userId) =>
        testDb.insert(users).values({
          id: userId,
          teamId: constants.teamId,
          birthday: dayjs.utc().toDate(),
        }),
      ),
    );

    await sendMockSqsMessage("askPresentIdeas", event, handler);

    expect(sendDMMock).toHaveBeenCalledTimes(constants.otherUserIds.length);

    constants.otherUserIds.forEach((userId) => {
      expect(sendDMMock).toHaveBeenCalledWith(
        constructAskPresentIdeasMessage({
          birthdayPerson: constants.userId,
          user: userId,
          name: userId + constants.namePostfix,
          eventId: constants.eventId,
        }),
      );
    });
  });

  it("Should not send dm to the one whose birthday is coming up", async () => {
    const event = {
      user: constants.userId,
      team: constants.teamId,
      eventId: constants.eventId,
    } satisfies Events["askPresentIdeas"];

    const sendDMMock = vi.spyOn(
      createSlackAppMock().client.chat,
      "postMessage",
    );

    await testDb.insert(users).values({
      id: constants.userId,
      teamId: constants.teamId,
      birthday: dayjs.utc().toDate(),
    });

    await sendMockSqsMessage("askPresentIdeas", event, handler);

    expect(sendDMMock).not.toHaveBeenCalled();
  });
});
