import { Router } from "express";
import { submissionController } from "../controllers/submission.controller.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

// All submission routes require authentication
router.post("/submit", requireAuth, (req, res) => submissionController.submit(req, res));
router.post("/", requireAuth, (req, res) => submissionController.submit(req, res));
router.get("/history", requireAuth, (req, res) => submissionController.getHistory(req, res));
router.get("/:id", requireAuth, (req, res) => submissionController.getSubmission(req, res));

export default router;
