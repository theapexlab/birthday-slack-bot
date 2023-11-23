import { saveBirthday } from "@/db/queries/saveBirthday";
import { constructBirthdayConfirmedMessage } from "@/services/slack/constructBirthdayConfirmedMessage";
import { constructErrorMessage } from "@/services/slack/constructErrorMessage";
import { sendResponse } from "@/services/slack/sendResponse";
import { handleEvent } from "@/utils/eventBridge/handleEvent";

export const handler = handleEvent(
  "birthdayConfirmed",
  async ({ user, team, birthday, responseUrl }) => {
    try {
      await saveBirthday({ user, teamId: team, birthday });

      await sendResponse(responseUrl, constructBirthdayConfirmedMessage());
    } catch (error) {
      await sendResponse(responseUrl, constructErrorMessage(error));

      console.error("Error sending birthday confirmed message: ", error);
    }
  },
);
