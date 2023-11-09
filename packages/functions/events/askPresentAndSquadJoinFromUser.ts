import { constructPresentAndSquadJoinMessage } from "@/services/slack/constructPresentAndSquadJoinMessage";
import { createSlackApp } from "@/services/slack/createSlackApp";
import { getUserInfo } from "@/services/slack/getUserInfo";
import { handleEvent } from "@/utils/eventBridge/handleEvent";

export const handler = handleEvent(
  "askPresentAndSquadJoinFromUser",
  async ({ birthdayPerson, user, eventId }) => {
    const userInfo = await getUserInfo(user);

    if (!userInfo.user) {
      return;
    }

    const app = createSlackApp();

    await app.client.chat.postMessage(
      constructPresentAndSquadJoinMessage({
        birthdayPerson,
        user,
        name: userInfo.user.profile?.first_name || userInfo.user.name || "",
        eventId,
      }),
    );
  },
);
