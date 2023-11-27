import { savePresentIdea } from "@/db/queries/savePresentIdea";
import { constructErrorMessage } from "@/services/slack/constructErrorMessage";
import { constructPresentIdeaSavedMessage } from "@/services/slack/constructPresentIdeaSavedMessage";
import { sendResponse } from "@/services/slack/sendResponse";
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

      await sendResponse(responseUrl, constructPresentIdeaSavedMessage());
    } catch (error) {
      await sendResponse(responseUrl, constructErrorMessage(error));

      console.error("Error processing savePresentIdea event: ", error);
    }
  },
);
