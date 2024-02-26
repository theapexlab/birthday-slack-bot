import { sql } from "drizzle-orm";

import { db } from "@/db/index";

export const cleanUp = async (tableName: string) =>
  db.execute(sql`DELETE FROM ${tableName}`);
