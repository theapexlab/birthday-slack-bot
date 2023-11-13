import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";

import type { CronEventType } from "@/types/cron";

const eventBridge = new EventBridgeClient();

export const sendCronEvent = async (type: CronEventType, eventId: string) =>
  eventBridge.send(
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
