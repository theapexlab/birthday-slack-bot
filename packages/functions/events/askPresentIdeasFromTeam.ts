import { getTeammates } from "@/db/queries/getTeammates";
import { handleEvent } from "@/utils/eventBridge/handleEvent";
import { publishEvent } from "@/utils/eventBridge/publishEvent";
import { publishScheduledEvent } from "@/utils/scheduler/publishScheduledEvent";
export const handler = handleEvent(
  "askPresentIdeasFromTeam",
  async ({ team, birthdayPerson, eventId }) => {
    try {
      const teammates = await getTeammates(team, birthdayPerson);

      await Promise.all(
        teammates.map((teammate) =>
          publishEvent("askPresentIdeasFromUser", {
            user: teammate,
            birthdayPerson,
            eventId,
          }),
        ),
      );
      await publishScheduledEvent(
        "askPresentAndSquadJoinFromTeam",
        {
          birthdayPerson,
          team,
          eventId,
        },
        {
          days: 4,
        },
      );
    } catch (error) {
      console.error("Error processing askPresentIdeasFromTeam event: ", error);
    }
  },
);
