import { use } from "sst/constructs";

import { ConfigStack } from "../ConfigStack";
import { EventBusStack } from "../EventBusStack";
import { SchedulerStack } from "../SchedulerStack";
import { StorageStack } from "../StorageStack";

export const getBaseFunctionProps = () => {
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

export const getFunctionProps = () => {
  const { scheduleHandlerLambda, schedulerFunctionInvokeRole } =
    use(SchedulerStack);

  const baseFunctionProps = getBaseFunctionProps();

  return {
    ...baseFunctionProps,
    environment: {
      ...baseFunctionProps.environment,
      SCHEDULER_LAMBDA_ARN: scheduleHandlerLambda.functionArn,
      SCHEDULER_ROLE_ARN: schedulerFunctionInvokeRole.roleArn,
    },
  };
};
