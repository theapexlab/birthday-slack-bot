import { SendMessageCommand } from "@aws-sdk/client-sqs";

import { sqsClient } from "./sqsClient";

export const sendQueueMessage = async (queueUrl: string, body: object) => {
  const message = new SendMessageCommand({
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify(body),
  });

  await sqsClient.send(message);
};
