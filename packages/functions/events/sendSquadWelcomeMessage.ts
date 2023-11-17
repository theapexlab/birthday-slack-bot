import { getIceBreakerThreads } from "@/db/queries/getIceBreakerThreads";
import { getPresentIdeasByUser } from "@/db/queries/getPresentIdeasByUser";
import { constructBirthdaySquadWelcomeMessage } from "@/services/slack/constructBirthdaySquadWelcomeMessage";
import { createSlackApp } from "@/services/slack/createSlackApp";
import { getIceBreakerThreadLink } from "@/services/slack/getIceBreakerThreadLink";
import { handleEvent } from "@/utils/eventBridge/handleEvent";

export const handler = handleEvent(
  "sendSquadWelcomeMessage",
  async ({ team, birthdayPerson, conversationId, eventId }) => {
    try {
      const iceBreakers = await getIceBreakerThreads(team, birthdayPerson);

      const iceBreakerLinkResponses = await Promise.all(
        iceBreakers.map(getIceBreakerThreadLink),
      );

      const presentIdeas = await getPresentIdeasByUser(team, birthdayPerson);

      const message = constructBirthdaySquadWelcomeMessage({
        icebreakerLinks: iceBreakerLinkResponses.flatMap(
          (iceBreakerLink) => iceBreakerLink.permalink ?? [],
        ),
        presentIdeas,
        birthdayPerson,
        eventId,
      });

      const app = createSlackApp();
      await app.client.chat.postMessage({
        ...message,
        channel: conversationId,
      });
    } catch (error) {
      console.error("Error processing sendSquadWelcomeMessage event: ", error);
    }
  },
);
