import {
  CreateScheduleCommand,
  SchedulerClient,
} from "@aws-sdk/client-scheduler";

import { getScheduleWithDaysOffset } from "./getScheduleExtension";

const schedulerLambdaArn = process.env.SCHEDULER_LAMBDA_ARN || "";
const schedulerRoleArn = process.env.SCHEDULER_ROLE_ARN || "";
const schedulerClient = new SchedulerClient({});

const schedules = [{ eventType: "askPresentAndSquadJoinFromTeam", offset: 4 }];

export const setSchedules = async (
  team: string,
  birthdayPerson: string,
  eventId?: string,
) => {
  await Promise.all(
    schedules.map(({ eventType, offset }) => {
      const createCommand = new CreateScheduleCommand({
        Name: `${birthdayPerson}_${eventType}`,
        FlexibleTimeWindow: { Mode: "OFF" },
        ScheduleExpression: getScheduleWithDaysOffset(offset),
        ActionAfterCompletion: "DELETE",
        Target: {
          Arn: schedulerLambdaArn,
          RoleArn: schedulerRoleArn,
          Input: JSON.stringify({
            detail: { team, birthdayPerson, eventId, eventType },
          }),
        },
      });
      return schedulerClient.send(createCommand);
    }),
  );
};
