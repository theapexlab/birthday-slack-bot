import type { ScheduledHandler } from "aws-lambda";

import type { EventType } from "@/events";
import { publishEvent } from "@/utils/eventBridge/publishEvent";

type DetailType = {
  team: string;
  birthdayPerson: string;
  eventId?: string;
  eventType: EventType;
};

export const handler: ScheduledHandler<DetailType> = async ({
  detail: { team, birthdayPerson, eventType, eventId },
}) => {
  try {
    await publishEvent(eventType, {
      team,
      birthdayPerson,
      eventId,
    });
  } catch (error) {
    console.error("Error when processing schedule", error);
  }
};
