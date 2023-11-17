import type { ChatPostMessageArguments } from "@slack/web-api";

export type PostMessageArguments = Pick<
  ChatPostMessageArguments,
  "channel" | "text" | "blocks" | "metadata" | "unfurl_links"
>;

export type ReplaceMessageArguments = Omit<PostMessageArguments, "channel"> & {
  replace_original: boolean;
};
