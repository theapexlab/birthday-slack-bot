import type { APIGatewayProxyEventV2, EventBridgeEvent } from "aws-lambda";

import type { BaseEvent } from "@/types/BaseEvent";
import type { CronEventType } from "@/types/cron";

type Event =
  | APIGatewayProxyEventV2
  | EventBridgeEvent<CronEventType, BaseEvent>;

const isApiGatewayProxyEventV2 = (
  event: Event,
): event is APIGatewayProxyEventV2 => "routeKey" in event;

export const cronHandler =
  (handler: (eventId?: string) => Promise<unknown>) =>
  async (request: Event) => {
    try {
      const eventId = isApiGatewayProxyEventV2(request)
        ? request.queryStringParameters?.eventId
        : request.detail.eventId;

      await handler(eventId);

      return {
        statusCode: 200,
        body: "Event sent",
      };
    } catch (error) {
      console.error(error);

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
