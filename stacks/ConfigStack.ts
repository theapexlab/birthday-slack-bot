import type { StackContext } from "sst/constructs";
import { Config } from "sst/constructs";

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
  const ADMIN_SLACK_USER_ID = new Config.Secret(stack, "ADMIN_SLACK_USER_ID");
  const DEPUTY_ADMIN_SLACK_USER_ID = new Config.Secret(
    stack,
    "DEPUTY_ADMIN_SLACK_USER_ID",
  );

  return [
    SLACK_LOG_LEVEL,
    SLACK_BOT_TOKEN,
    SLACK_SIGNING_SECRET,
    CORE_SLACK_CHANNEL_ID,
    RANDOM_SLACK_CHANNEL_ID,
    ADMIN_SLACK_USER_ID,
    DEPUTY_ADMIN_SLACK_USER_ID,
  ];
}
