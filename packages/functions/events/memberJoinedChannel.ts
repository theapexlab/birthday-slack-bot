import { Config } from "sst/node/config";

import { getBotUserId } from "@/services/slack/getBotUserId";
import { getUserInfo } from "@/services/slack/getUserInfo";
import { handleEvent } from "@/utils/eventBridge/handleEvent";
import { publishEvent } from "@/utils/eventBridge/publishEvent";

export const handler = handleEvent("memberJoinedChannel", async (event) => {
  try {
    if (event.channel !== Config.CORE_SLACK_CHANNEL_ID) {
      return;
    }

    const botUserId = await getBotUserId();

    if (event.user === botUserId) {
      publishEvent("botJoined", {
        channel: event.channel,
      });
      return;
    }

    const userInfo = await getUserInfo(event.user);

    if (userInfo.user?.is_bot) {
      return;
    }

    publishEvent("userJoined", {
      user: event.user,
    });
  } catch (error) {
    console.error(`Error processing slack event: ${error as string}`);
  }
});
