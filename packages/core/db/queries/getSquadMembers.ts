import { and, eq, not, sql } from "drizzle-orm";

import { db } from "@/db/index";
import { squadJoins, users } from "@/db/schema";

type RandomSquadMembersInput = {
  teamId: string;
  usersToExclude: string[];
  limit: number;
};

export const getSquadMembers = async (
  teamId: string,
  birthdayPersonId: string,
) => {
  const squadMembers = await db
    .select({
      id: squadJoins.userId,
    })
    .from(squadJoins)
    .where(
      and(
        eq(squadJoins.teamId, teamId),
        eq(squadJoins.birthdayPerson, birthdayPersonId),
      ),
    )
    .orderBy(sql`RANDOM()`)
    .limit(5);

  return squadMembers.map((member) => member.id);
};

export const getRandomSquadMembers = async ({
  teamId,
  usersToExclude,
  limit,
}: RandomSquadMembersInput) => {
  const teammates = await db
    .select({
      id: users.id,
    })
    .from(users)
    .where(
      and(
        eq(users.teamId, teamId),
        ...usersToExclude.map((userId) => not(eq(users.id, userId))),
      ),
    )
    .orderBy(sql`RANDOM()`)
    .limit(limit);

  return teammates.map((teammate) => teammate.id);
};
