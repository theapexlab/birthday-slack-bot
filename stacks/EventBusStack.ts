import { EventBus, type StackContext } from "sst/constructs";

export function EventBusStack({ stack }: StackContext) {
  const eventBus = new EventBus(stack, "EventBus", {});

  stack.addOutputs({
    eventBusName: eventBus.eventBusName,
  });

  return {
    eventBus,
  };
}
