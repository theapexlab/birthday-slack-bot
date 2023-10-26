import { constructBirthdayConfirmedMessage } from "@/services/slack/constructBirthdayConfirmedMessage";
import { handleEvent } from "@/utils/eventBridge/handleEvent";

export const handler = handleEvent(
  "birthdayConfirmed",
  async ({ user, team, birthday, responseUrl, eventId }) => {
    await fetch(responseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        constructBirthdayConfirmedMessage({
          eventId,
        }),
      ),
    });

    console.log(
      `User ${user} from team ${team} confirmed their birthday: ${birthday}`,
    );

    // TODO: Save birthday to database
  },
);
