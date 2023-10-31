import type { APIGatewayProxyEventV2 } from "aws-lambda";

export const parseRequest = (event: APIGatewayProxyEventV2) => {
  if (!event.body) {
    throw new Error("No request body");
  }

  if (!event.isBase64Encoded) {
    return JSON.parse(event.body);
  }

  const rawData = Buffer.from(event.body, "base64").toString("utf-8");

  const parsedData = rawData
    .split("&")
    .reduce((acc: { [key: string]: string }, keyValue: string) => {
      const [key, value] = keyValue.split("=");
      acc[decodeURIComponent(key)] = decodeURIComponent(value);
      return acc;
    }, {});

  return JSON.parse(parsedData.payload);
};
