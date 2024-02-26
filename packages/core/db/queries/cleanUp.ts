import { sql } from "drizzle-orm";

import { db } from "@/db/index";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const cleanUp = async (executeSql: string) =>
  db.execute(
    sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`,
  );
