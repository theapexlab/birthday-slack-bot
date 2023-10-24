import { handler } from "@/functions/lambdas/slack-callback";
import type { SlackCallbackRequest } from "@/types/SlackEventRequest";

export const sendMockSlackEvent = async (body: SlackCallbackRequest) =>
  fetch(`${import.meta.env.VITE_API_URL}/slack/callback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then((res) => res.json())
    .catch((error) => console.error(error.stack));

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
