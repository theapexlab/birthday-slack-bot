import * as dotenv from "dotenv";
import { migrate } from "drizzle-orm/node-postgres/migrator";

dotenv.config({
  path: ".env.local",
});

const { db } = await import("@/db");

await migrate(db, { migrationsFolder: "./drizzle" });
