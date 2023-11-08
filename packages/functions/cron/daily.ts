import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

import {
  getBirthdays,
  getUsersWhoseBirthdayIsMissing,
} from "@/db/queries/getBirthdays";
import { publishEvent } from "@/utils/eventBridge/publishEvent";
import { cronHandler } from "@/utils/lambda/cronHandler";

const sendReminderWhoseBirthdayIsMissing = async () => {
  const users = await getUsersWhoseBirthdayIsMissing();

  await Promise.all(
    users.map((user) =>
      publishEvent("askBirthday", {
        user: user.id,
        eventId: "askBirthday",
      }),
    ),
  );
};

export const handler = cronHandler(async (eventId?: string) => {
  const today = dayjs().utc().startOf("day");

  const users = await getBirthdays(today.add(2, "month"));

  await Promise.all(
    users.map((user) =>
      publishEvent("askPresentIdeasFromTeam", {
        team: user.teamId,
        birthdayPerson: user.id,
        eventId,
      }),
    ),
  );

  await sendReminderWhoseBirthdayIsMissing();

  return {
    users,
    message: users.length ? "Sent present ideas requests" : "No birthdays",
  };
});
