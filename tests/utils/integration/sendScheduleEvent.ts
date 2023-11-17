import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";

import type { Events, EventType } from "@/events";
import { getScheduleDetailType } from "@/utils/scheduler/getScheduleDetailType";
const eventBridge = new EventBridgeClient();

type DetailType = {
  eventId: string;
  eventType: EventType;
  payload: Events[EventType];
};

export const sendScheduleEvent = async (detail: DetailType) => {
  await eventBridge.send(
    new PutEventsCommand({
      Entries: [
        {
          Detail: JSON.stringify(detail),
          DetailType: getScheduleDetailType(import.meta.env.VITE_STAGE),
          Source: "sst",
        },
      ],
    }),
  );
};
