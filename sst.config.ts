import type { SSTConfig } from "sst";

import { ConfigStack } from "./stacks/ConfigStack";
// import { CronStack } from "./stacks/CronStack";
import { EventBusStack } from "./stacks/EventBusStack";
import { MyStack } from "./stacks/MyStack";
import { SchedulerStack } from "./stacks/SchedulerStack";
import { StorageStack } from "./stacks/StorageStack";

export default {
  config() {
    return {
      name: "birthday-slack-bot",
      region: "eu-central-1",
    };
  },
  stacks(app) {
    app
      .stack(ConfigStack)
      .stack(StorageStack)
      .stack(EventBusStack)
      .stack(SchedulerStack)
      .stack(MyStack)
      // .stack(CronStack);
  },
} satisfies SSTConfig;
