import { App } from "@slack/bolt";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { users } from "@/db/schema";
import { getIceBreakerWindow } from "@/services/birthday/getIcebreakerWindow";
import { deleteLastRandomChannelPost } from "@/testUtils/deleteLastRandomChannelPost";
import { testDb } from "@/testUtils/testDb";
import { waitForPostInRandom } from "@/testUtils/waitForPostInRandomChannel";

const app = new App({
  signingSecret: import.meta.env.VITE_SLACK_SIGNING_SECRET,
  token: import.meta.env.VITE_SLACK_BOT_TOKEN,
});

const generateUsers = async () => {
  const { start, end } = getIceBreakerWindow();

  const birthdays = [
    start.subtract(1, "day"), // 1 day before
    start, // start
    start.add(1, "day"), // 1 day after
    end.subtract(1, "day"), // 1 day before end
    end, // end
    end.add(1, "day"), // 1 day after end
    start.add(30, "day"), // random day in the window
    start.add(6, "months"), // random day outside the window
  ];

  await Promise.all(
    birthdays.map((birthday, i) =>
      testDb.insert(users).values({
        id: `U${i + 1}`,
        teamId: "T1",
        birthday: birthday.toDate(),
      }),
    ),
  );
};

describe("Icebreaker questions", () => {
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

    expect(message.blocks?.length).toBe(1);
  }, 20_000);

  it("Should mention users whose birthday is in the ice breaker question window", async () => {
    await generateUsers();

    const eventId = "IB2_" + Date.now().toString();

    await fetch(
      `${import.meta.env.VITE_API_URL}/icebreaker?eventId=${eventId}`,
    );

    const message = await waitForPostInRandom(app, eventId);

    expect(message.blocks?.length).toBe(2);

    const text = message.blocks?.[1].text?.text;

    expect(text).not.toContain("<@U1>");
    expect(text).toContain("<@U2>");
    expect(text).toContain("<@U3>");
    expect(text).toContain("<@U4>");
    expect(text).not.toContain("<@U5>");
    expect(text).not.toContain("<@U6>");
    expect(text).toContain("<@U7>");
    expect(text).not.toContain("<@U8>");
  });
});
