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

export const cleanUpSchedules = async (eventId: string) =>
  Promise.all([
    schedulerClient.send(
      new DeleteScheduleCommand({
        Name: `${eventId}_askPresentAndSquadJoinFromTeam`,
      }),
    ),
    schedulerClient.send(
      new DeleteScheduleCommand({
        Name: `${eventId}_createBirthdaySquad`,
      }),
    ),
    schedulerClient.send(
      new DeleteScheduleCommand({
        Name: `${eventId}_birthdayCleanup`,
      }),
    ),
  ]);
