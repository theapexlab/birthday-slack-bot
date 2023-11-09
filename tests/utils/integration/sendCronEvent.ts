import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";

import type { ScheduledEventType } from "@/types/cron";

const eventBridge = new EventBridgeClient();

export const sendCronEvent = async (
  type: ScheduledEventType,
  eventId: string,
) => {
  await eventBridge.send(
    new PutEventsCommand({
      Entries: [
        {
          Detail: JSON.stringify({
            eventId,
          }),
          DetailType: type,
          Source: "sst",
        },
      ],
    }),
  );
};
