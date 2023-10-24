import { handleEvent } from "@/utils/eventBridge/handleEvent";

export const handler = handleEvent("memberLeftChannel", async ({ user }) => {
  console.log(`Member left ${user}`);
});
