import { and, eq } from "drizzle-orm";
import { vi } from "vitest";

import { dbFactory } from "@/db/dbFactory";
import {
  iceBreakerThreads,
  presentIdeas,
  squadJoins,
  users,
} from "@/db/schema";

import { queryDb } from "./unit/dbOperations";
import { pollInterval, waitTimeout } from "./constants";

export const [testDb] = dbFactory(
  import.meta.env.VITE_CI
    ? {
        host: import.meta.env.VITE_DB_HOST!,
        database: import.meta.env.VITE_DB_NAME!,
        user: import.meta.env.VITE_DB_USER!,
        password: import.meta.env.VITE_DB_PASSWORD!,
      }
    : {
        connectionString: import.meta.env.VITE_DB_URL!,
      },
);

export const waitForTestItems = async (id: string, expectedCount: number = 2) =>
  vi.waitFor(
    async () => {
      // const items = await testDb
      //   .select()
      //   .from(testItems)
      //   .where(eq(testItems.testId, id))
      //   .limit(expectedCount);
      const items = await queryDb(
        `SELECT * FROM test-items WHERE test_id = '${id}'  LIMIT ${expectedCount}`,
      );

      if (items.length !== expectedCount) {
        throw new Error(
          `Expected ${expectedCount} test item(s) but got ${items.length}`,
        );
      }

      return items;
    },
    {
      timeout: waitTimeout,
      interval: pollInterval,
    },
  );

type WaitForArgs = {
  userId?: string;
  teamId?: string;
  expectedCount?: number;
};

export const waitForUsers = async ({
  userId,
  teamId,
  expectedCount = 1,
}: WaitForArgs) =>
  vi.waitFor(
    async () => {
      const items = await testDb
        .select()
        .from(users)
        .where(
          and(
            userId ? eq(users.id, userId) : undefined,
            teamId ? eq(users.teamId, teamId) : undefined,
          ),
        );

      if (items.length !== expectedCount) {
        throw new Error(
          `Expected ${expectedCount} user(s), but got ${items.length}`,
        );
      }
      return items;
    },
    {
      timeout: waitTimeout,
      interval: pollInterval,
    },
  );

export const waitForIceBreakerThreads = async ({
  teamId,
  expectedCount,
}: WaitForArgs) =>
  vi.waitFor(
    async () => {
      const items = await testDb
        .select()
        .from(iceBreakerThreads)
        .where(teamId ? eq(iceBreakerThreads.teamId, teamId) : undefined);

      if (items.length !== expectedCount) {
        throw new Error(
          `Expected ${expectedCount} icebreaker thread(s), but got ${items.length}`,
        );
      }
      return items;
    },
    {
      timeout: waitTimeout,
      interval: pollInterval,
    },
  );

export const waitForPresentIdeas = async ({
  userId,
  teamId,
  expectedCount = 1,
}: WaitForArgs) =>
  vi.waitFor(
    async () => {
      const items = await testDb
        .select()
        .from(presentIdeas)
        .where(
          and(
            userId ? eq(presentIdeas.userId, userId) : undefined,
            teamId ? eq(presentIdeas.teamId, teamId) : undefined,
          ),
        );

      if (items.length !== expectedCount) {
        throw new Error(
          `Expected ${expectedCount} present idea(s), but got ${items.length}`,
        );
      }
      return items;
    },
    {
      timeout: waitTimeout,
      interval: pollInterval,
    },
  );

export const waitForSquadJoins = async ({
  userId,
  teamId,
  expectedCount = 1,
}: WaitForArgs) =>
  vi.waitFor(
    async () => {
      const items = await testDb
        .select()
        .from(squadJoins)
        .where(
          and(
            userId ? eq(squadJoins.userId, userId) : undefined,
            teamId ? eq(squadJoins.teamId, teamId) : undefined,
          ),
        );

      if (items.length !== expectedCount) {
        throw new Error(
          `Expected ${expectedCount} squad join(s), but got ${items.length}`,
        );
      }
      return items;
    },
    {
      timeout: waitTimeout,
      interval: pollInterval,
    },
  );
