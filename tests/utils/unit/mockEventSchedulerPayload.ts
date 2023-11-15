import dayjs from "dayjs";

import type { Events, EventType } from "@/events";
import type { TimeOffset } from "@/functions/utils/scheduler/getScheduleExtension";
import { getScheduleWithTimeOffset } from "@/functions/utils/scheduler/getScheduleExtension";

export const mockEventSchedulerPayload = <T extends EventType>(
  eventType: T,
  payload: Events[T],
  timeOffset: TimeOffset,
) => ({
  Name: `${payload.eventId || dayjs().valueOf()}_${eventType}`,
  FlexibleTimeWindow: { Mode: "OFF" },
  ScheduleExpression: getScheduleWithTimeOffset(timeOffset),
  ActionAfterCompletion: "DELETE",
  Target: {
    Arn: "",
    RoleArn: "",
    Input: JSON.stringify({
      detail: { payload, eventType },
    }),
  },
});
