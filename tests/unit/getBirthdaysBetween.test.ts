import dayjs from "dayjs";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { getBirthdaysBetween } from "@/db/queries/getBirthdays";
import { users } from "@/db/schema";
import {
  generateIceBreakerTestUsers,
  usersInWindow,
  usersOutsideWindow,
} from "@/testUtils/generateIceBreakerTestUsers";
import { testCases } from "@/testUtils/iceBreakerTestCases";
import { testDb } from "@/testUtils/testDb";

vi.mock("@/db/index", async () => ({
  db: await import("@/testUtils/testDb").then(({ testDb }) => testDb),
}));

describe("Get birthdays between", () => {
  beforeAll(async () => {
    await testDb.delete(users);
  });

  afterEach(async () => {
    await testDb.delete(users);
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
          teamId: "T1",
          birthday: expect.any(Date),
        });
      }

      for (const user of usersOutsideWindow) {
        expect(filteredUsers).not.toContainEqual({
          id: user,
          teamId: "T1",
          birthday: expect.any(Date),
        });
      }
    });
  });
});
