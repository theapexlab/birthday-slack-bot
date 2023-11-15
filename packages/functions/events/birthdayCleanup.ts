import { deleteBirthdayInputs } from "@/db/queries/deleteBirthdayInputs";
import { handleEvent } from "@/utils/eventBridge/handleEvent";

export const handler = handleEvent(
  "birthdayCleanup",
  async ({ team, birthdayPerson }) => {
    await deleteBirthdayInputs(team, birthdayPerson);
  },
);
