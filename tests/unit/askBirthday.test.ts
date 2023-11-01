import type { Mock } from "vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Events } from "@/events";
import { handler } from "@/functions/events/askBirthday";
import { constructAskBirthdayMessage } from "@/services/slack/constructAskBirthdayMessage";
import { createSlackApp } from "@/services/slack/createSlackApp";
import { getUserInfo } from "@/services/slack/getUserInfo";
import { sendMockSqsMessage } from "@/testUtils/sendMockSqsMessage";

const constants = vi.hoisted(() => ({
  otherBotUserId: "B999",
  userId: "U001",
  userName: "Foo",
  eventId: "E001",
}));

vi.mock("@/services/slack/createSlackApp", () => ({
  createSlackApp: vi.fn().mockReturnValue({
    client: {
      chat: {
        postMessage: vi.fn(),
      },
    },
  }),
}));

vi.mock("@/services/slack/getUserInfo", async () => ({
  getUserInfo: vi.fn().mockResolvedValue({
    user: {
      is_bot: false,
      profile: {
        first_name: constants.userName,
      },
    },
  }),
}));

describe("Member joined channel", () => {
  let getUserInfoMock: Mock;
  let createSlackAppMock: Mock;

  beforeEach(() => {
    getUserInfoMock = getUserInfo as Mock;
    createSlackAppMock = createSlackApp as Mock;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("Should not do anything if user is a bot", async () => {
    const event = {
      user: constants.otherBotUserId,
      eventId: constants.eventId,
    } satisfies Events["askBirthday"];

    getUserInfoMock.mockResolvedValueOnce({
      user: {
        is_bot: true,
      },
    });

    await sendMockSqsMessage("askBirthday", event, handler);

    expect(createSlackAppMock).not.toHaveBeenCalled();
  });

  it("Should send dm to user if exists and not bot", async () => {
    const event = {
      user: constants.userId,
      eventId: constants.eventId,
    } satisfies Events["askBirthday"];

    const sendDMMock = vi.spyOn(
      createSlackAppMock().client.chat,
      "postMessage",
    );

    await sendMockSqsMessage("askBirthday", event, handler);

    expect(sendDMMock).toHaveBeenCalledOnce();
    expect(sendDMMock).toHaveBeenCalledWith(
      constructAskBirthdayMessage({
        eventId: constants.eventId,
        name: constants.userName,
        user: constants.userId,
      }),
    );
  });
});
