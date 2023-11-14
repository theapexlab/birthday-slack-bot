import type { APIGatewayProxyHandlerV2 } from "aws-lambda";

import { getUser } from "@/db/queries/getUser";
import { publishEvent } from "@/utils/eventBridge/publishEvent";

export const handler: APIGatewayProxyHandlerV2 = async (request) => {
  try {
    if (!request.queryStringParameters?.userId) {
      throw new Error("No userId");
    }

    const user = await getUser(request.queryStringParameters.userId);

    if (!user) {
      throw new Error("User not found");
    }

    await publishEvent("askPresentAndSquadJoinFromTeam", {
      birthdayPerson: user.id,
      team: user.teamId,
    });

    return {
      statusCode: 200,
      body: "Event sent",
    };
  } catch (error) {
    console.error(`Error sending manual botJoined event: ${error}`);

    return {
      statusCode: 500,
      body: JSON.stringify(
        {
          error,
        },
        null,
        2,
      ),
    };
  }
};
