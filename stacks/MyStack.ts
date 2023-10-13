import type { StackContext } from "sst/constructs";
import { Queue, use } from "sst/constructs";

import { ConfigStack } from "./ConfigStack";

export function MyStack({ stack }: StackContext) {
  const secrets = use(ConfigStack);

  const processTriggerJob = new Queue(stack, "process-trigger-job", {
    consumer: {
      function: {
        handler: "packages/functions/queues/process-cron-job-queue.handler",
        timeout: 10,
        bind: secrets,
      },
    },
  });

  return {
    processTriggerJob,
  };
}
