import type { StackContext } from "sst/constructs";
import { Cron, use } from "sst/constructs";

import { MyStack } from "./MyStack";

export function CronStack({ stack }: StackContext) {
  const { stage } = stack;
  const isDev = stage !== "production";
  const { processTriggerJob } = use(MyStack);

  const triggerBirthdayJob = {
    function: {
      handler: "packages/functions/cron/index.handler",
      bind: [processTriggerJob],
      environment: {
        processTriggerJobQueueUrl: processTriggerJob.queueUrl,
        isDev: isDev.toString(),
      },
    },
  };

  new Cron(stack, "Birthday-dev-trigger", {
    schedule: `rate(1 day)`,
    job: triggerBirthdayJob,
    enabled: isDev,
  });
}
