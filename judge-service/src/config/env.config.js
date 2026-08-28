import path from "path";

function cleanRedisUri(value = "") {
  let str = String(value || "").trim();
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    str = str.slice(1, -1).trim();
  }
  if (str.startsWith("redis-cli")) {
    const match = str.match(/rediss?:\/\/[^\s"']+/);
    if (match) str = match[0];
  }
  return str;
}

const isValidSecret = (value) => typeof value === "string" && value.length >= 32;
const isValidMongoUri = (value) => /^mongodb(?:\+srv)?:\/\//.test(String(value || "").trim());
const isValidRedisUri = (value) => /^rediss?:\/\//.test(cleanRedisUri(value));

export function validateWorkerEnvironment(env = process.env) {
  const production = env.NODE_ENV === "production";
  if (!production) return { production: false };

  const errors = [];
  if (!isValidMongoUri(env.MONGODB_URI)) errors.push("MONGODB_URI must be a valid MongoDB URI");
  
  const rawRedis = env.REDIS_URL;
  const redisUrl = cleanRedisUri(rawRedis);
  env.REDIS_URL = redisUrl;

  if (!rawRedis || !rawRedis.trim()) {
    errors.push("REDIS_URL is not set. Please set REDIS_URL in .env.worker");
  } else if (!isValidRedisUri(redisUrl)) {
    errors.push(`REDIS_URL must be a valid Redis URI starting with redis:// or rediss:// (received: "${String(rawRedis).slice(0, 30)}")`);
  } else if (!redisUrl.startsWith("rediss://") && env.ALLOW_INSECURE_REDIS !== "true") {
    if (redisUrl.includes(".db.redis.io")) {
      // Redis Cloud standard port is allowed
    } else {
      errors.push("REDIS_URL must use TLS (rediss://), or ALLOW_INSECURE_REDIS=true on a trusted private network");
    }
  }
  if (!isValidSecret(env.EXECUTION_SERVICE_TOKEN)) errors.push("EXECUTION_SERVICE_TOKEN must be at least 32 characters");
  if (env.REALTIME_SERVICE_URL && !isValidSecret(env.REALTIME_INTERNAL_SECRET)) {
    errors.push("REALTIME_INTERNAL_SECRET must be at least 32 characters when REALTIME_SERVICE_URL is configured");
  }
  if (!env.SANDBOX_IMAGE) errors.push("SANDBOX_IMAGE is required");
  if (!env.JUDGE_TEMP_ROOT || !path.isAbsolute(env.JUDGE_TEMP_ROOT)) {
    errors.push("JUDGE_TEMP_ROOT must be an absolute path shared by the worker and host Docker daemon");
  }

  if (errors.length > 0) throw new Error(`Invalid worker configuration: ${errors.join("; ")}`);
  return { production: true };
}
