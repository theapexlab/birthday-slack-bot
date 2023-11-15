import { publishEvent } from "@/utils/eventBridge/publishEvent";
import { publishScheduledEvent } from "@/utils/scheduler/publishScheduledEvent";

type Arguments = {
  birthdayPerson: string;
  team: string;
  eventId?: string;
};

export const publishBirthdayEvents = async (args: Arguments) => {
  await publishEvent("askPresentIdeasFromTeam", args);

  await publishScheduledEvent("askPresentAndSquadJoinFromTeam", args, {
    days: 4,
  });

  await publishScheduledEvent("birthdayCleanup", args, {
    months: 2,
  });
};
