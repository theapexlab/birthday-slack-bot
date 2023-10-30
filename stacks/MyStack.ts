import type { StackContext } from "sst/constructs";
import { Api, EventBus, Function, Queue, use } from "sst/constructs";

import { eventTypes } from "@/events";

import { ConfigStack } from "./ConfigStack";
import { StorageStack } from "./StorageStack";

export function MyStack({ stack }: StackContext) {
  const secrets = use(ConfigStack);
  const { db } = use(StorageStack);

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
                  bind: [...secrets, db],
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
        bind: [...secrets, db],
        environment: {
          EVENT_BUS_NAME: eventBus.eventBusName,
          DB_URL: process.env.DB_URL || "",
        },
      },
    },
    routes: {
      "POST /slack/event": "packages/functions/lambdas/slack-event.handler",
      "POST /slack/interaction":
        "packages/functions/lambdas/slack-interaction.handler",
    },
  });

  if (stack.stage !== "staging" && stack.stage !== "production") {
    api.addRoutes(stack, {
      "POST /slack/test-payload":
        "packages/functions/lambdas/listen-for-test-payloads.handler",
    });
  }

  api.attachPermissions([eventBus]);

  new Function(stack, "MigrateDb", {
    handler: "packages/functions/lambdas/migrateDb.handler",
    bind: [...secrets, db],
    functionName: "MigrateDb",
    environment: {
      DB_URL: process.env.DB_URL || "",
    },
    copyFiles: [
      {
        from: "packages/core/db/migrations",
      },
    ],
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
