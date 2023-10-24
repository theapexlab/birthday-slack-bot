import type { Mock } from "vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Events } from "@/events";
import { handler } from "@/functions/events/askBirthday";
import { createSlackApp } from "@/services/slack/createSlackApp";
import { getUserInfo } from "@/services/slack/getUserInfo";
import { sendMockSqsMessage } from "@/testUtils/sendMockSqsMessage";

const constants = vi.hoisted(() => ({
  otherBotUserId: "B999",
  userId: "U001",
  userName: "Foo",
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
    } satisfies Events["askBirthday"];

    const sendDMMock = vi.spyOn(
      createSlackAppMock().client.chat,
      "postMessage",
    );

    await sendMockSqsMessage("askBirthday", event, handler);

    expect(sendDMMock).toHaveBeenCalledOnce();
    expect(sendDMMock).toHaveBeenCalledWith({
      channel: constants.userId,
      text: "Please share your birthday with us! :birthday:",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Hey ${constants.userName}! :wave:`,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Please share your birthday with us! :birthday:",
          },
          accessory: {
            type: "datepicker",
            initial_date: "1995-01-01",
            placeholder: {
              type: "plain_text",
              text: "Select a date",
              emoji: true,
            },
            action_id: "birthday",
          },
        },
      ],
    });
  });
});
