import type { APIGatewayProxyHandlerV2 } from "aws-lambda";

import { constructLoadingMessage } from "@/services/slack/constructLoadingMessage";
import { sendResponse } from "@/services/slack/sendResponse";
import {
  additionalPresentIdeasInputActionId,
  additionalPresentIdeasInputBlockId,
  additionalPresentIdeasSaveButtonActionId,
  birthdayConfirmActionId,
  birthdayIncorrectActionId,
  pickBirthdayActionId,
  presentIdeasInputActionId,
  presentIdeasInputBlockId,
  presentIdeasSaveButtonActionId,
  SlackInteractionRequestSchema,
  squadJoinCheckboxActionId,
  squadJoinCheckboxBlockId,
} from "@/types/SlackInteractionRequest";
import { publishEvent } from "@/utils/eventBridge/publishEvent";
import { parseRequest } from "@/utils/lambda/parseRequest";
import { errorResult, okResult } from "@/utils/lambda/result";

export const handler: APIGatewayProxyHandlerV2 = async (request) => {
  try {
    const payload = parseRequest(request);

    const parsedData = SlackInteractionRequestSchema.parse(payload);

    switch (parsedData.actions[0].action_id) {
      case pickBirthdayActionId:
        await publishEvent("birthdayFilled", {
          birthday: parsedData.actions[0].selected_date,
          responseUrl: parsedData.response_url,
        });
        break;
      case birthdayConfirmActionId:
        await publishEvent("birthdayConfirmed", {
          user: parsedData.user.id,
          team: parsedData.user.team_id,
          birthday: parsedData.actions[0].value,
          responseUrl: parsedData.response_url,
        });
        break;
      case birthdayIncorrectActionId:
        await publishEvent("askBirthday", {
          user: parsedData.user.id,
          responseUrl: parsedData.response_url,
        });
        break;
      case presentIdeasSaveButtonActionId: {
        const presentIdea =
          parsedData.state?.values?.[presentIdeasInputBlockId]?.[
            presentIdeasInputActionId
          ]?.value;

        if (!presentIdea) {
          throw new Error("Present idea is empty");
        }
        await publishEvent("savePresentIdea", {
          birthdayPerson: parsedData.actions[0].value,
          user: parsedData.user.id,
          team: parsedData.user.team_id,
          presentIdea,
          responseUrl: parsedData.response_url,
        });
        break;
      }
      case additionalPresentIdeasSaveButtonActionId: {
        const presentIdea =
          parsedData.state?.values?.[additionalPresentIdeasInputBlockId]?.[
            additionalPresentIdeasInputActionId
          ]?.value;
        const squadJoin =
          !!parsedData.state?.values?.[squadJoinCheckboxBlockId]?.[
            squadJoinCheckboxActionId
          ]?.selected_options?.length;

        if (!presentIdea) {
          throw new Error("Additional Present idea is empty");
        }
        if (squadJoin) {
          await publishEvent("saveSquadJoin", {
            birthdayPerson: parsedData.actions[0].value,
            user: parsedData.user.id,
            team: parsedData.user.team_id,
          });
        }
        await publishEvent("savePresentIdea", {
          birthdayPerson: parsedData.actions[0].value,
          user: parsedData.user.id,
          team: parsedData.user.team_id,
          presentIdea,
          responseUrl: parsedData.response_url,
        });
        break;
      }
      default:
        return okResult();
    }

    await sendResponse(parsedData.response_url, constructLoadingMessage());

    return okResult();
  } catch (error) {
    console.error(`Error handling slack interaction: ${error}`);

    return errorResult(error);
  }
};
