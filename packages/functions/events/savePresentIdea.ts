import { savePresentIdea } from "@/db/queries/savePresentIdea";
import { constructPresentIdeaSavedMessage } from "@/services/slack/constructPresentIdeaSavedMessage";
import { handleEvent } from "@/utils/eventBridge/handleEvent";

export const handler = handleEvent(
  "savePresentIdea",
  async ({ user, team, birthdayPerson, presentIdea, responseUrl }) => {
    try {
      await savePresentIdea({
        userId: user,
        teamId: team,
        birthdayPerson,
        presentIdea,
      });

      await fetch(responseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(constructPresentIdeaSavedMessage()),
      });
    } catch (error) {
      console.error("Error processing savePresentIdea event: ", error);
    }
  },
);
