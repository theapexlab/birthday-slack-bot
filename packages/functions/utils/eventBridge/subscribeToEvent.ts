import type { EventBus } from "sst/constructs";
import type { SSTConstruct } from "sst/constructs/Construct";

import type { EventType } from "@/events";

type Args = {
  type: EventType;
  bus: EventBus;
  handler: string;
  bind: SSTConstruct[];
};

export const subscribeToEvent = ({ type, bus, handler, bind }: Args) => {
  bus.subscribe(type, {
    environment: {
      EVENT_BUS_NAME: bus.eventBusName,
    },
    handler,
    bind: [...bind, bus],
  });
};
