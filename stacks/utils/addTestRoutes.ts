import type { Api, Stack } from "sst/constructs";

export const addTestRoutes = (stack: Stack, api: Api) => {
  if (stack.stage === "production") {
    return;
  }

  api.addRoutes(stack, {
    "GET /icebreaker": "packages/functions/cron/iceBreakerQuestions.handler",
    "GET /daily": "packages/functions/cron/daily.handler",
  });

  if (stack.stage === "staging") {
    return;
  }

  api.addRoutes(stack, {
    "POST /slack/test-payload":
      "packages/functions/lambdas/listen-for-test-payloads.handler",
  });
};
