import { deleteUser } from "@/db/queries/deleteUser";
import { handleEvent } from "@/utils/eventBridge/handleEvent";

export const handler = handleEvent(
  "memberLeftChannel",
  async ({ user, team }) => {
    try {
      await deleteUser(user, team);
    } catch (error) {
      console.error("Error processing memberLeftChannel event: ", error);
    }
  },
);
