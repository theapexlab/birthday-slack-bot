import {
  CreateScheduleCommand,
  SchedulerClient,
} from "@aws-sdk/client-scheduler";
import dayjs from "dayjs";

import type { Events, EventType } from "@/events";

import { getScheduleWithDaysOffset } from "./getScheduleExtension";

const schedulerLambdaArn = process.env.SCHEDULER_LAMBDA_ARN || "";
const schedulerRoleArn = process.env.SCHEDULER_ROLE_ARN || "";
const schedulerClient = new SchedulerClient({});

export const publishScheduledEvent = async <T extends EventType>(
  eventType: T,
  payload: Events[T],
  dayOffset: number,
) => {
  const createCommand = new CreateScheduleCommand({
    Name: `${dayjs().valueOf()}_${eventType}`,
    FlexibleTimeWindow: { Mode: "OFF" },
    ScheduleExpression: getScheduleWithDaysOffset(dayOffset),
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
