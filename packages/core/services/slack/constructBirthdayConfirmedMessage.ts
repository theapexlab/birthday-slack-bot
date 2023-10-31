import type { ChatReplaceMessageArguments } from "@/types/ChatReplaceMessageArguments";

export const constructBirthdayConfirmedMessage =
  (): ChatReplaceMessageArguments => ({
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
  });
