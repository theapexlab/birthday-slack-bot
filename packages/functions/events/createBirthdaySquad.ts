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
    const { KRISZTA_SLACK_USER_ID, MATE_SLACK_USER_ID } = Config;

    // Include Kriszta in all squads except on her birthday, where Mate is added to the squad.
    const adminPerson =
      birthdayPerson !== KRISZTA_SLACK_USER_ID
        ? KRISZTA_SLACK_USER_ID
        : MATE_SLACK_USER_ID;

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
