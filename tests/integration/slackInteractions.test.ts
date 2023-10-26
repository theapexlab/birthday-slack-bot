import { App } from "@slack/bolt";
import { describe, expect, it, vi } from "vitest";

import { constructAskBirthdayMessageReplacement } from "@/services/slack/constructAskBirthdayMessage";
import { constructBirthdayConfirmedMessage } from "@/services/slack/constructBirthdayConfirmedMessage";
import { constructConfirmBirthdayMessage } from "@/services/slack/constructConfirmBirthdayMessage";
import { sendMockSlackInteraction } from "@/testUtils/sendMockSlackInteraction";
import { waitForRedisItem } from "@/testUtils/waitForRedisItem";

const constants = vi.hoisted(() => ({
  responseUrl: import.meta.env.VITE_API_URL + "/slack/test-payload",
  birthday: "2000-02-15",
}));

const app = new App({
  signingSecret: import.meta.env.VITE_SLACK_SIGNING_SECRET,
  token: import.meta.env.VITE_SLACK_BOT_TOKEN,
});

describe("Slack interactions", () => {
  it("Should send confirmation message when birthday is selected", async () => {
    const eventId = "I1_" + Date.now().toString();

    await sendMockSlackInteraction({
      type: "block_actions",
      user: {
        id: import.meta.env.VITE_SLACK_USER_ID,
        team_id: "T1",
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

    const item = await waitForRedisItem(eventId);

    expect(item).toEqual(
      JSON.stringify(constructConfirmBirthdayMessage(constants.birthday)),
    );
  }, 20_000);

  it("Should send thank you message when birthday is confirmed", async () => {
    const eventId = "I2_" + Date.now().toString();

    await sendMockSlackInteraction({
      type: "block_actions",
      user: {
        id: import.meta.env.VITE_SLACK_USER_ID,
        team_id: "T1",
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

    const item = await waitForRedisItem(eventId);

    expect(item).toEqual(JSON.stringify(constructBirthdayConfirmedMessage()));
  }, 20_000);

  it("Should ask for birthday again when birthday is incorrect", async () => {
    const eventId = "I3_" + Date.now().toString();

    await sendMockSlackInteraction({
      type: "block_actions",
      user: {
        id: import.meta.env.VITE_SLACK_USER_ID,
        team_id: "T1",
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

    const item = await waitForRedisItem(eventId);

    expect(item).toEqual(
      JSON.stringify(
        constructAskBirthdayMessageReplacement({
          name: user?.profile?.first_name || user?.name || "",
          user: import.meta.env.VITE_SLACK_USER_ID,
        }),
      ),
    );
  }, 20_000);
});
