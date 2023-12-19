import { and, eq } from "drizzle-orm";

import { db } from "@/db/index";
import { iceBreakerThreads, presentIdeas, squadJoins } from "@/db/schema";

export const deleteBirthdayInputs = async (teamId: string, userId: string) => {
  console.log("Deleting birthday inputs", teamId, userId);

  await db.transaction(async (tx) => {
    await tx
      .delete(iceBreakerThreads)
      .where(
        and(
          eq(iceBreakerThreads.teamId, teamId),
          eq(iceBreakerThreads.userId, userId),
        ),
      );

    await tx
      .delete(presentIdeas)
      .where(
        and(
          eq(presentIdeas.teamId, teamId),
          eq(presentIdeas.birthdayPerson, userId),
        ),
      );

    await tx
      .delete(squadJoins)
      .where(
        and(
          eq(squadJoins.teamId, teamId),
          eq(squadJoins.birthdayPerson, userId),
        ),
      );
  });

  console.log("Birthday inputs deleted", teamId, userId);
};
