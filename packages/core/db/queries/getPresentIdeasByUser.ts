import { and, eq } from "drizzle-orm";

import { db } from "@/db/index";
import { presentIdeas } from "@/db/schema";

export const getPresentIdeasByUser = async (teamId: string, userId: string) => {
  const ideas = await db
    .select()
    .from(presentIdeas)
    .where(
      and(
        eq(presentIdeas.teamId, teamId),
        eq(presentIdeas.birthdayPerson, userId),
      ),
    );

  return ideas.reduce<Map<string, string[]>>((acc, idea) => {
    const currentIdeas = acc.get(idea.userId) ?? [];
    acc.set(idea.userId, [...currentIdeas, idea.presentIdea]);
    return acc;
  }, new Map());
};
