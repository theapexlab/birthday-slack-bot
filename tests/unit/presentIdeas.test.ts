import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import type { Mock } from "vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getBirthdays } from "@/db/queries/getBirthdays";
import type { SelectUser } from "@/db/schema";
import { callWithMockCronEvent } from "@/testUtils/callWithMockCronEvent";
import { mockEventBridgePayload } from "@/testUtils/mocks/mockEventBridgePayload";

dayjs.extend(utc);

const constants = vi.hoisted(() => ({
  userId: "U001",
  teamId: "T001",
  secondUserId: "U002",
  eventId: "E001",
}));

vi.mock("@aws-sdk/client-eventbridge", async () => {
  const EventBridgeClient = vi.fn();
  EventBridgeClient.prototype.send = vi.fn();

  const PutEventsCommand = vi.fn();

  return {
    EventBridgeClient,
    PutEventsCommand,
  };
});

vi.mock("@/db/queries/getBirthdays", () => ({
  getBirthdays: vi.fn().mockResolvedValue([]),
}));

describe("Present ideas", () => {
  let eventBridge: EventBridgeClient;
  let getBirthdaysMock: Mock;

  beforeEach(() => {
    eventBridge = new EventBridgeClient();
    getBirthdaysMock = getBirthdays as Mock;
  });

  afterEach(() => {
    vi.clearAllMocks();
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
        id: constants.secondUserId,
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
        user: constants.secondUserId,
        eventId: constants.eventId,
      }),
    );
  });

  it("Should not publish askPresentIdeas event if no user has birthday exactly 2 months from now", async () => {
    await callWithMockCronEvent(constants.eventId);

    expect(eventBridge.send).not.toHaveBeenCalled();
  });
});
