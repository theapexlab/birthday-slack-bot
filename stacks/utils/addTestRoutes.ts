import type { Api, Stack } from "sst/constructs";

export const addTestRoutes = (stack: Stack, api: Api) => {
  if (stack.stage === "production") {
    return;
  }

  api.addRoutes(stack, {
    "GET /botJoined": "packages/functions/lambdas/manualBotJoinedEvent.handler",
    "GET /userJoined":
      "packages/functions/lambdas/manualUserJoinedEvent.handler",
    "GET /birthdayPing": "packages/functions/lambdas/manualReping.handler",
    "GET /icebreaker": "packages/functions/cron/iceBreakerQuestions.handler",
    "GET /askPresentIdeas":
      "packages/functions/lambdas/manualAskPresentIdeasEvent.handler",
    "GET /squadJoin": "packages/functions/lambdas/manualSquadJoinEvent.handler",
    "GET /createBirthdaySquad":
      "packages/functions/lambdas/manualCreateBirthdaySquad.handler",
    "GET /cleanup": "packages/functions/lambdas/manualCleanup.handler",
  });

  stack.addOutputs({
    botJoinedTestUrl: api.url + "/botJoined",
    userJoinedTestUrl: api.url + "/userJoined?userId=",
    birthdayPingTestUrl: api.url + "/birthdayPing",
    iceBreakerTestUrl: api.url + "/icebreaker",
    askPresentIdeasTestUrl: api.url + "/askPresentIdeas?userId=",
    squadJoinTestUrl: api.url + "/squadJoin?userId=",
    createBirthdaySquadTestUrl: api.url + "/createBirthdaySquad?userId=",
    cleanupTestUrl: api.url + "/cleanup?userId=",
  });

  if (stack.stage === "staging") {
    return;
  }

  api.addRoutes(stack, {
    "POST /slack/test-payload":
      "packages/functions/lambdas/listen-for-test-payloads.handler",
  });
};
