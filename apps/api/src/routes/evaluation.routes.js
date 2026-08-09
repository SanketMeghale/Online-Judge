import express from "express";
import { optionalAuth, requireAuth } from "../middleware/auth.middleware.js";
import { calculateUserHiringEvaluation } from "../services/evaluation.service.js";

const router = express.Router();

/**
 * GET /api/evaluation
 * Returns the currently authenticated user's 100% real, data-driven hiring evaluation
 */
router.get("/", optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.query.userId || "guest_coder";
    const company = req.query.company || "Google";
    const track = req.query.track || "dsa";

    const evaluation = await calculateUserHiringEvaluation(userId, { company, track });
    res.json({
      success: true,
      evaluation
    });
  } catch (error) {
    console.error("[EvaluationRoutes] GET / error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate data-driven evaluation."
    });
  }
});

/**
 * GET /api/evaluation/:userId
 * Returns specific user's data-driven hiring evaluation (for Admin or Profile)
 */
router.get("/:userId", optionalAuth, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const company = req.query.company || "Google";
    const track = req.query.track || "dsa";

    const evaluation = await calculateUserHiringEvaluation(targetUserId, { company, track });
    res.json({
      success: true,
      evaluation
    });
  } catch (error) {
    console.error("[EvaluationRoutes] GET /:userId error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate user evaluation."
    });
  }
});

export default router;
