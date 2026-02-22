import app from "./app.js";
import { env } from "./config/env.js";
import { getRedisClient } from "./config/redis.js";

app.listen(env.PORT, async () => {
  await getRedisClient();
  console.log(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
});
