import { App } from "@slack/bolt";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { deleteDmMessages } from "@/testUtils/deleteDmMessages";
import { sendMockSlackEvent } from "@/testUtils/sendMockSlackEvent";
import { waitForDm } from "@/testUtils/waitForDm";

const constants = vi.hoisted(() => ({
  challenge: "challenge",
}));

const app = new App({
  signingSecret: import.meta.env.VITE_SLACK_SIGNING_SECRET,
  token: import.meta.env.VITE_SLACK_BOT_TOKEN,
});

describe("Slack events", () => {
  beforeAll(async () => {
    await deleteDmMessages(app);
  });

  afterEach(async () => {
    await deleteDmMessages(app);
  });

  it("Should return challenge on slack event endpoint", async () => {
    const res = await sendMockSlackEvent({
      type: "url_verification",
      challenge: constants.challenge,
    });

    expect(res).toEqual({
      urlVerificationChallenge: constants.challenge,
    });
  });

  it("Should send DM to user when they join the channel", async () => {
    await sendMockSlackEvent({
      type: "event_callback",
      event: {
        type: "member_joined_channel",
        channel: import.meta.env.VITE_SLACK_CHANNEL_ID,
        user: import.meta.env.VITE_SLACK_USER_ID,
      },
    });

    const chat = await waitForDm(app);

    expect(chat.messages?.length).toEqual(1);
    expect(chat.messages![0].text).toEqual(
      "Please share your birthday with us! :birthday:",
    );
  }, 10_000);

  it("Should send DM to all users when bot joins the channel", async () => {
    await sendMockSlackEvent({
      type: "event_callback",
      event: {
        type: "member_joined_channel",
        channel: import.meta.env.VITE_SLACK_CHANNEL_ID,
        user: import.meta.env.VITE_SLACK_BOT_USER_ID,
      },
    });

    const chat = await waitForDm(app);

    expect(chat.messages?.length).toEqual(1);
    expect(chat.messages![0].text).toEqual(
      "Please share your birthday with us! :birthday:",
    );
  }, 10_000);
});
