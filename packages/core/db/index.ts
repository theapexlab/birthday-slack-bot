import { RDS } from "sst/node/rds";

import { dbFactory } from "./dbFactory";

export const [db, migrate] = dbFactory(process.env.IS_LOCAL ? "node" : "aws", {
  node: {
    connectionString: process.env.DB_URL ?? "",
  },
  aws: {
    database: RDS.Database.defaultDatabaseName,
    secretArn: RDS.Database.secretArn,
    resourceArn: RDS.Database.clusterArn,
  },
});
