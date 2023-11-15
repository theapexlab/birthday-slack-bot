import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { Config } from "sst/node/config";

import { publishEvent } from "@/utils/eventBridge/publishEvent";
import { errorResult, okResult } from "@/utils/lambda/result";

export const handler: APIGatewayProxyHandlerV2 = async (request) => {
  try {
    if (!request.queryStringParameters?.userId) {
      throw new Error("No userId");
    }

    await publishEvent("memberJoinedChannel", {
      channel: Config.CORE_SLACK_CHANNEL_ID,
      user: request.queryStringParameters.userId,
    });

    return okResult("Event sent");
  } catch (error) {
    console.error(`Error sending manual userJoined event: ${error}`);

    return errorResult(error);
  }
};
