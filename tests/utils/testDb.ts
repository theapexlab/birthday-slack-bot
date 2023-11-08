import { eq } from "drizzle-orm";
import { vi } from "vitest";

import { dbFactory } from "@/db/dbFactory";
import { testItems } from "@/db/schema";

import { waitTimeout } from "./constants";

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
      interval: 1_000,
    },
  );
