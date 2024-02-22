// import { PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
// import type { StackContext } from "sst/constructs";
// import { Cron } from "sst/constructs";

// import { getCronDetailType } from "@/utils/cron/getCronDetailType";

// import { getFunctionProps } from "./utils/getFunctionProps";
// import { isStageTestable } from "./utils/isStageTestable";

export function CronStack() {
  // const functionProps = getFunctionProps();

  // const isTestable = isStageTestable(stack);

  // new Cron(stack, "IceBreakerCron", {
  //   job: {
  //     function: {
  //       handler: "packages/functions/cron/iceBreakerQuestions.handler",
  //       ...functionProps,
  //     },
  //   },
  //   cdk: isTestable
  //     ? {
  //         rule: {
  //           eventPattern: {
  //             detailType: [getCronDetailType("iceBreaker", stack.stage)],
  //           },
  //         },
  //       }
  //     : undefined,
  //   // Every first Tuesday of the month at 11:00 UTC
  //   schedule: "cron(0 11 ? * 3#1 *)",
  // });

  // const schedulerRole = new Role(stack, "SchedulerRole", {
  //   assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
  // });

  // schedulerRole.addToPolicy(
  //   new PolicyStatement({
  //     actions: ["scheduler:CreateSchedule", "iam:PassRole"],
  //     resources: ["*"],
  //   }),
  // );

  // new Cron(stack, "DailyCron", {
  //   job: {
  //     function: {
  //       handler: "packages/functions/cron/daily.handler",
  //       ...functionProps,
  //       role: schedulerRole,
  //     },
  //   },
  //   cdk: isTestable
  //     ? {
  //         rule: {
  //           eventPattern: {
  //             detailType: [getCronDetailType("daily", stack.stage)],
  //           },
  //         },
  //       }
  //     : undefined,
  //   // Every day at 11:00 UTC
  //   schedule: "cron(0 11 ? * * *)",
  // });
}
