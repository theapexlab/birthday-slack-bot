import { and, eq } from "drizzle-orm";

import { db } from "@/db/index";
import { iceBreakerThreads } from "@/db/schema";

export const getIceBreakerThreads = async (teamId: string, userId?: string) => {
  const threads = await db
    .select({
      threadId: iceBreakerThreads.threadId,
    })
    .from(iceBreakerThreads)
    .where(
      and(
        eq(iceBreakerThreads.teamId, teamId),
        userId ? eq(iceBreakerThreads.userId, userId) : undefined,
      ),
    );

  return threads.map((thread) => thread.threadId);
};
