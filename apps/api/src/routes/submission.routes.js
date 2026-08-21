import { Router } from "express";
import { submissionController } from "../controllers/submission.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import rateLimit from "express-rate-limit";

const router = Router();
const submissionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many submissions. Please retry shortly." }
});

/**
 * Submission Routes
 * Base Path: /api/submissions
 */

// 1. POST /api/submissions/submit - Non-blocking submit code (Status = QUEUED)
router.post("/submit", requireAuth, submissionLimiter, (req, res) => submissionController.submit(req, res));
router.post("/", requireAuth, submissionLimiter, (req, res) => submissionController.submit(req, res));

// 2. GET /api/submissions/history - Fetch submission history
router.get("/history", requireAuth, (req, res) => submissionController.getHistory(req, res));

// 3. GET /api/submissions/:id - Fetch single submission by ID
router.get("/:id", requireAuth, (req, res) => submissionController.getSubmission(req, res));

export default router;
