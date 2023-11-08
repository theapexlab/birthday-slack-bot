import type { Dayjs } from "dayjs";
import { and, isNull, or, sql } from "drizzle-orm";

import { db } from "@/db/index";
import { users } from "@/db/schema";

export const getBirthdaysBetween = async (startDate: Dayjs, endDate: Dayjs) => {
  const filterStart = or(
    sql`EXTRACT('MONTH' FROM ${users.birthday}) > ${startDate.month() + 1}`,
    and(
      sql`EXTRACT('MONTH' FROM ${users.birthday}) = ${startDate.month() + 1}`,
      sql`EXTRACT('DAY' FROM ${users.birthday}) >= ${startDate.date()}`,
    ),
  );

  const filterEnd = or(
    sql`EXTRACT('MONTH' FROM ${users.birthday}) < ${endDate.month() + 1}`,
    and(
      sql`EXTRACT('MONTH' FROM ${users.birthday}) = ${endDate.month() + 1}`,
      sql`EXTRACT('DAY' FROM ${users.birthday}) < ${endDate.date()}`,
    ),
  );

  if (startDate.year() !== endDate.year()) {
    return db.query.users.findMany({
      where: or(filterStart, filterEnd),
    });
  }

  return db.query.users.findMany({
    where: and(filterStart, filterEnd),
  });
};

export const getBirthdays = async (date: Dayjs) =>
  db.query.users.findMany({
    where: and(
      sql`EXTRACT('MONTH' FROM ${users.birthday}) = ${date.month() + 1}`,
      sql`EXTRACT('DAY' FROM ${users.birthday}) = ${date.date()}`,
    ),
  });

export const getUsersWhoseBirthdayIsMissing = async () =>
  db.query.users.findMany({
    where: isNull(users.birthday),
  });
