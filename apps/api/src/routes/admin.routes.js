import { Router } from "express";
import { requireAdmin } from "../middleware/auth.middleware.js";
import {
  getDashboardStats,
  getAdminUsers,
  getAdminUserDetails,
  updateAdminUserRole,
  updateAdminUserStatus,
  getAdminProblems,
  getAdminProblemById,
  createAdminProblem,
  updateAdminProblem,
  deleteAdminProblem,
  getAdminTopics,
  createAdminTopic,
  updateAdminTopic,
  deleteAdminTopic,
  getAdminSubmissions,
  getAdminSubmissionDetails,
  getAdminContests,
  createAdminContest,
  updateAdminContest,
  deleteAdminContest,
  getAdminAnalytics,
  getAdminReports,
  updateAdminReportStatus,
  getAdminAICoachStats,
  getAdminAuditLogs,
  getAdminSettings,
  updateAdminSettings,
  getAdminCompanies,
  createAdminCompany,
  updateAdminCompany,
  deleteAdminCompany,
  addProblemToCompany,
  removeProblemFromCompany,
  logAdminAction
} from "../services/admin.service.js";

const router = Router();

// Apply requireAdmin middleware to all endpoints on this router
router.use(requireAdmin);

// 1. DASHBOARD
router.get("/dashboard", async (req, res) => {
  try {
    const stats = await getDashboardStats();
    res.json({ success: true, ...stats });
  } catch (error) {
    console.error("[AdminAPI] /dashboard error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch admin dashboard statistics." });
  }
});

// 2. USERS
router.get("/users", async (req, res) => {
  try {
    const result = await getAdminUsers(req.query);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error("[AdminAPI] /users error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch users list." });
  }
});

router.get("/users/:id", async (req, res) => {
  try {
    const details = await getAdminUserDetails(req.params.id);
    if (!details) return res.status(404).json({ success: false, error: "User not found." });
    res.json({ success: true, ...details });
  } catch (error) {
    console.error("[AdminAPI] /users/:id error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch user details." });
  }
});

router.patch("/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ success: false, error: "Invalid role specified." });
    }
    const updated = await updateAdminUserRole(req.params.id, role, req.user, req);
    if (!updated) return res.status(404).json({ success: false, error: "User not found." });
    res.json({ success: true, user: updated });
  } catch (error) {
    console.error("[AdminAPI] /users/:id/role error:", error);
    res.status(500).json({ success: false, error: "Failed to update user role." });
  }
});

router.patch("/users/:id/status", async (req, res) => {
  try {
    const { status, reason } = req.body;
    if (!["active", "suspended"].includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status specified." });
    }
    const updated = await updateAdminUserStatus(req.params.id, status, reason, req.user, req);
    if (!updated) return res.status(404).json({ success: false, error: "User not found." });
    res.json({ success: true, user: updated });
  } catch (error) {
    console.error("[AdminAPI] /users/:id/status error:", error);
    res.status(500).json({ success: false, error: "Failed to update user status." });
  }
});

// 3. PROBLEMS
router.get("/problems", async (req, res) => {
  try {
    const result = await getAdminProblems(req.query);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error("[AdminAPI] /problems error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch problems." });
  }
});

router.get("/problems/:id", async (req, res) => {
  try {
    const problem = await getAdminProblemById(req.params.id);
    if (!problem) return res.status(404).json({ success: false, error: "Problem not found." });
    res.json({ success: true, problem });
  } catch (error) {
    console.error("[AdminAPI] /problems/:id error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch problem." });
  }
});

router.post("/problems", async (req, res) => {
  try {
    const { title, difficulty, topic, statement } = req.body;
    if (!title || !difficulty || !topic || !statement) {
      return res.status(400).json({ success: false, error: "Title, difficulty, topic, and statement are required." });
    }
    const problem = await createAdminProblem(req.body, req.user, req);
    res.status(201).json({ success: true, problem });
  } catch (error) {
    console.error("[AdminAPI] POST /problems error:", error);
    res.status(500).json({ success: false, error: "Failed to create problem." });
  }
});

