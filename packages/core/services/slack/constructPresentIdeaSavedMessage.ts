import type { ReplaceMessageArguments } from "@/types/MessageArguments";

export const constructPresentIdeaSavedMessage =
  (): ReplaceMessageArguments => ({
    replace_original: true,
    text: "Thanks for the response! 🙏",
  });
