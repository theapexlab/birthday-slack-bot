import { dbFactory } from "./dbFactory";

export const [db, migrate] = dbFactory(
  process.env.IS_LOCAL
    ? {
        connectionString: process.env.DB_URL ?? "",
      }
    : {
        host: process.env.DB_HOST ?? "",
        database: process.env.DB_NAME ?? "",
        user: process.env.DB_USER ?? "",
        password: process.env.DB_PASSWORD ?? "",
      },
);
