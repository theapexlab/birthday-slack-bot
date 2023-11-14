import { Rule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import {
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { type StackContext } from "sst/constructs";
import { Function } from "sst/constructs";

import { scheduleEvent } from "@/types/schedule";

import { getBaseFunctionProps } from "./utils/getFunctionProps";
import { isStageTestable } from "./utils/isStageTestable";

export function SchedulerStack({ stack }: StackContext) {
  const scheduleHandlerLambda = new Function(
    stack,
    `ScheduleHandlerLambda-${stack.stage}`,
    {
      handler: "packages/functions/schedule/scheduleHandlerLambda.handler",
      ...getBaseFunctionProps(),
    },
  );

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
              resources: [scheduleHandlerLambda.functionArn],
            }),
          ],
        }),
      },
      roleName: `schedulerFunctionInvokeRole-${stack.stage}`,
    },
  );

  const isTestable = isStageTestable(stack);

  if (isTestable) {
    new Rule(stack, "LambdaTriggerRule", {
      eventPattern: {
        detailType: [scheduleEvent],
      },
      targets: [new LambdaFunction(scheduleHandlerLambda)],
    });
  }

  return {
    scheduleHandlerLambda,
    schedulerFunctionInvokeRole,
  };
}
