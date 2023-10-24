import type { LogLevel } from "@slack/bolt";
import { App } from "@slack/bolt";
import { Config } from "sst/node/config";

export const createSlackApp = () => {
  const token = Config.SLACK_BOT_TOKEN;
  const signingSecret = Config.SLACK_SIGNING_SECRET;
  const logLevel = Config.SLACK_LOG_LEVEL as LogLevel;

  if (!token || !signingSecret || !logLevel) {
    throw new Error("Missing Slack config");
  }

  const app = new App({
    signingSecret,
    token,
    logLevel,
  });

  return app;
};
