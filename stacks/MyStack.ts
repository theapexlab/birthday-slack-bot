import type { StackContext } from "sst/constructs";
import { Api, EventBus, Queue, use } from "sst/constructs";

import { eventTypes } from "@/events/index";

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
                    eventBusName: eventBus.eventBusName,
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
      "POST /slack/callback":
        "packages/functions/lambdas/slack-callback.handler",
    },
  });

  api.attachPermissions([eventBus]);

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
