/* eslint-disable @typescript-eslint/ban-ts-comment */
import { RDS } from "sst/node/rds";

import { dbFactory } from "./dbFactory";

export const [db, migrate] = dbFactory(
  process.env.IS_LOCAL || process.env.NODE_ENV === "development"
    ? {
        type: "node",
        connectionString: process.env.DB_URL ?? "",
      }
    : {
        type: "aws",
        //@ts-ignore
        database: RDS.Database.defaultDatabaseName,
        //@ts-ignore
        secretArn: RDS.Database.secretArn,
        //@ts-ignore
        resourceArn: RDS.Database.clusterArn,
      },
);
