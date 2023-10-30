import { App } from "@slack/bolt";
import { and, eq } from "drizzle-orm";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { users } from "@/db/schema";
import { deleteDmMessages } from "@/testUtils/deleteDmMessages";
import { sendMockSlackEvent } from "@/testUtils/sendMockSlackEvent";
import { testDb } from "@/testUtils/testDb";
import { waitForDm } from "@/testUtils/waitForDm";

const constants = vi.hoisted(() => ({
  challenge: "challenge",
  birthday: new Date("2000-02-15"),
  teamId: "T1",
  userId: "U1",
}));

const app = new App({
  signingSecret: import.meta.env.VITE_SLACK_SIGNING_SECRET,
  token: import.meta.env.VITE_SLACK_BOT_TOKEN,
});

describe("Slack events", () => {
  beforeEach(async () => {
    await deleteDmMessages(app);
    await testDb.delete(users);
  }, 10_000);

  afterAll(async () => {
    await deleteDmMessages(app);
    await testDb.delete(users);
  }, 10_000);

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
    const eventId = "E1_" + Date.now().toString();

    await sendMockSlackEvent({
      type: "event_callback",
      event: {
        type: "member_joined_channel",
        channel: import.meta.env.VITE_CORE_SLACK_CHANNEL_ID,
        user: import.meta.env.VITE_SLACK_USER_ID,
        team: import.meta.env.VITE_TEAM_ID,
      },
      event_id: eventId,
    });

    const chat = await waitForDm(app, eventId);

    expect(chat.messages?.length).toEqual(1);
    expect(chat.messages![0].text).toEqual(
      "Please share your birthday with us! :birthday:",
    );
  }, 20_000);

  it("Should send DM to all users when bot joins the channel", async () => {
    const eventId = "E2_" + Date.now().toString();

    await sendMockSlackEvent({
      type: "event_callback",
      event: {
        type: "member_joined_channel",
        channel: import.meta.env.VITE_CORE_SLACK_CHANNEL_ID,
        user: import.meta.env.VITE_SLACK_BOT_USER_ID,
        team: import.meta.env.VITE_TEAM_ID,
      },
      event_id: eventId,
    });

    const chat = await waitForDm(app, eventId);

    expect(chat.messages?.length).toEqual(1);
    expect(chat.messages![0].text).toEqual(
      "Please share your birthday with us! :birthday:",
    );
  }, 20_000);

  it("Should delete user from db when user leaves channel", async () => {
    const eventId = "E3_" + Date.now().toString();

    await testDb.insert(users).values({
      id: constants.userId,
      teamId: constants.teamId,
      birthday: constants.birthday,
    });

    await sendMockSlackEvent({
      type: "event_callback",
      event: {
        type: "member_left_channel",
        channel: import.meta.env.VITE_CORE_SLACK_CHANNEL_ID,
        user: constants.userId,
        team: constants.teamId,
      },
      event_id: eventId,
    });

    const items = await vi.waitFor(
      async () => {
        const items = await testDb
          .select()
          .from(users)
          .where(
            and(
              eq(users.id, constants.userId),
              eq(users.teamId, constants.teamId),
            ),
          )
          .limit(1);

        if (items.length === 0) {
          return Promise.resolve(items);
        }
        return Promise.reject();
      },
      {
        timeout: 20_000,
        interval: 1_000,
      },
    );

    expect(items.length).toEqual(0);
  }, 20_000);
});
