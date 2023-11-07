import type { ReplaceMessageArguments } from "@/types/MessageArguments";

export const constructBirthdayConfirmedMessage =
  (): ReplaceMessageArguments => ({
    replace_original: true,
    text: "Thanks for submitting your birthday! 🎉",
  });
