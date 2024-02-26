import MockDate from "mockdate";

import { getIceBreakerWindow } from "@/services/birthday/getIcebreakerWindow";

import { insertDb } from "./unit/dbOperations";

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

  await insertDb(
    "users",
    birthdays.map((birthday, i) => ({
      id: `U${i + 1}`,
      team_id: "T1",
      birthday: birthday.toDate(),
    })),
  );
};

export const usersInWindow = ["U2", "U3", "U4", "U7"];
export const usersOutsideWindow = ["U1", "U5", "U6", "U8"];
