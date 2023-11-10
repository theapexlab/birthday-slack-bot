import {
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import type { StackContext } from "sst/constructs";
import { Api, Function, Queue, use } from "sst/constructs";

import { eventTypes } from "@/events";

import { EventBusStack } from "./EventBusStack";
import { getFunctionProps } from "./getFunctionProps";

export function MyStack({ stack }: StackContext) {
  const { eventBus } = use(EventBusStack);
  const functionProps = getFunctionProps();

  const schedulerRole = new Role(stack, "SchedulerRole", {
    assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
  });

  schedulerRole.addToPolicy(
    new PolicyStatement({
      actions: [
        "scheduler:CreateSchedule",
        "iam:PassRole",
      ],
      resources: ["*"],
    }),
  );


  eventBus.addRules(
    stack,
    eventTypes.reduce(
      (rules, eventType) => ({
        ...rules,
        [eventType]: {
          pattern: { detailType: [eventType] },
          targets: {
            function: new Queue(stack, `${eventType}-queue`, {
              consumer: {
                function: {
                  handler: `packages/functions/events/${eventType}.handler`,
                  ...functionProps,
                  role: schedulerRole,
                },
              },
            }),
          },
        },
      }),
      {},
    ),
  );

  const api = new Api(stack, "Api", {
    defaults: {
      function: {
        ...functionProps,
      },
    },
    routes: {
      "POST /slack/event": "packages/functions/lambdas/slack-event.handler",
      "POST /slack/interaction":
        "packages/functions/lambdas/slack-interaction.handler",
      "GET /icebreaker": "packages/functions/cron/iceBreakerQuestions.handler",
      "GET /daily": "packages/functions/cron/daily.handler",
    },
  });

  if (stack.stage !== "staging" && stack.stage !== "production") {
    api.addRoutes(stack, {
      "POST /slack/test-payload":
        "packages/functions/lambdas/listen-for-test-payloads.handler",
    });
  }

  const migrationFn = new Function(stack, "MigrateDb", {
    handler: "packages/functions/lambdas/migrateDb.handler",
    copyFiles: [
      {
        from: "packages/core/db/migrations",
      },
    ],
    timeout: "60 seconds",
    ...functionProps,
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
    MigrationFunctionName: migrationFn.functionName,
  });
}
