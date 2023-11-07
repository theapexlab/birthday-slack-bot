import { z } from "zod";

export const pickBirthdayActionId = "pickBirthday";
export const birthdayConfirmActionId = "birthdayConfirm";
export const birthdayIncorrectActionId = "birthdayIncorrect";
export const presentIdeasInputActionId = "presentIdeas";
export const presentIdeasInputBlockId = "presentIdeasInput";
export const presentIdeasSaveButtonBlockId = "presentIdeasSaveButton";

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
        }),
        z.object({
          type: z.literal("button"),
          action_id: z.union([
            z.literal(birthdayConfirmActionId),
            z.literal(birthdayIncorrectActionId),
            z.literal(presentIdeasSaveButtonBlockId),
          ]),
          value: z.string(),
        }),
      ]),
    )
    .length(1),
  response_url: z.string(),
  state: z
    .object({
      values: z.object({
        [presentIdeasInputBlockId]: z.object({
          [presentIdeasInputActionId]: z.object({
            type: z.literal("plain_text_input"),
            value: z.string(),
          }),
        }),
      }),
    })
    .optional(),
});

export type SlackInteractionRequest = z.infer<
  typeof SlackInteractionRequestSchema
>;
