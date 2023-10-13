import { Config, type StackContext } from "sst/constructs";

export function ConfigStack({ stack }: StackContext) {
  const SLACK_LOG_LEVEL = new Config.Secret(stack, "SLACK_LOG_LEVEL");
  const SLACK_BOT_TOKEN = new Config.Secret(stack, "SLACK_BOT_TOKEN");
  const SLACK_SIGNING_SECRET = new Config.Secret(stack, "SLACK_SIGNING_SECRET");
  const CORE_SLACK_CHANNEL_ID = new Config.Secret(
    stack,
    "CORE_SLACK_CHANNEL_ID",
  );
  const RANDOM_SLACK_CHANNEL_ID = new Config.Secret(
    stack,
    "RANDOM_SLACK_CHANNEL_ID",
  );

  return [
    SLACK_LOG_LEVEL,
    SLACK_BOT_TOKEN,
    SLACK_SIGNING_SECRET,
    CORE_SLACK_CHANNEL_ID,
    RANDOM_SLACK_CHANNEL_ID,
  ];
}
