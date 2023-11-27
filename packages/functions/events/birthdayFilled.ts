import { constructConfirmBirthdayMessage } from "@/services/slack/constructConfirmBirthdayMessage";
import { constructErrorMessage } from "@/services/slack/constructErrorMessage";
import { sendResponse } from "@/services/slack/sendResponse";
import { handleEvent } from "@/utils/eventBridge/handleEvent";

export const handler = handleEvent(
  "birthdayFilled",
  async ({ birthday, responseUrl }) => {
    try {
      await sendResponse(
        responseUrl,
        constructConfirmBirthdayMessage(birthday),
      );
    } catch (error) {
      await sendResponse(responseUrl, constructErrorMessage(error));

      console.error("birthdayFilled", error);
    }
  },
);
