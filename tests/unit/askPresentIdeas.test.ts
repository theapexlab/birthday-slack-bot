import "@/testUtils/unit/mockDb";
import "@/testUtils/unit/mockEventBridge";
import "@/testUtils/unit/mockSlackApp";

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
import { handler } from "@/functions/cron/daily";
import { testDb } from "@/testUtils/testDb";
import { mockEventBridgePayload } from "@/testUtils/unit/mockEventBridgePayload";
import { mockLambdaEvent } from "@/testUtils/unit/mockLambdaPayload";

dayjs.extend(utc);

export const callWithMockCronEvent = async (eventId: string) =>
  handler({
    ...mockLambdaEvent,
    queryStringParameters: {
      eventId,
    },
  });

const constants = vi.hoisted(() => ({
  userId: "U001",
  teamId: "T001",
  otherUserIds: ["U002", "U003"],
  eventId: "E001",
}));

describe("Daily cron", () => {
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

  it("Should publish askPresentIdeasFromTeam event if user has birthday exactly 2 months from now", async () => {
    await testDb.insert(users).values({
      id: constants.userId,
      teamId: constants.teamId,
      birthday: dayjs.utc().add(2, "month").toDate(),
    });

    await callWithMockCronEvent(constants.eventId);

    expect(eventBridge.send).toHaveBeenCalledOnce();
    expect(PutEventsCommand).toHaveBeenCalledWith(
      mockEventBridgePayload("askPresentIdeasFromTeam", {
        team: constants.teamId,
        birthdayPerson: constants.userId,
        eventId: constants.eventId,
      }),
    );
  });

  it("Should publish askPresentIdeasFromTeam event twice if 2 users have birthday exactly 2 months from now", async () => {
    await testDb.insert(users).values([
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
    ]);

    await callWithMockCronEvent(constants.eventId);

    expect(eventBridge.send).toHaveBeenCalledTimes(2);
    expect(PutEventsCommand).toHaveBeenCalledWith(
      mockEventBridgePayload("askPresentIdeasFromTeam", {
        team: constants.teamId,
        birthdayPerson: constants.userId,
        eventId: constants.eventId,
      }),
    );
    expect(PutEventsCommand).toHaveBeenCalledWith(
      mockEventBridgePayload("askPresentIdeasFromTeam", {
        team: constants.teamId,
        birthdayPerson: constants.otherUserIds[0],
        eventId: constants.eventId,
      }),
    );
  });

  it("Should not publish askPresentIdeasFromTeam event if no user has birthday exactly 2 months from now", async () => {
    await testDb.insert(users).values([
      {
        id: constants.userId,
        teamId: constants.teamId,
        birthday: dayjs.utc().add(3, "month").toDate(),
      },
      {
        id: constants.otherUserIds[0],
        teamId: constants.teamId,
        birthday: dayjs.utc().add(4, "month").toDate(),
      },
    ]);

    await callWithMockCronEvent(constants.eventId);

    expect(eventBridge.send).not.toHaveBeenCalled();
  });
});
