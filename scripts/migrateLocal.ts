import dotenv from "dotenv";

import { dbFactory } from "@/db/dbFactory";

dotenv.config({
  path: ".env.local",
});

const [, migrate] = dbFactory("node", {
  node: {
    connectionString: process.env.DB_URL ?? "",
  },
  aws: {
    database: "",
    secretArn: "",
    resourceArn: "",
  },
});

await migrate();
