import { z } from "zod";

export const BaseEvent = z.object({
  eventId: z.string().optional(),
});

export type BaseEvent = z.infer<typeof BaseEvent>;
