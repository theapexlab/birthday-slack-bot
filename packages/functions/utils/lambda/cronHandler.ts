import type { APIGatewayProxyEventV2, EventBridgeEvent } from "aws-lambda";

import type { BaseEvent } from "@/types/BaseEvent";
import type { ScheduledEventType } from "@/types/cron";

type Event =
  | APIGatewayProxyEventV2
  | EventBridgeEvent<ScheduledEventType, BaseEvent>;

const isApiGatewayProxyEventV2 = (
  event: Event,
): event is APIGatewayProxyEventV2 => "queryStringParameters" in event;

export const cronHandler =
  (handler: (eventId?: string) => Promise<unknown>) =>
  async (request: Event) => {
    try {
      const eventId = isApiGatewayProxyEventV2(request)
        ? request.queryStringParameters?.eventId
        : request.detail.eventId;

      await handler(eventId);
    } catch (error) {
      console.error(error);
    }
  };
