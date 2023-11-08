import type { SlackInteractionRequest } from "@/types/SlackInteractionRequest";

export const sendMockSlackInteraction = async (
  body: SlackInteractionRequest,
) => {
  const urlEncodedBody = new URLSearchParams({
    payload: JSON.stringify(body),
  });

  const encodedBody = urlEncodedBody.toString();

  return fetch(`${import.meta.env.VITE_API_URL}/slack/interaction`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: encodedBody,
  })
    .then((res) => res.json())
    .catch((error) => console.error(error.stack));
};
