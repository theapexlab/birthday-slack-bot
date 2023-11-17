import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { iceBreakerThreads, users } from "@/db/schema";
import { timeout } from "@/testUtils/constants";
import {
  generateIceBreakerTestUsers,
  usersInWindow,
  usersOutsideWindow,
} from "@/testUtils/generateIceBreakerTestUsers";
import { deleteLastRandomChannelPost } from "@/testUtils/integration/deleteLastRandomPost";
import { sendCronEvent } from "@/testUtils/integration/sendCronEvent";
import { waitForPostInRandom } from "@/testUtils/integration/waitForPostInRandom";
import { testDb, waitForIceBreakerThreads } from "@/testUtils/testDb";

const constants = vi.hoisted(() => ({
  teamId: "T1",
}));

describe("Icebreaker questions", () => {
  beforeAll(async () => {
    await testDb.delete(users);
    await testDb.delete(iceBreakerThreads);
  });

  afterEach(async () => {
    await deleteLastRandomChannelPost();
    await testDb.delete(users);
    await testDb.delete(iceBreakerThreads);
  });

  it(
    "Should send ice breaker question to random channel without mentioning anyone if no one has birthday in the ice breaker question window",
    async () => {
      const eventId = "IB1_" + Date.now().toString();

      await sendCronEvent("iceBreaker", eventId);

      const message = await waitForPostInRandom(eventId);

      expect(
        message.blocks?.length,
        `Message has ${message.blocks?.length ?? 0} blocks`,
      ).toBe(1);
    },
    timeout,
  );

  it(
    "Should mention users whose birthday is in the ice breaker question window",
    async () => {
      await generateIceBreakerTestUsers();

      const eventId = "IB2_" + Date.now().toString();

      await sendCronEvent("iceBreaker", eventId);

      const message = await waitForPostInRandom(eventId);

      expect(
        message.blocks?.length,
        `Message has ${message.blocks?.length ?? 0} blocks`,
      ).toBe(2);

      const text = message.blocks?.[1].text?.text;

      for (const user of usersInWindow) {
        expect(text, `Expected ${user} to be mentioned`).toContain(
          `<@${user}>`,
        );
      }

      for (const user of usersOutsideWindow) {
        expect(text, `Expected ${user} not to be mentioned`).not.toContain(
          `<@${user}>`,
        );
      }
    },
    timeout,
  );

  it(
    "Should save thread ts in database",
    async () => {
      await generateIceBreakerTestUsers();

      const eventId = "IB3_" + Date.now().toString();

      await sendCronEvent("iceBreaker", eventId);

      const threads = await waitForIceBreakerThreads({
        teamId: constants.teamId,
        expectedCount: usersInWindow.length,
      });

      for (const user of usersInWindow) {
        expect(
          threads,
          `Expected thread with ${user} to be saved`,
        ).toContainEqual({
          id: expect.any(Number),
          teamId: constants.teamId,
          userId: user,
          threadId: expect.any(String),
        });
      }

      for (const user of usersOutsideWindow) {
        expect(
          threads,
          `Expected thread with ${user} not to be saved`,
        ).not.toContainEqual({
          id: expect.any(Number),
          teamId: constants.teamId,
          userId: user,
          threadId: expect.any(String),
        });
      }
    },
    timeout,
  );
});
