import type { ChatPostMessageArguments } from "@slack/web-api";

type Arguments = {
  birthdayPerson: string;
  user: string;
  name: string;
  eventId?: string;
};

export const constructAskPresentIdeasMessage = ({
  birthdayPerson,
  user,
  name,
  eventId,
}: Arguments): ChatPostMessageArguments =>
  ({
    channel: user,
    metadata: {
      event_type: "askPresentIdeas",
      event_payload: {
        eventId: eventId || "",
        birthdayPerson,
      },
    },
    text: `Hey, <@${user}>! <@${birthdayPerson}>'s birthday is in 2 months. Do you have any present ideas?`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Hey ${name}! 👋`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `It's <@${birthdayPerson}>'s birthday is in 2 months. Do you have any present ideas?`,
        },
      },
    ],
  }) satisfies ChatPostMessageArguments;
