import type { SSTConfig } from "sst";

import { ConfigStack } from "./stacks/ConfigStack";
import { CronStack } from "./stacks/CronStack";
import { MyStack } from "./stacks/MyStack";

export default {
  config() {
    return {
      name: "birthday-slack-bot",
      region: "eu-central-1",
    };
  },
  stacks(app) {
    app.stack(ConfigStack).stack(MyStack).stack(CronStack);
  },
} satisfies SSTConfig;
