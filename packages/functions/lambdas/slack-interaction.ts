import type { APIGatewayProxyHandlerV2 } from "aws-lambda";

import { SlackInteractionRequestSchema } from "@/types/SlackInteractionRequest";
import { publishEvent } from "@/utils/eventBridge/publishEvent";
import { parseRequest } from "@/utils/lambda/parseRequest";

export const handler: APIGatewayProxyHandlerV2 = async (request) => {
  try {
    const payload = parseRequest(request);

    const parsedData = SlackInteractionRequestSchema.parse(payload);

    publishEvent("birthdayFilled", {
      user: parsedData.user.id,
      team: parsedData.user.team_id,
      birthday: parsedData.actions[0].selected_date,
      responseUrl: parsedData.response_url,
    });

    return {
      statusCode: 200,
    };
  } catch (error) {
    console.error(`Error handling slack interaction: ${error}`);
    return {
      statusCode: 500,
    };
  }
};
