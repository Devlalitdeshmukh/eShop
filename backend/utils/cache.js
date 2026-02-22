const memoryCache = new Map();

let redisClient;
let redisReady = false;

const now = () => Date.now();

const getFromMemory = (key) => {
  const row = memoryCache.get(key);
  if (!row) return null;
  if (row.expiresAt && row.expiresAt < now()) {
    memoryCache.delete(key);
    return null;
  }
  return row.value;
};

const setToMemory = (key, value, ttlSeconds) => {
  const expiresAt = ttlSeconds ? now() + ttlSeconds * 1000 : null;
  memoryCache.set(key, { value, expiresAt });
};

const initRedis = async () => {
  if (!process.env.REDIS_URL || redisClient || redisReady) return;

  try {
    const redis = await import("redis");
    redisClient = redis.createClient({ url: process.env.REDIS_URL });
    redisClient.on("error", () => {
      redisReady = false;
    });
    await redisClient.connect();
    redisReady = true;
  } catch {
    redisReady = false;
  }
};

export const getCache = async (key) => {
  await initRedis();
  if (redisReady && redisClient) {
    const cached = await redisClient.get(key);
    return cached ? JSON.parse(cached) : null;
  }
  return getFromMemory(key);
};

export const setCache = async (key, value, ttlSeconds = 300) => {
  await initRedis();
  if (redisReady && redisClient) {
    await redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
    return;
  }
  setToMemory(key, value, ttlSeconds);
};

export const delCache = async (keys) => {
  const keyList = Array.isArray(keys) ? keys : [keys];
  await initRedis();
  if (redisReady && redisClient) {
    await redisClient.del(keyList);
  }
  keyList.forEach((k) => memoryCache.delete(k));
};
