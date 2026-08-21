import assert from "node:assert/strict";
import { test } from "node:test";
import { validateApiEnvironment } from "../src/config/env.config.js";
import { User } from "../src/models/User.js";

const validProduction = {
  NODE_ENV: "production",
  MONGODB_URI: "mongodb+srv://user:password@example.mongodb.net/judgo",
  REDIS_URL: "rediss://default:password@example.redis.cloud:6379",
  JWT_SECRET: "a".repeat(32),
  REALTIME_JWT_SECRET: "b".repeat(32),
  REALTIME_INTERNAL_SECRET: "c".repeat(32),
  CLIENT_ORIGIN: "https://judgo.example"
};

test("production API configuration fails closed when secrets and services are missing", () => {
  assert.throws(() => validateApiEnvironment({ NODE_ENV: "production" }), /Invalid production configuration/);
});

test("production API configuration accepts TLS-backed dependencies", () => {
  assert.deepEqual(validateApiEnvironment(validProduction), { production: true, warnings: [] });
});

test("production API rejects plaintext Redis unless explicitly private", () => {
  assert.throws(
    () => validateApiEnvironment({ ...validProduction, REDIS_URL: "redis://redis.internal:6379" }),
    /must use rediss:\/\//
  );
});

test("user text index does not use the profile language field as MongoDB language override", () => {
  const textIndex = User.schema.indexes().find(([fields]) => fields.name === "text");
  assert.ok(textIndex);
  assert.equal(textIndex[1].language_override, "searchLanguage");
});
