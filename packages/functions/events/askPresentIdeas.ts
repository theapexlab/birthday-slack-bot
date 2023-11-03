import { handleEvent } from "@/utils/eventBridge/handleEvent";

export const handler = handleEvent(
  "askPresentIdeas",
  async ({ team, user, eventId }) => {
    console.log(`askPresentIdeas: ${team} ${user} ${eventId}`);
  },
);
