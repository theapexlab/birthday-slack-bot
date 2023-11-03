import { z } from "zod";

const BaseEvent = z.object({
  eventId: z.string().optional(),
});

const Events = z.object({
  memberJoinedChannel: BaseEvent.extend({
    channel: z.string(),
    user: z.string(),
  }),
  askBirthday: BaseEvent.extend({
    user: z.string(),
    responseUrl: z.string().optional(),
  }),
  botJoined: BaseEvent.extend({
    channel: z.string(),
  }),
  memberLeftChannel: z.object({
    user: z.string(),
    team: z.string(),
  }),
  birthdayFilled: z.object({
    birthday: z.string(),
    responseUrl: z.string(),
  }),
  birthdayConfirmed: z.object({
    user: z.string(),
    team: z.string(),
    birthday: z.string(),
    responseUrl: z.string(),
  }),
  askPresentIdeas: BaseEvent.extend({
    user: z.string(),
    team: z.string(),
  }),
});

export type Events = z.infer<typeof Events>;

export type EventType = keyof Events;

export const eventTypes = Object.keys(Events.shape) as EventType[];
