export const mockLambdaEvent = {
  body: "",
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
};

export const mockLambdaContext = {
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
};

export const mockLambdaScheduledEvent = {
  "detail-type": "Scheduled Event" as const,
  id: "event-id",
  version: "0",
  account: "123456789012", // Example AWS account ID
  region: "us-west-2", // Example AWS region
  source: "aws.events",
  time: new Date().toISOString(), // Current time in ISO format
  resources: [
    "arn:aws:events:us-west-2:123456789012:rule/your-scheduled-rule", // Example ARN of the rule that triggered the event
  ],
};

export const mockLambdaScheduledCallBack = () => {};
