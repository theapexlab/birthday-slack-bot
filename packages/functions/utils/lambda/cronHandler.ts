import type { APIGatewayProxyEventV2, EventBridgeEvent } from "aws-lambda";

type Event =
  | APIGatewayProxyEventV2
  | EventBridgeEvent<"Scheduled Event", unknown>;

const isApiGatewayProxyEventV2 = (
  event: Event,
): event is APIGatewayProxyEventV2 => "queryStringParameters" in event;

export const cronHandler =
  (handler: (eventId?: string) => Promise<unknown>) =>
  async (request: Event) => {
    try {
      const eventId = isApiGatewayProxyEventV2(request)
        ? request.queryStringParameters?.eventId
        : undefined;

      await handler(eventId);
    } catch (error) {
      console.error(error);
    }
  };
