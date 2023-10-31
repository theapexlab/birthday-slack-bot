import dotenv from "dotenv";

import { dbFactory } from "@/db/dbFactory";

dotenv.config({
  path: ".env.local",
});

const [, migrate] = dbFactory({
  type: "node",
  connectionString: process.env.DB_URL ?? "",
});

await migrate();
