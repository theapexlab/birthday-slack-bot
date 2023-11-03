import { getTeammates } from "@/db/queries/getTeammates";
import { constructAskPresentIdeasMessage } from "@/services/slack/constructAskPresentIdeasMessage";
import { createSlackApp } from "@/services/slack/createSlackApp";
import { getUserInfo } from "@/services/slack/getUserInfo";
import { handleEvent } from "@/utils/eventBridge/handleEvent";

export const handler = handleEvent(
  "askPresentIdeas",
  async ({ team, user, eventId }) => {
    const teammates = await getTeammates(team, user);

    const app = createSlackApp();

    const userNames = await Promise.all(
      teammates.map((teammate) => getUserInfo(teammate)),
    );

    await Promise.all(
      teammates.map((teammate, i) =>
        app.client.chat.postMessage(
          constructAskPresentIdeasMessage({
            birthdayPerson: user,
            user: teammate,
            name:
              userNames[i].user?.profile?.first_name ||
              userNames[i].user?.name ||
              "",
            eventId,
          }),
        ),
      ),
    );
  },
);
