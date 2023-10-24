import { createSlackApp } from "./createSlackApp";

export const getChannelMembers = async (
  channelId: string,
): Promise<string[]> => {
  const app = createSlackApp();

  const { members } = await app.client.conversations.members({
    channel: channelId,
  });

  if (!members) {
    throw new Error("Error while fetching channel members");
  }

  return members;
};
