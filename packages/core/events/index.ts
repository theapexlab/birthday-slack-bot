import { z } from "zod";

const Events = z.object({
  memberJoinedChannel: z.object({
    channel: z.string(),
    user: z.string(),
  }),
  userJoined: z.object({
    user: z.string(),
  }),
  botJoined: z.object({
    channel: z.string(),
  }),
  memberLeftChannel: z.object({
    user: z.string(),
  }),
});

export type Events = z.infer<typeof Events>;

export type EventType = keyof Events;

export const eventTypes = Object.keys(Events.shape) as EventType[];
