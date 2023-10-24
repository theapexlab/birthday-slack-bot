import { createSlackApp } from "@/services/slack/createSlackApp";
import { getUserInfo } from "@/services/slack/getUserInfo";
import { handleEvent } from "@/utils/eventBridge/handleEvent";

export const handler = handleEvent("askBirthday", async ({ user }) => {
  try {
    const userInfo = await getUserInfo(user);

    if (!userInfo.user || userInfo.user.is_bot) {
      return;
    }

    const app = createSlackApp();

    await app.client.chat.postMessage({
      channel: user,
      text: "Please share your birthday with us! :birthday:",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Hey ${userInfo.user?.profile?.first_name}! :wave:`,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Please share your birthday with us! :birthday:",
          },
          accessory: {
            type: "datepicker",
            initial_date: "1995-01-01",
            placeholder: {
              type: "plain_text",
              text: "Select a date",
              emoji: true,
            },
            action_id: "birthday",
          },
        },
      ],
    });
  } catch (error) {
    console.log("Error processing askBirthday event: ", error);
  }
});
