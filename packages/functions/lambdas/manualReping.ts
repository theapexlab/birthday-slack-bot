import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { sendReminderWhoseBirthdayIsMissing } from "cron/daily";

import { errorResult, okResult } from "@/utils/lambda/result";

export const handler: APIGatewayProxyHandlerV2 = async () => {
  try {
    await sendReminderWhoseBirthdayIsMissing();

    return okResult("Ping sent");
  } catch (error) {
    console.error(`Error sending manual ping event: ${error}`);

    return errorResult(error);
  }
};
