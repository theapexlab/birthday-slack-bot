import { Config } from "sst/node/config";

import { createSlackApp } from "./createSlackApp";

export const getIceBreakerThreadLink = async (threadId: string) => {
  const app = createSlackApp();

  return app.client.chat.getPermalink({
    channel: Config.RANDOM_SLACK_CHANNEL_ID,
    message_ts: threadId,
  });
};
