import { handleEvent } from "@/utils/eventBridge/handleEvent";

export const handler = handleEvent(
  "birthdayFilled",
  async ({ user, birthday, responseUrl }) => {
    console.log(`Birthday filled ${user}: ${birthday}`);

    await fetch(responseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        replace_original: true,
        text: "Thanks for sharing your birthday with us! :birthday:",
      }),
    });
  },
);
