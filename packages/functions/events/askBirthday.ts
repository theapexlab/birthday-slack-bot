import { saveBirthday } from "@/db/queries/saveBirthday";
import {
  constructAskBirthdayMessage,
  constructAskBirthdayMessageReplacement,
} from "@/services/slack/constructAskBirthdayMessage";
import { constructErrorMessage } from "@/services/slack/constructErrorMessage";
import { createSlackApp } from "@/services/slack/createSlackApp";
import { getUserInfo } from "@/services/slack/getUserInfo";
import { sendResponse } from "@/services/slack/sendResponse";
import { handleEvent } from "@/utils/eventBridge/handleEvent";

export const handler = handleEvent(
  "askBirthday",
  async ({ user, eventId, responseUrl }) => {
    try {
      const { user: userInfo } = await getUserInfo(user);

      if (!userInfo || userInfo.is_bot || !userInfo.team_id) {
        return;
      }

      const app = createSlackApp();

      const payload = {
        user,
        name: userInfo.profile?.first_name || userInfo.name || "",
        eventId,
      };

      if (responseUrl) {
        await sendResponse(
          responseUrl,
          constructAskBirthdayMessageReplacement(payload),
        );
        return;
      }

      await saveBirthday({
        birthday: null,
        teamId: userInfo.team_id,
        user,
      });

      await app.client.chat.postMessage(constructAskBirthdayMessage(payload));
    } catch (error) {
      if (responseUrl) {
        await sendResponse(responseUrl, constructErrorMessage(error));
      }

      console.error("Error processing askBirthday event: ", error);
    }
  },
);
