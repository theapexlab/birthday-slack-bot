import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { Config } from "sst/node/config";

import { publishEvent } from "@/utils/eventBridge/publishEvent";
import { errorResult, okResult } from "@/utils/lambda/result";

export const handler: APIGatewayProxyHandlerV2 = async () => {
  try {
    await publishEvent("botJoined", {
      channel: Config.CORE_SLACK_CHANNEL_ID,
    });

    return okResult("Event sent");
  } catch (error) {
    console.error(`Error sending manual botJoined event: ${error}`);

    return errorResult(error);
  }
};
