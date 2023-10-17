import { handleEvent } from "@/utils/eventBridge/handleEvent";

export const handler = handleEvent("botJoined", async ({ channel }) => {
  console.log(`Bot joined channel ${channel}`);
});
