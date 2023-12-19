import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";

import type { Events, EventType } from "@/events";

const client = new EventBridgeClient({});

export const publishEvent = async <T extends EventType>(
  event: T,
  payload: Events[T],
) => {
  try {
    console.log("Publishing event", event, payload);

    await client.send(
      new PutEventsCommand({
        Entries: [
          {
            Detail: JSON.stringify(payload),
            DetailType: event,
            EventBusName: process.env.EVENT_BUS_NAME,
            Source: "sst",
          },
        ],
      }),
    );
  } catch (error) {
    console.error("Error publishing event", event, payload, error);
  }
};
