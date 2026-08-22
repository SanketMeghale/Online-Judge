import { Router } from "express";
import rateLimit from "express-rate-limit";
import { signRealtimeToken, signToken } from "../lib/jwt.js";
import { verifyFirebaseIdToken } from "../lib/firebaseAdmin.js";
import {
  createUser,
  deleteUser,
  findUserByEmail,
  findUserById,
  findUserByUsername,
  isUsernameAvailable,
  upsertFirebaseUser,
  updateUserPassword,
  updateUserProfile,
  validateUserCredentials,
  verifyUserRawPassword
} from "../lib/userStore.js";
import { optionalAuth, requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many login/registration attempts. Please try again in 15 minutes."
  }
});

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL_ENV),
  sameSite: "lax",
  maxAge: 24 * 60 * 60 * 1000
};
const COOKIE_CLEAR_OPTIONS = {
  httpOnly: COOKIE_OPTIONS.httpOnly,
  secure: COOKIE_OPTIONS.secure,
  sameSite: COOKIE_OPTIONS.sameSite
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_.-]{3,30}$/;

function sendAuthFailure(response, error, fallback, defaultStatus = 500) {
  const status = Number(error?.statusCode || defaultStatus);
  response.status(status).json({
    success: false,
    error: status === 503 ? "Authentication storage is temporarily unavailable." : fallback
  });
}

router.post("/register", authLimiter, async (request, response) => {
  try {
    const { name, username, email, password } = request.body ?? {};

    if (!name || !username || !email || !password) {
      response.status(400).json({
        success: false,
        error: "Missing required fields: name, username, email, and password are required."
      });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanUsername = String(username).trim().toLowerCase();
    const cleanName = String(name).trim();

    if (!EMAIL_REGEX.test(cleanEmail)) {
      response.status(400).json({ success: false, error: "Please enter a valid email address." });
      return;
    }

    if (!USERNAME_REGEX.test(cleanUsername)) {
      response.status(400).json({
        success: false,
        error: "Username must be 3-30 characters long and contain only letters, numbers, underscores, dots, or hyphens."
      });
      return;
    }

    if (password.length < 12) {
      response.status(400).json({ success: false, error: "Password must be at least 12 characters long." });
      return;
    }

    const existingEmail = await findUserByEmail(cleanEmail);
    if (existingEmail) {
      response.status(409).json({ success: false, error: "An account with this email address already exists." });
      return;
    }

    const existingUsername = await findUserByUsername(cleanUsername);
    if (existingUsername) {
      response.status(409).json({ success: false, error: "This username is already taken. Please choose another." });
      return;
    }

    const user = await createUser({
      name: cleanName,
      username: cleanUsername,
      email: cleanEmail,
      password
    });

    const token = signToken({ userId: user.id, email: user.email, username: user.username });
    try {
      response.cookie("token", token, COOKIE_OPTIONS);
    } catch {}

    response.status(201).json({
      success: true,
      message: "Account registered successfully.",
      user
    });
  } catch (err) {
    console.error("[Auth Register Error]:", err);
    sendAuthFailure(response, err, "Internal server error during registration.");
  }
});

router.post("/login", authLimiter, async (request, response) => {
  try {
    const { email, username, identifier, password } = request.body ?? {};
    const userIdentifier = String(email || username || identifier || "").trim();

    if (!userIdentifier || !password) {
      response.status(400).json({ success: false, error: "Both email/username and password are required." });
      return;
    }

    const user = await validateUserCredentials(userIdentifier, password);

    if (!user) {
      response.status(401).json({ success: false, error: "Invalid credentials. Please check your email/username and password." });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email, username: user.username });
    try {
      response.cookie("token", token, COOKIE_OPTIONS);
    } catch {}

    response.json({
      success: true,
      message: "Logged in successfully.",
      user
    });
  } catch (err) {
    console.error("[Auth Login Error]:", err);
    sendAuthFailure(response, err, "Internal server error during login.");
  }
});

router.post("/google", authLimiter, async (request, response) => {
  try {
    const { idToken } = request.body ?? {};

    if (!idToken) {
      response.status(400).json({ success: false, error: "Firebase ID token is required." });
      return;
    }

    const decodedToken = await verifyFirebaseIdToken(idToken);
    if (!decodedToken?.uid) {
      response.status(401).json({ success: false, error: "Invalid Firebase authentication token." });
      return;
    }

    const email = decodedToken.email || `${decodedToken.uid}@users.judgo.dev`;
    const user = await upsertFirebaseUser({
      firebaseUid: decodedToken.uid,
      email,
      displayName: decodedToken.name || "",
      photoURL: decodedToken.picture || "",
      provider: decodedToken.provider || "google.com"
    });

    if (!user) {
      response.status(401).json({ success: false, error: "Failed to authenticate with Google. Please try again." });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email, username: user.username });
    try {
      response.cookie("token", token, COOKIE_OPTIONS);
    } catch {}

    response.json({
      success: true,
      message: "Authenticated with Google successfully.",
      user
    });
  } catch (err) {
    console.error("[Auth Google Error]:", err);
    sendAuthFailure(response, err, "Invalid or expired Google authentication token.", 401);
  }
});

