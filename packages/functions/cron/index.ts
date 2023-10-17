import { sendQueueMessage } from "@/utils/sqs/sendQueueMessage";

export const handler = async () => {
  try {
    const queueUrl = process.env.processTriggerJobQueueUrl;
    if (!queueUrl) {
      throw new Error("No queue url");
    }

    await sendQueueMessage(queueUrl, {});

    return {
      statusCode: 200,
    };
  } catch (error) {
    console.error(`Error handling trigger jobs: ${error as string}`);
    return {
      statusCode: 500,
    };
  }
};
