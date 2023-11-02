import { App } from "@slack/bolt";
import { eq } from "drizzle-orm";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { iceBreakerThreads, users } from "@/db/schema";
import { timeout } from "@/testUtils/constants";
import { deleteLastRandomChannelPost } from "@/testUtils/deleteLastRandomChannelPost";
import {
  generateIceBreakerTestUsers,
  usersInWindow,
  usersOutsideWindow,
} from "@/testUtils/generateIceBreakerTestUsers";
import { testDb } from "@/testUtils/testDb";
import { waitForPostInRandom } from "@/testUtils/waitForPostInRandomChannel";

const app = new App({
  signingSecret: import.meta.env.VITE_SLACK_SIGNING_SECRET,
  token: import.meta.env.VITE_SLACK_BOT_TOKEN,
});

describe("Icebreaker questions", () => {
  beforeAll(async () => {
    await testDb.delete(users);
    await testDb.delete(iceBreakerThreads);
  }, 10_000);

  afterEach(async () => {
    await deleteLastRandomChannelPost(app);
    await testDb.delete(users);
    await testDb.delete(iceBreakerThreads);
  }, 10_000);

  it(
    "Should send ice breaker question to random channel",
    async () => {
      const eventId = "IB1_" + Date.now().toString();

      await fetch(
        `${import.meta.env.VITE_API_URL}/icebreaker?eventId=${eventId}`,
      );

      const message = await waitForPostInRandom(app, eventId);

      expect(message.blocks?.length).toBe(1);
    },
    timeout,
  );

  it(
    "Should mention users whose birthday is in the ice breaker question window",
    async () => {
      await generateIceBreakerTestUsers();

      const eventId = "IB2_" + Date.now().toString();

      await fetch(
        `${import.meta.env.VITE_API_URL}/icebreaker?eventId=${eventId}`,
      );

      const message = await waitForPostInRandom(app, eventId);

      expect(message.blocks?.length).toBe(2);

      const text = message.blocks?.[1].text?.text;

      for (const user of usersInWindow) {
        expect(text).toContain(`<@${user}>`);
      }

      for (const user of usersOutsideWindow) {
        expect(text).not.toContain(`<@${user}>`);
      }
    },
    timeout,
  );

  it(
    "Should save thread ts in database",
    async () => {
      await generateIceBreakerTestUsers();

      const eventId = "IB3_" + Date.now().toString();

      await fetch(
        `${import.meta.env.VITE_API_URL}/icebreaker?eventId=${eventId}`,
      );

      const threads = await vi.waitFor(
        async () => {
          const items = await testDb
            .select()
            .from(iceBreakerThreads)
            .where(eq(iceBreakerThreads.teamId, "T1"));

          if (items.length < usersInWindow.length) {
            return Promise.reject();
          }
          return items;
        },
        {
          timeout,
          interval: 1_000,
        },
      );

      for (const user of usersInWindow) {
        expect(threads).toContainEqual({
          id: expect.any(Number),
          teamId: "T1",
          userId: user,
          threadId: expect.any(String),
        });
      }

      for (const user of usersOutsideWindow) {
        expect(threads).not.toContainEqual({
          id: expect.any(Number),
          teamId: "T1",
          userId: user,
          threadId: expect.any(String),
        });
      }
    },
    timeout,
  );
});