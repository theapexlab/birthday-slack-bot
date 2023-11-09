import { eq } from "drizzle-orm";
import { afterEach, beforeAll, describe, expect, it, test, vi } from "vitest";

import { testItems, users } from "@/db/schema";
import { constructAskBirthdayMessageReplacement } from "@/services/slack/constructAskBirthdayMessage";
import { constructBirthdayConfirmedMessage } from "@/services/slack/constructBirthdayConfirmedMessage";
import { constructConfirmBirthdayMessage } from "@/services/slack/constructConfirmBirthdayMessage";
import { timeout, waitTimeout } from "@/testUtils/constants";
import { deleteLastDm } from "@/testUtils/deleteLastDm";
import { sendMockSlackInteraction } from "@/testUtils/sendMockSlackInteraction";
import { testDb, waitForTestItem } from "@/testUtils/testDb";
import { app } from "@/testUtils/testSlackApp";
import { waitForDm } from "@/testUtils/waitForDm";
import {
  birthdayConfirmActionId,
  birthdayIncorrectActionId,
} from "@/types/SlackInteractionRequest";

const constants = vi.hoisted(() => ({
  responseUrl: `${import.meta.env.VITE_API_URL}/slack/test-payload`,
  birthday: "2000-02-15",
  teamId: "T1",
  userId: "U1",
}));

describe("Slack interactions", () => {
  beforeAll(async () => {
    await testDb.delete(users);
    await testDb.delete(testItems);
  });

  afterEach(async () => {
    await deleteLastDm();

    await testDb.delete(users);
    await testDb.delete(testItems);
  });

  it(
    "Should send confirmation message when birthday is selected",
    async () => {
      const eventId = "AB1_" + Date.now().toString();

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
            selected_date: constants.birthday,
          },
        ],
      });

      const item = await waitForTestItem(eventId);

      expect(
        item.payload,
        "Payload doesn't match confirm birthday message",
      ).toEqual(
        JSON.stringify(constructConfirmBirthdayMessage(constants.birthday)),
      );
    },
    timeout,
  );

  test("Confirm message should be valid", async () => {
    const eventId = "AB2_" + Date.now().toString();

    await app.client.chat.postMessage({
      channel: import.meta.env.VITE_SLACK_USER_ID,
      ...constructConfirmBirthdayMessage(constants.birthday, eventId),
    });

    const message = await waitForDm(eventId);

    expect(message.blocks?.[0].text?.text).toContain(constants.birthday);
    expect(message.blocks?.[1].elements?.[0].action_id).toEqual(
      birthdayConfirmActionId,
    );
    expect(message.blocks?.[1].elements?.[1].action_id).toEqual(
      birthdayIncorrectActionId,
    );
  });

  it(
    "Should send thank you message when birthday is confirmed",
    async () => {
      const eventId = "AB3_" + Date.now().toString();

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
            value: constants.birthday,
          },
        ],
      });

      const item = await waitForTestItem(eventId);

      expect(
        item.payload,
        "Payload doesn't match birthday confirmed message",
      ).toEqual(JSON.stringify(constructBirthdayConfirmedMessage()));
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
            throw new Error("User not saved");
          }
          return items[0];
        },
        {
          timeout: waitTimeout,
          interval: 1_000,
        },
      );

      expect(item, "User doesn't match expected user").toEqual({
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
      const eventId = "AB4_" + Date.now().toString();

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
            value: constants.birthday,
          },
        ],
      });

      const { user } = await app.client.users.info({
        user: import.meta.env.VITE_SLACK_USER_ID,
      });

      const item = await waitForTestItem(eventId);

      expect(
        item.payload,
        "Payload doesn't match ask birthday message",
      ).toEqual(
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