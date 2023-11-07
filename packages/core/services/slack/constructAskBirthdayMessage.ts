import type { ChatPostMessageArguments } from "@slack/web-api";

import type { ChatReplaceMessageArguments } from "@/types/ChatReplaceMessageArguments";
import { pickBirthdayActionId } from "@/types/SlackInteractionRequest";

import { makeTextBlock, makeTextBlockWithDatepicker } from "./messageItems";

type Arguments = {
  user: string;
  name: string;
  eventId?: string;
};

const constructBaseAskBirthdayMessage = ({
  name,
  eventId,
}: Arguments): Omit<ChatPostMessageArguments, "channel"> => ({
  text: "Please share your birthday with us! 🥳",
  blocks: [
    makeTextBlock(`Hey ${name}! 👋`),
    makeTextBlockWithDatepicker(
      "Please share your birthday with us! 🥳",
      pickBirthdayActionId,
    ),
  ],
  metadata: eventId
    ? {
        event_type: "askBirthday",
        event_payload: {
          eventId,
        },
      }
    : undefined,
});

export const constructAskBirthdayMessage = (
  args: Arguments,
): ChatPostMessageArguments => ({
  ...constructBaseAskBirthdayMessage(args),
  channel: args.user,
});

export const constructAskBirthdayMessageReplacement = (
  args: Arguments,
): ChatReplaceMessageArguments => ({
  ...constructBaseAskBirthdayMessage(args),
  replace_original: true,
});
