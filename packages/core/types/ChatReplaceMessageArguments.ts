import type { ChatPostMessageArguments } from "@slack/web-api";

export type ChatReplaceMessageArguments = Omit<
  ChatPostMessageArguments,
  "channel"
> & {
  replace_original: boolean;
};
