import { Config } from "sst/node/config";

import { db } from "@/db/index";
import { getBirthdaysBetween } from "@/db/queries/getBirthdays";
import { iceBreakerThreads } from "@/db/schema";
import { getIceBreakerWindow } from "@/services/birthday/getIcebreakerWindow";
import { constructIceBreakerQuestion } from "@/services/slack/constructIceBreakerQuestion";
import { createSlackApp } from "@/services/slack/createSlackApp";
import { cronHandler } from "@/utils/lambda/cronHandler";

export const handler = cronHandler(async (eventId?: string) => {
  try {
    const { start, end } = getIceBreakerWindow();
    const users = await getBirthdaysBetween(start, end);

    const app = createSlackApp();

    const message = await app.client.chat.postMessage(
      constructIceBreakerQuestion({
        channel: Config.RANDOM_SLACK_CHANNEL_ID,
        eventId,
        users: users.map((user) => user.id),
      }),
    );

    if (!message.ok || !message.ts) {
      throw new Error("Failed to send ice breaker question");
    }

    await db.insert(iceBreakerThreads).values(
      users.map((user) => ({
        userId: user.id,
        teamId: user.teamId,
        threadId: message.ts!,
      })),
    );

    return {
      message: "Ice breaker question sent",
    };
  } catch (error) {
    console.error("Error processing ice breaker question cron: ", error);
  }
});
