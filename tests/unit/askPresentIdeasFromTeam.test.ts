import "@/testUtils/unit/mockDb";
import "@/testUtils/unit/mockEventBridge";
import "@/testUtils/unit/mockSlackApp";
import "@/testUtils/unit/mockEventScheduler";

import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { users } from "@/db/schema";
import type { Events } from "@/events";
import { handler as askPresentIdeasFromTeam } from "@/functions/events/askPresentIdeasFromTeam";
import { testDb } from "@/testUtils/testDb";
import { mockEventBridgePayload } from "@/testUtils/unit/mockEventBridgePayload";
import { sendMockSqsMessage } from "@/testUtils/unit/sendMockSqsMessage";

dayjs.extend(utc);

const constants = vi.hoisted(() => ({
  userId: "U001",
  teamId: "T001",
  otherUserIds: ["U002", "U003"],
  eventId: "E001",
  namePostfix: "Name",
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

describe("askPresentIdeasFromTeam", () => {
  let eventBridge: EventBridgeClient;

  beforeAll(async () => {
    await testDb.delete(users);
  });

  beforeEach(() => {
    eventBridge = new EventBridgeClient();
  });

  afterEach(async () => {
    vi.clearAllMocks();
    await testDb.delete(users);
  });

  it("Should publish askPresentIdeasFromUser event", async () => {
    const event = {
      birthdayPerson: constants.userId,
      team: constants.teamId,
      eventId: constants.eventId,
    } satisfies Events["askPresentIdeasFromTeam"];

    await testDb.insert(users).values(
      constants.otherUserIds.map((userId) => ({
        id: userId,
        teamId: constants.teamId,
        birthday: dayjs.utc().toDate(),
      })),
    );

    await sendMockSqsMessage(
      "askPresentIdeasFromTeam",
      event,
      askPresentIdeasFromTeam,
    );

    expect(eventBridge.send).toHaveBeenCalledTimes(2);
    constants.otherUserIds.forEach((userId) => {
      expect(PutEventsCommand).toHaveBeenCalledWith(
        mockEventBridgePayload("askPresentIdeasFromUser", {
          user: userId,
          birthdayPerson: constants.userId,
          eventId: constants.eventId,
        }),
      );
    });
  });

  it("Should not publish askPresentIdeasFromUser event for the one whose birthday is coming up", async () => {
    const event = {
      birthdayPerson: constants.userId,
      team: constants.teamId,
      eventId: constants.eventId,
    } satisfies Events["askPresentIdeasFromTeam"];

    await testDb.insert(users).values({
      id: constants.userId,
      teamId: constants.teamId,
      birthday: dayjs.utc().toDate(),
    });

    await sendMockSqsMessage(
      "askPresentIdeasFromTeam",
      event,
      askPresentIdeasFromTeam,
    );

    expect(eventBridge.send).not.toHaveBeenCalled();
  });
});
