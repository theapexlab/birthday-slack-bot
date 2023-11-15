import { and, eq } from "drizzle-orm";
import { vi } from "vitest";

import { dbFactory } from "@/db/dbFactory";
import {
  iceBreakerThreads,
  presentIdeas,
  squadJoins,
  testItems,
  users,
} from "@/db/schema";

import { pollInterval, waitTimeout } from "./constants";

export const [testDb] = dbFactory(
  import.meta.env.VITE_CI
    ? {
        type: "aws",
        database: import.meta.env.VITE_DB_NAME!,
        secretArn: import.meta.env.VITE_DB_SECRET_ARN!,
        resourceArn: import.meta.env.VITE_DB_CLUSTER_ARN!,
      }
    : {
        type: "node",
        connectionString: import.meta.env.VITE_DB_URL!,
      },
);

export const waitForTestItem = async (id: string) =>
  vi.waitFor(
    async () => {
      const items = await testDb
        .select()
        .from(testItems)
        .where(eq(testItems.id, id))
        .limit(1);

      if (items.length === 0) {
        throw new Error("Testitem not saved");
      }
      return items[0];
    },
    {
      timeout: waitTimeout,
      interval: pollInterval,
    },
  );

export const waitForUser = async (
  userId: string,
  teamId: string,
  expectedCount: number = 1,
) =>
  vi.waitFor(
    async () => {
      const items = await testDb
        .select()
        .from(users)
        .where(and(eq(users.id, userId), eq(users.teamId, teamId)));

      if (items.length !== expectedCount) {
        throw new Error(`Expected ${expectedCount}, but got ${items.length}`);
      }
      return items;
    },
    {
      timeout: waitTimeout,
      interval: pollInterval,
    },
  );

export const waitForIceBreakerThreads = async (
  teamId: string,
  expectedCount: number,
) =>
  vi.waitFor(
    async () => {
      const items = await testDb
        .select()
        .from(iceBreakerThreads)
        .where(and(eq(iceBreakerThreads.teamId, teamId)));

      if (items.length !== expectedCount) {
        throw new Error(`Expected ${expectedCount}, but got ${items.length}`);
      }
      return items;
    },
    {
      timeout: waitTimeout,
      interval: pollInterval,
    },
  );

export const waitForPresentIdea = async (
  userId: string,
  teamId: string,
  expectedCount: number = 1,
) =>
  vi.waitFor(
    async () => {
      const items = await testDb
        .select()
        .from(presentIdeas)
        .where(
          and(eq(presentIdeas.userId, userId), eq(presentIdeas.teamId, teamId)),
        );

      if (items.length !== expectedCount) {
        throw new Error(`Expected ${expectedCount}, but got ${items.length}`);
      }
      return items[0];
    },
    {
      timeout: waitTimeout,
      interval: pollInterval,
    },
  );

export const waitForSquadJoin = async (
  userId: string,
  teamId: string,
  expectedCount: number = 1,
) =>
  vi.waitFor(
    async () => {
      const items = await testDb
        .select()
        .from(squadJoins)
        .where(
          and(eq(squadJoins.userId, userId), eq(squadJoins.teamId, teamId)),
        );

      if (items.length !== expectedCount) {
        throw new Error(`Expected ${expectedCount}, but got ${items.length}`);
      }
      return items[0];
    },
    {
      timeout: waitTimeout,
      interval: pollInterval,
    },
  );
