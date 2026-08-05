import { submissionService } from "../services/submission.service.js";

export class SubmissionController {
  async submit(req, res) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, error: "Authentication required." });
      }

      const userId = req.user.id;
      const { problemId, language, code, stdin, expectedOutput } = req.body;

      if (!problemId || !language || !code) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: problemId, language, and code are required."
        });
      }

      const submission = await submissionService.submitCode({
        userId,
        problemId,
        language,
        code,
        stdin,
        expectedOutput
      });

      return res.status(200).json({
        success: true,
        message: "Submission evaluated successfully.",
        submission
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message || "Failed to submit code for evaluation."
      });
    }
  }

  async getSubmission(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const submission = await submissionService.getSubmissionById(id);

      if (submission && userId && String(submission.userId) !== String(userId)) {
        return res.status(403).json({
          success: false,
          error: "Access denied. You can only view your own submissions."
        });
      }

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
      if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, error: "Authentication required." });
      }

      const userId = req.user.id;
      const { problemId, verdict, language, limit = 50, page = 1 } = req.query;

      const historyData = await submissionService.getUserSubmissionHistory({
        userId,
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
