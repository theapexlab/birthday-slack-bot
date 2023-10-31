import {
  constructAskBirthdayMessage,
  constructAskBirthdayMessageReplacement,
} from "@/services/slack/constructAskBirthdayMessage";
import { createSlackApp } from "@/services/slack/createSlackApp";
import { getUserInfo } from "@/services/slack/getUserInfo";
import { handleEvent } from "@/utils/eventBridge/handleEvent";

export const handler = handleEvent(
  "askBirthday",
  async ({ user, eventId, responseUrl }) => {
    try {
      const userInfo = await getUserInfo(user);

      if (!userInfo.user || userInfo.user.is_bot) {
        return;
      }

      const app = createSlackApp();

      const payload = {
        user,
        name: userInfo.user.profile?.first_name || userInfo.user.name || "",
        eventId,
      };

      if (responseUrl) {
        await fetch(responseUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(constructAskBirthdayMessageReplacement(payload)),
        });
        return;
      }

      await app.client.chat.postMessage(constructAskBirthdayMessage(payload));
    } catch (error) {
      console.error("Error processing askBirthday event: ", error);
    }
  },
);
