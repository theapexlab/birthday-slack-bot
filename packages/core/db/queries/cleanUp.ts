import { sql } from "drizzle-orm";

import { db } from "@/db/index";

export const cleanUp = async (executeSql: string) =>
  db.execute(sql.raw(executeSql));
