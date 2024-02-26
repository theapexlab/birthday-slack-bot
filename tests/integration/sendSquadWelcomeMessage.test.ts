import "@/testUtils/unit/mockDb";

import { App } from "@slack/bolt";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { presentIdeas, users } from "@/db/schema";
import { getIceBreakerThreadLink } from "@/services/slack/getIceBreakerThreadLink";
import { timeout } from "@/testUtils/constants";
import { deleteLastDm } from "@/testUtils/integration/deleteLastDm";
import { deleteLastRandomChannelPost } from "@/testUtils/integration/deleteLastRandomPost";
import { sendCronEvent } from "@/testUtils/integration/sendCronEvent";
import { sendScheduleEvent } from "@/testUtils/integration/sendScheduleEvent";
import { waitForDm } from "@/testUtils/integration/waitForDm";
import { testDb, waitForIceBreakerThreads } from "@/testUtils/testDb";
import { cleanUp } from "@/testUtils/unit/cleanUp";

dayjs.extend(utc);

const constants = vi.hoisted(() => ({
  teamId: import.meta.env.VITE_SLACK_TEAM_ID,
  userId: "U1",
  otherUserId: import.meta.env.VITE_SLACK_BOT_USER_ID,
  presentIdeas: [
    {
      userId: import.meta.env.VITE_SLACK_BOT_USER_ID,
      presentIdea: "Test idea",
    },
    {
      userId: import.meta.env.VITE_SLACK_BOT_USER_ID,
      presentIdea: "Test idea 2\nHello\n\n- Idea1\n- Idea2\n- Idea3",
    },
  ],
}));

vi.mock("sst/node/config", () => ({
  Config: {
    RANDOM_SLACK_CHANNEL_ID: import.meta.env.VITE_RANDOM_SLACK_CHANNEL_ID,
  },
}));

vi.mock("@/services/slack/createSlackApp", async () => ({
  createSlackApp: vi.fn().mockReturnValue(
    new App({
      signingSecret: import.meta.env.VITE_SLACK_SIGNING_SECRET,
      token: import.meta.env.VITE_SLACK_BOT_TOKEN,
    }),
  ),
}));

describe("Squad welcome message", () => {
  beforeAll(async () => {
    await cleanUp("users");
    await cleanUp("iceBreakerThreads");
    await cleanUp("presentIdeas");
  });

  afterEach(async () => {
    await deleteLastRandomChannelPost();
    await deleteLastDm();

    await cleanUp("users");
    await cleanUp("iceBreakerThreads");
    await cleanUp("presentIdeas");
  });

  it(
    "Should contain icebreaker links and present ideas",
    async () => {
      await testDb.insert(users).values([
        {
          id: constants.userId,
          teamId: constants.teamId,
          birthday: dayjs.utc().add(2, "month").toDate(),
        },
        {
          id: constants.otherUserId,
          teamId: constants.teamId,
          birthday: new Date(),
        },
      ]);

      const iceBreakerEventId = "W01_" + Date.now().toString();

      await sendCronEvent("iceBreaker", iceBreakerEventId);

      const threadId = await waitForIceBreakerThreads({
        teamId: constants.teamId,
        userId: constants.userId,
        expectedCount: 1,
      }).then((threads) => threads[0].threadId);

      await Promise.all(
        constants.presentIdeas.map(({ userId, presentIdea }) =>
          testDb.insert(presentIdeas).values({
            teamId: constants.teamId,
            userId,
            birthdayPerson: constants.userId,
            presentIdea: presentIdea,
          }),
        ),
      );

      const welcomeMessageEventId = "W02_" + Date.now().toString();

      await sendScheduleEvent({
        eventId: welcomeMessageEventId,
        eventType: "sendSquadWelcomeMessage",
        payload: {
          team: import.meta.env.VITE_SLACK_TEAM_ID,
          birthdayPerson: constants.userId,
          conversationId: import.meta.env.VITE_SLACK_DM_ID,
          eventId: welcomeMessageEventId,
        },
      });

      const messageSent = await waitForDm(welcomeMessageEventId);

      expect(messageSent.blocks?.[0].text?.text).toContain(
        `<@${constants.userId}>`,
      );

      const link = await getIceBreakerThreadLink(threadId);

      expect(messageSent.blocks?.[1].text?.text).toContain(link.permalink);

      constants.presentIdeas.forEach(({ userId, presentIdea }) => {
        expect(messageSent.blocks?.[2].text?.text).toContain(`<@${userId}>`);

        const ideaParts = presentIdea.split("\n");

        ideaParts.forEach((part) => {
          expect(messageSent.blocks?.[2].text?.text).toContain(part);
        });
      });
    },
    timeout,
  );
});
