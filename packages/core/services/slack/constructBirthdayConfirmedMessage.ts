import type { ChatReplaceMessageArguments } from "@/types/ChatReplaceMessageArguments";

export const constructBirthdayConfirmedMessage =
  (): ChatReplaceMessageArguments => ({
    replace_original: true,
    text: "Thanks for submitting your birthday! 🎉",
  });
