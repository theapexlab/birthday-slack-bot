import { saveSquadJoin } from "@/db/queries/saveSquadJoin";
import { handleEvent } from "@/utils/eventBridge/handleEvent";

export const handler = handleEvent(
  "saveSquadJoin",
  async ({ user, team, birthdayPerson }) => {
    try {
      await saveSquadJoin({
        userId: user,
        teamId: team,
        birthdayPerson,
      });
    } catch (error) {
      console.error("Error processing saveSquadJoin event: ", error);
    }
  },
);
