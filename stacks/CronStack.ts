import type { StackContext } from "sst/constructs";
import { Cron } from "sst/constructs";

import { daily, iceBreaker } from "@/types/cron";

import { getFunctionProps } from "./utils/getFunctionProps";
import { isStageTestable } from "./utils/isStageTestable";

export function CronStack({ stack }: StackContext) {
  const functionProps = getFunctionProps();

  const isTestable = isStageTestable(stack);

  new Cron(stack, "IceBreakerCron", {
    job: {
      function: {
        handler: "packages/functions/cron/iceBreakerQuestions.handler",
        ...functionProps,
      },
    },
    cdk: isTestable
      ? {
          rule: {
            eventPattern: {
              detailType: [iceBreaker],
            },
          },
        }
      : undefined,
    // Every first Tuesday of the month at 11:00 UTC
    schedule: "cron(0 11 ? * 3#1 *)",
  });

  new Cron(stack, "DailyCron", {
    job: {
      function: {
        handler: "packages/functions/cron/daily.handler",
        ...functionProps,
      },
    },
    cdk: isTestable
      ? {
          rule: {
            eventPattern: {
              detailType: [daily],
            },
          },
        }
      : undefined,
    // Every day at 11:00 UTC
    schedule: "cron(0 11 ? * * *)",
  });
}
