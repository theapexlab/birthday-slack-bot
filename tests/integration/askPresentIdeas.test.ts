import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { eq } from "drizzle-orm";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { presentIdeas, testItems, users } from "@/db/schema";
import { getScheduleWithTimeOffset } from "@/functions/utils/scheduler/getScheduleExtension";
import { constructPresentIdeaSavedMessage } from "@/services/slack/constructPresentIdeaSavedMessage";
import { pollInterval, timeout, waitTimeout } from "@/testUtils/constants";
import { deleteLastDm } from "@/testUtils/integration/deleteLastDm";
import {
  cleanUpSchedule,
  getSchedule,
} from "@/testUtils/integration/scheduler";
import { sendCronEvent } from "@/testUtils/integration/sendCronEvent";
import { sendSlackInteraction } from "@/testUtils/integration/sendSlackInteraction";
import { waitForDm } from "@/testUtils/integration/waitForDm";
import { testDb, waitForTestItem } from "@/testUtils/testDb";
import {
  presentIdeasInputActionId,
  presentIdeasSaveButtonActionId,
} from "@/types/SlackInteractionRequest";

dayjs.extend(utc);

const constants = vi.hoisted(() => ({
  teamId: "T1",
  birthdayPerson: "U1",
  userId: "U2",
  presentIdea: "Test idea",
}));

describe("Present ideas", () => {
  beforeAll(async () => {
    await testDb.delete(users);
    await testDb.delete(testItems);
    await testDb.delete(presentIdeas);
  });

  afterEach(async () => {
    await deleteLastDm();

    await testDb.delete(users);
    await testDb.delete(testItems);
    await testDb.delete(presentIdeas);
  });

  it(
    "Should ask for present ideas in DM",
    async () => {
      await testDb.insert(users).values([
        {
          id: import.meta.env.VITE_SLACK_USER_ID,
          teamId: import.meta.env.VITE_SLACK_TEAM_ID,
          birthday: new Date(),
        },
        {
          id: constants.birthdayPerson,
          teamId: import.meta.env.VITE_SLACK_TEAM_ID,
          birthday: dayjs.utc().add(2, "month").toDate(),
        },
      ]);

      const eventId = "PI1_" + Date.now().toString();

      await sendCronEvent("daily", eventId);

      const message = await waitForDm(eventId);

      expect(message.blocks?.length, "Message doesn't have 4 blocks").toBe(4);

      expect(
        message.blocks?.[1].text?.text,
        "Block doesn't mention birthday person.",
      ).toContain(`<@${constants.birthdayPerson}>`);

      expect(
        message.blocks?.[2].element?.action_id,
        "Block doesn't contain input element",
      ).toBe(presentIdeasInputActionId);

      expect(
        message.blocks?.[3].elements?.[0].action_id,
        "Block doesn't contain save button",
      ).toBe(presentIdeasSaveButtonActionId);

      await cleanUpSchedule(`${eventId}_askPresentAndSquadJoinFromTeam`);
    },
    timeout,
  );

  it(
    "Should save present idea to db",
    async () => {
      await testDb.insert(users).values([
        {
          id: constants.userId,
          teamId: constants.teamId,
          birthday: new Date(),
        },
        {
          id: constants.birthdayPerson,
          teamId: constants.teamId,
          birthday: new Date(),
        },
      ]);

      const eventId = "PI2_" + Date.now().toString();

      await sendSlackInteraction({
        type: "block_actions",
        user: {
          id: constants.userId,
          team_id: constants.teamId,
        },
        response_url: `${
          import.meta.env.VITE_API_URL
        }/slack/test-payload?testId=${eventId}`,
        actions: [
          {
            action_id: "presentIdeasSaveButton",
            type: "button",
            value: constants.birthdayPerson,
          },
        ],
        state: {
          values: {
            presentIdeasInputBlockId: {
              presentIdeasInputActionId: {
                type: "plain_text_input",
                value: constants.presentIdea,
              },
            },
          },
        },
      });

      const presentIdea = await vi.waitFor(
        async () => {
          const items = await testDb
            .select()
            .from(presentIdeas)
            .where(eq(presentIdeas.userId, constants.userId))
            .limit(1);

          if (items.length === 0) {
            throw new Error("Present idea not saved");
          }
          return items[0];
        },
        {
          timeout: waitTimeout,
          interval: pollInterval,
        },
      );

      expect(
        presentIdea.birthdayPerson,
        "Incorrect user saved as birthday person",
      ).toEqual(constants.birthdayPerson);

      expect(presentIdea.presentIdea, "Incorrect present idea saved").toEqual(
        constants.presentIdea,
      );

      const item = await waitForTestItem(eventId);

      expect(
        item.payload,
        "Payload doesn't match present idea saved message",
      ).toEqual(JSON.stringify(constructPresentIdeaSavedMessage()));
    },
    timeout,
  );
  it(
    "Should create schedule for PresentAndSquadJoin event",
    async () => {
      await testDb.insert(users).values([
        {
          id: import.meta.env.VITE_SLACK_USER_ID,
          teamId: import.meta.env.VITE_SLACK_TEAM_ID,
          birthday: new Date(),
        },
        {
          id: constants.birthdayPerson,
          teamId: import.meta.env.VITE_SLACK_TEAM_ID,
          birthday: dayjs.utc().add(2, "month").toDate(),
        },
      ]);

      const eventId = "PI3_" + Date.now().toString();

      await sendCronEvent("daily", eventId);

      await waitForDm(eventId);

      const schedule = await getSchedule(
        `${eventId}_askPresentAndSquadJoinFromTeam`,
      );

      expect(
        schedule.ScheduleExpression,
        "Incorrect schedule extension",
      ).toEqual(getScheduleWithTimeOffset({ days: 4 }));

      expect(
        schedule.ScheduleExpressionTimezone,
        "Timezone should be UTC",
      ).toEqual("UTC");

      expect(
        schedule.ActionAfterCompletion,
        "After completion should be DELETE",
      ).toEqual("DELETE");

      await cleanUpSchedule(`${eventId}_askPresentAndSquadJoinFromTeam`);
    },
    timeout,
  );
});
