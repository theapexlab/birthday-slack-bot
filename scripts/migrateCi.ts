import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";

const client = new LambdaClient({ region: "eu-central-1" });

const res = await client.send(
  new InvokeCommand({
    FunctionName: process.argv[2],
    Payload: JSON.stringify({}),
  }),
);

const payload = res.Payload
  ? Buffer.from(res.Payload?.buffer).toString()
  : undefined;

const payloadJson = JSON.parse(payload || "");

if (payloadJson.statusCode !== 200) {
  console.error(payloadJson);
  process.exit(1);
}
