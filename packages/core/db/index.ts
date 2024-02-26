import { dbFactory } from "./dbFactory";

export const [db, migrate] = dbFactory(
  process.env.IS_LOCAL
    ? {
        type: "node",
        connectionString: process.env.DB_URL ?? "",
      }
    : {
        type: "aws",
        database: process.env.DB_NAME ?? "",
        secretArn: process.env.DB_SECRET_ARN ?? "",
        resourceArn: process.env.DB_RESOURCE_ARN ?? "",
      },
);
