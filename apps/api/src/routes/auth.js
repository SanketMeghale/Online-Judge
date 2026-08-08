import { Router } from "express";
import rateLimit from "express-rate-limit";
import { signToken } from "../lib/jwt.js";
import { createUser, findUserByEmail, findUserByUsername, validateUserCredentials } from "../lib/userStore.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => Boolean(process.env.VERCEL) || Boolean(process.env.VERCEL_ENV),
  validate: { trustProxy: false, xForwardedForHeader: false },
  message: {
    success: false,
    error: "Too many login/registration attempts. Please try again in 15 minutes."
  }
});

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 24 * 60 * 60 * 1000
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_.-]{3,30}$/;

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
    const cleanUsername = String(username).trim();
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

    if (password.length < 6) {
      response.status(400).json({ success: false, error: "Password must be at least 6 characters long." });
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
      token,
      accessToken: token,
      user
    });
  } catch (err) {
    console.error("[Auth Register Error]:", err);
    response.status(500).json({
      success: false,
      error: err?.message || "Internal server error during registration."
    });
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
      token,
      accessToken: token,
      user
    });
  } catch (err) {
    console.error("[Auth Login Error]:", err);
    response.status(500).json({
      success: false,
      error: err?.message || "Internal server error during login."
    });
  }
});

router.post("/logout", (request, response) => {
  try {
    response.clearCookie("token", COOKIE_OPTIONS);
  } catch {}
  response.json({
    success: true,
    message: "Logged out successfully."
  });
});

router.get("/me", requireAuth, (request, response) => {
  response.json({
    success: true,
    user: request.user
  });
});

export default router;
