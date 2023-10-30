import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    alias: {
      "@/db": path.resolve(__dirname, "packages/core/db"),
      "@/events": path.resolve(__dirname, "packages/core/events"),
      "@/functions": path.resolve(__dirname, "packages/functions"),
      "@/services": path.resolve(__dirname, "packages/core/services"),
      "@/types": path.resolve(__dirname, "packages/core/types"),
      "@/utils": path.resolve(__dirname, "packages/functions/utils"),
      "@/testUtils": path.resolve(__dirname, "tests/utils"),
    },
  },
});
