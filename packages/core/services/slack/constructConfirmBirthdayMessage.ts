import type { ChatReplaceMessageArguments } from "@/types/ChatReplaceMessageArguments";
import {
  birthdayConfirmActionId,
  birthdayIncorrectActionId,
} from "@/types/SlackInteractionRequest";

import { makeActionsBlock, makeTextBlock } from "./messageItems";

export const constructConfirmBirthdayMessage = (
  birthday: string,
): ChatReplaceMessageArguments =>
  ({
    replace_original: true,
    text: "Confirm your birthday",
    blocks: [
      makeTextBlock(`Are you sure your birthday is ${birthday}?`),
      makeActionsBlock(
        birthdayConfirmActionId,
        birthdayIncorrectActionId,
        birthday,
        "",
      ),
    ],
  }) satisfies ChatReplaceMessageArguments;
