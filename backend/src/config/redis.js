import { env } from "./env.js";

let redisClient = null;

export const getRedisClient = async () => {
  if (!env.REDIS_ENABLED || !env.REDIS_URL) {
    return null;
  }

  if (redisClient) {
    return redisClient;
  }

  try {
    const redis = await import("redis");
    redisClient = redis.createClient({ url: env.REDIS_URL });
    redisClient.on("error", (error) => {
      console.warn("Redis error:", error.message);
    });
    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.warn("Redis unavailable:", error.message);
    redisClient = null;
    return null;
  }
};

export const closeRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
};
