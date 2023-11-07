import { handler } from "@/functions/cron/daily";

import { mockLambdaEvent } from "./mocks/mockLambdaPayload";

export const callWithMockCronEvent = async (eventId: string) =>
  handler({
    ...mockLambdaEvent,
    queryStringParameters: {
      eventId,
    },
  });
