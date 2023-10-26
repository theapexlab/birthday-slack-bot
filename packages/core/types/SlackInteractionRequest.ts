import * as z from "zod";

export const pickBirthdayActionId = "pickBirthday";
export const birthdayConfirmActionId = "birthdayConfirm";
export const birthdayIncorrectActionId = "birthdayIncorrect";

export const SlackInteractionRequestSchema = z.object({
  type: z.literal("block_actions"),
  user: z.object({
    id: z.string(),
    team_id: z.string(),
  }),
  actions: z
    .array(
      z.discriminatedUnion("type", [
        z.object({
          type: z.literal("datepicker"),
          selected_date: z.string(),
          action_id: z.literal(pickBirthdayActionId),
          action_ts: z.string(),
        }),
        z.object({
          type: z.literal("button"),
          action_id: z.union([
            z.literal(birthdayConfirmActionId),
            z.literal(birthdayIncorrectActionId),
          ]),
          action_ts: z.string(),
          value: z.string(),
        }),
      ]),
    )
    .length(1),
  response_url: z.string(),
});

export type SlackInteractionRequest = z.infer<
  typeof SlackInteractionRequestSchema
>;
