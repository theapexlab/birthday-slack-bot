import type { ChatPostMessageArguments, KnownBlock } from "@slack/web-api";

import { makeTextBlock } from "./messageItems";

type Arguments = {
  users: string[];
  channel: string;
  eventId?: string;
};

const iceBreakerQuestions = [
  "Hey Guys! What was the last item that you were window shopping for?",
];

export const constructIceBreakerQuestion = ({
  users,
  channel,
  eventId,
}: Arguments): ChatPostMessageArguments => {
  const randomIceBreakerQuestion =
    iceBreakerQuestions[Math.floor(Math.random() * iceBreakerQuestions.length)];

  const blocks: KnownBlock[] = [
    makeTextBlock(
      `${randomIceBreakerQuestion} Post your picks in the thread! 👇`,
    ),
  ];

  if (users.length) {
    blocks.push(
      makeTextBlock(
        `Let's see your ones ${users.map((user) => `<@${user}>`).join(", ")}!`,
      ),
    );
  }

  return {
    channel: channel,
    metadata: eventId
      ? {
          event_type: "iceBreakerQuestion",
          event_payload: {
            eventId: eventId,
          },
        }
      : undefined,
    text: randomIceBreakerQuestion,
    blocks,
  } satisfies ChatPostMessageArguments;
};
