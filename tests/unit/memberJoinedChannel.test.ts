import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";
import type { Mock } from "vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Events } from "@/events";
import { handler } from "@/functions/events/memberJoinedChannel";
import { getUserInfo } from "@/services/slack/getUserInfo";
import { mockEventBridgePayload } from "@/testUtils/mockEventBridgePayload";
import { sendMockSqsMessage } from "@/testUtils/sendMockSqsMessage";

const constants = vi.hoisted(() => ({
  birthdayBotUserId: "B001",
  coreChannelId: "C001",
  otherChannelId: "C999",
  otherBotUserId: "B999",
  userId: "U001",
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

vi.mock("@/services/slack/getBotUserId", () => ({
  getBotUserId: vi.fn().mockResolvedValue(constants.birthdayBotUserId),
}));

vi.mock("@/services/slack/getUserInfo", async () => ({
  getUserInfo: vi.fn().mockResolvedValue({
    user: {
      is_bot: false,
    },
  }),
}));

vi.mock("sst/node/config", () => ({
  Config: {
    CORE_SLACK_CHANNEL_ID: constants.coreChannelId,
  },
}));

describe("Member joined channel", () => {
  let eventBridge: EventBridgeClient;
  let getUserInfoMock: Mock;

  beforeEach(() => {
    eventBridge = new EventBridgeClient();
    getUserInfoMock = getUserInfo as Mock;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("Should not do anything if event is not for core channel", async () => {
    const event = {
      user: constants.userId,
      channel: constants.otherChannelId,
      eventId: constants.eventId,
    } satisfies Events["memberJoinedChannel"];

    await sendMockSqsMessage("memberJoinedChannel", event, handler);

    expect(eventBridge.send).not.toHaveBeenCalled();
  });

  it("Should publish botJoined event if birthdaybot joined core channel", async () => {
    const event = {
      user: constants.birthdayBotUserId,
      channel: constants.coreChannelId,
      eventId: constants.eventId,
    } satisfies Events["memberJoinedChannel"];

    await sendMockSqsMessage("memberJoinedChannel", event, handler);

    expect(eventBridge.send).toHaveBeenCalled();
    expect(PutEventsCommand).toHaveBeenCalledWith(
      mockEventBridgePayload("botJoined", {
        channel: constants.coreChannelId,
        eventId: constants.eventId,
      }),
    );
  });

  it("Should publish askBirthday event if user joined core channel", async () => {
    const event = {
      user: constants.userId,
      channel: constants.coreChannelId,
      eventId: constants.eventId,
    } satisfies Events["memberJoinedChannel"];

    await sendMockSqsMessage("memberJoinedChannel", event, handler);

    expect(eventBridge.send).toHaveBeenCalled();
    expect(PutEventsCommand).toHaveBeenCalledWith(
      mockEventBridgePayload("askBirthday", {
        user: constants.userId,
        eventId: constants.eventId,
      }),
    );
  });

  it("Should not do anything if other bot joined core channel", async () => {
    const event = {
      user: constants.otherBotUserId,
      channel: constants.coreChannelId,
      eventId: constants.eventId,
    } satisfies Events["memberJoinedChannel"];

    getUserInfoMock.mockResolvedValueOnce({
      user: {
        is_bot: true,
      },
    });

    await sendMockSqsMessage("memberJoinedChannel", event, handler);

    expect(eventBridge.send).not.toHaveBeenCalled();
  });
});
