import { App } from "@slack/bolt";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { users } from "@/db/schema";
import { deleteDmMessages } from "@/testUtils/deleteDmMessages";
import { testDb } from "@/testUtils/testDb";
import { waitForPostInRandom } from "@/testUtils/waitForPostInRandomChannel";

const app = new App({
  signingSecret: import.meta.env.VITE_SLACK_SIGNING_SECRET,
  token: import.meta.env.VITE_SLACK_BOT_TOKEN,
});

describe("Slack events", () => {
  beforeAll(async () => {
    await deleteDmMessages(app);
    await testDb.delete(users);
  }, 10_000);

  afterAll(async () => {
    await deleteDmMessages(app);
    await testDb.delete(users);
  }, 10_000);

  it("Should send ice breaker question to random channel", async () => {
    const eventId = "IB1_" + Date.now().toString();

    await fetch(
      `${import.meta.env.VITE_API_URL}/icebreaker?eventId=${eventId}`,
    );

    const chat = await waitForPostInRandom(app, eventId);

    expect(chat.messages?.length).toEqual(1);
    expect(chat.messages![0].text).toEqual(
      "Random ice breaker question: What is your favorite color?",
    );
  }, 20_000);
});
