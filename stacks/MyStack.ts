import type { StackContext } from "sst/constructs";
import { Api } from "sst/constructs";

export function MyStack({ stack }: StackContext): void {
  const api = new Api(stack, "api", {
    defaults: {
      function: {},
    },
    routes: {
      "GET /healthcheck": "packages/functions/lambdas/healthcheck.handler",
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
