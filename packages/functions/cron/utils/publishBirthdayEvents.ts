import { publishEvent } from "@/utils/eventBridge/publishEvent";
import { publishScheduledEvent } from "@/utils/scheduler/publishScheduledEvent";

type Arguments = {
  birthdayPerson: string;
  team: string;
  eventId?: string;
};

export const publishBirthdayEvents = async (args: Arguments) => {
  await publishEvent("askPresentIdeasFromTeam", args);

  await publishScheduledEvent(
    "askPresentAndSquadJoinFromTeam",
    args,
    4,
    "days",
  );

  await publishScheduledEvent("createBirthdaySquad", args, 8, "days");

  await publishScheduledEvent("birthdayCleanup", args, 2, "months");
};
