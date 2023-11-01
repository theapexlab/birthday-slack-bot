import type { App } from "@slack/bolt";

export const deleteLastRandomChannelPost = async (app: App) => {
  const chat = await app.client.conversations.history({
    channel: import.meta.env.VITE_RANDOM_SLACK_CHANNEL_ID,
    limit: 1,
  });

  await Promise.all(
    chat.messages?.map(async (message) => {
      if (!message.ts) {
        return;
      }

      await app.client.chat.delete({
        channel: import.meta.env.VITE_RANDOM_SLACK_CHANNEL_ID,
        ts: message.ts,
      });
    }) ?? [],
  );
};
