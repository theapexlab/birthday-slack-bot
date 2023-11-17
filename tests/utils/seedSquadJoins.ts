import { squadJoins } from "@/db/schema";

import { testDb } from "./testDb";

export const seedSquadJoins = async (
  birthdayPerson: string,
  teamId: string,
  userIds: string[],
  count: number,
) => {
  const insertedSquadMembers = userIds.slice(0, count);

  await testDb.insert(squadJoins).values(
    insertedSquadMembers.map((userId) => ({
      userId,
      teamId: teamId,
      birthdayPerson,
    })),
  );

  return insertedSquadMembers;
};
