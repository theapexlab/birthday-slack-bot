import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

import { getBirthdays } from "@/db/queries/getBirthdays";
import { publishEvent } from "@/utils/eventBridge/publishEvent";
import { cronHandler } from "@/utils/lambda/cronHandler";

export const handler = cronHandler(async (eventId?: string) => {
  const today = dayjs().utc().startOf("day");

  const users = await getBirthdays(today.add(2, "month"));

  await Promise.all(
    users.map((user) =>
      publishEvent("askPresentIdeas", {
        team: user.teamId,
        user: user.id,
        eventId,
      }),
    ),
  );
});
