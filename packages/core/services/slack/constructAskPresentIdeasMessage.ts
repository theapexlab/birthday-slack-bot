import type { ChatPostMessageArguments } from "@slack/web-api";

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
    ],
  }) satisfies ChatPostMessageArguments;
