import type { SectionBlock } from "@slack/bolt";
import { App } from "@slack/bolt";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { users } from "@/db/schema";
import { constructIceBreakerQuestion } from "@/services/slack/constructIceBreakerQuestion";
import { deleteLastRandomChannelPost } from "@/testUtils/deleteLastRandomChannelPost";
import { testDb } from "@/testUtils/testDb";
import { waitForPostInRandom } from "@/testUtils/waitForPostInRandomChannel";

const app = new App({
  signingSecret: import.meta.env.VITE_SLACK_SIGNING_SECRET,
  token: import.meta.env.VITE_SLACK_BOT_TOKEN,
});

describe("Slack events", () => {
  beforeAll(async () => {
    await testDb.delete(users);
  }, 10_000);

  afterEach(async () => {
    await deleteLastRandomChannelPost(app);
    await testDb.delete(users);
  }, 10_000);

  it("Should send ice breaker question to random channel", async () => {
    const eventId = "IB1_" + Date.now().toString();

    await fetch(
      `${import.meta.env.VITE_API_URL}/icebreaker?eventId=${eventId}`,
    );

    const message = await waitForPostInRandom(app, eventId);

    const expectedMessage = constructIceBreakerQuestion({
      channel: import.meta.env.VITE_RANDOM_SLACK_CHANNEL_ID,
      eventId,
      users: ["U1", "U2"],
    });

    const expectedText = (expectedMessage.blocks?.[1] as SectionBlock).text
      ?.text;

    expect(message.blocks?.[1]?.text?.text).toEqual(expectedText);
  }, 20_000);
});
