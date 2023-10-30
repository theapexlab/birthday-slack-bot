import { RDSDataClient } from "@aws-sdk/client-rds-data";
import { drizzle as drizzleRds } from "drizzle-orm/aws-data-api/pg";
import { migrate as migrateRds } from "drizzle-orm/aws-data-api/pg/migrator";
import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import { migrate as migrateNode } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

const migrationsFolder = "packages/core/db/migrations";

type DbType = "node" | "aws";

type FactoryPayload = {
  node: {
    connectionString: string;
  };
  aws: {
    database: string;
    secretArn: string;
    resourceArn: string;
  };
};

export const dbFactory = (type: DbType, payload: FactoryPayload) => {
  if (type === "node") {
    const pool = new pg.Pool({
      ...payload.node,
    });

    const db = drizzleNode(pool);

    return [
      db,
      async () => {
        await migrateNode(db, {
          migrationsFolder,
        });
      },
    ] as const;
  }

  const db = drizzleRds(new RDSDataClient({}), {
    ...payload.aws,
  });

  return [
    db,
    async () => {
      await migrateRds(db, {
        migrationsFolder,
      });
    },
  ] as const;
};
