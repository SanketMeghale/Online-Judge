import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  getCoachProfile,
  getOrCreateConversation,
  chatWithMentor,
  reviewCode,
  getProblemHint,
  handleMockInterview,
  clearUserConversation
} from "../services/aiCoach.service.js";

const router = express.Router();
router.use(requireAuth);

/**
 * GET /api/ai/profile
 * Returns authenticated user's real skill profile, weak topics, and Today's Focus
 */
router.get("/profile", async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || "guest_coder";
    const data = await getCoachProfile(userId);
    res.json(data);
  } catch (error) {
    console.error("[AIRoutes] GET /profile error:", error);
    res.status(500).json({ success: false, error: "Failed to load AI Coach profile." });
  }
});

/**
 * GET /api/ai/conversations
 * Returns active chat history for authenticated user
 */
router.get("/conversations", async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || "guest_coder";
    const conversation = await getOrCreateConversation(userId, req.query.conversationId);
    res.json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error("[AIRoutes] GET /conversations error:", error);
    res.status(500).json({ success: false, error: "Failed to load conversation history." });
  }
});

/**
 * POST /api/ai/mentor
 * Real-time personalized chat with AI Mentor
 */
router.post("/mentor", async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || "guest_coder";
    const { message, context, conversationId } = req.body || {};

    if (!message || !String(message).trim()) {
      return res.status(400).json({ success: false, error: "Message text is required." });
    }

    const result = await chatWithMentor({
      userId,
      message: String(message).trim(),
      context: context || {},
      conversationId
    });

    res.json(result);
  } catch (error) {
    console.error("[AIRoutes] POST /mentor error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "AI Mentor is temporarily unavailable. Please try again."
    });
  }
});

/**
 * POST /api/ai/review
 * Structured AI code review and complexity scoring
 */
router.post("/review", async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || "guest_coder";
    const { code, language, problemId } = req.body || {};

    if (!code || !String(code).trim()) {
      return res.status(400).json({ success: false, error: "Source code is required for review." });
    }

    const result = await reviewCode({
      userId,
      code: String(code).trim(),
      language: language || "python",
      problemId
    });

    res.json(result);
  } catch (error) {
    console.error("[AIRoutes] POST /review error:", error);
    res.status(500).json({ success: false, error: "Failed to analyze code complexity." });
  }
});

/**
 * POST /api/ai/hint
 * Progressive 5-level hint generator
 */
router.post("/hint", async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || "guest_coder";
    const { problemId, hintLevel, currentCode } = req.body || {};

    const result = await getProblemHint({
      userId,
      problemId,
      hintLevel: Number(hintLevel) || 1,
      currentCode: currentCode || ""
    });

    res.json(result);
  } catch (error) {
    console.error("[AIRoutes] POST /hint error:", error);
    res.status(500).json({ success: false, error: "Failed to generate hint." });
  }
});

/**
 * POST /api/ai/interview
 * Mock technical interview session interaction
 */
router.post("/interview", async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || "guest_coder";
    const { company, track, difficulty, action, answer, code, language, history } = req.body || {};

    const result = await handleMockInterview({
      userId,
      company: company || "Google",
      track: track || "dsa",
      difficulty: difficulty || "Medium",
      action: action || "start",
      answer: answer || "",
      code: code || "",
      language: language || "python",
      history: history || []
    });

    res.json(result);
  } catch (error) {
    console.error("[AIRoutes] POST /interview error:", error);
    res.status(500).json({ success: false, error: "Failed to process mock interview session." });
  }
});

/**
 * DELETE /api/ai/conversations
 * Clears chat history for authenticated user
 */
router.delete("/conversations", async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || "guest_coder";
    const result = await clearUserConversation(userId, req.query.conversationId);
    res.json(result);
  } catch (error) {
    console.error("[AIRoutes] DELETE /conversations error:", error);
    res.status(500).json({ success: false, error: "Failed to clear conversation." });
  }
});

export default router;
