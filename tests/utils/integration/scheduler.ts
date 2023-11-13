import {
  DeleteScheduleCommand,
  GetScheduleCommand,
  SchedulerClient,
} from "@aws-sdk/client-scheduler";

const schedulerClient = new SchedulerClient({});

export const getSchedule = async (name: string) =>
  schedulerClient.send(
    new GetScheduleCommand({
      Name: name,
    }),
  );

export const cleanUpSchedule = async (name: string) =>
  schedulerClient.send(
    new DeleteScheduleCommand({
      Name: name,
    }),
  );
