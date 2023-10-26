import { handler } from "@/functions/lambdas/slack-event";
import type { SlackCallbackRequest } from "@/types/SlackEventRequest";

export const callWithMockSlackEvent = async (body: SlackCallbackRequest) =>
  handler(
    {
      body: JSON.stringify(body),
      headers: {},
      isBase64Encoded: false,
      rawPath: "",
      rawQueryString: "",
      requestContext: {
        accountId: "",
        apiId: "",
        domainName: "",
        domainPrefix: "",
        http: {
          method: "",
          path: "",
          protocol: "",
          sourceIp: "",
          userAgent: "",
        },
        requestId: "",
        routeKey: "",
        stage: "",
        time: "",
        timeEpoch: 0,
      },
      routeKey: "",
      version: "",
    },
    {
      awsRequestId: "",
      callbackWaitsForEmptyEventLoop: false,
      functionName: "",
      functionVersion: "",
      invokedFunctionArn: "",
      logGroupName: "",
      logStreamName: "",
      memoryLimitInMB: "",
      getRemainingTimeInMillis: () => 0,
      done: () => {},
      fail: () => {},
      succeed: () => {},
    },
    () => {},
  );
