import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  iceBreakerThreads,
  presentIdeas,
  squadJoins,
  users,
} from "@/db/schema";
import { timeout } from "@/testUtils/constants";
import { sendScheduleEvent } from "@/testUtils/integration/sendScheduleEvent";
import {
  testDb,
  waitForIceBreakerThreads,
  waitForPresentIdeas,
  waitForSquadJoins,
} from "@/testUtils/testDb";
import { cleanUp } from "@/testUtils/unit/cleanUp";

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
    await cleanUp("iceBreakerThreads");
    await cleanUp("presentIdeas");
    await cleanUp("squadJoins");
  });

  beforeEach(async () => {
    await testDb.insert(users).values([
      {
        id: constants.birthdayPerson,
        teamId: constants.teamId,
        birthday: new Date(),
      },
      {
        id: constants.otherUserIdsInTeam[0],
        teamId: constants.teamId,
        birthday: new Date(),
      },
      {
        id: constants.otherUserIdsInTeam[1],
        teamId: constants.teamId,
        birthday: new Date(),
      },
      {
        id: constants.otherBirthdayPerson,
        teamId: constants.otherTeamId,
        birthday: new Date(),
      },
      {
        id: constants.otherUserIdsInOtherTeam[0],
        teamId: constants.otherTeamId,
        birthday: new Date(),
      },
      {
        id: constants.otherUserIdsInOtherTeam[1],
        teamId: constants.otherTeamId,
        birthday: new Date(),
      },
    ]);
  });

  afterEach(async () => {
    await cleanUp("users");
    await cleanUp("iceBreakerThreads");
    await cleanUp("presentIdeas");
    await cleanUp("squadJoins");
  });

  it(
    "Should delete icebreaker threads related to birthdayPerson",
    async () => {
      const eventId = "BC1_" + Date.now().toString();

      const otherItems = [
        {
          teamId: constants.teamId,
          threadId: "T1",
          userId: constants.otherUserIdsInTeam[0],
        },
        {
          teamId: constants.otherTeamId,
          threadId: "T2",
          userId: constants.otherBirthdayPerson,
        },
      ];

      await testDb.insert(iceBreakerThreads).values([
        {
          teamId: constants.teamId,
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
          teamId: constants.teamId,
          userId: constants.birthdayPerson,
        },
        {
          birthdayPerson: constants.otherBirthdayPerson,
          presentIdea: "PI4",
          teamId: constants.otherTeamId,
          userId: constants.otherUserIdsInOtherTeam[0],
        },
        {
          birthdayPerson: constants.otherBirthdayPerson,
          presentIdea: "PI5",
          teamId: constants.otherTeamId,
          userId: constants.otherUserIdsInOtherTeam[1],
        },
      ];

      await testDb.insert(presentIdeas).values([
        {
          birthdayPerson: constants.birthdayPerson,
          presentIdea: "PI1",
          teamId: constants.teamId,
          userId: constants.otherUserIdsInTeam[0],
        },
        {
          birthdayPerson: constants.birthdayPerson,
          presentIdea: "PI2",
          teamId: constants.teamId,
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
          teamId: constants.teamId,
          userId: constants.birthdayPerson,
        },
        {
          birthdayPerson: constants.otherBirthdayPerson,
          teamId: constants.otherTeamId,
          userId: constants.otherUserIdsInOtherTeam[0],
        },
        {
          birthdayPerson: constants.otherBirthdayPerson,
          teamId: constants.otherTeamId,
          userId: constants.otherUserIdsInOtherTeam[1],
        },
      ];

      await testDb.insert(squadJoins).values([
        {
          birthdayPerson: constants.birthdayPerson,
          teamId: constants.teamId,
          userId: constants.otherUserIdsInTeam[0],
        },
        {
          birthdayPerson: constants.birthdayPerson,
          teamId: constants.teamId,
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
