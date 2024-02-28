import "@/testUtils/unit/mockDb";

import dayjs from "dayjs";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { getBirthdaysBetween } from "@/db/queries/getBirthdays";
import {
  generateIceBreakerTestUsers,
  usersInWindow,
  usersOutsideWindow,
} from "@/testUtils/generateIceBreakerTestUsers";
import { cleanUp } from "@/testUtils/unit/dbOperations";
import { testCases } from "@/testUtils/unit/iceBreakerTestCases";

const constants = vi.hoisted(() => ({
  teamId: "T1",
}));

describe("Get birthdays between", () => {
  beforeAll(async () => {
    await cleanUp("users");
  });

  afterEach(async () => {
    await cleanUp("users");
  });

  testCases.forEach(async (testCase) => {
    it(`Should return users with birthdays between ${testCase.start} and ${testCase.end} when today is ${testCase.today}`, async () => {
      await generateIceBreakerTestUsers(testCase.today);

      const filteredUsers = await getBirthdaysBetween(
        dayjs.utc(testCase.start),
        dayjs.utc(testCase.end),
      );

      for (const user of usersInWindow) {
        expect(filteredUsers).toContainEqual({
          id: user,
          teamId: constants.teamId,
          birthday: expect.any(Date),
        });
      }

      for (const user of usersOutsideWindow) {
        expect(filteredUsers).not.toContainEqual({
          id: user,
          teamId: constants.teamId,
          birthday: expect.any(Date),
        });
      }
    });
  });
});
