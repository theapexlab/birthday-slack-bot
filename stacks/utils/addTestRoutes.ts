import type { Api, Stack } from "sst/constructs";

export const addTestRoutes = (stack: Stack, api: Api) => {
  if (stack.stage === "production") {
    return;
  }

  api.addRoutes(stack, {
    "GET /icebreaker": "packages/functions/cron/iceBreakerQuestions.handler",
    "GET /daily": "packages/functions/cron/daily.handler",
    "GET /botJoined": "packages/functions/lambdas/manualBotJoinedEvent.handler",
    "GET /userJoined":
      "packages/functions/lambdas/manualUserJoinedEvent.handler",
    "GET /squadJoin": "packages/functions/lambdas/manualSquadJoinEvent.handler",
    "GET /createBirthdaySquad":
      "packages/functions/events/manualCreateBirthdaySquad.handler",
  });

  stack.addOutputs({
    iceBreakerTestUrl: api.url + "/icebreaker",
    dailyTestUrl: api.url + "/daily",
    botJoinedTestUrl: api.url + "/botJoined",
    userJoinedTestUrl: api.url + "/userJoined?userId=",
    squadJoinTestUrl: api.url + "/squadJoin?userId=",
    createBirthdaySquadTestUrl: api.url + "/createBirthdaySquad?userId=",
  });

  if (stack.stage === "staging") {
    return;
  }

  api.addRoutes(stack, {
    "POST /slack/test-payload":
      "packages/functions/lambdas/listen-for-test-payloads.handler",
  });
};
