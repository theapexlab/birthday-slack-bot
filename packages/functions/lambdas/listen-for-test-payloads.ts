import type { APIGatewayProxyHandlerV2 } from "aws-lambda";

import { redis } from "@/services/redis/redisClient";

export const handler: APIGatewayProxyHandlerV2 = async (request) => {
  try {
    if (!request.body) {
      throw new Error("No request body");
    }

    const key = request.queryStringParameters?.testId;

    if (!key) {
      throw new Error("No testId");
    }

    await redis.set(`test:${key}`, request.body, "EX", 60);

    return {
      statusCode: 200,
      body: JSON.stringify({}),
    };
  } catch (error) {
    console.error(`Error handling slack event: ${error}`);
    return {
      statusCode: 500,
      body: JSON.stringify({}),
    };
  }
};
