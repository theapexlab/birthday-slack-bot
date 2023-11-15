import { createSlackApp } from "@/services/slack/createSlackApp";
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

      //TODO APEX-1562
      const app = createSlackApp();
      await app.client.chat.postMessage({
        channel: conversationId,
        metadata: eventId
          ? {
              event_type: "sendSquadWelcomeMessage",
              event_payload: {
                eventId,
              },
            }
          : undefined,
        text: "Test message",
      });
    } catch (error) {
      console.error("Error processing sendSquadWelcomeMessage event: ", error);
    }
  },
);
