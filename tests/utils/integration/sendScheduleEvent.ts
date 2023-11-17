import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";

import type { Events, EventType } from "@/events";
import { getScheduleDetailType } from "@/utils/scheduler/getScheduleDetailType";
const eventBridge = new EventBridgeClient();

type DetailType<T extends EventType> = {
  eventId: string;
  eventType: T;
  payload: Events[T];
};

export const sendScheduleEvent = async <T extends EventType>(
  detail: DetailType<T>,
) => {
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
