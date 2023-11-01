import type { ChatPostMessageArguments, KnownBlock } from "@slack/web-api";

type Arguments = {
  users: string[];
  channel: string;
  eventId?: string;
};

const iceBreakerQuestions = [
  "Hey Guys! What was the last item that you were window shopping for?",
];

export const constructIceBreakerQuestion = (
  args: Arguments,
): ChatPostMessageArguments => {
  const randomIceBreakerQuestion =
    iceBreakerQuestions[Math.floor(Math.random() * iceBreakerQuestions.length)];

  const blocks: KnownBlock[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `${randomIceBreakerQuestion} Post your picks in the thread! 👇`,
      },
    },
  ];

  if (args.users.length) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `Let's see your ones ${args.users
          .map((user) => `<@${user}>`)
          .join(", ")}!`,
      },
    });
  }

  return {
    channel: args.channel,
    metadata: args.eventId
      ? {
          event_type: "iceBreakerQuestion",
          event_payload: {
            eventId: args.eventId,
          },
        }
      : undefined,
    text: randomIceBreakerQuestion,
    blocks,
  } satisfies ChatPostMessageArguments;
};
