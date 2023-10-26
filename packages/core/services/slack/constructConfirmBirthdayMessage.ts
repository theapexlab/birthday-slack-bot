import type { ChatReplaceMessageArguments } from "@/types/ChatReplaceMessageArguments";
import {
  birthdayConfirmActionId,
  birthdayIncorrectActionId,
} from "@/types/SlackInteractionRequest";

export const constructConfirmBirthdayMessage = (
  birthday: string,
): ChatReplaceMessageArguments =>
  ({
    replace_original: true,
    text: "Confirm your birthday",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Are you sure your birthday is ${birthday}?`,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              emoji: true,
              text: "Yes",
            },
            style: "primary",
            action_id: birthdayConfirmActionId,
            value: birthday,
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              emoji: true,
              text: "No",
            },
            style: "danger",
            action_id: birthdayIncorrectActionId,
            value: birthday,
          },
        ],
      },
    ],
    metadata: {
      event_type: "confirmBirthday",
      event_payload: {
        birthday,
      },
    },
  }) satisfies ChatReplaceMessageArguments;
