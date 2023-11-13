import type { ScheduledHandler } from "aws-lambda";

import type { Events, EventType } from "@/events";
import { publishEvent } from "@/utils/eventBridge/publishEvent";

type DetailType = {
  eventType: EventType;
  payload: Events[EventType];
};

export const handler: ScheduledHandler<DetailType> = async ({
  detail: { eventType, payload },
}) => {
  try {
    await publishEvent(eventType, payload);
  } catch (error) {
    console.error("Error when processing schedule", error);
  }
};
