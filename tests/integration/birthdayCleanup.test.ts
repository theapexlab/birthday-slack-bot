import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { timeout } from "@/testUtils/constants";
import { sendScheduleEvent } from "@/testUtils/integration/sendScheduleEvent";
import {
  waitForIceBreakerThreads,
  waitForPresentIdeas,
  waitForSquadJoins,
} from "@/testUtils/testDb";
import { cleanUp, insertDb } from "@/testUtils/unit/dbOperations";

const constants = vi.hoisted(() => ({
  teamId: "T1",
  birthdayPerson: "U1",
  otherUserIdsInTeam: ["U2", "U3"],
  otherTeamId: "T2",
  otherBirthdayPerson: "U4",
  otherUserIdsInOtherTeam: ["U5", "U6"],
}));

describe("Birthday cleanup", () => {
  beforeAll(async () => {
    await cleanUp("users");
    await cleanUp("ice_breaker_threads");
    await cleanUp("present_ideas");
    await cleanUp("squad_joins");
  });

  beforeEach(async () => {
    await insertDb("users", [
      {
        id: constants.birthdayPerson,
        team_id: constants.teamId,
        birthday: new Date(),
      },
      {
        id: constants.otherUserIdsInTeam[0],
        team_id: constants.teamId,
        birthday: new Date(),
      },
      {
        id: constants.otherUserIdsInTeam[1],
        team_id: constants.teamId,
        birthday: new Date(),
      },
      {
        id: constants.otherBirthdayPerson,
        team_id: constants.otherTeamId,
        birthday: new Date(),
      },
      {
        id: constants.otherUserIdsInOtherTeam[0],
        team_id: constants.otherTeamId,
        birthday: new Date(),
      },
      {
        id: constants.otherUserIdsInOtherTeam[1],
        team_id: constants.otherTeamId,
        birthday: new Date(),
      },
    ]);
  });

  afterEach(async () => {
    await cleanUp("users");
    await cleanUp("ice_breaker_threads");
    await cleanUp("present_ideas");
    await cleanUp("squad_joins");
  });

  it(
    "Should delete icebreaker threads related to birthdayPerson",
    async () => {
      const eventId = "BC1_" + Date.now().toString();

      const otherItems = [
        {
          team_id: constants.teamId,
          threadId: "T1",
          userId: constants.otherUserIdsInTeam[0],
        },
        {
          team_id: constants.otherTeamId,
          threadId: "T2",
          userId: constants.otherBirthdayPerson,
        },
      ];

      await insertDb("users", [
        {
          team_id: constants.teamId,
          threadId: "T1",
          userId: constants.birthdayPerson,
        },
        ...otherItems,
      ]);

      await sendScheduleEvent({
        eventId,
        eventType: "birthdayCleanup",
        payload: {
          team: constants.teamId,
          birthdayPerson: constants.birthdayPerson,
        },
      });

      const items = await waitForIceBreakerThreads({
        expectedCount: otherItems.length,
      });

      otherItems.forEach((item, index) => {
        expect(items[index]).toEqual({
          ...item,
          id: expect.any(Number),
        });
      });
    },
    timeout,
  );

  it(
    "Should delete present ideas related to birthdayPerson",
    async () => {
      const eventId = "BC2_" + Date.now().toString();

      const otherItems = [
        {
          birthdayPerson: constants.otherUserIdsInTeam[0],
          presentIdea: "PI3",
          team_id: constants.teamId,
          userId: constants.birthdayPerson,
        },
        {
          birthdayPerson: constants.otherBirthdayPerson,
          presentIdea: "PI4",
          team_id: constants.otherTeamId,
          userId: constants.otherUserIdsInOtherTeam[0],
        },
        {
          birthdayPerson: constants.otherBirthdayPerson,
          presentIdea: "PI5",
          team_id: constants.otherTeamId,
          userId: constants.otherUserIdsInOtherTeam[1],
        },
      ];

      await insertDb("users", [
        {
          birthdayPerson: constants.birthdayPerson,
          presentIdea: "PI1",
          team_id: constants.teamId,
          userId: constants.otherUserIdsInTeam[0],
        },
        {
          birthdayPerson: constants.birthdayPerson,
          presentIdea: "PI2",
          team_id: constants.teamId,
          userId: constants.otherUserIdsInTeam[1],
        },
        ...otherItems,
      ]);

      await sendScheduleEvent({
        eventId,
        eventType: "birthdayCleanup",
        payload: {
          team: constants.teamId,
          birthdayPerson: constants.birthdayPerson,
        },
      });

      const items = await waitForPresentIdeas({
        expectedCount: otherItems.length,
      });

      otherItems.forEach((item, index) => {
        expect(items[index]).toEqual({
          ...item,
          id: expect.any(Number),
        });
      });
    },
    timeout,
  );

  it(
    "Should delete squad joins related to birthdayPerson",
    async () => {
      const eventId = "BC3_" + Date.now().toString();

      const otherItems = [
        {
          birthdayPerson: constants.otherUserIdsInTeam[0],
          team_id: constants.teamId,
          userId: constants.birthdayPerson,
        },
        {
          birthdayPerson: constants.otherBirthdayPerson,
          team_id: constants.otherTeamId,
          userId: constants.otherUserIdsInOtherTeam[0],
        },
        {
          birthdayPerson: constants.otherBirthdayPerson,
          team_id: constants.otherTeamId,
          userId: constants.otherUserIdsInOtherTeam[1],
        },
      ];

      await insertDb("users", [
        {
          birthdayPerson: constants.birthdayPerson,
          team_id: constants.teamId,
          userId: constants.otherUserIdsInTeam[0],
        },
        {
          birthdayPerson: constants.birthdayPerson,
          team_id: constants.teamId,
          userId: constants.otherUserIdsInTeam[1],
        },
        ...otherItems,
      ]);

      await sendScheduleEvent({
        eventId,
        eventType: "birthdayCleanup",
        payload: {
          team: constants.teamId,
          birthdayPerson: constants.birthdayPerson,
        },
      });

      const items = await waitForSquadJoins({
        expectedCount: otherItems.length,
      });

      otherItems.forEach((item, index) => {
        expect(items[index]).toEqual({
          id: expect.any(Number),
          ...item,
        });
      });
    },
    timeout,
  );
});
