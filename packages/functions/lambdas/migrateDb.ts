import type { APIGatewayProxyHandlerV2 } from "aws-lambda";

import { migrate } from "@/db/index";

export const handler: APIGatewayProxyHandlerV2 = async () => {
  try {
    console.log("Migrating db...");

    await migrate();

    console.log("Migration complete!");

    return {
      statusCode: 200,
      body: JSON.stringify({}),
    };
  } catch (error) {
    console.error(`Error migrating db: ${error}`);
    return {
      statusCode: 500,
      body: JSON.stringify({}),
    };
  }
};
