import type { APIGatewayProxyHandlerV2 } from "aws-lambda";

import type { EventPayload, EventType } from "@/events";
import { constructLoadingMessage } from "@/services/slack/constructLoadingMessage";
import { sendResponse } from "@/services/slack/sendResponse";
import type { SlackInteractionRequest } from "@/types/SlackInteractionRequest";
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

const getEventPayload = (
  request: SlackInteractionRequest,
): EventPayload<EventType> | EventPayload<EventType>[] | null => {
  switch (request.actions[0].action_id) {
    case pickBirthdayActionId:
      return {
        type: "birthdayFilled",
        payload: {
          birthday: request.actions[0].selected_date,
          responseUrl: request.response_url,
        },
      };
    case birthdayConfirmActionId:
      return {
        type: "birthdayConfirmed",
        payload: {
          user: request.user.id,
          team: request.user.team_id,
          birthday: request.actions[0].value,
          responseUrl: request.response_url,
        },
      };
    case birthdayIncorrectActionId:
      return {
        type: "askBirthday",
        payload: {
          user: request.user.id,
          responseUrl: request.response_url,
        },
      };
    case presentIdeasSaveButtonActionId: {
      const presentIdea =
        request.state?.values?.[presentIdeasInputBlockId]?.[
          presentIdeasInputActionId
        ]?.value;

      if (!presentIdea) {
        throw new Error("Present idea is empty");
      }

      return {
        type: "savePresentIdea",
        payload: {
          birthdayPerson: request.actions[0].value,
          user: request.user.id,
          team: request.user.team_id,
          presentIdea,
          responseUrl: request.response_url,
        },
      };
    }
    case additionalPresentIdeasSaveButtonActionId: {
      const presentIdea =
        request.state?.values?.[additionalPresentIdeasInputBlockId]?.[
          additionalPresentIdeasInputActionId
        ]?.value;
      const squadJoin =
        !!request.state?.values?.[squadJoinCheckboxBlockId]?.[
          squadJoinCheckboxActionId
        ]?.selected_options?.length;

      if (!presentIdea) {
        throw new Error("Additional Present idea is empty");
      }

      const events: EventPayload<EventType>[] = [
        {
          type: "savePresentIdea",
          payload: {
            birthdayPerson: request.actions[0].value,
            user: request.user.id,
            team: request.user.team_id,
            presentIdea,
            responseUrl: request.response_url,
          },
        },
      ];

      if (squadJoin) {
        events.push({
          type: "saveSquadJoin",
          payload: {
            birthdayPerson: request.actions[0].value,
            user: request.user.id,
            team: request.user.team_id,
          },
        });
      }

      return events;
    }
    default:
      return null;
  }
};

export const handler: APIGatewayProxyHandlerV2 = async (request) => {
  try {
    const payload = parseRequest(request);

    const parsedData = SlackInteractionRequestSchema.parse(payload);

    const event = getEventPayload(parsedData);

    if (!event) {
      return okResult();
    }

    await sendResponse(parsedData.response_url, constructLoadingMessage());

    if (Array.isArray(event)) {
      await Promise.all(event.map((e) => publishEvent(e.type, e.payload)));
    } else {
      await publishEvent(event.type, event.payload);
    }

    return okResult();
  } catch (error) {
    console.error(`Error handling slack interaction: ${error}`);

    return errorResult(error);
  }
};
