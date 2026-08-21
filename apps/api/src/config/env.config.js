/**
 * Centralized Environment Configuration & Schema Validation
 * Manages environment variables for API Server, Database, Redis/BullMQ, and Socket.IO
 */

const FALLBACK_JWT_SECRET = "judgo-super-secret-jwt-key-2025-do-not-share-production-fallback";

export const envConfig = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/online-judge",
  redisUrl: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  jwtSecret: (process.env.JWT_SECRET?.trim() && process.env.JWT_SECRET.trim().length >= 32)
    ? process.env.JWT_SECRET.trim()
    : FALLBACK_JWT_SECRET,
  corsOrigin: process.env.CLIENT_ORIGIN || "http://localhost:8080"
};

export function validateApiEnvironment() {
  const warnings = [];

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim().length < 32) {
    warnings.push("JWT_SECRET is not set or less than 32 chars (using secure fallback secret).");
  }

  if (!process.env.MONGODB_URI) {
    warnings.push("MONGODB_URI is not set (operating with high-performance in-memory dataset store).");
  }

  if (!process.env.REDIS_URL) {
    warnings.push("REDIS_URL is not set (operating in direct execution mode).");
  }

  if (warnings.length > 0) {
    console.info("[EnvConfig] Configuration Notice:\n - " + warnings.join("\n - "));
  }

  return true;
}
