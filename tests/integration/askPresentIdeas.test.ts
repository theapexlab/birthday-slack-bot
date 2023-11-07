import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { users } from "@/db/schema";
import { timeout } from "@/testUtils/constants";
import { deleteLastDmMessage } from "@/testUtils/deleteLastDmMessage";
import { testDb } from "@/testUtils/testDb";
import { waitForDm } from "@/testUtils/waitForDm";
import {
  presentIdeasInputActionId,
  presentIdeasSaveButtonBlockId,
} from "@/types/SlackInteractionRequest";

dayjs.extend(utc);

const constants = vi.hoisted(() => ({
  birthdayPerson: "U1",
}));

describe("Present ideas", () => {
  beforeAll(async () => {
    await testDb.delete(users);
  });

  afterEach(async () => {
    await deleteLastDmMessage();

    await testDb.delete(users);
  });

  it(
    "Should ask for present ideas in DM",
    async () => {
      await testDb.insert(users).values({
        id: import.meta.env.VITE_SLACK_USER_ID,
        teamId: import.meta.env.VITE_SLACK_TEAM_ID,
        birthday: new Date(),
      });

      await testDb.insert(users).values({
        id: constants.birthdayPerson,
        teamId: import.meta.env.VITE_SLACK_TEAM_ID,
        birthday: dayjs.utc().add(2, "month").toDate(),
      });

      const eventId = "PI1_" + Date.now().toString();

      await fetch(`${import.meta.env.VITE_API_URL}/daily?eventId=${eventId}`);

      const message = await waitForDm(eventId);

      expect(message.blocks?.length, "Message doesn't have 4 blocks").toBe(4);

      expect(
        message.blocks?.[1].text?.text,
        "Block doesn't mention birthday person.",
      ).toContain(`<@${constants.birthdayPerson}>`);

      expect(
        message.blocks?.[2].element?.action_id,
        "Block doesn't contain input element",
      ).toBe(presentIdeasInputActionId);

      expect(
        message.blocks?.[3].elements?.[0].action_id,
        "Block doesn't contain save button",
      ).toBe(presentIdeasSaveButtonBlockId);
    },
    timeout,
  );
});
