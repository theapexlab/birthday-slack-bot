import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";

import type { Events, EventType } from "@/events";
import type { ScheduleEventType } from "@/types/schedule";
const eventBridge = new EventBridgeClient();

type DetailType = {
  eventId: string;
  eventType: EventType;
  payload: Events[EventType];
};

export const sendScheduleEvent = async (
  type: ScheduleEventType,
  detail: DetailType,
) => {
  await eventBridge.send(
    new PutEventsCommand({
      Entries: [
        {
          Detail: JSON.stringify(detail),
          DetailType: type,
          Source: "sst",
        },
      ],
    }),
  );
};
