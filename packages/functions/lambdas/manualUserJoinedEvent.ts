import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { Config } from "sst/node/config";

import { publishEvent } from "@/utils/eventBridge/publishEvent";

export const handler: APIGatewayProxyHandlerV2 = async (request) => {
  try {
    if (!request.queryStringParameters?.userId) {
      throw new Error("No userId");
    }

    await publishEvent("memberJoinedChannel", {
      channel: Config.CORE_SLACK_CHANNEL_ID,
      user: request.queryStringParameters.userId,
    });

    return {
      statusCode: 200,
      body: "Event sent",
    };
  } catch (error) {
    console.error(`Error sending manual userJoined event: ${error}`);

    return {
      statusCode: 500,
      body: JSON.stringify(
        {
          error,
        },
        null,
        2,
      ),
    };
  }
};
