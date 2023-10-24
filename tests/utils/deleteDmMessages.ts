import type { App } from "@slack/bolt";

export const deleteDmMessages = async (app: App) => {
  const chat = await app.client.conversations.history({
    channel: import.meta.env.VITE_SLACK_DM_ID,
    limit: 1,
  });

  for (const message of chat.messages ?? []) {
    if (!message.ts) {
      continue;
    }

    await app.client.chat.delete({
      channel: import.meta.env.VITE_SLACK_DM_ID,
      ts: message.ts,
    });
  }
};
