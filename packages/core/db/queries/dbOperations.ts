import { sql } from "drizzle-orm";

import { db } from "@/db/index";

export const executeSql = async (executeSql: string) =>
  db.execute(sql.raw(executeSql));
