import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { timeout } from "@/testUtils/constants";
import { deleteLastDm } from "@/testUtils/integration/deleteLastDm";
import { waitForDm } from "@/testUtils/integration/waitForDm";
import { waitForUsers } from "@/testUtils/testDb";
import { cleanUp, insertDb } from "@/testUtils/unit/dbOperations";
import type { SlackCallbackRequest } from "@/types/SlackEventRequest";

const constants = vi.hoisted(() => ({
  challenge: "challenge",
  birthday: new Date("2000-02-15"),
  teamId: "T1",
  userId: "U1",
}));

export const sendSlackEvent = async (body: SlackCallbackRequest) =>
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
    await cleanUp("users");
  });

  afterEach(async () => {
    await deleteLastDm();
    await cleanUp("users");
  });

  it(
    "Should return challenge on slack event endpoint",
    async () => {
      const res = await sendSlackEvent({
        type: "url_verification",
        challenge: constants.challenge,
      });

      expect(res, "Challenge is not matched").toEqual({
        urlVerificationChallenge: constants.challenge,
      });
    },
    timeout,
  );

  it(
    "Should send DM to user when they join the channel",
    async () => {
      const eventId = "E1_" + Date.now().toString();

      await sendSlackEvent({
        type: "event_callback",
        event: {
          type: "member_joined_channel",
          channel: import.meta.env.VITE_CORE_SLACK_CHANNEL_ID,
          user: import.meta.env.VITE_SLACK_USER_ID,
          team: import.meta.env.VITE_SLACK_TEAM_ID,
        },
        event_id: eventId,
      });

      const message = await waitForDm(eventId);

      expect(
        message.blocks?.[1].accessory?.type,
        "Message doesn't have datepicker",
      ).toBe("datepicker");
    },
    timeout,
  );

  it(
    "Should send DM to all users when bot joins the channel",
    async () => {
      const eventId = "E2_" + Date.now().toString();

      await sendSlackEvent({
        type: "event_callback",
        event: {
          type: "member_joined_channel",
          channel: import.meta.env.VITE_CORE_SLACK_CHANNEL_ID,
          user: import.meta.env.VITE_SLACK_BOT_USER_ID,
          team: import.meta.env.VITE_SLACK_TEAM_ID,
        },
        event_id: eventId,
      });

      const message = await waitForDm(eventId);

      expect(
        message.blocks?.[1].accessory?.type,
        "Message doesn't have datepicker",
      ).toBe("datepicker");
    },
    timeout,
  );

  it(
    "Should delete user from db when user leaves channel",
    async () => {
      const eventId = "E3_" + Date.now().toString();

      await insertDb("users", {
        id: constants.userId,
        team_id: constants.teamId,
        birthday: constants.birthday,
      });

      await sendSlackEvent({
        type: "event_callback",
        event: {
          type: "member_left_channel",
          channel: import.meta.env.VITE_CORE_SLACK_CHANNEL_ID,
          user: constants.userId,
          team: constants.teamId,
        },
        event_id: eventId,
      });

      await waitForUsers({
        userId: constants.userId,
        teamId: constants.teamId,
        expectedCount: 0,
      });
    },
    timeout,
  );
});
