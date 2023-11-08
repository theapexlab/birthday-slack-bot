import { and, eq } from "drizzle-orm";

import { db } from "@/db/index";
import { users } from "@/db/schema";
import { handleEvent } from "@/utils/eventBridge/handleEvent";

export const handler = handleEvent(
  "memberLeftChannel",
  async ({ user, team }) => {
    try {
      await db
        .delete(users)
        .where(and(eq(users.id, user), eq(users.teamId, team)));
    } catch (error) {
      console.error("Error processing memberLeftChannel event: ", error);
    }
  },
);
