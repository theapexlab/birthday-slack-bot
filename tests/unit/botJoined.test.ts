import "@/testUtils/unit/mockEventBridge";

import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Events } from "@/events";
import { handler } from "@/functions/events/botJoined";
import { mockEventBridgePayload } from "@/testUtils/unit/mockEventBridgePayload";
import { sendMockSqsMessage } from "@/testUtils/unit/sendMockSqsMessage";

const constants = vi.hoisted(() => ({
  channelMembers: ["U001", "U002", "U003", "U004"],
  coreChannelId: "C001",
  eventId: "E001",
}));

vi.mock("@/services/slack/getChannelMembers", () => ({
  getChannelMembers: vi.fn().mockResolvedValue(constants.channelMembers),
}));

describe("Bot joined channel", () => {
  let eventBridge: EventBridgeClient;

  beforeEach(() => {
    eventBridge = new EventBridgeClient();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("Should put askBirthday event for each user", async () => {
    const event = {
      channel: constants.coreChannelId,
      eventId: constants.eventId,
    } satisfies Events["botJoined"];

    await sendMockSqsMessage("botJoined", event, handler);

    expect(eventBridge.send).toHaveBeenCalledTimes(4);

    for (const user of constants.channelMembers) {
      expect(PutEventsCommand).toHaveBeenCalledWith(
        mockEventBridgePayload("askBirthday", {
          user,
          eventId: constants.eventId,
        }),
      );
    }
  });
});
