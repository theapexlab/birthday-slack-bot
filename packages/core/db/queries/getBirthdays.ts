import { and, gte, lt } from "drizzle-orm";

import { db } from "@/db/index";
import { users } from "@/db/schema";

export const getBirthdaysBetween = async (startDate: Date, endDate: Date) =>
  db.query.users.findMany({
    where: and(gte(users.birthday, startDate), lt(users.birthday, endDate)),
  });
