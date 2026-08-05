import { Router } from "express";
import rateLimit from "express-rate-limit";
import { signToken } from "../lib/jwt.js";
import { createUser, findUserByEmail, findUserByUsername, validateUserCredentials } from "../lib/userStore.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

// Rate limiter for authentication attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many login attempts. Please try again after 15 minutes."
  }
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many accounts created from this IP. Please try again later."
  }
});

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidUsername(username) {
  return typeof username === "string" && /^[a-zA-Z0-9._-]{3,30}$/.test(username.trim());
}

router.post("/register", registerLimiter, async (req, res) => {
  try {
    const { name, username, email, password } = req.body ?? {};

    if (!name || !username || !email || !password) {
      return res.status(400).json({ success: false, error: "Name, username, email, and password are required." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, error: "Please enter a valid email address." });
    }

    if (!isValidUsername(username)) {
      return res.status(400).json({
        success: false,
        error: "Username must be 3-30 characters and contain only letters, numbers, underscores, or hyphens."
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: "Password must be at least 6 characters long." });
    }

    if (await findUserByEmail(email)) {
      return res.status(409).json({ success: false, error: "An account with this email address already exists." });
    }

    if (await findUserByUsername(username)) {
      return res.status(409).json({ success: false, error: "Username is already taken." });
    }

    const user = await createUser({ name, username, email, password });
    const token = signToken({ userId: user.id });

    // Set secure HTTP-Only Cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    return res.status(201).json({
      success: true,
      token,
      user
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || "Registration failed." });
  }
});

router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Both email and password are required." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, error: "Please enter a valid email address." });
    }

    const user = await validateUserCredentials(email, password);
    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid email address or password." });
    }

    const token = signToken({ userId: user.id });

    // Set secure HTTP-Only Cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    return res.status(200).json({
      success: true,
      token,
      user
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || "Login failed." });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    path: "/"
  });
  return res.status(200).json({ success: true, message: "Logged out successfully." });
});

router.get("/me", requireAuth, (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user
  });
});

export default router;
