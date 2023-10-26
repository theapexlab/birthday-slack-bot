import type { ChatReplaceMessageArguments } from "@/types/ChatReplaceMessageArguments";

type Arguments = {
  eventId: string;
};

export const constructBirthdayConfirmedMessage = ({
  eventId,
}: Arguments): ChatReplaceMessageArguments => ({
  replace_original: true,
  text: "Thanks for submitting your birthday! :tada:",
  blocks: [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `Thanks for submitting your birthday! :tada:`,
      },
    },
  ],
  metadata: {
    event_type: "birthdayConfirmed",
    event_payload: {
      originalEventId: eventId,
    },
  },
});
