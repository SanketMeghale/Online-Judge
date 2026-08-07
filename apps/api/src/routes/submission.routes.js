import { Router } from "express";
import { submissionController } from "../controllers/submission.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * Submission Routes
 * Base Path: /api/submissions
 */

// 1. POST /api/submissions/submit - Non-blocking submit code (Status = QUEUED)
router.post("/submit", authenticate, (req, res) => submissionController.submit(req, res));
router.post("/", authenticate, (req, res) => submissionController.submit(req, res));

// 2. GET /api/submissions/history - Fetch authenticated user submission history
router.get("/history", authenticate, (req, res) => submissionController.getHistory(req, res));

// 3. GET /api/submissions/:id - Fetch single submission by ID
router.get("/:id", authenticate, (req, res) => submissionController.getSubmission(req, res));

export default router;
