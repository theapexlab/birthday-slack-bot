import { sql } from "drizzle-orm";

import { db } from "@/db/index";

export const cleanUp = async (executeSql: string) =>
  db.execute(
    sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`,
  );
