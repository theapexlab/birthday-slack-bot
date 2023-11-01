import type { StackContext } from "sst/constructs";
import { Cron } from "sst/constructs";

export function CronStack({ stack }: StackContext) {
  new Cron(stack, "Cron", {
    job: "packages/functions/cron/iceBreakerQuestions.handler",
    // Every first Tuesday of the month at 11:00 UTC
    schedule: "cron(0 11 ? * 3#1 *)",
  });
}
