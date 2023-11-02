import MockDate from "mockdate";

import { users } from "@/db/schema";
import { getIceBreakerWindow } from "@/services/birthday/getIcebreakerWindow";

import { testDb } from "./testDb";

export const generateIceBreakerTestUsers = async (today?: string) => {
  if (today) {
    MockDate.set(today);
  }

  let { start, end } = getIceBreakerWindow();

  if (today) {
    MockDate.reset();
  }

  start = start.set("year", 1986);
  end = end.set("year", 1997);

  const birthdays = [
    start.subtract(1, "day"), // 1 day before
    start, // start
    start.add(1, "day"), // 1 day after
    end.subtract(1, "day"), // 1 day before end
    end, // end
    end.add(1, "day"), // 1 day after end
    start.add(30, "day"), // random day in the window
    start.add(6, "months"), // random day outside the window
  ];

  await Promise.all(
    birthdays.map((birthday, i) =>
      testDb.insert(users).values({
        id: `U${i + 1}`,
        teamId: "T1",
        birthday: birthday.toDate(),
      }),
    ),
  );
};

export const usersInWindow = ["U2", "U3", "U4", "U7"];
export const usersOutsideWindow = ["U1", "U5", "U6", "U8"];
