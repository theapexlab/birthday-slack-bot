import { vi } from "vitest";

vi.mock("@/db/index", async () => ({
  db: await import("@/testUtils/testDb").then(({ testDb }) => testDb),
}));
