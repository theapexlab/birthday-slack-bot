import "@/testUtils/unit/mockDb";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { squadJoins, users } from "@/db/schema";
import { welcomeMessageEventType } from "@/services/slack/constructBirthdaySquadWelcomeMessage";
import { timeout } from "@/testUtils/constants";
import { deleteLastDm } from "@/testUtils/integration/deleteLastDm";
import { sendScheduleEvent } from "@/testUtils/integration/sendScheduleEvent";
import { waitForDm } from "@/testUtils/integration/waitForDm";
import { seedSquadJoins } from "@/testUtils/seedSquadJoins";
import { testDb } from "@/testUtils/testDb";

dayjs.extend(utc);

const testSlackTeamId = import.meta.env.VITE_SLACK_TEAM_ID;
const testUserId = import.meta.env.VITE_SLACK_USER_ID;
const testBotUserId = import.meta.env.VITE_SLACK_BOT_USER_ID;

const constants = vi.hoisted(() => ({
  birthdayPerson: "U001",
  eventId: "E001",
  teamId: testSlackTeamId,
  otherUserIds: [testUserId, testBotUserId],
  conversationId: "CH001",
}));

describe("CreateBirthdaySquad", () => {
  beforeAll(async () => {
    await testDb.delete(users);
    await testDb.delete(squadJoins);
  });

  afterEach(async () => {
    await deleteLastDm();
    await testDb.delete(users);
    await testDb.delete(squadJoins);
  });

  it(
    "Should publish sendWelcomeMessage to the conversation with the joined members",
    async () => {
      await testDb.insert(users).values({
        id: constants.birthdayPerson,
        teamId: constants.teamId,
        birthday: dayjs.utc().toDate(),
      });

      await testDb.insert(users).values(
        constants.otherUserIds.map((userId) => ({
          id: userId,
          teamId: constants.teamId,
          birthday: dayjs.utc().toDate(),
        })),
      );

      await seedSquadJoins(
        constants.birthdayPerson,
        constants.teamId,
        constants.otherUserIds,
        2,
      );

      const eventId = "CS1_" + Date.now().toString();

      await sendScheduleEvent({
        eventId,
        eventType: "createBirthdaySquad",
        payload: {
          team: import.meta.env.VITE_SLACK_TEAM_ID,
          birthdayPerson: constants.birthdayPerson,
          eventId,
        },
      });

      const message = await waitForDm(eventId);

      expect(message.metadata?.event_type, "EventType doesn't match").toEqual(
        welcomeMessageEventType,
      );
    },
    timeout,
  );

  it(
    "Should publish sendWelcomeMessage to the conversation with the random users",
    async () => {
      await testDb.insert(users).values({
        id: constants.birthdayPerson,
        teamId: constants.teamId,
        birthday: dayjs.utc().toDate(),
      });

      await testDb.insert(users).values(
        constants.otherUserIds.map((userId) => ({
          id: userId,
          teamId: constants.teamId,
          birthday: dayjs.utc().toDate(),
        })),
      );

      const eventId = "CS2_" + Date.now().toString();

      await sendScheduleEvent({
        eventId,
        eventType: "createBirthdaySquad",
        payload: {
          team: import.meta.env.VITE_SLACK_TEAM_ID,
          birthdayPerson: constants.birthdayPerson,
          eventId,
        },
      });

      const message = await waitForDm(eventId);

      expect(message.metadata?.event_type, "EventType doesn't match").toEqual(
        welcomeMessageEventType,
      );
    },
    timeout,
  );
});
