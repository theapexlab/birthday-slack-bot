import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";

import type { ScheduleEventType } from "@/types/schedule";
const eventBridge = new EventBridgeClient();

export const sendScheduleEvent = async (
  type: ScheduleEventType,
  detail: string,
) => {
  await eventBridge.send(
    new PutEventsCommand({
      Entries: [
        {
          Detail: detail,
          DetailType: type,
          Source: "sst",
        },
      ],
    }),
  );
};
