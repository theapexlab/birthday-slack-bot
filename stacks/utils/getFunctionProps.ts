import { use } from "sst/constructs";

import { ConfigStack } from "../ConfigStack";
import { EventBusStack } from "../EventBusStack";
import { SchedulerStack } from "../SchedulerStack";
import { StorageStack } from "../StorageStack";

const getBaseFunctionProps = () => {
  const secrets = use(ConfigStack);

  return {
    bind: secrets,
    runtime: "nodejs18.x" as const,
  };
};

export const getDbFunctionProps = () => {
  const baseFunctionProps = getBaseFunctionProps();
  const { db } = use(StorageStack);

  const bind = [...baseFunctionProps.bind, ...(db ? [db] : [])];

  return {
    ...baseFunctionProps,
    environment: {
      DB_URL: process.env.DB_URL || "",
    },
    bind,
  };
};

export const getEventBusFunctionProps = () => {
  const baseFunctionProps = getBaseFunctionProps();
  const { eventBus } = use(EventBusStack);

  return {
    ...baseFunctionProps,
    permissions: [eventBus],
    environment: {
      EVENT_BUS_NAME: eventBus.eventBusName,
    },
  };
};

export const getFunctionProps = () => {
  const { scheduleHandlerLambda, schedulerFunctionInvokeRole } =
    use(SchedulerStack);

  const dbFunctionProps = getDbFunctionProps();
  const eventBusFunctionProps = getEventBusFunctionProps();

  return {
    ...dbFunctionProps,
    ...eventBusFunctionProps,
    environment: {
      ...dbFunctionProps.environment,
      ...eventBusFunctionProps.environment,
      SCHEDULER_LAMBDA_ARN: scheduleHandlerLambda.functionArn,
      SCHEDULER_ROLE_ARN: schedulerFunctionInvokeRole.roleArn,
    },
    bind: [...dbFunctionProps.bind, ...eventBusFunctionProps.bind],
  };
};
