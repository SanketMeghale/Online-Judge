import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "online-judge-production-secret-key-2026";
const SALT_ROUNDS = 10;

export function signToken(payload, expiresIn = "24h") {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token) {
  if (!token || typeof token !== "string") {
    return null;
  }
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export async function hashPassword(password) {
  if (!password) throw new Error("Password is required for hashing.");
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export function hashPasswordSync(password) {
  if (!password) throw new Error("Password is required for hashing.");
  return bcrypt.hashSync(password, SALT_ROUNDS);
}

export async function verifyPassword(password, hash) {
  if (!password || !hash) return false;
  try {
    // Backwards compatibility for legacy plain sha256 hashes if present during dev
    if (!hash.startsWith("$2a$") && !hash.startsWith("$2b$")) {
      return false;
    }
    return await bcrypt.compare(password, hash);
  } catch (err) {
    return false;
  }
}

export function verifyPasswordSync(password, hash) {
  if (!password || !hash) return false;
  try {
    if (!hash.startsWith("$2a$") && !hash.startsWith("$2b$")) {
      return false;
    }
    return bcrypt.compareSync(password, hash);
  } catch (err) {
    return false;
  }
}
