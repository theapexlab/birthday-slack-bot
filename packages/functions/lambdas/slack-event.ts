import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyHandlerV2,
} from "aws-lambda";

import { SlackCallbackRequestSchema } from "@/types/SlackEventRequest";
import { publishEvent } from "@/utils/eventBridge/publishEvent";
import { errorResult, okResult } from "@/utils/lambda/result";

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
      return okResult({
        urlVerificationChallenge: validatedBody.challenge,
      });
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

    return okResult();
  } catch (error) {
    console.error(`Error handling slack event: ${error}`);

    return errorResult(error);
  }
};
