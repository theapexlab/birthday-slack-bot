import { and, eq } from "drizzle-orm";

import { db } from "@/db/index";
import { users } from "@/db/schema";

export const deleteUser = async (userId: string, teamId: string) => {
  console.log("Deleting user", userId, teamId);

  await db
    .delete(users)
    .where(and(eq(users.id, userId), eq(users.teamId, teamId)));

  console.log("User deleted", userId, teamId);
};
