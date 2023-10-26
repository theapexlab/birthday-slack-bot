import { vi } from "vitest";

import { redis } from "@/services/redis/redisClient";

export const waitForRedisItem = async (key: string) =>
  vi.waitFor(
    async () => {
      const item = await redis.get(`test:${key}`);
      if (!item) {
        return Promise.reject();
      }
      return item;
    },
    {
      timeout: 20_000,
      interval: 1_000,
    },
  );
