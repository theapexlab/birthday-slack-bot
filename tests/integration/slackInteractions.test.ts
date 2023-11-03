import { eq } from "drizzle-orm";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { testItems, users } from "@/db/schema";
import { constructAskBirthdayMessageReplacement } from "@/services/slack/constructAskBirthdayMessage";
import { constructBirthdayConfirmedMessage } from "@/services/slack/constructBirthdayConfirmedMessage";
import { constructConfirmBirthdayMessage } from "@/services/slack/constructConfirmBirthdayMessage";
import { timeout } from "@/testUtils/constants";
import { testDb, waitForTestItem } from "@/testUtils/testDb";
import { app } from "@/testUtils/testSlackApp";
import type { SlackInteractionRequest } from "@/types/SlackInteractionRequest";

const constants = vi.hoisted(() => ({
  responseUrl: import.meta.env.VITE_API_URL + "/slack/test-payload",
  birthday: "2000-02-15",
  teamId: "T1",
  userId: "U1",
}));

export const sendMockSlackInteraction = async (
  body: SlackInteractionRequest,
) => {
  const urlEncodedBody = new URLSearchParams({
    payload: JSON.stringify(body),
  });

  const encodedBody = urlEncodedBody.toString();

  return fetch(`${import.meta.env.VITE_API_URL}/slack/interaction`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: encodedBody,
  })
    .then((res) => res.json())
    .catch((error) => console.error(error.stack));
};

describe("Slack interactions", () => {
  beforeEach(async () => {
    await testDb.delete(users);
    await testDb.delete(testItems);
  });

  afterAll(async () => {
    await testDb.delete(users);
    await testDb.delete(testItems);
  });

  it(
    "Should send confirmation message when birthday is selected",
    async () => {
      const eventId = "I1_" + Date.now().toString();

      await sendMockSlackInteraction({
        type: "block_actions",
        user: {
          id: constants.userId,
          team_id: constants.teamId,
        },
        response_url: constants.responseUrl + `?testId=${eventId}`,
        actions: [
          {
            type: "datepicker",
            action_id: "pickBirthday",
            action_ts: eventId,
            selected_date: constants.birthday,
          },
        ],
      });

      const item = await waitForTestItem(eventId);

      expect(item.payload).toEqual(
        JSON.stringify(constructConfirmBirthdayMessage(constants.birthday)),
      );
    },
    timeout,
  );

  it(
    "Should send thank you message when birthday is confirmed",
    async () => {
      const eventId = "I2_" + Date.now().toString();

      await sendMockSlackInteraction({
        type: "block_actions",
        user: {
          id: constants.userId,
          team_id: constants.teamId,
        },
        response_url: constants.responseUrl + `?testId=${eventId}`,
        actions: [
          {
            type: "button",
            action_id: "birthdayConfirm",
            action_ts: eventId,
            value: constants.birthday,
          },
        ],
      });

      const item = await waitForTestItem(eventId);

      expect(item.payload).toEqual(
        JSON.stringify(constructBirthdayConfirmedMessage()),
      );
    },
    timeout,
  );

  it(
    "Should save user to db when birthday is confirmed",
    async () => {
      await sendMockSlackInteraction({
        type: "block_actions",
        user: {
          id: constants.userId,
          team_id: constants.teamId,
        },
        response_url: constants.responseUrl + "?testId=1",
        actions: [
          {
            type: "button",
            action_id: "birthdayConfirm",
            action_ts: "",
            value: constants.birthday,
          },
        ],
      });

      const item = await vi.waitFor(
        async () => {
          const items = await testDb
            .select()
            .from(users)
            .where(eq(users.id, constants.userId))
            .limit(1);

          if (items.length === 0) {
            return Promise.reject();
          }
          return items[0];
        },
        {
          timeout: timeout,
          interval: 1_000,
        },
      );

      expect(item).toEqual({
        id: constants.userId,
        teamId: constants.teamId,
        birthday: new Date(constants.birthday),
      });
    },
    timeout,
  );

  it(
    "Should ask for birthday again when birthday is incorrect",
    async () => {
      const eventId = "I3_" + Date.now().toString();

      await sendMockSlackInteraction({
        type: "block_actions",
        user: {
          id: import.meta.env.VITE_SLACK_USER_ID,
          team_id: constants.teamId,
        },
        response_url: constants.responseUrl + `?testId=${eventId}`,
        actions: [
          {
            type: "button",
            action_id: "birthdayIncorrect",
            action_ts: eventId,
            value: constants.birthday,
          },
        ],
      });

      const { user } = await app.client.users.info({
        user: import.meta.env.VITE_SLACK_USER_ID,
      });

      const item = await waitForTestItem(eventId);

      expect(item.payload).toEqual(
        JSON.stringify(
          constructAskBirthdayMessageReplacement({
            name: user?.profile?.first_name || user?.name || "",
            user: import.meta.env.VITE_SLACK_USER_ID,
          }),
        ),
      );
    },
    timeout,
  );
});
