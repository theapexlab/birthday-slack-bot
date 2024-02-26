import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";

const client = new LambdaClient({ region: "eu-central-1" });

export const cleanUp = async (tableName: string) => {
  console.log("🚀 ~ cleanUp ~ argv:", process.env.VITE_CLEANUP_FUNCTION_NAME);
  const res = await client.send(
    new InvokeCommand({
      FunctionName: process.env.VITE_CLEANUP_FUNCTION_NAME,
      Payload: JSON.stringify({ tableName }),
    }),
  );

  const payload = res.Payload
    ? Buffer.from(res.Payload?.buffer).toString()
    : undefined;

  return JSON.parse(payload || "");
};
