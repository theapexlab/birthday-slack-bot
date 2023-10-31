import { users } from "./schema";
import { db } from ".";

type Args = {
  user: string;
  teamId: string;
  birthday: string;
};

export const saveBirthday = async ({ birthday, teamId, user }: Args) => {
  await db.insert(users).values({
    id: user,
    teamId,
    birthday: new Date(birthday),
  });
};
