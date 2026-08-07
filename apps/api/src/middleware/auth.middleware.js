import { verifyToken } from "../lib/jwt.js";
import { findUserById, sanitizeUser } from "../lib/userStore.js";

/**
 * Strict Production-Ready Authentication Middleware
 */
export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Authentication required. Please log in to access this resource."
    });
  }

  const payload = verifyToken(token);
  if (!payload || !payload.userId) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired authentication token. Please log in again."
    });
  }

  const user = await findUserById(payload.userId);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: "Authenticated user record not found."
    });
  }

  req.user = sanitizeUser(user);
  next();
}

export async function requireAuth(req, res, next) {
  return authenticate(req, res, next);
}

export async function optionalAuth(req, _res, next) {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    const payload = verifyToken(token);
    if (payload?.userId) {
      const user = await findUserById(payload.userId);
      if (user) {
        req.user = sanitizeUser(user);
      }
    }
  }

  next();
}

export default authenticate;
