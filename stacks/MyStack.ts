import type { StackContext } from "sst/constructs";
import { Api, EventBus, Queue, use } from "sst/constructs";

import { eventTypes } from "@/events";

import { ConfigStack } from "./ConfigStack";

export function MyStack({ stack }: StackContext) {
  const secrets = use(ConfigStack);

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
                  },
                  bind: secrets,
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
        bind: secrets,
        environment: {
          EVENT_BUS_NAME: eventBus.eventBusName,
        },
      },
    },
    routes: {
      "POST /slack/event": "packages/functions/lambdas/slack-event.handler",
      "POST /slack/interaction":
        "packages/functions/lambdas/slack-interaction.handler",
    },
  });

  api.attachPermissions([eventBus]);

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
