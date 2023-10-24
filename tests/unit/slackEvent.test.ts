import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { mockEventBridgePayload } from "@/testUtils/mockEventBridgePayload";
import { callWithMockSlackEvent } from "@/testUtils/sendMockSlackEvent";
import type { SlackEvent } from "@/types/SlackEventRequest";

const constants = vi.hoisted(() => ({
  challenge: "challenge",
  coreChannelId: "C001",
  userId: "U001",
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
      channel: constants.coreChannelId,
    } satisfies SlackEvent;

    await callWithMockSlackEvent({
      type: "event_callback",
      event,
    });

    expect(eventBridge.send).toHaveBeenCalledOnce();
    expect(PutEventsCommand).toHaveBeenCalledWith(
      mockEventBridgePayload("memberJoinedChannel", event),
    );
  });

  it("Should publish memberLeftChannel event when member_left_channel slack event is received", async () => {
    const event = {
      type: "member_left_channel",
      user: constants.userId,
      channel: constants.coreChannelId,
    } satisfies SlackEvent;

    await callWithMockSlackEvent({
      type: "event_callback",
      event,
    });

    expect(eventBridge.send).toHaveBeenCalledOnce();
    expect(PutEventsCommand).toHaveBeenCalledWith(
      mockEventBridgePayload("memberLeftChannel", event),
    );
  });
});
