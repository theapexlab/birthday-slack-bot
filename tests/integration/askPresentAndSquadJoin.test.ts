import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { presentIdeas, testItems, users } from "@/db/schema";
import { constructLoadingMessage } from "@/services/slack/constructLoadingMessage";
import { constructPresentIdeaSavedMessage } from "@/services/slack/constructPresentIdeaSavedMessage";
import { timeout } from "@/testUtils/constants";
import { deleteLastDm } from "@/testUtils/integration/deleteLastDm";
import { sendScheduleEvent } from "@/testUtils/integration/sendScheduleEvent";
import { sendSlackInteraction } from "@/testUtils/integration/sendSlackInteraction";
import { waitForDm } from "@/testUtils/integration/waitForDm";
import {
  testDb,
  waitForPresentIdeas,
  waitForSquadJoins,
  waitForTestItems,
} from "@/testUtils/testDb";
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

      const eventId = "SJ1_" + Date.now().toString();

      await sendScheduleEvent({
        eventId,
        eventType: "askPresentAndSquadJoinFromTeam",
        payload: {
          team: import.meta.env.VITE_SLACK_TEAM_ID,
          birthdayPerson: constants.birthdayPerson,
          eventId,
        },
      });

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

      const eventId = "SJ2_" + Date.now().toString();

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

      const presentIdea = (
        await waitForPresentIdeas({
          teamId: constants.teamId,
          userId: constants.userId,
        })
      )[0];

      const squadJoin = (
        await waitForSquadJoins({
          teamId: constants.teamId,
          userId: constants.userId,
        })
      )[0];

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

      const items = await waitForTestItems(eventId);

      expect(items.length, "Incorrect number of items saved").toEqual(2);

      expect(items, "Didn't send loading message").toContainEqual(
        expect.objectContaining({
          testId: eventId,
          payload: JSON.stringify(constructLoadingMessage()),
        }),
      );

      expect(
        items,
        "Payload doesn't match present idea saved message",
      ).toContainEqual(
        expect.objectContaining({
          testId: eventId,
          payload: JSON.stringify(constructPresentIdeaSavedMessage()),
        }),
      );
    },
    timeout,
  );
});
