import { insertDb } from "./unit/dbOperations";

export const seedSquadJoins = async (
  birthdayPerson: string,
  teamId: string,
  userIds: string[],
  count: number,
) => {
  const insertedSquadMembers = userIds.slice(0, count);

  await insertDb(
    "users",
    insertedSquadMembers.map((userId) => ({
      userId,
      teamId: teamId,
      birthdayPerson,
    })),
  );

  return insertedSquadMembers;
};
