import type { ChatReplaceMessageArguments } from "@/types/ChatReplaceMessageArguments";

import { makeTextBlock } from "./messageItems";

export const constructBirthdayConfirmedMessage =
  (): ChatReplaceMessageArguments => ({
    replace_original: true,
    text: "Thanks for submitting your birthday! 🎉",
    blocks: [makeTextBlock(`Thanks for submitting your birthday! 🎉`)],
  });
