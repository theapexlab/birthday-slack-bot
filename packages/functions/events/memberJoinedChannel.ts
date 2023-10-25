import { Config } from "sst/node/config";

import { getBotUserId } from "@/services/slack/getBotUserId";
import { getUserInfo } from "@/services/slack/getUserInfo";
import { handleEvent } from "@/utils/eventBridge/handleEvent";
import { publishEvent } from "@/utils/eventBridge/publishEvent";

export const handler = handleEvent("memberJoinedChannel", async (event) => {
  try {
    console.log(
      `MEMBER_JOINED_CHANNEL: ${event.channel} ${event.user} ${event.eventId}`,
    );

    if (event.channel !== Config.CORE_SLACK_CHANNEL_ID) {
      console.log(
        `MEMBER_JOINED_CHANNEL: Ignoring event from channel ${event.channel}`,
      );
      return;
    }

    const botUserId = await getBotUserId();

    if (event.user === botUserId) {
      await publishEvent("botJoined", {
        channel: event.channel,
        eventId: event.eventId,
      });
      return;
    }

    const userInfo = await getUserInfo(event.user);

    if (userInfo.user?.is_bot) {
      return;
    }

    await publishEvent("askBirthday", {
      user: event.user,
      eventId: event.eventId,
    });
  } catch (error) {
    console.error(`Error processing slack event: ${error}`);
  }
});
