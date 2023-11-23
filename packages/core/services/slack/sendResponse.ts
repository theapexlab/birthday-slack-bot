import type { PostMessageArguments } from "@/types/MessageArguments";

export const sendResponse = async (
  responseUrl: string,
  message: Omit<PostMessageArguments, "channel">,
) => {
  try {
    return fetch(responseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
  } catch (error) {
    console.error("Error sending response: ", error);
  }
};
