import type { ReplaceMessageArguments } from "@/types/MessageArguments";

export const constructBirthdayConfirmedMessage =
  (): ReplaceMessageArguments => ({
    text: "Thanks for submitting your birthday! 🎉",
  });
