import type { StackContext } from "sst/constructs";
import { Cron, use } from "sst/constructs";

import { ConfigStack } from "./ConfigStack";

export function CronStack({ stack }: StackContext) {
  const secrets = use(ConfigStack);

  const environment = {
    DB_URL: process.env.DB_URL || "",
  };

  const icebreakerCron = new Cron(stack, "Cron", {
    job: {
      function: {
        environment,
        handler: "packages/functions/cron/iceBreakerQuestions.handler",
      },
    },
    // Every first Tuesday of the month at 11:00 UTC
    schedule: "cron(0 11 ? * 3#1 *)",
  });

  icebreakerCron.bind(secrets);

  const dailyCron = new Cron(stack, "DailyCron", {
    job: {
      function: {
        environment,
        handler: "packages/functions/cron/daily.handler",
      },
    },
    // Every day at 11:00 UTC
    schedule: "cron(0 11 ? * * *)",
  });

  dailyCron.bind(secrets);
}
