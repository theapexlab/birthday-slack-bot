import dayjs from "dayjs";

import type { Events, EventType } from "@/events";
import { getScheduleWithDaysOffset } from "@/functions/utils/scheduler/getScheduleExtension";

export const mockEventSchedulerPayload = <T extends EventType>(
  eventType: T,
  payload: Events[T],
  dayOffset: number,
) => ({
  Name: `${payload.eventId || dayjs().valueOf()}_${eventType}`,
  FlexibleTimeWindow: { Mode: "OFF" },
  ScheduleExpression: getScheduleWithDaysOffset(dayOffset),
  ActionAfterCompletion: "DELETE",
  Target: {
    Arn: "",
    RoleArn: "",
    Input: JSON.stringify({
      detail: { payload, eventType },
    }),
  },
});
