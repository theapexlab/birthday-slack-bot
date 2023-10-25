import { getChannelMembers } from "@/services/slack/getChannelMembers";
import { handleEvent } from "@/utils/eventBridge/handleEvent";
import { publishEvent } from "@/utils/eventBridge/publishEvent";

export const handler = handleEvent(
  "botJoined",
  async ({ channel, eventId }) => {
    try {
      console.log(`BOT_JOINED: ${channel} ${eventId}`);

      const users = await getChannelMembers(channel);

      await Promise.all(
        users.map((user) =>
          publishEvent("askBirthday", {
            user,
            eventId,
          }),
        ),
      );
    } catch (error) {
      console.error("Error processing botJoined event: ", error);
    }
  },
);