router.patch("/problems/:id", async (req, res) => {
  try {
    const problem = await updateAdminProblem(req.params.id, req.body, req.user, req);
    if (!problem) return res.status(404).json({ success: false, error: "Problem not found." });
    res.json({ success: true, problem });
  } catch (error) {
    console.error("[AdminAPI] PATCH /problems/:id error:", error);
    res.status(500).json({ success: false, error: "Failed to update problem." });
  }
});

router.delete("/problems/:id", async (req, res) => {
  try {
    const result = await deleteAdminProblem(req.params.id, req.user, req);
    res.json(result);
  } catch (error) {
    console.error("[AdminAPI] DELETE /problems/:id error:", error);
    res.status(500).json({ success: false, error: "Failed to delete problem." });
  }
});

// 4. TOPICS (SINGLE SOURCE OF TRUTH)
router.get("/topics", async (_req, res) => {
  try {
    const topics = await getAdminTopics();
    res.json({ success: true, topics });
  } catch (error) {
    console.error("[AdminAPI] /topics error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch topics." });
  }
});

router.post("/topics", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, error: "Topic name is required." });
    const topic = await createAdminTopic(req.body, req.user, req);
    res.status(201).json({ success: true, topic });
  } catch (error) {
    console.error("[AdminAPI] POST /topics error:", error);
    res.status(500).json({ success: false, error: "Failed to create topic." });
  }
});

router.patch("/topics/:id", async (req, res) => {
  try {
    const topic = await updateAdminTopic(req.params.id, req.body, req.user, req);
    if (!topic) return res.status(404).json({ success: false, error: "Topic not found." });
    res.json({ success: true, topic });
  } catch (error) {
    console.error("[AdminAPI] PATCH /topics/:id error:", error);
    res.status(500).json({ success: false, error: "Failed to update topic." });
  }
});

router.delete("/topics/:id", async (req, res) => {
  try {
    const result = await deleteAdminTopic(req.params.id, req.user, req);
    res.json(result);
  } catch (error) {
    console.error("[AdminAPI] DELETE /topics/:id error:", error);
    res.status(500).json({ success: false, error: "Failed to delete topic." });
  }
});

// 5. SUBMISSIONS
router.get("/submissions", async (req, res) => {
  try {
    const result = await getAdminSubmissions(req.query);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error("[AdminAPI] /submissions error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch submissions." });
  }
});

router.get("/submissions/:id", async (req, res) => {
  try {
    const submission = await getAdminSubmissionDetails(req.params.id);
    if (!submission) return res.status(404).json({ success: false, error: "Submission not found." });
    res.json({ success: true, submission });
  } catch (error) {
    console.error("[AdminAPI] /submissions/:id error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch submission details." });
  }
});

// 6. CONTESTS
router.get("/contests", async (req, res) => {
  try {
    const contests = await getAdminContests();
    res.json({ success: true, contests });
  } catch (error) {
    console.error("[AdminAPI] /contests error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch contests." });
  }
});

router.post("/contests", async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ success: false, error: "Contest title is required." });
    const contest = await createAdminContest(req.body, req.user, req);
    res.status(201).json({ success: true, contest });
  } catch (error) {
    console.error("[AdminAPI] POST /contests error:", error);
    res.status(500).json({ success: false, error: "Failed to create contest." });
  }
});

router.patch("/contests/:id", async (req, res) => {
  try {
    const contest = await updateAdminContest(req.params.id, req.body, req.user, req);
    if (!contest) return res.status(404).json({ success: false, error: "Contest not found." });
    res.json({ success: true, contest });
  } catch (error) {
    console.error("[AdminAPI] PATCH /contests/:id error:", error);
    res.status(500).json({ success: false, error: "Failed to update contest." });
  }
});

router.delete("/contests/:id", async (req, res) => {
  try {
    const result = await deleteAdminContest(req.params.id, req.user, req);
    res.json(result);
  } catch (error) {
    console.error("[AdminAPI] DELETE /contests/:id error:", error);
    res.status(500).json({ success: false, error: "Failed to delete contest." });
  }
});

