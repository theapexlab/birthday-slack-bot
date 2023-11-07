import { and, eq } from "drizzle-orm";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { users } from "@/db/schema";
import { timeout, waitTimeout } from "@/testUtils/constants";
import { deleteLastDmMessage } from "@/testUtils/deleteLastDmMessage";
import { testDb } from "@/testUtils/testDb";
import { waitForDm } from "@/testUtils/waitForDm";
import type { SlackCallbackRequest } from "@/types/SlackEventRequest";

const constants = vi.hoisted(() => ({
  challenge: "challenge",
  birthday: new Date("2000-02-15"),
  teamId: "T1",
  userId: "U1",
}));

export const sendMockSlackEvent = async (body: SlackCallbackRequest) =>
  fetch(`${import.meta.env.VITE_API_URL}/slack/event`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then((res) => res.json())
    .catch((error) => console.error(error.stack));

describe("Slack events", () => {
  beforeAll(async () => {
    await testDb.delete(users);
  }, 10_000);

  afterEach(async () => {
    await deleteLastDmMessage();
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

  it(
    "Should send DM to user when they join the channel",
    async () => {
      const eventId = "E1_" + Date.now().toString();

      await sendMockSlackEvent({
        type: "event_callback",
        event: {
          type: "member_joined_channel",
          channel: import.meta.env.VITE_CORE_SLACK_CHANNEL_ID,
          user: import.meta.env.VITE_SLACK_USER_ID,
          team: import.meta.env.VITE_SLACK_TEAM_ID,
        },
        event_id: eventId,
      });

      await waitForDm(eventId);
    },
    timeout,
  );

  it(
    "Should send DM to all users when bot joins the channel",
    async () => {
      const eventId = "E2_" + Date.now().toString();

      await sendMockSlackEvent({
        type: "event_callback",
        event: {
          type: "member_joined_channel",
          channel: import.meta.env.VITE_CORE_SLACK_CHANNEL_ID,
          user: import.meta.env.VITE_SLACK_BOT_USER_ID,
          team: import.meta.env.VITE_SLACK_TEAM_ID,
        },
        event_id: eventId,
      });

      await waitForDm(eventId);
    },
    timeout,
  );

  it(
    "Should delete user from db when user leaves channel",
    async () => {
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

      await vi.waitFor(
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
            return items;
          }

          throw new Error("User not deleted");
        },
        {
          timeout: waitTimeout,
          interval: 1_000,
        },
      );
    },
    timeout,
  );
});
