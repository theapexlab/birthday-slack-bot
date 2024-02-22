import {
  InstanceClass,
  InstanceSize,
  InstanceType,
  // SubnetType,
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

const dbName = "birthdayBotDb";
const dbUsername = "birthdayBotDbAdmin";

export function StorageStack({ stack }: StackContext) {
  if (process.env.USE_LOCAL_DB) {
    return null;
  }

  const vpc = new Vpc(stack, "vpc", {
    natGateways: 1,
    // subnetConfiguration: [
    //   {
    //     cidrMask: 24,
    //     name: "public",
    //     subnetType: SubnetType.PUBLIC,
    //   },
    // ],
  });

  const dbSecret = new DatabaseSecret(stack, "RDS secret", {
    username: dbUsername,
    dbname: dbName,
  });

  const db = new DatabaseInstance(stack, "Database", {
    engine: DatabaseInstanceEngine.postgres({
      version: PostgresEngineVersion.VER_13,
    }),
    instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MICRO),
    databaseName: dbName,
    allocatedStorage: 10,
    backupRetention: Duration.days(3),
    vpc,
    vpcSubnets: vpc.selectSubnets(),
    credentials: Credentials.fromSecret(dbSecret),
    publiclyAccessible: true,
  });

  const outputs = {
    RDS_HOST: db.instanceEndpoint.hostname,
    RDS_NAME: dbName,
    RDS_USER: dbUsername,
    RDS_PASSWORD: dbSecret.secretValueFromJson("password").toString(),
  };

  stack.addOutputs(outputs);

  return outputs;
}