// 7. ANALYTICS
router.get("/analytics", async (req, res) => {
  try {
    const analytics = await getAdminAnalytics(req.query.range || "30d");
    res.json({ success: true, ...analytics });
  } catch (error) {
    console.error("[AdminAPI] /analytics error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch platform analytics." });
  }
});

// 8. REPORTS
router.get("/reports", async (req, res) => {
  try {
    const reports = await getAdminReports(req.query);
    res.json({ success: true, reports });
  } catch (error) {
    console.error("[AdminAPI] /reports error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch reports." });
  }
});

router.patch("/reports/:id", async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    if (!status) return res.status(400).json({ success: false, error: "Status is required." });
    const report = await updateAdminReportStatus(req.params.id, { status, adminNotes }, req.user, req);
    if (!report) return res.status(404).json({ success: false, error: "Report not found." });
    res.json({ success: true, report });
  } catch (error) {
    console.error("[AdminAPI] PATCH /reports/:id error:", error);
    res.status(500).json({ success: false, error: "Failed to update report." });
  }
});

// 9. AI COACH TELEMETRY
router.get("/ai-coach", async (_req, res) => {
  try {
    const aiStats = await getAdminAICoachStats();
    res.json({ success: true, ...aiStats });
  } catch (error) {
    console.error("[AdminAPI] /ai-coach error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch AI telemetry." });
  }
});

// 10. AUDIT LOGS
router.get("/audit-logs", async (req, res) => {
  try {
    const result = await getAdminAuditLogs(req.query);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error("[AdminAPI] /audit-logs error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch audit logs." });
  }
});

// 11. PLATFORM SETTINGS
router.get("/settings", async (_req, res) => {
  try {
    const settings = await getAdminSettings();
    res.json({ success: true, settings });
  } catch (error) {
    console.error("[AdminAPI] /settings error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch platform settings." });
  }
});

router.patch("/settings", async (req, res) => {
  try {
    const settings = await updateAdminSettings(req.body, req.user, req);
    res.json({ success: true, settings });
  } catch (error) {
    console.error("[AdminAPI] PATCH /settings error:", error);
    res.status(500).json({ success: false, error: "Failed to update platform settings." });
  }
});

// 12. COMPANY SHEETS CONTROL
router.get("/companies", async (req, res) => {
  try {
    const result = await getAdminCompanies(req.query);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error("[AdminAPI] /companies error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch companies." });
  }
});

router.post("/companies", async (req, res) => {
  try {
    const company = await createAdminCompany(req.body, req.user, req);
    res.status(201).json({ success: true, company });
  } catch (error) {
    console.error("[AdminAPI] POST /companies error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to create company sheet." });
  }
});

router.put("/companies/:id", async (req, res) => {
  try {
    const company = await updateAdminCompany(req.params.id, req.body, req.user, req);
    if (!company) return res.status(404).json({ success: false, error: "Company not found." });
    res.json({ success: true, company });
  } catch (error) {
    console.error("[AdminAPI] PUT /companies/:id error:", error);
    res.status(500).json({ success: false, error: "Failed to update company sheet." });
  }
});

router.delete("/companies/:id", async (req, res) => {
  try {
    const result = await deleteAdminCompany(req.params.id, req.user, req);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error("[AdminAPI] DELETE /companies/:id error:", error);
    res.status(500).json({ success: false, error: "Failed to delete company sheet." });
  }
});

router.post("/companies/:id/problems", async (req, res) => {
  try {
    const company = await addProblemToCompany(req.params.id, req.body, req.user, req);
    res.json({ success: true, company });
  } catch (error) {
    console.error("[AdminAPI] POST /companies/:id/problems error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to add problem to company sheet." });
  }
});

router.delete("/companies/:id/problems/:problemId", async (req, res) => {
  try {
    const company = await removeProblemFromCompany(req.params.id, req.params.problemId, req.user, req);
    res.json({ success: true, company });
  } catch (error) {
    console.error("[AdminAPI] DELETE /companies/:id/problems/:problemId error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to remove problem from company sheet." });
  }
});

export default router;
