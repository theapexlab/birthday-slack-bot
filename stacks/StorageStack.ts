import {
  InstanceClass,
  InstanceSize,
  InstanceType,
  Vpc,
} from "aws-cdk-lib/aws-ec2";
import {
  Credentials,
  DatabaseInstance,
  DatabaseInstanceEngine,
  DatabaseSecret,
  PostgresEngineVersion,
} from "aws-cdk-lib/aws-rds";
import { Duration } from "aws-cdk-lib/core";
import type { StackContext } from "sst/constructs";

export function StorageStack({ stack }: StackContext) {
  if (process.env.USE_LOCAL_DB) {
    return {};
  }

  const vpc = new Vpc(stack, "vpc", {});

  const dbSecret = new DatabaseSecret(stack, "RDS secret", {
    username: "birthdayBotDbAdmin",
    dbname: "birthdayBotDb",
  });

  const db = new DatabaseInstance(stack, "Database", {
    engine: DatabaseInstanceEngine.postgres({
      version: PostgresEngineVersion.VER_13,
    }),
    instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MICRO),
    databaseName: "birthdayBotDb",
    allocatedStorage: 10,
    backupRetention: Duration.days(3),
    vpc,
    credentials: Credentials.fromSecret(dbSecret),
  });

  stack.addOutputs({
    RDS_INSTANCE_ARN: db.instanceArn,
    RDS_SECRET_ARN: dbSecret.secretArn,
    RDS_DATABASE: "birthdayBotDb",
  });

  return {
    db,
    dbSecret,
  };
}
