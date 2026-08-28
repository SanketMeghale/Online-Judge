/**
 * Centralized environment validation for both the local API server and Vercel.
 * Development may use localhost defaults. Production always fails closed.
 */

const DEVELOPMENT_JWT_SECRET = "judgo-development-only-jwt-secret-change-before-production";

export function isProductionEnvironment(environment = process.env) {
  return environment.NODE_ENV === "production" || Boolean(environment.VERCEL_ENV);
}

export function cleanRedisUri(value = "") {
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

function validMongoUri(value = "") {
  return /^mongodb(?:\+srv)?:\/\//.test(String(value).trim());
}

function validRedisUri(value = "") {
  const cleaned = cleanRedisUri(value);
  return /^rediss?:\/\//.test(cleaned);
}

function validSecret(value = "") {
  return String(value).trim().length >= 32;
}

export const envConfig = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/online-judge",
  redisUrl: cleanRedisUri(process.env.REDIS_URL) || "redis://127.0.0.1:6379",
  jwtSecret: validSecret(process.env.JWT_SECRET)
    ? process.env.JWT_SECRET.trim()
    : DEVELOPMENT_JWT_SECRET,
  corsOrigin: process.env.CLIENT_ORIGIN || "http://localhost:8080"
};

export function validateApiEnvironment(environment = process.env) {
  const production = isProductionEnvironment(environment);
  const errors = [];
  const warnings = [];

  if (production) {
    if (!validMongoUri(environment.MONGODB_URI)) errors.push("MONGODB_URI must be a valid MongoDB connection URI");
    const rawRedis = environment.REDIS_URL;
    const redisUrl = cleanRedisUri(rawRedis);
    if (!rawRedis || !rawRedis.trim()) {
      errors.push("REDIS_URL is not set. Ensure REDIS_URL is added to Production in Vercel Environment Variables.");
    } else if (!validRedisUri(redisUrl)) {
      errors.push(`REDIS_URL must be a valid Redis connection URI starting with redis:// or rediss:// (received: "${String(rawRedis).slice(0, 30)}")`);
    } else if (redisUrl.startsWith("redis://") && environment.ALLOW_INSECURE_REDIS !== "true") {
      if (redisUrl.includes(".db.redis.io")) {
        warnings.push("REDIS_URL uses Redis Cloud standard port. rediss:// TLS is not required.");
      } else {
        errors.push("REDIS_URL must use rediss:// in production unless ALLOW_INSECURE_REDIS=true for a private network");
      }
    }
    if (!validSecret(environment.JWT_SECRET)) errors.push("JWT_SECRET must contain at least 32 characters");
    if (!validSecret(environment.REALTIME_JWT_SECRET)) errors.push("REALTIME_JWT_SECRET must contain at least 32 characters");
    if (!validSecret(environment.REALTIME_INTERNAL_SECRET)) errors.push("REALTIME_INTERNAL_SECRET must contain at least 32 characters");
    if (!environment.CLIENT_ORIGIN) errors.push("CLIENT_ORIGIN is required");
    if (
      environment.CLIENT_ORIGIN &&
      !String(environment.CLIENT_ORIGIN).startsWith("https://") &&
      environment.ALLOW_INSECURE_ORIGIN !== "true"
    ) {
      errors.push("CLIENT_ORIGIN must use https:// in production");
    }
    if (environment.ENABLE_DEMO_USERS === "true") errors.push("ENABLE_DEMO_USERS cannot be enabled in production");
  } else {
    if (!validSecret(environment.JWT_SECRET)) warnings.push("JWT_SECRET is not set or less than 32 characters; using a development-only secret");
    if (!environment.MONGODB_URI) warnings.push("MONGODB_URI is not set; using local MongoDB at mongodb://127.0.0.1:27017/online-judge");
    if (!environment.REDIS_URL) warnings.push("REDIS_URL is not set; using local Redis at redis://127.0.0.1:6379 (execution remains queue-only)");
  }

  if (errors.length) throw new Error(`Invalid production configuration: ${errors.join("; ")}`);
  if (warnings.length) console.info(`[EnvConfig] Configuration notice:\n - ${warnings.join("\n - ")}`);

  return { production, warnings };
}
