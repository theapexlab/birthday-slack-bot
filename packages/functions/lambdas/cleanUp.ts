import { cleanUp } from "@/db/queries/cleanUp";
import { errorResult, okResult } from "@/utils/lambda/result";

export const handler = async (event: { tableName: string }) => {
  console.log("🚀 ~ handler ~ event:", event);

  try {
    // Extract tableName from the event object
    const { tableName } = event;

    if (!tableName) {
      throw new Error("tableName parameter is required");
    }

    console.log("Cleaning up db...");

    const result = await cleanUp(tableName);
    console.log("🚀 ~ handler ~ result:", result);

    console.log("Clean up complete!");

    return okResult(result);
  } catch (error) {
    console.error(`Error migrating db: ${error}`);

    return errorResult(error);
  }
};
