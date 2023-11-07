import { getTeammates } from "@/db/queries/getTeammates";
import { handleEvent } from "@/utils/eventBridge/handleEvent";
import { publishEvent } from "@/utils/eventBridge/publishEvent";

export const handler = handleEvent(
  "askPresentIdeasFromTeam",
  async ({ team, birthdayPerson, eventId }) => {
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
  },
);
