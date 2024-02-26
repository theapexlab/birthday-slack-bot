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

import { handler } from "@/functions/schedule/scheduleHandlerLambda";
import { cleanUp } from "@/testUtils/unit/cleanUp";
import { mockEventBridgePayload } from "@/testUtils/unit/mockEventBridgePayload";
import {
  mockLambdaContext,
  mockLambdaScheduledCallBack,
  mockLambdaScheduledEvent,
} from "@/testUtils/unit/mockLambdaPayload";

dayjs.extend(utc);

const constants = vi.hoisted(() => ({
  userId: "U001",
  teamId: "T001",
  eventId: "E001",
}));

describe("Schedule handler", () => {
  let eventBridge: EventBridgeClient;

  beforeAll(async () => {
    await cleanUp("users");
  });

  beforeEach(() => {
    eventBridge = new EventBridgeClient();
  });

  afterEach(async () => {
    vi.clearAllMocks();
    await cleanUp("users");
  });

  it("Should publish event with the given type and payload", async () => {
    await handler(
      {
        ...mockLambdaScheduledEvent,
        detail: {
          eventType: "askPresentAndSquadJoinFromTeam",
          payload: {
            team: constants.teamId,
            birthdayPerson: constants.userId,
            eventId: constants.eventId,
          },
        },
      },
      mockLambdaContext,
      mockLambdaScheduledCallBack,
    );

    expect(eventBridge.send).toHaveBeenCalledOnce();
    expect(PutEventsCommand).toHaveBeenCalledWith(
      mockEventBridgePayload("askPresentAndSquadJoinFromTeam", {
        team: constants.teamId,
        birthdayPerson: constants.userId,
        eventId: constants.eventId,
      }),
    );
  });
});
