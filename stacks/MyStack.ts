import type { StackContext } from "sst/constructs";
import { Api, EventBus, Function, Queue, use } from "sst/constructs";

import { eventTypes } from "@/events";

import { ConfigStack } from "./ConfigStack";
import { StorageStack } from "./StorageStack";

export function MyStack({ stack }: StackContext) {
  const secrets = use(ConfigStack);
  const { db } = use(StorageStack);

  const bind = [...secrets, ...(db ? [db] : [])];

  const eventBus = new EventBus(stack, "Bus", {});

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
                  },
                  bind,
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
        bind,
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

  api.attachPermissions([eventBus]);

  const migrationFn = new Function(stack, "MigrateDb", {
    handler: "packages/functions/lambdas/migrateDb.handler",
    bind,
    environment: {
      DB_URL: process.env.DB_URL || "",
    },
    copyFiles: [
      {
        from: "packages/core/db/migrations",
      },
    ],
    timeout: "60 seconds",
    runtime: "nodejs18.x",
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
    MigrationFunctionName: migrationFn.functionName,
  });
}
