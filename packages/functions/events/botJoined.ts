import { getChannelMembers } from "@/services/slack/getChannelMembers";
import { handleEvent } from "@/utils/eventBridge/handleEvent";
import { publishEvent } from "@/utils/eventBridge/publishEvent";

export const handler = handleEvent("botJoined", async ({ channel }) => {
  try {
    const users = await getChannelMembers(channel);

    for (const user of users) {
      publishEvent("askBirthday", {
        user,
      });
    }
  } catch (error) {
    console.error("Error processing botJoined event: ", error as string);
  }
});
