import type { PostMessageArguments } from "@/types/MessageArguments";
import {
  presentIdeasInputActionId,
  presentIdeasInputBlockId,
  presentIdeasSaveButtonActionId,
} from "@/types/SlackInteractionRequest";

import {
  makeActionsBlock,
  makeInputBlock,
  makeTextBlock,
} from "./messageItems";

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
}: Arguments): PostMessageArguments => ({
  channel: user,
  metadata: eventId
    ? {
        event_type: "askPresentIdeas",
        event_payload: {
          eventId,
        },
      }
    : undefined,
  text: `Hey, <@${user}>! <@${birthdayPerson}>'s birthday is in 2 months. Do you have any present ideas?`,
  blocks: [
    makeTextBlock(`Hey ${name}! 👋`),
    makeTextBlock(
      `It's <@${birthdayPerson}>'s birthday is in 2 months. Do you have any present ideas?`,
    ),
    makeInputBlock(
      "Present ideas",
      presentIdeasInputBlockId,
      presentIdeasInputActionId,
      true,
    ),
    makeActionsBlock([
      {
        actionId: presentIdeasSaveButtonActionId,
        text: "Save",
        value: birthdayPerson,
        style: "primary",
      },
    ]),
  ],
});
