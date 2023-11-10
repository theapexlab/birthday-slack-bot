import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { eq } from "drizzle-orm";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { presentIdeas, squadJoins, testItems, users } from "@/db/schema";
import { constructPresentIdeaSavedMessage } from "@/services/slack/constructPresentIdeaSavedMessage";
import { pollInterval, timeout, waitTimeout } from "@/testUtils/constants";
import { deleteLastDm } from "@/testUtils/integration/deleteLastDm";
import { sendScheduleEvent } from "@/testUtils/integration/sendScheduleEvent";
import { sendSlackInteraction } from "@/testUtils/integration/sendSlackInteraction";
import { waitForDm } from "@/testUtils/integration/waitForDm";
import { testDb, waitForTestItem } from "@/testUtils/testDb";
import { scheduleEvent } from "@/types/schedule";
import {
  additionalPresentIdeasInputActionId,
  additionalPresentIdeasSaveButtonActionId,
  squadJoinCheckboxActionId,
} from "@/types/SlackInteractionRequest";

dayjs.extend(utc);

const constants = vi.hoisted(() => ({
  teamId: "T1",
  birthdayPerson: "U1",
  userId: "U2",
  presentIdea: "Test idea",
}));

describe("Present and Squad Join", () => {
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
    "Should ask for present and squad join in DM",
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

      await sendScheduleEvent(
        scheduleEvent,
        JSON.stringify({
          eventId,
          eventType: "askPresentAndSquadJoinFromTeam",
          payload: {
            team: import.meta.env.VITE_SLACK_TEAM_ID,
            birthdayPerson: constants.birthdayPerson,
            eventId,
          },
        }),
      );

      const message = await waitForDm(eventId);

      expect(message.blocks?.length, "Message doesn't have 5 blocks").toBe(5);

      expect(
        message.blocks?.[1].text?.text,
        "Block doesn't mention birthday person.",
      ).toContain(`<@${constants.birthdayPerson}>`);

      expect(
        message.blocks?.[2].element?.action_id,
        "Block doesn't contain input element",
      ).toBe(additionalPresentIdeasInputActionId);

      expect(
        message.blocks?.[3].element?.action_id,
        "Block doesn't contain squad join checkbox",
      ).toBe(squadJoinCheckboxActionId);

      expect(
        message.blocks?.[4].elements?.[0].action_id,
        "Block doesn't contain save button",
      ).toBe(additionalPresentIdeasSaveButtonActionId);
    },
    timeout,
  );

  it(
    "Should save additional present idea and squad join to db",
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
            action_id: additionalPresentIdeasSaveButtonActionId,
            type: "button",
            value: constants.birthdayPerson,
          },
        ],
        state: {
          values: {
            additionalPresentIdeasInputBlockId: {
              additionalPresentIdeasActionId: {
                type: "plain_text_input",
                value: constants.presentIdea,
              },
            },
            squadJoinCheckboxBlockId: {
              squadJoinCheckboxActionId: {
                type: "checkboxes",
                selected_options: [
                  {
                    value: "Sure",
                  },
                ],
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
      const squadJoin = await vi.waitFor(
        async () => {
          const items = await testDb
            .select()
            .from(squadJoins)
            .where(eq(squadJoins.userId, constants.userId))
            .limit(1);

          if (items.length === 0) {
            throw new Error("Squad join not saved");
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

      expect(
        squadJoin.birthdayPerson,
        "Squad join not matching with the birthday person",
      ).toEqual(presentIdea.birthdayPerson);

      const item = await waitForTestItem(eventId);

      expect(
        item.payload,
        "Payload doesn't match present idea saved message",
      ).toEqual(JSON.stringify(constructPresentIdeaSavedMessage()));
    },
    timeout,
  );
});
