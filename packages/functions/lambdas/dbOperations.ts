import { executeSql } from "@/db/queries/dbOperations";
import { errorResult, okResult } from "@/utils/lambda/result";

export const handler = async (event: { sql: string }) => {
  console.log("🚀 ~ handler ~ event:", event);

  try {
    // Extract tableName from the event object
    const { sql } = event;

    if (!sql) {
      throw new Error("sql parameter is required");
    }

    console.log("Cleaning up db...");

    const result = await executeSql(sql);
    console.log("🚀 ~ handler ~ result:", result);

    console.log("Clean up complete!");

    return okResult(result);
  } catch (error) {
    console.error(`Error migrating db: ${error}`);

    return errorResult(error);
  }
};
