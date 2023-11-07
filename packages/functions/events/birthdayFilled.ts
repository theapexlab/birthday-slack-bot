import { constructConfirmBirthdayMessage } from "@/services/slack/constructConfirmBirthdayMessage";
import { handleEvent } from "@/utils/eventBridge/handleEvent";

export const handler = handleEvent(
  "birthdayFilled",
  async ({ birthday, responseUrl }) => {
    try {
      await fetch(responseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(constructConfirmBirthdayMessage(birthday)),
      });
    } catch (error) {
      console.error("birthdayFilled", error);
    }
  },
);
