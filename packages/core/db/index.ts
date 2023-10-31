/* eslint-disable @typescript-eslint/ban-ts-comment */
import { RDS } from "sst/node/rds";

import { dbFactory } from "./dbFactory";

//@ts-ignore
console.log(RDS.Database);

export const [db, migrate] = dbFactory(
  process.env.IS_LOCAL || process.env.NODE_ENV === "development"
    ? "node"
    : "aws",
  {
    node: {
      connectionString: process.env.DB_URL ?? "",
    },
    aws: {
      //@ts-ignore
      database: RDS.Database.defaultDatabaseName,
      //@ts-ignore
      secretArn: RDS.Database.secretArn,
      //@ts-ignore
      resourceArn: RDS.Database.clusterArn,
    },
  },
);
