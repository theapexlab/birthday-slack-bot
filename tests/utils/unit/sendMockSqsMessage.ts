import type { SQSEvent } from "aws-lambda";

import type { Events, EventType } from "@/events";

export const sendMockSqsMessage = async <T extends EventType>(
  type: T,
  body: Events[T],
  handler: (event: SQSEvent) => Promise<void[]>,
) =>
  handler({
    Records: [
      {
        body: JSON.stringify({
          "detail-type": type,
          detail: body,
        }),
        messageId: "",
        receiptHandle: "",
        messageAttributes: {},
        md5OfBody: "",
        eventSource: "",
        eventSourceARN: "",
        awsRegion: "",
        attributes: {
          ApproximateFirstReceiveTimestamp: "",
          ApproximateReceiveCount: "",
          SenderId: "",
          SentTimestamp: "",
        },
      },
    ],
  });
