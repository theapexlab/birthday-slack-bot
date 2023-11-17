import { constructBirthdaySquadWelcomeMessage } from "@/services/slack/constructBirthdaySquadWelcomeMessage";
import { createSlackApp } from "@/services/slack/createSlackApp";
import { handleEvent } from "@/utils/eventBridge/handleEvent";

export const handler = handleEvent(
  "sendSquadWelcomeMessage",
  async ({ team, birthdayPerson, conversationId, eventId }) => {
    try {
      const message = await constructBirthdaySquadWelcomeMessage({
        channel: conversationId,
        teamId: team,
        birthdayPerson,
        eventId,
      });

      const app = createSlackApp();
      await app.client.chat.postMessage(message);
    } catch (error) {
      console.error("Error processing sendSquadWelcomeMessage event: ", error);
    }
  },
);
