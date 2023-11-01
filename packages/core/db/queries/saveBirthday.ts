import { db } from "@/db/index";
import { users } from "@/db/schema";

type Args = {
  user: string;
  teamId: string;
  birthday: string;
};

export const saveBirthday = async ({ birthday, teamId, user }: Args) => {
  await db
    .insert(users)
    .values({
      id: user,
      teamId,
      birthday: new Date(birthday),
    })
    .onConflictDoUpdate({
      target: [users.id, users.teamId],
      set: {
        birthday: new Date(birthday),
      },
    });
};
