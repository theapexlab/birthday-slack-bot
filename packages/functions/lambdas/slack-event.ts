import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyHandlerV2,
} from "aws-lambda";

import { SlackCallbackRequestSchema } from "@/types/SlackEventRequest";
import { publishEvent } from "@/utils/eventBridge/publishEvent";

export const handler: APIGatewayProxyHandlerV2 = async (
  request: APIGatewayProxyEventV2,
) => {
  try {
    if (!request.body) {
      throw new Error("No request body");
    }

    const validatedBody = SlackCallbackRequestSchema.parse(
      JSON.parse(request.body),
    );

    if (validatedBody.type === "url_verification") {
      return {
        statusCode: 200,
        body: JSON.stringify({
          urlVerificationChallenge: validatedBody.challenge,
        }),
      };
    }

    switch (validatedBody.event.type) {
      case "member_joined_channel":
        await publishEvent("memberJoinedChannel", {
          ...validatedBody.event,
          eventId: validatedBody.event_id,
        });
        break;

      case "member_left_channel":
        await publishEvent("memberLeftChannel", validatedBody.event);
        break;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({}),
    };
  } catch (error) {
    console.error(`Error handling slack event: ${error}`);
    return {
      statusCode: 500,
      body: JSON.stringify({}),
    };
  }
};
