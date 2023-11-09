import {
  PolicyDocument,
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

  const schedulerRole = new Role(stack, "LambdaVPCRole", {
    assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
  });

  schedulerRole.addToPolicy(
    new PolicyStatement({
      actions: [
        "scheduler:CreateSchedule",
        "scheduler:GetSchedule",
        "scheduler:UpdateSchedule",
        "scheduler:DeleteSchedule",
        "iam:PassRole",
      ],
      resources: ["*"],
    }),
  );

  const scheduleHandlerLambda = new Function(stack, "ScheduleHandlerLambda", {
    handler: "packages/functions/schedule/scheduleHandlerLambda.handler",
    bind: [...functionProps.bind, eventBus],
    role: new Role(stack, "PutEventsRole", {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
      inlinePolicies: {
        SchedulerPolicy: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ["events:PutEvents"],
              resources: ["*"],
            }),
          ],
        }),
      },
    }),
    permissions: [eventBus],
    environment: {
      EVENT_BUS_NAME: eventBus.eventBusName,
    },
  });
  scheduleHandlerLambda.addPermission("AllowEventBridgeInvoke", {
    principal: new ServicePrincipal("events.amazonaws.com"),
    action: "lambda:InvokeFunction",
  });

  const schedulerFunctionRole = new Role(
    stack,
    `schedulerFunctionRole-${stack.stage}`,
    {
      assumedBy: new ServicePrincipal("scheduler.amazonaws.com"),
      inlinePolicies: {
        lambdaExecute: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ["lambda:InvokeFunction"],
              resources: ["*"],
            }),
          ],
        }),
      },
      roleName: `schedulerFunctionRole-${stack.stage}`,
    },
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
                  permissions: [eventBus],
                  environment: {
                    EVENT_BUS_NAME: eventBus.eventBusName,
                    DB_URL: process.env.DB_URL || "",
                    SCHEDULER_LAMBDA_ARN: scheduleHandlerLambda.functionArn,
                    SCHEDULER_ROLE_ARN: schedulerFunctionRole.roleArn,
                  },
                  bind: functionProps.bind,
                  role: schedulerRole,
                  runtime: "nodejs18.x",
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
        bind: functionProps.bind,
        permissions: [eventBus],
        environment: {
          EVENT_BUS_NAME: eventBus.eventBusName,
          DB_URL: process.env.DB_URL || "",
        },
        runtime: "nodejs18.x",
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
