import type { APIGatewayProxyEventV2, EventBridgeEvent } from "aws-lambda";
import { Config } from "sst/node/config";

import { createSlackApp } from "@/services/slack/createSlackApp";

type Event =
  | APIGatewayProxyEventV2
  | EventBridgeEvent<"Scheduled Event", unknown>;

const isApiGatewayProxyEventV2 = (
  event: Event,
): event is APIGatewayProxyEventV2 => "queryStringParameters" in event;

export const handler = async (request: Event) => {
  const app = createSlackApp();

  await app.client.chat.postMessage({
    channel: Config.RANDOM_SLACK_CHANNEL_ID,
    text: "Random ice breaker question: What is your favorite color?",
    metadata: isApiGatewayProxyEventV2(request)
      ? {
          event_type: "iceBreakerQuestion",
          event_payload: {
            eventId: request.queryStringParameters?.eventId || "",
          },
        }
      : undefined,
  });
};
