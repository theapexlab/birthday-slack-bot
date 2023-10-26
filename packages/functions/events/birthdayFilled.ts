import { constructConfirmBirthdayMessage } from "@/services/slack/constructConfirmBirthdayMessage";
import { handleEvent } from "@/utils/eventBridge/handleEvent";

export const handler = handleEvent(
  "birthdayFilled",
  async ({ birthday, responseUrl, eventId }) => {
    await fetch(responseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        constructConfirmBirthdayMessage({
          birthday,
          eventId,
        }),
      ),
    });
  },
);
