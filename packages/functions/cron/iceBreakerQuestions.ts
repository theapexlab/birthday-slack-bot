import type { APIGatewayProxyEventV2, EventBridgeEvent } from "aws-lambda";
import { Config } from "sst/node/config";

import { getBirthdaysBetween } from "@/db/queries/getBirthdays";
import { getIceBreakerWindow } from "@/services/birthday/getIcebreakerWindow";
import { constructIceBreakerQuestion } from "@/services/slack/constructIceBreakerQuestion";
import { createSlackApp } from "@/services/slack/createSlackApp";

type Event =
  | APIGatewayProxyEventV2
  | EventBridgeEvent<"Scheduled Event", unknown>;

const isApiGatewayProxyEventV2 = (
  event: Event,
): event is APIGatewayProxyEventV2 => "queryStringParameters" in event;

export const handler = async (request: Event) => {
  const { start, end } = getIceBreakerWindow();
  const users = await getBirthdaysBetween(start.toDate(), end.toDate());

  const app = createSlackApp();

  const eventId = isApiGatewayProxyEventV2(request)
    ? request.queryStringParameters?.eventId
    : undefined;

  await app.client.chat.postMessage(
    constructIceBreakerQuestion({
      channel: Config.RANDOM_SLACK_CHANNEL_ID,
      eventId,
      users: users.map((user) => user.id),
    }),
  );
};
