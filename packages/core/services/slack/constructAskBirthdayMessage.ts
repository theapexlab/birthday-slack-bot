import type {
  PostMessageArguments,
  ReplaceMessageArguments,
} from "@/types/MessageArguments";
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
}: Arguments): Omit<PostMessageArguments, "channel"> => ({
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
): PostMessageArguments => ({
  ...constructBaseAskBirthdayMessage(args),
  channel: args.user,
});

export const constructAskBirthdayMessageReplacement = (
  args: Arguments,
): ReplaceMessageArguments => ({
  ...constructBaseAskBirthdayMessage(args),
  replace_original: true,
});
