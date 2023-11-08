import { constructAskPresentIdeasMessage } from "@/services/slack/constructAskPresentIdeasMessage";
import { createSlackApp } from "@/services/slack/createSlackApp";
import { getUserInfo } from "@/services/slack/getUserInfo";
import { handleEvent } from "@/utils/eventBridge/handleEvent";

export const handler = handleEvent(
  "askPresentIdeasFromUser",
  async ({ birthdayPerson, user, eventId }) => {
    try {
      const userInfo = await getUserInfo(user);

      if (!userInfo.user) {
        return;
      }

      const app = createSlackApp();

      await app.client.chat.postMessage(
        constructAskPresentIdeasMessage({
          birthdayPerson,
          user,
          name: userInfo.user.profile?.first_name || userInfo.user.name || "",
          eventId,
        }),
      );
    } catch (error) {
      console.error("Error processing askPresentIdeasFromUser event: ", error);
    }
  },
);
