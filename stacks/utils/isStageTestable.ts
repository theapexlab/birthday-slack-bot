import type { Stack } from "sst/constructs";

export const isStageTestable = (stack: Stack) =>
  stack.stage !== "staging" && stack.stage !== "production";
