import { Router } from "express";
import { submissionController } from "../controllers/submission.controller.js";
import { optionalAuth } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * Submission Routes
 * Base Path: /api/submissions
 */

// 1. POST /api/submissions/submit - Non-blocking submit code (Status = QUEUED)
router.post("/submit", optionalAuth, (req, res) => submissionController.submit(req, res));
router.post("/", optionalAuth, (req, res) => submissionController.submit(req, res));

// 2. GET /api/submissions/history - Fetch submission history
router.get("/history", optionalAuth, (req, res) => submissionController.getHistory(req, res));

// 3. GET /api/submissions/:id - Fetch single submission by ID
router.get("/:id", optionalAuth, (req, res) => submissionController.getSubmission(req, res));

export default router;
