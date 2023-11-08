import type { ChatPostMessageArguments } from "@slack/web-api";

export type PostMessageArguments = Pick<
  ChatPostMessageArguments,
  "channel" | "text" | "blocks" | "metadata"
>;

export type ReplaceMessageArguments = Omit<PostMessageArguments, "channel"> & {
  replace_original: boolean;
};
