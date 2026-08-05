import { verifyToken } from "../lib/jwt.js";
import { findUserById, sanitizeUser } from "../lib/userStore.js";

export function parseTokenFromRequest(req) {
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7).trim();
  }
  return null;
}

export async function requireAuth(req, res, next) {
  const token = parseTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Authentication required. Please log in to access this resource."
    });
  }

  const payload = verifyToken(token);
  if (!payload || (!payload.userId && !payload.id && !payload._id)) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired authentication token. Please log in again."
    });
  }

  const targetId = payload.userId || payload.id || payload._id;
  const user = await findUserById(targetId);

  if (!user) {
    return res.status(401).json({
      success: false,
      error: "User associated with this token no longer exists."
    });
  }

  req.user = sanitizeUser(user);
  next();
}

export async function optionalAuth(req, _res, next) {
  const token = parseTokenFromRequest(req);

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      const targetId = payload.userId || payload.id || payload._id;
      const user = await findUserById(targetId);
      if (user) {
        req.user = sanitizeUser(user);
      }
    }
  }
  next();
}

export const authenticate = requireAuth;
export default requireAuth;
