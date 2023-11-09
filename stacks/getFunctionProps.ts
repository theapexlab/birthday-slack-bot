import { use } from "sst/constructs";

import { ConfigStack } from "./ConfigStack";
import { EventBusStack } from "./EventBusStack";
import { StorageStack } from "./StorageStack";

export const getFunctionProps = () => {
  const secrets = use(ConfigStack);
  const { db } = use(StorageStack);
  const { eventBus } = use(EventBusStack);

  const bind = [...secrets, ...(db ? [db] : [])];

  return {
    permissions: [eventBus],
    environment: {
      EVENT_BUS_NAME: eventBus.eventBusName,
      DB_URL: process.env.DB_URL || "",
    },
    bind,
    runtime: "nodejs18.x" as const,
  };
};
