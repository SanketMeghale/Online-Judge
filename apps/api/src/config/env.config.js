/**
 * Centralized Environment Configuration & Schema Validation
 * Manages environment variables for API Server, Database, Redis/BullMQ, and Socket.IO
 */

export const envConfig = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/online-judge",
  redisUrl: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  jwtSecret: process.env.JWT_SECRET || "",
  corsOrigin: process.env.CLIENT_ORIGIN || "http://localhost:8080"
};

export function validateApiEnvironment() {
  const errors = [];
  if (!envConfig.jwtSecret || envConfig.jwtSecret.length < 32) {
    errors.push("JWT_SECRET must contain at least 32 characters");
  }

  const isProduction = envConfig.nodeEnv === "production" || Boolean(process.env.VERCEL_ENV);
  if (isProduction) {
    if (!process.env.MONGODB_URI) errors.push("MONGODB_URI is required in production");
    if (!/^rediss?:\/\//.test(process.env.REDIS_URL || "")) errors.push("A valid REDIS_URL is required in production");
    if (!process.env.CLIENT_ORIGIN) errors.push("CLIENT_ORIGIN is required in production");
    if (!process.env.REALTIME_JWT_SECRET || process.env.REALTIME_JWT_SECRET.trim().length < 32) {
      errors.push("REALTIME_JWT_SECRET must contain at least 32 characters in production");
    }
    if (process.env.ENABLE_DEMO_USERS === "true") errors.push("ENABLE_DEMO_USERS cannot be enabled in production");
  }

  if (errors.length > 0) {
    throw new Error(`Invalid API configuration: ${errors.join("; ")}`);
  }
}
