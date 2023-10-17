import { createSlackApp } from "./createSlackApp";

export const getBotUserId = async () => {
  const app = createSlackApp();
  const { user_id } = await app.client.auth.test();
  return user_id;
};
