import {
  CreateScheduleCommand,
  SchedulerClient,
} from "@aws-sdk/client-scheduler";
import dayjs from "dayjs";

import type { Events, EventType } from "@/events";

import type { TimeOffset } from "./getScheduleExtension";
import { getScheduleWithTimeOffset } from "./getScheduleExtension";

const schedulerLambdaArn = process.env.SCHEDULER_LAMBDA_ARN || "";
const schedulerRoleArn = process.env.SCHEDULER_ROLE_ARN || "";
const schedulerClient = new SchedulerClient({});

export const publishScheduledEvent = async <T extends EventType>(
  eventType: T,
  payload: Events[T],
  timeOffset: TimeOffset,
) => {
  const createCommand = new CreateScheduleCommand({
    Name: `${payload.eventId || dayjs().valueOf()}_${eventType}`,
    FlexibleTimeWindow: { Mode: "OFF" },
    ScheduleExpression: getScheduleWithTimeOffset(timeOffset),
    ActionAfterCompletion: "DELETE",
    Target: {
      Arn: schedulerLambdaArn,
      RoleArn: schedulerRoleArn,
      Input: JSON.stringify({
        detail: { payload, eventType },
      }),
    },
  });
  return schedulerClient.send(createCommand);
};
