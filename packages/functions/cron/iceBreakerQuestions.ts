import type { APIGatewayProxyEventV2, EventBridgeEvent } from "aws-lambda";
import { Config } from "sst/node/config";

import { db } from "@/db/index";
import { getBirthdaysBetween } from "@/db/queries/getBirthdays";
import { iceBreakerThreads } from "@/db/schema";
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

  const message = await app.client.chat.postMessage(
    constructIceBreakerQuestion({
      channel: Config.RANDOM_SLACK_CHANNEL_ID,
      eventId,
      users: users.map((user) => user.id),
    }),
  );

  if (!message.ok || !message.ts) {
    throw new Error("Failed to send ice breaker question");
  }

  await Promise.all(
    users.map((user) =>
      db.insert(iceBreakerThreads).values({
        userId: user.id,
        teamId: user.teamId,
        threadId: message.ts!,
      }),
    ),
  );
};
