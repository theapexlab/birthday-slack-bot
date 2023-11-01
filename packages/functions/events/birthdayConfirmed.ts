import { saveBirthday } from "@/db/queries/saveBirthday";
import { constructBirthdayConfirmedMessage } from "@/services/slack/constructBirthdayConfirmedMessage";
import { handleEvent } from "@/utils/eventBridge/handleEvent";

export const handler = handleEvent(
  "birthdayConfirmed",
  async ({ user, team, birthday, responseUrl }) => {
    try {
      await fetch(responseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(constructBirthdayConfirmedMessage()),
      });

      await saveBirthday({ user, teamId: team, birthday });
    } catch (error) {
      console.error("Error sending birthday confirmed message: ", error);
    }
  },
);
