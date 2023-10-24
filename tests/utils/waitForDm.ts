import type { App } from "@slack/bolt";
import { vi } from "vitest";

export const waitForDm = async (app: App) =>
  vi.waitFor(
    async () => {
      const chat = await app.client.conversations.history({
        channel: import.meta.env.VITE_SLACK_DM_ID,
        limit: 1,
      });

      if (!chat.messages?.length) {
        return Promise.reject();
      }

      return chat;
    },
    {
      timeout: 10_000,
      interval: 1_000,
    },
  );
