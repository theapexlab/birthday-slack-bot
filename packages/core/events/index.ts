import type { SlackEvent } from "@/types/SlackEventRequest";

export type Events = {
  memberJoinedChannel: Pick<SlackEvent, "channel" | "user">;
  userJoined: Pick<SlackEvent, "user">;
  botJoined: Pick<SlackEvent, "channel">;
  memberLeftChannel: Pick<SlackEvent, "user">;
};

export type EventType = keyof Events;
