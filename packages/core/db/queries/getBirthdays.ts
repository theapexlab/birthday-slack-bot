import { and, gt, lte } from "drizzle-orm";

import { db } from "@/db/index";
import { users } from "@/db/schema";

export const getBirthdaysBetween = async (startDate: Date, endDate: Date) =>
  db.query.users.findMany({
    where: and(gt(users.birthday, startDate), lte(users.birthday, endDate)),
  });
