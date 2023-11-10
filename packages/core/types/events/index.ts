import { z } from "zod";

import { BaseEvent } from "@/types/BaseEvent";

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
  memberLeftChannel: BaseEvent.extend({
    user: z.string(),
    team: z.string(),
  }),
  birthdayFilled: BaseEvent.extend({
    birthday: z.string(),
    responseUrl: z.string(),
  }),
  birthdayConfirmed: BaseEvent.extend({
    user: z.string(),
    team: z.string(),
    birthday: z.string(),
    responseUrl: z.string(),
  }),
  askPresentIdeasFromTeam: BaseEvent.extend({
    birthdayPerson: z.string(),
    team: z.string(),
  }),
  askPresentIdeasFromUser: BaseEvent.extend({
    birthdayPerson: z.string(),
    user: z.string(),
  }),
  savePresentIdea: BaseEvent.extend({
    birthdayPerson: z.string(),
    user: z.string(),
    team: z.string(),
    presentIdea: z.string(),
    responseUrl: z.string(),
  }),
  saveSquadJoin: BaseEvent.extend({
    birthdayPerson: z.string(),
    user: z.string(),
    team: z.string(),
  }),
  askPresentAndSquadJoinFromTeam: BaseEvent.extend({
    birthdayPerson: z.string(),
    team: z.string(),
  }),
  askPresentAndSquadJoinFromUser: BaseEvent.extend({
    birthdayPerson: z.string(),
    user: z.string(),
  }),
});

export type Events = z.infer<typeof Events>;

export type EventType = keyof Events;

export const eventTypes = Object.keys(Events.shape) as EventType[];