import { Router } from "express";
import {
  findUserById,
  findUserByUsername,
  isUsernameAvailable,
  updateUserProfile
} from "../lib/userStore.js";
import { signToken } from "../lib/jwt.js";
import { optionalAuth, requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

const USERNAME_REGEX = /^[a-zA-Z0-9_.-]{3,30}$/;
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL_ENV),
  sameSite: "lax",
  maxAge: 24 * 60 * 60 * 1000
};

// 1. GET /api/users/me - Retrieve current authenticated user profile
router.get("/me", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized. Please log in." });
    }

    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User profile not found." });
    }

    res.json({
      success: true,
      user
    });
  } catch (err) {
    console.error("[GET /api/users/me Error]:", err);
    res.status(500).json({ success: false, error: "Failed to fetch user profile." });
  }
});

// 2. PATCH /api/users/me & PUT /api/users/me - Update permitted profile fields
async function handleUpdateProfile(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized. Please log in." });
    }

    const {
      displayName,
      name,
      username,
      bio,
      location,
      github,
      githubProfile,
      linkedin,
      linkedinProfile,
      website,
      personalWebsite,
      avatar,
      avatarUrl,
      photoURL,
      language,
      timezone,
      preferences
    } = req.body || {};

    const cleanDisplayName = String(displayName || name || "").trim();
    if (cleanDisplayName && cleanDisplayName.length < 2) {
      return res.status(400).json({
        success: false,
        error: "Display name must be at least 2 characters long."
      });
    }

    const cleanUsername = String(username || "").trim().toLowerCase();
    if (cleanUsername) {
      if (!USERNAME_REGEX.test(cleanUsername)) {
        return res.status(400).json({
          success: false,
          error: "Username must be 3-30 characters long and contain only letters, numbers, underscores, dots, or hyphens."
        });
      }

      const isAvailable = await isUsernameAvailable(cleanUsername, userId);
      if (!isAvailable) {
        return res.status(409).json({
          success: false,
          error: "Username is already taken. Please choose another."
        });
      }
    }

    const updatePayload = {
      displayName: cleanDisplayName || undefined,
      name: cleanDisplayName || undefined,
      username: cleanUsername || undefined,
      bio: typeof bio === "string" ? bio : undefined,
      location: typeof location === "string" ? location : undefined,
      github: typeof github === "string" ? github : typeof githubProfile === "string" ? githubProfile : undefined,
      githubProfile: typeof githubProfile === "string" ? githubProfile : typeof github === "string" ? github : undefined,
      linkedin: typeof linkedin === "string" ? linkedin : typeof linkedinProfile === "string" ? linkedinProfile : undefined,
      linkedinProfile: typeof linkedinProfile === "string" ? linkedinProfile : typeof linkedin === "string" ? linkedin : undefined,
      website: typeof website === "string" ? website : typeof personalWebsite === "string" ? personalWebsite : undefined,
      personalWebsite: typeof personalWebsite === "string" ? personalWebsite : typeof website === "string" ? website : undefined,
      avatar: typeof avatar === "string" ? avatar : typeof avatarUrl === "string" ? avatarUrl : typeof photoURL === "string" ? photoURL : undefined,
      avatarUrl: typeof avatarUrl === "string" ? avatarUrl : typeof avatar === "string" ? avatar : typeof photoURL === "string" ? photoURL : undefined,
      photoURL: typeof photoURL === "string" ? photoURL : typeof avatarUrl === "string" ? avatarUrl : typeof avatar === "string" ? avatar : undefined,
      language: typeof language === "string" ? language : undefined,
      timezone: typeof timezone === "string" ? timezone : undefined,
      preferences: preferences && typeof preferences === "object" ? preferences : undefined
    };

    const updatedUser = await updateUserProfile(userId, updatePayload);
    if (!updatedUser) {
      return res.status(404).json({ success: false, error: "User account could not be found to update." });
    }

    // Refresh JWT cookie in case username or identity changed
    try {
      const token = signToken({
        userId: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username
      });
      res.cookie("token", token, COOKIE_OPTIONS);
    } catch {}

    res.json({
      success: true,
      message: "Profile updated successfully.",
      user: updatedUser
    });
  } catch (err) {
    console.error("[PATCH /api/users/me Error]:", err);
    res.status(500).json({
      success: false,
      error: err?.message || "Failed to update profile in database."
    });
  }
}

router.patch("/me", requireAuth, handleUpdateProfile);
router.put("/me", requireAuth, handleUpdateProfile);

// 3. GET /api/users/check-username - Check username availability
router.get("/check-username", optionalAuth, async (req, res) => {
  try {
    const { username } = req.query;
    const cleanUsername = String(username || "").trim().toLowerCase();

    if (!cleanUsername || !USERNAME_REGEX.test(cleanUsername)) {
      return res.status(400).json({
        success: false,
        available: false,
        message: "Username must be 3-30 characters (letters, numbers, '.', '_', '-')."
      });
    }

    const available = await isUsernameAvailable(cleanUsername, req.user?.id);
    res.json({
      success: true,
      available,
      message: available ? "Username available" : "Username already taken"
    });
  } catch (err) {
    console.error("[Check Username Error]:", err);
    res.status(500).json({ success: false, error: "Error checking username availability." });
  }
});

// 4. GET /api/users/:username - Retrieve public user profile
router.get("/:username", optionalAuth, async (req, res) => {
  try {
    const { username } = req.params;
    const user = await findUserByUsername(String(username).trim());
    if (!user || user.isDeleted) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    // Public sanitized profile representation
    res.json({
      success: true,
      user: {
        id: user.id,
        _id: user._id,
        displayName: user.displayName || user.name,
        name: user.name,
        username: user.username,
        photoURL: user.photoURL || user.avatarUrl,
        avatarUrl: user.avatarUrl || user.photoURL,
        avatar: user.avatar || user.avatarUrl || user.photoURL,
        bio: user.bio,
        location: user.location,
        github: user.github,
        linkedin: user.linkedin,
        website: user.website,
        ranking: user.ranking,
        xp: user.xp,
        streak: user.streak,
        bestStreak: user.bestStreak,
        badges: user.badges,
        solved: user.solved,
        solvedProblemIds: user.preferences?.showSolvedProblems !== false ? user.solvedProblemIds : [],
        activeDates: user.preferences?.showActivity !== false ? user.activeDates : [],
        stats: user.stats,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error("[GET /api/users/:username Error]:", err);
    res.status(500).json({ success: false, error: "Failed to fetch user profile." });
  }
});

export default router;
