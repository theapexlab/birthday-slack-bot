import { PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import type { StackContext } from "sst/constructs";
import { Api, Function, Queue, use } from "sst/constructs";

import { eventTypes } from "@/events";

import { addTestRoutes } from "./utils/addTestRoutes";
import { getDbFunctionProps, getFunctionProps } from "./utils/getFunctionProps";
import { EventBusStack } from "./EventBusStack";

export function MyStack({ stack }: StackContext) {
  const { eventBus } = use(EventBusStack);
  const functionProps = getFunctionProps();

  const schedulerRole = new Role(stack, "SchedulerRole", {
    assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
  });

  schedulerRole.addToPolicy(
    new PolicyStatement({
      actions: ["scheduler:CreateSchedule", "iam:PassRole"],
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
    },
  });

  addTestRoutes(stack, api);

  const migrationFn = new Function(stack, "MigrateDb", {
    handler: "packages/functions/lambdas/migrateDb.handler",
    copyFiles: [
      {
        from: "packages/core/db/migrations",
      },
    ],
    timeout: "60 seconds",
    ...getDbFunctionProps(),
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
    MigrationFunctionName: migrationFn.functionName,
  });
}
