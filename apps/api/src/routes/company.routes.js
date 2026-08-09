import express from "express";
import { optionalAuth, requireAuth } from "../middleware/auth.middleware.js";
import {
  getAllCompaniesWithUserProgress,
  getCompanyDetailSheet,
  chatWithCompanyAI
} from "../services/company.service.js";

const router = express.Router();

/**
 * GET /api/companies
 * Returns all companies with current user's real progress and completion stats
 */
router.get("/", optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.query.userId || null;
    const companies = await getAllCompaniesWithUserProgress(userId);
    res.json({
      success: true,
      companies
    });
  } catch (error) {
    console.error("[CompanyRoutes] GET / error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch company sheets." });
  }
});

/**
 * GET /api/companies/:companyId
 * Returns complete company preparation sheet (stats, topics, problem list, readiness, roadmap)
 */
router.get("/:companyId", optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.query.userId || null;
    const sheet = await getCompanyDetailSheet(req.params.companyId, userId);
    res.json({
      success: true,
      sheet
    });
  } catch (error) {
    console.error("[CompanyRoutes] GET /:companyId error:", error);
    res.status(500).json({ success: false, error: "Failed to load company preparation sheet." });
  }
});

/**
 * POST /api/companies/:companyId/ai-chat
 * Real-time personalized AI coaching for target company
 */
router.post("/:companyId/ai-chat", optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || null;
    const { message, context } = req.body || {};

    if (!message || !String(message).trim()) {
      return res.status(400).json({ success: false, error: "Message text is required." });
    }

    const result = await chatWithCompanyAI(req.params.companyId, userId, String(message).trim(), context || {});
    res.json(result);
  } catch (error) {
    console.error("[CompanyRoutes] POST /:companyId/ai-chat error:", error);
    res.status(500).json({ success: false, error: "AI Company Coach temporarily unavailable." });
  }
});

export default router;
