import type { LogLevel } from "@slack/bolt";
import { App } from "@slack/bolt";
import { Config } from "sst/node/config";

let singletonApp: App | undefined;

export const createSlackApp = () => {
  if (singletonApp) {
    return singletonApp;
  }

  const token = Config.SLACK_BOT_TOKEN;
  const signingSecret = Config.SLACK_SIGNING_SECRET;
  const logLevel = Config.SLACK_LOG_LEVEL as LogLevel;

  if (!token || !signingSecret || !logLevel) {
    throw new Error("Missing Slack config");
  }

  singletonApp = new App({
    signingSecret,
    token,
    logLevel,
  });

  return singletonApp;
};
