import { handler } from "@/functions/lambdas/slack-event";
import type { SlackCallbackRequest } from "@/types/SlackEventRequest";

import { mockLambdaContext, mockLambdaEvent } from "./mocks/mockLambdaPayload";

export const callWithMockSlackEvent = async (body: SlackCallbackRequest) =>
  handler(
    {
      ...mockLambdaEvent,
      body: JSON.stringify(body),
    },
    mockLambdaContext,
    () => {},
  );
