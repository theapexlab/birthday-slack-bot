import { cleanUp } from "@/db/queries/cleanUp";
import { errorResult } from "@/utils/lambda/result";

export const handler = async () => {
  try {
    console.log("Cleaning up db...");

    const result = await cleanUp();

    console.log("Clean up complete!");

    return result;
  } catch (error) {
    console.error(`Error migrating db: ${error}`);

    return errorResult(error);
  }
};
