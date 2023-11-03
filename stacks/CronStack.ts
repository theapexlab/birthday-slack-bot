import type { StackContext } from "sst/constructs";
import { Cron, use } from "sst/constructs";

import { ConfigStack } from "./ConfigStack";

export function CronStack({ stack }: StackContext) {
  const secrets = use(ConfigStack);

  const cron = new Cron(stack, "Cron", {
    job: "packages/functions/cron/iceBreakerQuestions.handler",
    // Every first Tuesday of the month at 11:00 UTC
    schedule: "cron(0 11 ? * 3#1 *)",
  });

  cron.bind(secrets);
}
