import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";

const SALT_ROUNDS = 12;

const FALLBACK_JWT_SECRET = "judgo-super-secret-jwt-key-2025-do-not-share-production-fallback";
const FALLBACK_REALTIME_JWT_SECRET = "judgo-super-secret-realtime-jwt-key-2025-do-not-share-fallback";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET?.trim();
  if (secret && secret.length >= 32) {
    return secret;
  }
  return FALLBACK_JWT_SECRET;
}

function getRealtimeJwtSecret() {
  const secret = process.env.REALTIME_JWT_SECRET?.trim();
  if (secret && secret.length >= 32) return secret;
  const mainSecret = process.env.JWT_SECRET?.trim();
  if (mainSecret && mainSecret.length >= 32) return mainSecret;
  return FALLBACK_REALTIME_JWT_SECRET;
}

export function signToken(payload, expiresIn = "24h") {
  return jwt.sign(payload, getJwtSecret(), { expiresIn, algorithm: "HS256" });
}

export function signRealtimeToken(userId) {
  return jwt.sign({ userId: String(userId), purpose: "realtime" }, getRealtimeJwtSecret(), {
    expiresIn: "5m",
    algorithm: "HS256"
  });
}

export function verifyToken(token) {
  if (!token || typeof token !== "string") {
    return null;
  }

  try {
    return jwt.verify(token, getJwtSecret(), { algorithms: ["HS256"] });
  } catch {
    return null;
  }
}

export async function hashPassword(password) {
  if (!password) return "";
  return bcrypt.hash(password, SALT_ROUNDS);
}

export function hashPasswordSync(password) {
  if (!password) return "";
  return bcrypt.hashSync(password, SALT_ROUNDS);
}

export async function verifyPassword(password, hash) {
  if (!password || !hash) return false;
  // Backward compatibility: If hash is 64-char hex string (plain SHA256)
  if (hash.length === 64 && /^[a-f0-9]+$/i.test(hash)) {
    const legacyHash = crypto.createHash("sha256").update(password).digest("hex");
    return legacyHash === hash;
  }
  try {
    return await bcrypt.compare(password, hash);
  } catch (e) {
    return false;
  }
}

export function verifyPasswordSync(password, hash) {
  if (!password || !hash) return false;
  if (hash.length === 64 && /^[a-f0-9]+$/i.test(hash)) {
    const legacyHash = crypto.createHash("sha256").update(password).digest("hex");
    return legacyHash === hash;
  }
  try {
    return bcrypt.compareSync(password, hash);
  } catch (e) {
    return false;
  }
}