router.post("/logout", (request, response) => {
  try {
    response.clearCookie("token", COOKIE_CLEAR_OPTIONS);
  } catch {}
  response.json({
    success: true,
    message: "Logged out successfully."
  });
});

router.get("/me", requireAuth, async (request, response) => {
  try {
    const latestUser = await findUserById(request.user.id);
    response.json({
      success: true,
      user: latestUser || request.user
    });
  } catch (err) {
    response.json({
      success: true,
      user: request.user
    });
  }
});

router.get("/realtime-token", requireAuth, (request, response) => {
  const token = signRealtimeToken(request.user.id);
  response.json({ success: true, token, expiresInSeconds: 300 });
});

// Check username availability
router.get("/check-username", optionalAuth, async (request, response) => {
  try {
    const { username } = request.query;
    if (!username || !USERNAME_REGEX.test(String(username).trim())) {
      return response.status(400).json({
        success: false,
        available: false,
        message: "Username must be 3-30 characters (letters, numbers, '.', '_', '-')."
      });
    }

    const available = await isUsernameAvailable(String(username).trim(), request.user?.id);
    response.json({
      success: true,
      available,
      message: available ? "Username available" : "Username already taken"
    });
  } catch (err) {
    console.error("[Check Username Error]:", err);
    response.status(500).json({ success: false, error: "Error checking username." });
  }
});

// Update Profile & Settings
router.patch("/settings", requireAuth, async (request, response) => {
  try {
    const userId = request.user.id;
    const { name, displayName, username, bio, language, timezone, preferences } = request.body || {};

    const cleanName = String(displayName || name || "").trim();
    if (cleanName && cleanName.length < 2) {
      return response.status(400).json({ success: false, error: "Display name must be at least 2 characters." });
    }

    const cleanUsername = String(username || "").trim();
    if (cleanUsername) {
      if (!USERNAME_REGEX.test(cleanUsername)) {
        return response.status(400).json({
          success: false,
          error: "Username must be 3-30 characters and contain only letters, numbers, underscores, dots, or hyphens."
        });
      }

      const available = await isUsernameAvailable(cleanUsername, userId);
      if (!available) {
        return response.status(409).json({ success: false, error: "Username is already in use by another account." });
      }
    }

    const updatedUser = await updateUserProfile(userId, {
      name: cleanName,
      username: cleanUsername,
      bio: typeof bio === "string" ? bio : undefined,
      language: typeof language === "string" ? language : undefined,
      timezone: typeof timezone === "string" ? timezone : undefined,
      preferences: preferences && typeof preferences === "object" ? preferences : undefined
    });

    if (!updatedUser) {
      return response.status(404).json({ success: false, error: "User account not found." });
    }

    // Refresh token in case username changed
    const token = signToken({ userId: updatedUser.id, email: updatedUser.email, username: updatedUser.username });
    try {
      response.cookie("token", token, COOKIE_OPTIONS);
    } catch {}

    response.json({
      success: true,
      message: "Changes saved successfully",
      user: updatedUser
    });
  } catch (err) {
    console.error("[Update Settings Error]:", err);
    response.status(500).json({
      success: false,
      error: err?.message || "Failed to save settings."
    });
  }
});

// Change Password
router.post("/change-password", requireAuth, async (request, response) => {
  try {
    const userId = request.user.id;
    const { currentPassword, newPassword, confirmPassword } = request.body || {};

    if (!currentPassword || !newPassword) {
      return response.status(400).json({ success: false, error: "Current password and new password are required." });
    }

    if (newPassword.length < 12) {
      return response.status(400).json({ success: false, error: "New password must be at least 12 characters long." });
    }

    if (newPassword === currentPassword) {
      return response.status(400).json({ success: false, error: "New password cannot equal your current password." });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return response.status(400).json({ success: false, error: "New passwords do not match." });
    }

    const isCurrentValid = await verifyUserRawPassword(userId, currentPassword);
    if (!isCurrentValid) {
      return response.status(400).json({ success: false, error: "Current password is incorrect." });
    }

    const updated = await updateUserPassword(userId, newPassword);
    if (!updated) {
      return response.status(500).json({ success: false, error: "Failed to update password." });
    }

    response.json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (err) {
    console.error("[Change Password Error]:", err);
    response.status(500).json({
      success: false,
      error: err?.message || "Failed to change password."
    });
  }
});

// Delete Account Danger Zone
router.delete("/account", requireAuth, async (request, response) => {
  try {
    const userId = request.user.id;
    const { confirmation } = request.body || {};

    if (String(confirmation).trim() !== "DELETE") {
      return response.status(400).json({
        success: false,
        error: "Confirmation failed. Please type 'DELETE' to confirm account deletion."
      });
    }

    const deleted = await deleteUser(userId);
    if (!deleted) {
      return response.status(404).json({ success: false, error: "User account could not be found." });
    }

    try {
      response.clearCookie("token", COOKIE_CLEAR_OPTIONS);
    } catch {}

    response.json({
      success: true,
      message: "Account permanently deleted."
    });
  } catch (err) {
    console.error("[Delete Account Error]:", err);
    response.status(500).json({
      success: false,
      error: err?.message || "Failed to delete account."
    });
  }
});

export default router;
