import type { SSTConfig } from "sst";

import { MyStack } from "./stacks/MyStack";

export default {
  config() {
    return {
      name: "birthday-slack-bot",
      region: "eu-central-1",
    };
  },
  stacks(app) {
    app.stack(MyStack);
  },
} satisfies SSTConfig;
