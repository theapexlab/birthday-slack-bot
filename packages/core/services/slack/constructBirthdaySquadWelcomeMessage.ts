import { getIceBreakerThreads } from "@/db/queries/getIceBreakerThreads";
import { getPresentIdeasByUser } from "@/db/queries/getPresentIdeasByUser";
import type { PostMessageArguments } from "@/types/MessageArguments";

import { getIceBreakerThreadLink } from "./getIceBreakerThreadLink";

type Arguments = {
  channel: string;
  teamId: string;
  birthdayPerson: string;
  eventId?: string;
};

export const welcomeMessageEventType = "sendSquadWelcomeMessage";

const previousPresentsSheet =
  "https://docs.google.com/spreadsheets/d/1pzdNkF-18OUS6qhcVD2HHGkTwTmCXJEvR8LBzPjUnGI/edit?pli=1#gid=0";

const formatIceBreakerLinks = (iceBreakerLinks: string[]) =>
  iceBreakerLinks.map((iceBreakerLink) => `• ${iceBreakerLink}`).join("\n");

const formatPresentIdeas = (presentIdeas: string[]) =>
  presentIdeas
    .map((idea) =>
      idea
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n"),
    )
    .join("\n\n");

export const constructBirthdaySquadWelcomeMessage = async ({
  channel,
  teamId,
  birthdayPerson,
  eventId,
}: Arguments): Promise<PostMessageArguments> => {
  const iceBreakers = await getIceBreakerThreads(teamId, birthdayPerson);

  const iceBreakerLinkResponses = await Promise.all(
    iceBreakers.map(getIceBreakerThreadLink),
  );

  const iceBreakerLinks = formatIceBreakerLinks(
    iceBreakerLinkResponses.flatMap(
      (iceBreakerLink) => iceBreakerLink.permalink ?? [],
    ),
  );

  const presentIdeas = await getPresentIdeasByUser(teamId, birthdayPerson);

  const presentIdeasText = Array.from(presentIdeas.entries())
    .map(([user, ideas]) => `<@${user}>:\n${formatPresentIdeas(ideas)}\n`)
    .join("\n");

  return {
    channel,
    text: `Welcome to the birthday squad of <@${birthdayPerson}>! 🎁`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Welcome to the birthday squad of <@${birthdayPerson}>! 🎁*`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Icebreaker threads*\n${iceBreakerLinks}`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Present ideas*\nHere are the present ideas from everyone in the team:\n\n${presentIdeasText}`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Previous presents*\nYou can find the previous presents in <${previousPresentsSheet}|this spreadsheet>.`,
        },
      },
    ],
    unfurl_links: false,
    metadata: eventId
      ? {
          event_type: welcomeMessageEventType,
          event_payload: {
            eventId,
          },
        }
      : undefined,
  };
};
