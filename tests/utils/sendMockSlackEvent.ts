import type { SlackCallbackRequest } from "@/types/SlackEventRequest";

export const sendMockSlackEvent = async (body: SlackCallbackRequest) =>
  fetch(`${import.meta.env.VITE_API_URL}/slack/callback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then((res) => res.json())
    .catch((error) => console.error(error.stack));
