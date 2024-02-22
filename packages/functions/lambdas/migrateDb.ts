import { migrate } from "@/db/index";
import { errorResult, okResult } from "@/utils/lambda/result";

export const handler = async () => {
  try {
    console.log("🦄Migrating db...");

    await migrate();

    console.log("Migration complete!");

    return okResult();
  } catch (error) {
    console.error(`Error migrating db: ${error}`);

    return errorResult(error);
  }
};
