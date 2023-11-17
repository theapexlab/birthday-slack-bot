import { createSlackApp } from "./createSlackApp";

export const openConversation = async (userIds: string[]): Promise<string> => {
  const app = createSlackApp();
  const { channel } = await app.client.conversations.open({
    users: userIds.join(","),
  });

  if (!channel?.id) {
    throw new Error("Error while opening conversation");
  }
  return channel?.id;
};
