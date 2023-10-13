import { createSlackApp } from "./createSlackApp";

export const sendSlackMessage = async (target: string, text: string) => {
  const app = createSlackApp();

  await app.client.chat.postMessage({
    channel: target,
    text,
  });
};
