import { executeSql } from "@/db/queries/dbOperations";
import { errorResult, okResult } from "@/utils/lambda/result";

export const handler = async (event: { sql: string }) => {
  try {
    // Extract tableName from the event object
    const { sql } = event;

    if (!sql) {
      throw new Error("sql parameter is required");
    }

    const result = await executeSql(sql);

    return okResult(result);
  } catch (error) {
    console.error(`Error executing command: ${error}`);

    return errorResult(error);
  }
};
