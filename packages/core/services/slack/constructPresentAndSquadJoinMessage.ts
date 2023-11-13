import type { ChatPostMessageArguments } from "@slack/web-api";

import {
  additionalPresentIdeasInputActionId,
  additionalPresentIdeasInputBlockId,
  additionalPresentIdeasSaveButtonActionId,
  squadJoinCheckboxActionId,
  squadJoinCheckboxBlockId,
} from "@/types/SlackInteractionRequest";

import {
  makeActionsBlock,
  makeCheckboxInputBlock,
  makeInputBlock,
  makeTextBlock,
} from "./messageItems";

type Arguments = {
  birthdayPerson: string;
  user: string;
  name: string;
  eventId?: string;
};

export const constructPresentAndSquadJoinMessage = ({
  birthdayPerson,
  user,
  name,
  eventId,
}: Arguments): ChatPostMessageArguments =>
  ({
    channel: user,
    metadata: eventId
      ? {
          event_type: "askPresentIdeas",
          event_payload: {
            eventId,
          },
        }
      : undefined,
    text: `Hey, <@${user}>! <@${birthdayPerson}>'s birthday is in less then 2 months. Do you have any additional present ideas?`,
    blocks: [
      makeTextBlock(`Hey ${name}! 👋`),
      makeTextBlock(
        `It's <@${birthdayPerson}>'s birthday is in less then 2 months. Do you have any additional present ideas?`,
      ),
      makeInputBlock(
        "Additional present ideas",
        additionalPresentIdeasInputBlockId,
        additionalPresentIdeasInputActionId,
        true,
      ),
      makeCheckboxInputBlock(
        "Do you want to join the present-making squad?",
        squadJoinCheckboxBlockId,
        squadJoinCheckboxActionId,
      ),
      makeActionsBlock([
        {
          actionId: additionalPresentIdeasSaveButtonActionId,
          text: "Save",
          value: birthdayPerson,
          style: "primary",
        },
      ]),
    ],
  }) satisfies ChatPostMessageArguments;
