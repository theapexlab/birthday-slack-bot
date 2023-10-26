import type { ChatPostMessageArguments } from "@slack/web-api";

import type { ChatReplaceMessageArguments } from "@/types/ChatReplaceMessageArguments";
import { pickBirthdayActionId } from "@/types/SlackInteractionRequest";

type Arguments = {
  user: string;
  name: string;
  eventId?: string;
};

const constructBaseAskBirthdayMessage = ({
  name,
  eventId,
}: Arguments): Omit<ChatPostMessageArguments, "channel"> => ({
  text: "Please share your birthday with us! :birthday:",
  blocks: [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `Hey ${name}! :wave:`,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "Please share your birthday with us! :birthday:",
      },
      accessory: {
        type: "datepicker",
        initial_date: "1995-01-01",
        placeholder: {
          type: "plain_text",
          text: "Select a date",
          emoji: true,
        },
        action_id: pickBirthdayActionId,
      },
    },
  ],
  metadata: {
    event_type: "askBirthday",
    event_payload: {
      originalEventId: eventId,
    },
  },
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
