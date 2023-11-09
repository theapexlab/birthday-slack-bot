import { z } from "zod";

export const pickBirthdayActionId = "pickBirthday";
export const birthdayConfirmActionId = "birthdayConfirm";
export const birthdayIncorrectActionId = "birthdayIncorrect";
export const presentIdeasInputActionId = "presentIdeas";
export const presentIdeasInputBlockId = "presentIdeasInput";
export const presentIdeasSaveButtonActionId = "presentIdeasSaveButton";
export const additionalPresentIdeasInputActionId = "additionalPresentIdeasActionId";
export const additionalPresentIdeasInputBlockId = "additionalPresentIdeasInputBlockId";
export const additionalPresentIdeasSaveButtonActionId =
  "additionalPresentIdeasSaveButton";
export const squadJoinCheckboxBlockId = "squadJoinCheckboxBlockId";
export const squadJoinCheckboxActionId = "squadJoinCheckboxActionId";

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
            z.literal(presentIdeasSaveButtonActionId),
            z.literal(additionalPresentIdeasSaveButtonActionId),
          ]),
          value: z.string(),
        }),
        z.object({
          type: z.literal("checkboxes"),
          action_id: z.literal(squadJoinCheckboxActionId),
        }),
      ]),
    )
    .length(1),
  response_url: z.string(),
  state: z
    .object({
      values: z
        .object({
          [presentIdeasInputBlockId]: z
            .object({
              [presentIdeasInputActionId]: z
                .object({
                  type: z.literal("plain_text_input"),
                  value: z.string().nullable(), // assumes the value can be a string or null
                })
                .optional(),
            })
            .optional(),
          [additionalPresentIdeasInputBlockId]: z
            .object({
              [additionalPresentIdeasInputActionId]: z
                .object({
                  type: z.literal("plain_text_input"),
                  value: z.string().nullable(), // assumes the value can be a string or null
                })
                .optional(),
            })
            .optional(),
          [squadJoinCheckboxBlockId]: z
            .object({
              [squadJoinCheckboxActionId]: z
                .object({
                  type: z.literal("checkboxes"),
                  selected_options: z.array(
                    z.object({
                      text: z.object({
                        type: z.literal("plain_text"),
                        text: z.string(),
                        emoji: z.boolean().optional(),
                      }),
                      value: z.string(),
                    }),
                  ).nullable(),
                })
                .optional(),
            })
            .optional(),
        })
        .optional(),
    })
    .optional(),
});

export type SlackInteractionRequest = z.infer<
  typeof SlackInteractionRequestSchema
>;
