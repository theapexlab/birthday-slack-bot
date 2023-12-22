import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

import { db } from "@/db/index";
import { users } from "@/db/schema";

type Arguments = {
  user: string;
  teamId: string;
  birthday: string | null;
};

export const saveBirthday = async ({ birthday, teamId, user }: Arguments) => {
  console.log("Saving birthday", user, birthday, teamId);

  const birthdayDate = birthday ? dayjs.utc(birthday).toDate() : null;

  await db
    .insert(users)
    .values({
      id: user,
      teamId,
      birthday: birthdayDate,
    })
    .onConflictDoUpdate({
      target: [users.id, users.teamId],
      set: {
        birthday: birthdayDate,
      },
    });

  console.log("Birthday saved", user, birthday, teamId);
};
