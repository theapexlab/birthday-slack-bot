import { Config } from "sst/node/config";

import {
  getRandomSquadMembers,
  getSquadMembers,
} from "@/db/queries/getSquadMembers";
import { openConversation } from "@/services/slack/openConversation";
import {
  BIRTHDAY_SQUAD_SIZE,
  MIN_BIRTHDAY_SQUAD_SIZE,
} from "@/utils/constants";
import { handleEvent } from "@/utils/eventBridge/handleEvent";
import { publishEvent } from "@/utils/eventBridge/publishEvent";

export const handler = handleEvent(
  "createBirthdaySquad",
  async ({ team, birthdayPerson, eventId }) => {
    const { ADMIN_SLACK_USER_ID, DEPUTY_ADMIN_SLACK_USER_ID } = Config;

    // Include admin in all squads except on the individual's birthday, where deputy admin is added to the squad.
    const adminPerson =
      birthdayPerson !== ADMIN_SLACK_USER_ID
        ? ADMIN_SLACK_USER_ID
        : DEPUTY_ADMIN_SLACK_USER_ID;

    try {
      const appliedSquadMembers = await getSquadMembers(team, birthdayPerson);

      const squadMembers = [...appliedSquadMembers];

      if (appliedSquadMembers.length < MIN_BIRTHDAY_SQUAD_SIZE) {
        const randomSquadMembers = await getRandomSquadMembers({
          teamId: team,
          usersToExclude: [birthdayPerson, adminPerson, ...appliedSquadMembers],
          limit: BIRTHDAY_SQUAD_SIZE - appliedSquadMembers.length,
        });
        squadMembers.push(...randomSquadMembers);
      }

      squadMembers.push(adminPerson);

      if (squadMembers.length < 2) {
        throw new Error("Error need at least 2 user to open a conversation");
      }

      const conversationId = await openConversation(squadMembers);

      await publishEvent("sendSquadWelcomeMessage", {
        conversationId,
        birthdayPerson,
        team,
        eventId,
      });
    } catch (error) {
      console.error("Error processing createBirthdaySquad event: ", error);
    }
  },
);
