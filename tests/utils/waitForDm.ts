import { vi } from "vitest";

import { waitTimeout } from "./constants";
import { app } from "./testSlackApp";

export const waitForDm = async (eventId: string) =>
  vi.waitFor(
    async () => {
      const chat = await app.client.conversations.history({
        channel: import.meta.env.VITE_SLACK_DM_ID,
        limit: 1,
        include_all_metadata: true,
      });

      if (!chat.messages?.length) {
        throw new Error("No message sent");
      }

      if (
        !chat.messages.some(
          (message) =>
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            (message.metadata?.event_payload?.["eventId"] as
              | string
              | undefined) === eventId,
        )
      ) {
        throw new Error(`No message with eventId ${eventId}`);
      }

      return chat.messages[0];
    },
    {
      timeout: waitTimeout,
      interval: 1_000,
    },
  );
