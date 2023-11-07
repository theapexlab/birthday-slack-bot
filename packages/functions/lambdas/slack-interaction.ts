import type { APIGatewayProxyHandlerV2 } from "aws-lambda";

import { SlackInteractionRequestSchema } from "@/types/SlackInteractionRequest";
import { publishEvent } from "@/utils/eventBridge/publishEvent";
import { parseRequest } from "@/utils/lambda/parseRequest";

export const handler: APIGatewayProxyHandlerV2 = async (request) => {
  try {
    const payload = parseRequest(request);

    const parsedData = SlackInteractionRequestSchema.parse(payload);

    switch (parsedData.actions[0].action_id) {
      case "pickBirthday":
        await publishEvent("birthdayFilled", {
          birthday: parsedData.actions[0].selected_date,
          responseUrl: parsedData.response_url,
        });
        break;
      case "birthdayConfirm":
        await publishEvent("birthdayConfirmed", {
          user: parsedData.user.id,
          team: parsedData.user.team_id,
          birthday: parsedData.actions[0].value,
          responseUrl: parsedData.response_url,
        });
        break;
      case "birthdayIncorrect":
        await publishEvent("askBirthday", {
          user: parsedData.user.id,
          responseUrl: parsedData.response_url,
        });
        break;
      case "presentIdeasSaveButton":
        console.log(
          parsedData.state!.values.presentIdeasInput.presentIdeas.value,
        );
        await publishEvent("savePresentIdea", {
          birthdayPerson: parsedData.actions[0].value,
          user: parsedData.user.id,
          team: parsedData.user.team_id,
          presentIdea:
            parsedData.state!.values.presentIdeasInput.presentIdeas.value,
          responseUrl: parsedData.response_url,
        });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({}),
    };
  } catch (error) {
    console.error(`Error handling slack interaction: ${error}`);
    return {
      statusCode: 500,
      body: JSON.stringify({}),
    };
  }
};
