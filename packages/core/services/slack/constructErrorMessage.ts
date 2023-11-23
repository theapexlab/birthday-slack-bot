import type { PostMessageArguments } from "@/types/MessageArguments";

export const constructErrorMessage = (
  error: unknown,
): Omit<PostMessageArguments, "channel"> => ({
  text: `:warning: Something went wrong: ${formatError(error)}`,
});

const formatError = (error: unknown): string => {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return JSON.stringify(error);
};
