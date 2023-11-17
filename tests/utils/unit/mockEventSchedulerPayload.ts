import type { ManipulateType } from "dayjs";
import dayjs from "dayjs";

import type { Events, EventType } from "@/events";
import { getScheduleWithTimeOffset } from "@/functions/utils/scheduler/getScheduleExtension";

export const mockEventSchedulerPayload = <T extends EventType>(
  eventType: T,
  payload: Events[T],
  timeOffset: number,
  offsetType: ManipulateType,
) => ({
  Name: `${payload.eventId || dayjs().valueOf()}_${eventType}`,
  FlexibleTimeWindow: { Mode: "OFF" },
  ScheduleExpression: getScheduleWithTimeOffset(timeOffset, offsetType),
  ActionAfterCompletion: "DELETE",
  Target: {
    Arn: "",
    RoleArn: "",
    Input: JSON.stringify({
      detail: { payload, eventType },
    }),
  },
});
