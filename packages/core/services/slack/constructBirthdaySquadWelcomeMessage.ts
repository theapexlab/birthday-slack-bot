import type { ReplaceMessageArguments } from "@/types/MessageArguments";

type Arguments = {
  icebreakerLinks: string[];
  presentIdeas: Map<string, string[]>;
  birthdayPerson: string;
  eventId?: string;
};

export const welcomeMessageEventType = "sendSquadWelcomeMessage";

const previousPresentsSheet =
  "https://docs.google.com/spreadsheets/d/1pzdNkF-18OUS6qhcVD2HHGkTwTmCXJEvR8LBzPjUnGI/edit?pli=1#gid=0";

const formatIceBreakerLinks = (iceBreakerLinks: string[]) =>
  iceBreakerLinks.length
    ? iceBreakerLinks.map((iceBreakerLink) => `• ${iceBreakerLink}`).join("\n")
    : null;

const formatPresentIdeas = (presentIdeas: string[]) =>
  presentIdeas.length
    ? presentIdeas
        .map((idea) =>
          idea
            .split("\n")
            .map((line) => `> ${line}`)
            .join("\n"),
        )
        .join("\n\n")
    : null;

export const constructBirthdaySquadWelcomeMessage = ({
  icebreakerLinks,
  presentIdeas,
  birthdayPerson,
  eventId,
}: Arguments): ReplaceMessageArguments => {
  const formattedIceBreakerLinks = formatIceBreakerLinks(icebreakerLinks);

  const presentIdeasText = Array.from(presentIdeas.entries())
    .map(([user, ideas]) => `<@${user}>:\n${formatPresentIdeas(ideas)}\n`)
    .join("\n");

  return {
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
          text: `*Icebreaker threads*\n${
            formattedIceBreakerLinks || "No icebreaker threads."
          }`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Present ideas*\n${
            presentIdeasText
              ? `Here are the present ideas from everyone in the team:\n\n${presentIdeasText}`
              : "No present ideas."
          }`,
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
