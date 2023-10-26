import Redis from "ioredis";

const url = process.env.REDIS_URL as string;

export const redis = new Redis(url);
