import type { SQSHandler } from "aws-lambda";
import { Config } from "sst/node/config";

import { sendSlackMessage } from "@/services/slack/sendSlackMessage";

export const handler: SQSHandler = async () => {
  try {
    await sendSlackMessage(
      Config.CORE_SLACK_CHANNEL_ID,
      "Hello from Birthday bot!",
    );
  } catch (error) {
    console.error(`Error processing trigger jobs: ${error as string}`);
  }
};
