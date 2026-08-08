import { submissionService } from "../services/submission.service.js";

/**
 * SubmissionController - HTTP Request Handler for Submissions
 */
export class SubmissionController {
  async submit(req, res) {
    try {
      const userId = req.user?.id || req.user?._id || req.body?.userId || "guest_coder";

      const { problemId, language, code, stdin, expectedOutput } = req.body ?? {};

      console.log(`[SubmissionController] [STAGE 1: SUBMISSION_RECEIVED] problemId: '${problemId}', language: '${language}', userId: '${userId}'`);

      if (!problemId || !language || !code) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: problemId, language, and code are required."
        });
      }

      const queuedSubmission = await submissionService.submitCode({
        userId,
        problemId,
        language,
        code,
        stdin,
        expectedOutput
      });

      return res.status(202).json({
        success: true,
        message: "Submission queued for evaluation successfully.",
        submission: queuedSubmission
      });
    } catch (err) {
      console.error("[SubmissionController] submit error:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "Failed to submit code for evaluation."
      });
    }
  }

  async getSubmission(req, res) {
    try {
      const { id } = req.params;
      const submission = await submissionService.getSubmissionById(id);

      return res.status(200).json({
        success: true,
        submission
      });
    } catch (err) {
      return res.status(404).json({
        success: false,
        error: err.message || "Submission not found."
      });
    }
  }

  async getHistory(req, res) {
    try {
      const userIds = [req.user?.id, req.user?._id].filter(Boolean);
      if (!userIds.length) {
        return res.status(401).json({ success: false, error: "Authentication required." });
      }

      const { problemId, verdict, language, limit = 50, page = 1 } = req.query;

      const historyData = await submissionService.getUserSubmissionHistory({
        userId: userIds,
        problemId,
        verdict,
        language,
        limit: Number(limit),
        page: Number(page)
      });


      return res.status(200).json({
        success: true,
        ...historyData
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message || "Failed to fetch submission history."
      });
    }
  }
}

export const submissionController = new SubmissionController();
export default submissionController;
