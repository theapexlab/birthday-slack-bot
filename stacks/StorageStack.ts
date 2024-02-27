import {
  InstanceClass,
  InstanceSize,
  InstanceType,
  Port,
  SecurityGroup,
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
    return { outputs: null, rds: null };
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

  const rdsSecurtyGroup = new SecurityGroup(stack, "RdsSecurityGroupt", {
    vpc,
    description: "SecurityGroup associated with the RDS instance",
    allowAllOutbound: true,
  });
  rdsSecurtyGroup.connections.allowFromAnyIpv4(
    Port.tcp(5432),
    "Allow postgres port",
  );

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
    securityGroups: [rdsSecurtyGroup],
  });

  const outputs = {
    rdsHost: db.instanceEndpoint.hostname,
    rdsName: dbName,
    rdsUser: dbUsername,
    rdsPassword: dbSecret.secretValueFromJson("password").toString(),
  };

  stack.addOutputs(outputs);

  return { outputs, vpc };
}
