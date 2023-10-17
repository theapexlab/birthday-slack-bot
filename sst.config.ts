import type { SSTConfig } from "sst";

import { ConfigStack } from "./stacks/ConfigStack";
import { MyStack } from "./stacks/MyStack";

export default {
  config() {
    return {
      name: "birthday-slack-bot",
      region: "eu-central-1",
    };
  },
  stacks(app) {
    app.stack(ConfigStack).stack(MyStack);
  },
} satisfies SSTConfig;
