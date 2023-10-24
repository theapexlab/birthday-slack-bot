import { createSlackApp } from "./createSlackApp";

export const getUserInfo = async (userId: string) => {
  const app = createSlackApp();
  return app.client.users.info({ user: userId });
};
