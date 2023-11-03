import { and, eq, not } from "drizzle-orm";

import { db } from "@/db/index";
import { users } from "@/db/schema";

export const getTeammates = async (teamId: string, userId: string) => {
  const teammates = await db
    .select({
      id: users.id,
    })
    .from(users)
    .where(and(eq(users.teamId, teamId), not(eq(users.id, userId))));

  return teammates.map((teammate) => teammate.id);
};
