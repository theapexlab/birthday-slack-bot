import { handleEvent } from "@/utils/eventBridge/handleEvent";

//TODO APEX-1562
export const handler = handleEvent(
  "sendSquadWelcomeMessage",
  async ({ team, birthdayPerson, conversationId, eventId }) => {
    try {
      console.info({
        team,
        birthdayPerson,
        conversationId,
        eventId,
      });
    } catch (error) {
      console.error("Error processing sendSquadWelcomeMessage event: ", error);
    }
  },
);
