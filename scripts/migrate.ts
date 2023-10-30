import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";

const client = new LambdaClient({ region: "eu-central-1" });

await client.send(
  new InvokeCommand({
    FunctionName: process.argv[2],
    Payload: JSON.stringify({}),
  }),
);
