import { listSubmissionRecords } from "../lib/submissionStore.js";
import { findUserById } from "../lib/userStore.js";
import { problems } from "../data/problems.js";

export class UserController {
  async getDashboard(req, res) {
    try {
      const userId = req.user.id;
      const user = (await findUserById(userId)) || req.user;

      const allSubmissions = await listSubmissionRecords();
      const userSubmissions = allSubmissions.filter((s) => String(s.userId) === String(userId));

      const totalSubmissions = userSubmissions.length;
      const acceptedCount = userSubmissions.filter((s) => s.verdict === "AC").length;
      const wrongAnswerCount = userSubmissions.filter((s) => s.verdict === "WA").length;
      const runtimeErrorCount = userSubmissions.filter((s) => s.verdict === "RE").length;
      const timeLimitCount = userSubmissions.filter((s) => s.verdict === "TLE").length;
      const compilationErrorCount = userSubmissions.filter((s) => s.verdict === "CE").length;

      const acceptanceRate = totalSubmissions > 0 ? Math.round((acceptedCount / totalSubmissions) * 100) : 0;

      const solvedProblemIds = Array.from(
        new Set(userSubmissions.filter((s) => s.verdict === "AC").map((s) => s.problemId))
      );
      const attemptedProblemIds = Array.from(
        new Set(userSubmissions.map((s) => s.problemId))
      );

      const recentActivity = userSubmissions.slice(0, 10).map((s) => {
        const prob = problems.find((p) => p.id === s.problemId);
        return {
          id: s.id || s._id,
          problemId: s.problemId,
          problemTitle: prob?.title || s.problemId,
          verdict: s.verdict,
          statusText: s.statusText,
          language: s.language,
          submittedAt: s.createdAt || s.submittedAt
        };
      });

      return res.status(200).json({
        success: true,
        stats: {
          user: {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            ranking: user.ranking || 999,
            xp: user.xp || 0,
            streak: user.streak || 1,
            badges: user.badges || [],
            createdAt: user.createdAt || new Date()
          },
          totalSubmissions,
          acceptedCount,
          wrongAnswerCount,
          runtimeErrorCount,
          timeLimitCount,
          compilationErrorCount,
          acceptanceRate,
          solvedProblemCount: solvedProblemIds.length,
          attemptedProblemCount: attemptedProblemIds.length,
          solvedProblemIds,
          attemptedProblemIds,
          bookmarkedProblemIds: user.bookmarkedProblemIds || [],
          recentActivity
        }
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message || "Failed to fetch user dashboard statistics." });
    }
  }
}

export const userController = new UserController();
export default userController;
