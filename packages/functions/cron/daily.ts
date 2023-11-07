import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

import { getBirthdays } from "@/db/queries/getBirthdays";
import { publishEvent } from "@/utils/eventBridge/publishEvent";
import { cronHandler } from "@/utils/lambda/cronHandler";

export const handler = cronHandler(async (eventId?: string) => {
  try {
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

    return {
      users,
      message: users.length ? "Sent present ideas requests" : "No birthdays",
    };
  } catch (error) {
    console.error("Error processing daily cron: ", error);
  }
});
