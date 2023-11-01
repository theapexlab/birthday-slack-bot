import type { APIGatewayProxyEventV2, EventBridgeEvent } from "aws-lambda";
import { Config } from "sst/node/config";

import { constructIceBreakerQuestion } from "@/services/slack/constructIceBreakerQuestion";
import { createSlackApp } from "@/services/slack/createSlackApp";

type Event =
  | APIGatewayProxyEventV2
  | EventBridgeEvent<"Scheduled Event", unknown>;

const isApiGatewayProxyEventV2 = (
  event: Event,
): event is APIGatewayProxyEventV2 => "queryStringParameters" in event;

export const handler = async (request: Event) => {
  const app = createSlackApp();

  const eventId = isApiGatewayProxyEventV2(request)
    ? request.queryStringParameters?.eventId
    : undefined;

  await app.client.chat.postMessage(
    constructIceBreakerQuestion({
      channel: Config.RANDOM_SLACK_CHANNEL_ID,
      eventId,
      users: ["U1", "U2"],
    }),
  );
};
