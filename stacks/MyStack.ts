import type { StackContext } from "sst/constructs";
import { Api, EventBus, use } from "sst/constructs";

import { subscribeToEvent } from "@/functions/utils/eventBridge/subscribeToEvent";

import { ConfigStack } from "./ConfigStack";

export function MyStack({ stack }: StackContext) {
  const secrets = use(ConfigStack);

  const eventBus = new EventBus(stack, "Bus", {});

  subscribeToEvent({
    bus: eventBus,
    handler: "packages/functions/events/memberJoinedChannel.handler",
    type: "memberJoinedChannel",
    bind: secrets,
  });

  subscribeToEvent({
    bus: eventBus,
    handler: "packages/functions/events/botJoined.handler",
    type: "botJoined",
    bind: secrets,
  });

  subscribeToEvent({
    bus: eventBus,
    handler: "packages/functions/events/userJoined.handler",
    type: "userJoined",
    bind: secrets,
  });

  subscribeToEvent({
    bus: eventBus,
    handler: "packages/functions/events/memberLeftChannel.handler",
    type: "memberLeftChannel",
    bind: secrets,
  });

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
