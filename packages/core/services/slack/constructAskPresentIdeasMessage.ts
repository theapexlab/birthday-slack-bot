import type { ChatPostMessageArguments } from "@slack/web-api";

import {
  presentIdeasInputActionId,
  presentIdeasInputBlockId,
  presentIdeasSaveButtonBlockId,
} from "@/types/SlackInteractionRequest";

import { makeTextBlock } from "./messageItems";

type Arguments = {
  birthdayPerson: string;
  user: string;
  name: string;
  eventId?: string;
};

export const constructAskPresentIdeasMessage = ({
  birthdayPerson,
  user,
  name,
  eventId,
}: Arguments): ChatPostMessageArguments =>
  ({
    channel: user,
    metadata: {
      event_type: "askPresentIdeas",
      event_payload: {
        eventId: eventId || "",
        birthdayPerson,
      },
    },
    text: `Hey, <@${user}>! <@${birthdayPerson}>'s birthday is in 2 months. Do you have any present ideas?`,
    blocks: [
      makeTextBlock(`Hey ${name}! 👋`),
      makeTextBlock(
        `It's <@${birthdayPerson}>'s birthday is in 2 months. Do you have any present ideas?`,
      ),
      {
        type: "input",
        block_id: presentIdeasInputBlockId,
        element: {
          type: "plain_text_input",
          multiline: true,
          action_id: presentIdeasInputActionId,
        },
        label: {
          type: "plain_text",
          text: "Present ideas",
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
              text: "Save",
            },
            value: birthdayPerson,
            style: "primary",
            action_id: presentIdeasSaveButtonBlockId,
          },
        ],
      },
    ],
  }) satisfies ChatPostMessageArguments;
