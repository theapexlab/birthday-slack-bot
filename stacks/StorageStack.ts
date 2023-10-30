import { RDS, type StackContext } from "sst/constructs";

export function StorageStack({ stack }: StackContext) {
  const db = new RDS(stack, "Database", {
    defaultDatabaseName: "birthdayBotDb",
    engine: "postgresql13.9",
  });

  stack.addOutputs({
    RDS_CLUSTER_ARN: db.clusterArn,
    RDS_SECRET_ARN: db.secretArn,
    RDS_DATABASE: db.defaultDatabaseName,
  });

  return {
    db,
  };
}
