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
  const { outputs, vpc } = use(StorageStack);

  // const bind = [...baseFunctionProps.bind, ...(db ? [db] : [])];

  return {
    ...baseFunctionProps,
    vpc,
    environment: {
      DB_URL: process.env.DB_URL || "",
      DB_NAME: outputs.RDSDATABASE,
      DB_SECRET_ARN: outputs.RDSSECRETARN,
      DB_RESOURCE_ARN: outputs.RDSCLUSTERARN,
    },
    // bind,
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
