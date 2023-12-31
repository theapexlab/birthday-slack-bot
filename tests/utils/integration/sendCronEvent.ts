import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";

import {
  type CronEventType,
  getCronDetailType,
} from "@/utils/cron/getCronDetailType";

const eventBridge = new EventBridgeClient();

export const sendCronEvent = async (type: CronEventType, eventId: string) =>
  eventBridge.send(
    new PutEventsCommand({
      Entries: [
        {
          Detail: JSON.stringify({
            eventId,
          }),
          DetailType: getCronDetailType(type, import.meta.env.VITE_STAGE),
          Source: "sst",
        },
      ],
    }),
  );
