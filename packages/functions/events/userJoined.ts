import { handleEvent } from "@/utils/eventBridge/handleEvent";

export const handler = handleEvent("userJoined", async ({ user }) => {
  console.log(`New user joined ${user}`);
});
