import { Rule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import {
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { type StackContext, use } from "sst/constructs";
import { Function } from "sst/constructs";

import { scheduleEvent } from "@/types/schedule";

import { ConfigStack } from "./ConfigStack";
import { EventBusStack } from "./EventBusStack";
import { StorageStack } from "./StorageStack";

export function SchedulerStack({ stack }: StackContext) {
  const { eventBus } = use(EventBusStack);
  const secrets = use(ConfigStack);
  const { db } = use(StorageStack);
  const bind = [...secrets, ...(db ? [db] : [])];

  const schedulerFunctionInvokeRole = new Role(
    stack,
    `schedulerFunctionInvokeRole-${stack.stage}`,
    {
      assumedBy: new ServicePrincipal("scheduler.amazonaws.com"),
      inlinePolicies: {
        lambdaExecute: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ["lambda:InvokeFunction"],
              resources: ["*"],
            }),
          ],
        }),
      },
      roleName: `schedulerFunctionInvokeRole-${stack.stage}`,
    },
  );

  const scheduleHandlerLambda = new Function(stack, "ScheduleHandlerLambda", {
    handler: "packages/functions/schedule/scheduleHandlerLambda.handler",
    bind,
    role: new Role(stack, "PutEventsRole", {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
      inlinePolicies: {
        SchedulerPolicy: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ["events:PutEvents"],
              resources: ["*"],
            }),
          ],
        }),
      },
    }),
    permissions: [eventBus],
    environment: {
      EVENT_BUS_NAME: eventBus.eventBusName,
    },
  });

  scheduleHandlerLambda.addPermission("AllowEventBridgeInvoke", {
    principal: new ServicePrincipal("events.amazonaws.com"),
    action: "lambda:InvokeFunction",
  });

  // This rule is neccessary for testing
  new Rule(stack, "LambdaTriggerRule", {
    eventPattern: {
      detailType: [scheduleEvent],
    },
    targets: [new LambdaFunction(scheduleHandlerLambda)],
  });

  return {
    scheduleHandlerLambda,
    schedulerFunctionInvokeRole,
  };
}
