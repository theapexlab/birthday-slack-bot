import "@/testUtils/unit/mockEventBridge";

import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { handler } from "@/functions/lambdas/slack-event";
import { mockEventBridgePayload } from "@/testUtils/unit/mockEventBridgePayload";
import {
  mockLambdaContext,
  mockLambdaEvent,
} from "@/testUtils/unit/mockLambdaPayload";
import type {
  SlackCallbackRequest,
  SlackEvent,
} from "@/types/SlackEventRequest";

const constants = vi.hoisted(() => ({
  challenge: "challenge",
  coreChannelId: "C001",
  userId: "U001",
  eventId: "E001",
  teamId: "T001",
}));

export const callWithMockSlackEvent = async (body: SlackCallbackRequest) =>
  handler(
    {
      ...mockLambdaEvent,
      body: JSON.stringify(body),
    },
    mockLambdaContext,
    () => {},
  );

describe("Handle slack events", () => {
  let eventBridge: EventBridgeClient;

  beforeEach(() => {
    eventBridge = new EventBridgeClient();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("Should return challenge on slack event endpoint", async () => {
    const res = await callWithMockSlackEvent({
      type: "url_verification",
      challenge: constants.challenge,
    });

    expect(res).toEqual({
      statusCode: 200,
      body: JSON.stringify({
        urlVerificationChallenge: constants.challenge,
      }),
    });
  });

  it("Should publish memberJoinedChannel event when member_joined_channel slack event is received", async () => {
    const event = {
      type: "member_joined_channel",
      user: constants.userId,
      team: constants.teamId,
      channel: constants.coreChannelId,
    } satisfies SlackEvent;

    await callWithMockSlackEvent({
      type: "event_callback",
      event,
      event_id: constants.eventId,
    });

    expect(eventBridge.send).toHaveBeenCalledOnce();
    expect(PutEventsCommand).toHaveBeenCalledWith(
      mockEventBridgePayload("memberJoinedChannel", {
        ...event,
        eventId: constants.eventId,
      }),
    );
  });

  it("Should publish memberLeftChannel event when member_left_channel slack event is received", async () => {
    const event = {
      type: "member_left_channel",
      user: constants.userId,
      team: constants.teamId,
      channel: constants.coreChannelId,
    } satisfies SlackEvent;

    await callWithMockSlackEvent({
      type: "event_callback",
      event,
      event_id: constants.eventId,
    });

    expect(eventBridge.send).toHaveBeenCalledOnce();
    expect(PutEventsCommand).toHaveBeenCalledWith(
      mockEventBridgePayload("memberLeftChannel", event),
    );
  });
});
