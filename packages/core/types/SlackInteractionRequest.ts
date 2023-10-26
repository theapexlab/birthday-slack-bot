import * as z from "zod";

export const SlackInteractionRequestSchema = z.object({
  type: z.literal("block_actions"),
  user: z.object({
    id: z.string(),
    team_id: z.string(),
  }),
  actions: z
    .array(
      z.object({
        type: z.literal("datepicker"),
        selected_date: z.string(),
      }),
    )
    .length(1),
  response_url: z.string(),
});

export type SlackInteractionRequest = z.infer<
  typeof SlackInteractionRequestSchema
>;
