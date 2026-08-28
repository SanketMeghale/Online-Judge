import path from "path";
import { validateWorkerEnvironment } from "../src/config/env.config.js";

const validProduction = {
  NODE_ENV: "production",
  MONGODB_URI: "mongodb+srv://user:password@example.mongodb.net/judgo",
  REDIS_URL: "rediss://default:password@example.redis.cloud:6379",
  EXECUTION_SERVICE_TOKEN: "x".repeat(32),
  SANDBOX_IMAGE: "registry.example/judgo-sandbox:2026-08-21",
  JUDGE_TEMP_ROOT: path.resolve("/var/lib/judgo/jobs")
};

describe("worker production environment validation", () => {
  test("fails closed when required infrastructure is missing", () => {
    expect(() => validateWorkerEnvironment({ NODE_ENV: "production" })).toThrow("Invalid worker configuration");
  });

  test("accepts a complete TLS-backed production configuration", () => {
    expect(validateWorkerEnvironment(validProduction)).toEqual({ production: true });
  });

  test("allows plaintext Redis only when explicitly placed on a trusted private network", () => {
    expect(() => validateWorkerEnvironment({ ...validProduction, REDIS_URL: "redis://redis:6379" })).toThrow("must use TLS");
    expect(validateWorkerEnvironment({
      ...validProduction,
      REDIS_URL: "redis://redis:6379",
      ALLOW_INSECURE_REDIS: "true"
    })).toEqual({ production: true });
  });

  test("accepts Redis Cloud .db.redis.io URI even with redis:// scheme", () => {
    expect(validateWorkerEnvironment({
      ...validProduction,
      REDIS_URL: "redis://default:X53oSGrcpzJ6YPU5WEd085EcHHkF6AG3@ants-velvet-satin-43185.db.redis.io:15879"
    })).toEqual({ production: true });
  });
});
