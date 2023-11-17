import type { APIGatewayProxyHandlerV2 } from "aws-lambda";

import { getUser } from "@/db/queries/getUser";
import { publishEvent } from "@/utils/eventBridge/publishEvent";
import { errorResult, okResult } from "@/utils/lambda/result";

export const handler: APIGatewayProxyHandlerV2 = async (request) => {
  try {
    if (!request.queryStringParameters?.userId) {
      throw new Error("No userId");
    }

    const user = await getUser(request.queryStringParameters.userId);

    if (!user) {
      throw new Error("User not found");
    }

    await publishEvent("birthdayCleanup", {
      birthdayPerson: user.id,
      team: user.teamId,
    });

    return okResult("Event sent");
  } catch (error) {
    console.error(`Error sending manual birthday cleanup event: ${error}`);

    return errorResult(error);
  }
};
