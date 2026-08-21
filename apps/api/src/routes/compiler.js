import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../middleware/auth.middleware.js";
import { submissionService } from "../services/submission.service.js";

const router = Router();
const executionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.RUN_CODE_RATE_LIMIT_PER_MINUTE || 30),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many run requests. Please retry shortly." }
});

router.post("/run", requireAuth, executionLimiter, async (request, response, next) => {
  try {
    const userId = request.user?.id || request.user?._id;
    const { problemId, language, code, stdin = "" } = request.body ?? {};
    const queuedRun = await submissionService.runCode({
      userId,
      problemId,
      language,
      code,
      stdin
    });
    response.status(202).json({
      success: true,
      message: "Run queued for isolated execution.",
      submissionId: queuedRun.submissionId,
      status: queuedRun.status,
      submission: queuedRun
    });
  } catch (error) {
    if (error.statusCode) {
      response.status(error.statusCode).json({ success: false, error: error.message });
      return;
    }
    next(error);
  }
});

export default router;
