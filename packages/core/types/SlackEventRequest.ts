import * as z from "zod";

export const SlackChallengeRequestSchema = z.object({
  challenge: z.string(),
  type: z.literal("url_verification"),
});

export type SlackChallengeRequest = z.infer<typeof SlackChallengeRequestSchema>;

export const SlackEventSchema = z.object({
  type: z.union([
    z.literal("member_joined_channel"),
    z.literal("member_left_channel"),
  ]),
  user: z.string(),
  channel: z.string(),
});

export type SlackEvent = z.infer<typeof SlackEventSchema>;

export const SlackEventRequestSchema = z.object({
  event: SlackEventSchema,
  type: z.literal("event_callback"),
});

export type SlackEventRequest = z.infer<typeof SlackEventRequestSchema>;

export const SlackCallbackRequestSchema = z.union([
  SlackEventRequestSchema,
  SlackChallengeRequestSchema,
]);
