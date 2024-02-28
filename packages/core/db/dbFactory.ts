import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

import * as schema from "./schema";

const migrationsFolder = "./packages/core/db/migrations";

type FactoryPayload =
  | {
      connectionString: string;
    }
  | {
      host: string;
      database: string;
      user: string;
      password: string;
    };

export const dbFactory = (payload: FactoryPayload) => {
  const pool = new pg.Pool({
    ...payload,
  });

  const db = drizzle(pool, {
    schema,
  });

  return [
    db,
    async () => {
      await migrate(db, {
        migrationsFolder,
      });
    },
  ] as const;
};
