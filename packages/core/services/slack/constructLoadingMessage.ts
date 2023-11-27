import type { PostMessageArguments } from "@/types/MessageArguments";

export const constructLoadingMessage = (): Omit<
  PostMessageArguments,
  "channel"
> => ({
  text: "Loading...",
  blocks: [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: ":loading:",
      },
    },
  ],
});
