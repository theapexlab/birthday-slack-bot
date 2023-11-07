import type { ChatReplaceMessageArguments } from "@/types/ChatReplaceMessageArguments";

export const constructPresentIdeaSavedMessage =
  (): ChatReplaceMessageArguments => ({
    replace_original: true,
    text: "Thanks for the idea! 🙏",
  });
