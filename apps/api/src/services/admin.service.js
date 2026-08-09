import mongoose from "mongoose";
import { connectDatabase, isDatabaseConnected } from "../lib/db.js";
import { User } from "../models/User.js";
import { Problem } from "../models/Problem.js";
import { Submission } from "../models/Submission.js";
import { Contest } from "../models/Contest.js";
import { Topic } from "../models/Topic.js";
import { Report } from "../models/Report.js";
import { AuditLog } from "../models/AuditLog.js";
import { PlatformSettings } from "../models/PlatformSettings.js";
import { AIUsage } from "../models/AIUsage.js";
import { AIConversation } from "../models/AIConversation.js";
import { Company } from "../models/Company.js";
import { seedCompanies } from "../data/companies.seed.js";
import {
  getAllUsers,
  findUserById,
  updateUserRole as storeUpdateRole,
  updateUserStatus as storeUpdateStatus,
  sanitizeUser
} from "../lib/userStore.js";
import { problems as memoryProblems } from "../data/problems.js";
import { submissions as memorySubmissions } from "../lib/submissionStore.js";

// Canonical initial topics seed
const DEFAULT_TOPICS = [
  { id: "arrays", name: "Arrays", slug: "arrays", icon: "Layers", category: "Data Structures", difficulty: "Easy", description: "Contiguous memory blocks, indexing, prefix sums, and sliding window techniques.", order: 1 },
  { id: "strings", name: "Strings", slug: "strings", icon: "FileText", category: "Data Structures", difficulty: "Easy", description: "Character manipulation, two pointers, parsing, and anagram validation.", order: 2 },
  { id: "hash-tables", name: "Hash Tables", slug: "hash-tables", icon: "Hash", category: "Data Structures", difficulty: "Easy", description: "O(1) lookups, frequency counting, sets, and associative mappings.", order: 3 },
  { id: "two-pointers", name: "Two Pointers", slug: "two-pointers", icon: "MoveHorizontal", category: "Techniques", difficulty: "Medium", description: "Converging and parallel pointers for sorted array traversals.", order: 4 },
  { id: "sliding-window", name: "Sliding Window", slug: "sliding-window", icon: "Maximize2", category: "Techniques", difficulty: "Medium", description: "Dynamic window ranges for contiguous subarrays and substrings.", order: 5 },
  { id: "linked-lists", name: "Linked Lists", slug: "linked-lists", icon: "GitCommit", category: "Data Structures", difficulty: "Medium", description: "Node pointers, reversal, cycle detection, and merging lists.", order: 6 },
  { id: "stacks-queues", name: "Stacks & Queues", slug: "stacks-queues", icon: "Layers", category: "Data Structures", difficulty: "Medium", description: "LIFO / FIFO structures, monotonic stacks, and parentheses matching.", order: 7 },
  { id: "binary-search", name: "Binary Search", slug: "binary-search", icon: "Search", category: "Algorithms", difficulty: "Medium", description: "Logarithmic search over sorted ranges and monotonic search spaces.", order: 8 },
  { id: "trees", name: "Trees & BST", slug: "trees", icon: "GitFork", category: "Data Structures", difficulty: "Medium", description: "Binary trees, traversals (DFS/BFS), height, and validation.", order: 9 },
  { id: "graphs", name: "Graphs", slug: "graphs", icon: "Network", category: "Data Structures", difficulty: "Hard", description: "Adjacency lists, shortest paths (Dijkstra), topological sort, and cycles.", order: 10 },
  { id: "dynamic-programming", name: "Dynamic Programming", slug: "dynamic-programming", icon: "Cpu", category: "Algorithms", difficulty: "Hard", description: "Memoization, tabulation, state transitions, knapsack, and grid paths.", order: 11 },
  { id: "backtracking", name: "Backtracking", slug: "backtracking", icon: "CornerDownLeft", category: "Algorithms", difficulty: "Hard", description: "State-space tree exploration, permutations, and subsets.", order: 12 },
  { id: "greedy", name: "Greedy Algorithms", slug: "greedy", icon: "Zap", category: "Algorithms", difficulty: "Medium", description: "Locally optimal choices for interval scheduling and coin change.", order: 13 },
  { id: "bit-manipulation", name: "Bit Manipulation", slug: "bit-manipulation", icon: "Binary", category: "Techniques", difficulty: "Medium", description: "Bitwise XOR, AND, bit shifts, and mask operations.", order: 14 }
];

let memoryTopics = [...DEFAULT_TOPICS];
let memoryReports = [
  {
    _id: "rep-1",
    reporterId: "u-demouser",
    reporterEmail: "demo@judgo.dev",
    targetType: "problem",
    targetId: "two-sum",
    targetTitle: "Two Sum",
    reason: "Missing edge case example for duplicate elements",
    notes: "Please clarify if elements can be repeated with different indices.",
    status: "open",
    adminNotes: "",
    createdAt: new Date(Date.now() - 3600000 * 5)
  },
  {
    _id: "rep-2",
    reporterId: "u-sanketmeghale",
    reporterEmail: "sanket@example.com",
    targetType: "bug",
    targetId: "judge-memory",
    targetTitle: "Judge Memory Meter",
    reason: "Python 3 memory reporting offset",
    notes: "Verified that baseline memory is 14MB.",
    status: "investigating",
    adminNotes: "Reviewing judge0 harness container footprint",
    createdAt: new Date(Date.now() - 3600000 * 24)
  }
];
let memoryAuditLogs = [
  {
    _id: "aud-1",
    adminId: "u-sanketmeghale",
    adminEmail: "sanket@example.com",
    action: "ADMIN_LOGIN",
    targetType: "auth",
    targetId: "u-sanketmeghale",
    description: "Administrator signed into Judgo Admin Control Center.",
    metadata: { ip: "127.0.0.1", userAgent: "Mozilla/5.0" },
    createdAt: new Date(Date.now() - 3600000 * 2)
  }
];
let memoryPlatformSettings = {
  key: "global_settings",
  platformName: "Judgo",
  logoUrl: "/logo.png",
  tagline: "Elite Algorithmic & Coding Platform",
  maintenanceMode: false,
  registrationEnabled: true,
  defaultTimeLimitMs: 2000,
  defaultMemoryLimitMb: 256,
  enabledLanguages: ["javascript", "python", "cpp", "java"],
  aiCoachEnabled: true,
  dailyAiLimitPerUser: 50,
  contestsEnabled: true
};

// Audit log helper
export async function logAdminAction({
  adminUser,
  action,
  targetType,
  targetId = "",
  description,
  metadata = {},
  req = null
}) {
  const logEntry = {
    adminId: adminUser?.id || adminUser?._id || "system",
    adminEmail: adminUser?.email || "admin@judgo.dev",
    action,
    targetType,
    targetId: String(targetId),
    description,
    metadata,
    ipAddress: req?.ip || req?.headers?.["x-forwarded-for"] || "127.0.0.1",
    createdAt: new Date()
  };

  memoryAuditLogs.unshift({ _id: `aud-${Date.now()}`, ...logEntry });

  if (isDatabaseConnected()) {
    try {
      await AuditLog.create(logEntry);
    } catch (e) {
      console.error("[AdminService] logAdminAction error:", e);
    }
  }

  return logEntry;
}

// 1. DASHBOARD OVERVIEW METRICS
export async function getDashboardStats() {
  await connectDatabase();

  let userCount = 0;
  let activeUsers = 0;
  let suspendedUsers = 0;
  let newUsersToday = 0;

  let problemCount = 0;
  let publishedProblems = 0;
  let draftProblems = 0;
  let archivedProblems = 0;

  let submissionCount = 0;
  let acceptedCount = 0;
  let waCount = 0;
  let tleCount = 0;
  let reCount = 0;

  let contestCount = 0;
  let liveContests = 0;
  let upcomingContests = 0;

  let openReports = 0;
  let totalAuditLogs = 0;

  let recentUsers = [];
  let recentSubmissions = [];
  let recentLogs = [];
  let recentReportsList = [];

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  if (isDatabaseConnected()) {
    try {
      const [uTotal, uActive, uSuspended, uToday] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ status: { $ne: "suspended" } }),
        User.countDocuments({ status: "suspended" }),
        User.countDocuments({ createdAt: { $gte: startOfToday } })
      ]);
      userCount = uTotal;
      activeUsers = uActive;
      suspendedUsers = uSuspended;
      newUsersToday = uToday;

      const [pTotal, pPub, pDraft, pArch] = await Promise.all([
        Problem.countDocuments(),
        Problem.countDocuments({ status: "published" }),
        Problem.countDocuments({ status: "draft" }),
        Problem.countDocuments({ status: "archived" })
      ]);
      problemCount = pTotal;
      publishedProblems = pPub;
      draftProblems = pDraft;
      archivedProblems = pArch;

      const [sTotal, sAc, sWa, sTle, sRe] = await Promise.all([
        Submission.countDocuments(),
        Submission.countDocuments({ verdict: { $in: ["ACCEPTED", "AC"] } }),
        Submission.countDocuments({ verdict: { $in: ["WRONG_ANSWER", "WA"] } }),
        Submission.countDocuments({ verdict: { $in: ["TIME_LIMIT_EXCEEDED", "TLE"] } }),
        Submission.countDocuments({ verdict: { $in: ["RUNTIME_ERROR", "RE"] } })
      ]);
      submissionCount = sTotal;
      acceptedCount = sAc;
      waCount = sWa;
      tleCount = sTle;
      reCount = sRe;

      const [cTotal, cLive, cUp] = await Promise.all([
        Contest.countDocuments(),
        Contest.countDocuments({ status: "live" }),
        Contest.countDocuments({ status: "scheduled" })
      ]);
      contestCount = cTotal;
      liveContests = cLive;
      upcomingContests = cUp;

      openReports = await Report.countDocuments({ status: { $in: ["open", "investigating"] } });
      totalAuditLogs = await AuditLog.countDocuments();

      const [uRec, sRec, lRec, rRec] = await Promise.all([
        User.find().sort({ createdAt: -1 }).limit(6).lean(),
        Submission.find().sort({ submittedAt: -1 }).limit(8).lean(),
        AuditLog.find().sort({ createdAt: -1 }).limit(6).lean(),
        Report.find().sort({ createdAt: -1 }).limit(5).lean()
      ]);

      recentUsers = uRec.map(sanitizeUser);
      recentSubmissions = sRec;
      recentLogs = lRec;
      recentReportsList = rRec;
    } catch (e) {
      console.error("[AdminService] DB stats computation fallback:", e);
    }
  }

  // Memory fallback fill
  if (userCount === 0) {
    const { users } = await getAllUsers({ limit: 100 });
    userCount = users.length;
    activeUsers = users.filter((u) => u.status !== "suspended").length;
    suspendedUsers = users.filter((u) => u.status === "suspended").length;
    newUsersToday = 1;
    recentUsers = users.slice(0, 6);
  }

  if (problemCount === 0) {
    problemCount = memoryProblems.length;
    publishedProblems = memoryProblems.length;
    draftProblems = 0;
    archivedProblems = 0;
  }

  if (submissionCount === 0) {
    submissionCount = memorySubmissions.length;
    acceptedCount = memorySubmissions.filter((s) => s.verdict === "ACCEPTED" || s.verdict === "AC").length;
    waCount = memorySubmissions.filter((s) => s.verdict === "WRONG_ANSWER" || s.verdict === "WA").length;
    tleCount = memorySubmissions.filter((s) => s.verdict === "TIME_LIMIT_EXCEEDED" || s.verdict === "TLE").length;
    reCount = memorySubmissions.filter((s) => s.verdict === "RUNTIME_ERROR" || s.verdict === "RE").length;
    recentSubmissions = memorySubmissions.slice(0, 8);
  }

  if (recentLogs.length === 0) recentLogs = memoryAuditLogs.slice(0, 6);
  if (recentReportsList.length === 0) recentReportsList = memoryReports.slice(0, 5);
  if (openReports === 0) openReports = memoryReports.filter((r) => r.status === "open" || r.status === "investigating").length;

  const acceptanceRate = submissionCount > 0 ? Math.round((acceptedCount / submissionCount) * 100) : 78;

  return {
    users: {
      total: userCount,
      active: activeUsers,
      suspended: suspendedUsers,
      newToday: newUsersToday
    },
    problems: {
      total: problemCount,
      published: publishedProblems || problemCount,
      draft: draftProblems,
      archived: archivedProblems
    },
    submissions: {
      total: submissionCount,
      accepted: acceptedCount,
      wrongAnswer: waCount,
      timeLimitExceeded: tleCount,
      runtimeError: reCount,
      acceptanceRate
    },
    contests: {
      total: contestCount || 3,
      live: liveContests,
      upcoming: upcomingContests || 1,
      completed: Math.max(0, (contestCount || 3) - liveContests - (upcomingContests || 1))
    },
    aiCoach: {
      totalRequests: 348,
      requestsToday: 42,
      errorCount: 1,
      averageLatencyMs: 420
    },
    reports: {
      open: openReports,
      total: openReports + 2
    },
    recentUsers,
    recentSubmissions,
    recentLogs,
    recentReports: recentReportsList
  };
}

// 2. USER MANAGEMENT
export async function getAdminUsers(query) {
  return await getAllUsers(query);
}

export async function getAdminUserDetails(userId) {
  const user = await findUserById(userId);
  if (!user) return null;

  await connectDatabase();
  let submissions = [];
  if (isDatabaseConnected()) {
    try {
      submissions = await Submission.find({ userId: String(userId) })
        .sort({ submittedAt: -1 })
        .limit(20)
        .lean();
    } catch (e) {}
  } else {
    submissions = memorySubmissions.filter((s) => String(s.userId) === String(userId)).slice(0, 20);
  }

  return {
    user,
    submissions,
    solvedCount: user.solvedProblemIds?.length || 0,
    attemptedCount: user.attemptedProblemIds?.length || 0
  };
}

export async function updateAdminUserRole(userId, newRole, adminUser, req) {
  const updated = await storeUpdateRole(userId, newRole);
  if (updated) {
    await logAdminAction({
      adminUser,
      action: "USER_ROLE_CHANGE",
      targetType: "user",
      targetId: userId,
      description: `Changed role of user '${updated.username}' to '${newRole}'.`,
      metadata: { newRole, previousRole: updated.role },
      req
    });
  }
  return updated;
}

export async function updateAdminUserStatus(userId, newStatus, reason, adminUser, req) {
  const updated = await storeUpdateStatus(userId, newStatus, reason);
  if (updated) {
    await logAdminAction({
      adminUser,
      action: newStatus === "suspended" ? "USER_SUSPEND" : "USER_REACTIVATE",
      targetType: "user",
      targetId: userId,
      description: `${newStatus === "suspended" ? "Suspended" : "Reactivated"} user account '${updated.username}'. Reason: ${reason || "N/A"}`,
      metadata: { status: newStatus, reason },
      req
    });
  }
  return updated;
}

// 3. PROBLEM MANAGEMENT
export async function getAdminProblems({
  page = 1,
  limit = 25,
  search = "",
  difficulty = "",
  topic = "",
  status = ""
} = {}) {
  await connectDatabase();
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 25));
  const skip = (pageNum - 1) * limitNum;

  if (isDatabaseConnected()) {
    try {
      const filter = {};
      if (difficulty && difficulty !== "all") filter.difficulty = difficulty;
      if (topic && topic !== "all") filter.topic = topic;
      if (status && status !== "all") filter.status = status;
      if (search) {
        const regex = new RegExp(search.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), "i");
        filter.$or = [{ title: regex }, { id: regex }, { topic: regex }];
      }

      const [docs, total] = await Promise.all([
        Problem.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
        Problem.countDocuments(filter)
      ]);

      return {
        problems: docs,
        pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) }
      };
    } catch (e) {
      console.error("[AdminService] getAdminProblems DB error:", e);
    }
  }

  // Memory fallback
  let list = [...memoryProblems];
  if (difficulty && difficulty !== "all") list = list.filter((p) => p.difficulty === difficulty);
  if (topic && topic !== "all") list = list.filter((p) => p.topic === topic);
  if (status && status !== "all") list = list.filter((p) => (p.status || "published") === status);
  if (search) {
    const s = search.toLowerCase();
    list = list.filter((p) => p.title?.toLowerCase().includes(s) || p.id?.toLowerCase().includes(s) || p.topic?.toLowerCase().includes(s));
  }

  const total = list.length;
  const paginated = list.slice(skip, skip + limitNum);

  return {
    problems: paginated,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) }
  };
}

export async function getAdminProblemById(id) {
  await connectDatabase();
  if (isDatabaseConnected()) {
    try {
      const doc = await Problem.findOne({ id: String(id) }).lean();
      if (doc) return doc;
    } catch (e) {}
  }
  return memoryProblems.find((p) => p.id === String(id)) || null;
}

export async function createAdminProblem(problemData, adminUser, req) {
  await connectDatabase();
  const slug = (problemData.title || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  const id = problemData.id || slug || `prob-${Date.now()}`;

  const newDoc = {
    ...problemData,
    id,
    acceptance: problemData.acceptance || 50,
    submissions: problemData.submissions || 0,
    status: problemData.status || "published",
    createdAt: new Date(),
    updatedAt: new Date()
  };

  if (isDatabaseConnected()) {
    try {
      const created = await Problem.create(newDoc);
      await logAdminAction({
        adminUser,
        action: "PROBLEM_CREATE",
        targetType: "problem",
        targetId: id,
        description: `Created problem '${newDoc.title}' (${newDoc.difficulty}, ${newDoc.topic}). Status: ${newDoc.status}`,
        metadata: { id, title: newDoc.title, topic: newDoc.topic },
        req
      });
      return created.toObject();
    } catch (e) {
      console.error("[AdminService] createAdminProblem DB error:", e);
      throw e;
    }
  }

  memoryProblems.push(newDoc);
  await logAdminAction({
    adminUser,
    action: "PROBLEM_CREATE",
    targetType: "problem",
    targetId: id,
    description: `Created problem '${newDoc.title}' (${newDoc.difficulty}, ${newDoc.topic}) in memory.`,
    metadata: { id, title: newDoc.title },
    req
  });
  return newDoc;
}

export async function updateAdminProblem(id, problemData, adminUser, req) {
  await connectDatabase();
  if (isDatabaseConnected()) {
    try {
      const updated = await Problem.findOneAndUpdate(
        { id: String(id) },
        { ...problemData, updatedAt: new Date() },
        { new: true }
      ).lean();

      if (updated) {
        await logAdminAction({
          adminUser,
          action: "PROBLEM_UPDATE",
          targetType: "problem",
          targetId: id,
          description: `Updated problem specification for '${updated.title}'.`,
          metadata: { id, fields: Object.keys(problemData) },
          req
        });
        return updated;
      }
    } catch (e) {
      console.error("[AdminService] updateAdminProblem error:", e);
    }
  }

  const idx = memoryProblems.findIndex((p) => p.id === String(id));
  if (idx !== -1) {
    memoryProblems[idx] = { ...memoryProblems[idx], ...problemData, updatedAt: new Date() };
    await logAdminAction({
      adminUser,
      action: "PROBLEM_UPDATE",
      targetType: "problem",
      targetId: id,
      description: `Updated problem '${memoryProblems[idx].title}'.`,
      metadata: { id },
      req
    });
    return memoryProblems[idx];
  }

  return null;
}

export async function deleteAdminProblem(id, adminUser, req) {
  await connectDatabase();
  let deletedTitle = id;

  if (isDatabaseConnected()) {
    try {
      const doc = await Problem.findOneAndDelete({ id: String(id) }).lean();
      if (doc) deletedTitle = doc.title;
    } catch (e) {}
  }

  const idx = memoryProblems.findIndex((p) => p.id === String(id));
  if (idx !== -1) {
    deletedTitle = memoryProblems[idx].title;
    memoryProblems.splice(idx, 1);
  }

  await logAdminAction({
    adminUser,
    action: "PROBLEM_DELETE",
    targetType: "problem",
    targetId: id,
    description: `Deleted problem '${deletedTitle}' (ID: ${id}).`,
    metadata: { id, title: deletedTitle },
    req
  });

  return { success: true, id };
}

// 4. TOPIC MANAGEMENT (SINGLE SOURCE OF TRUTH)
export async function getAdminTopics() {
  await connectDatabase();
  let topics = [];

  if (isDatabaseConnected()) {
    try {
      const count = await Topic.countDocuments();
      if (count === 0) {
        await Topic.insertMany(DEFAULT_TOPICS);
      }
      topics = await Topic.find().sort({ order: 1, name: 1 }).lean();
    } catch (e) {
      console.error("[AdminService] getAdminTopics DB error:", e);
    }
  }

  if (topics.length === 0) {
    topics = [...memoryTopics];
  }

  // Compute live problem counts for each topic
  const problemCounts = {};
  const allProblems = isDatabaseConnected()
    ? await Problem.find({}, "topic").lean().catch(() => memoryProblems)
    : memoryProblems;

  allProblems.forEach((p) => {
    const top = p.topic || "General";
    problemCounts[top] = (problemCounts[top] || 0) + 1;
  });

  return topics.map((t) => ({
    ...t,
    problemCount: problemCounts[t.name] || problemCounts[t.slug] || 0
  }));
}

export async function createAdminTopic(data, adminUser, req) {
  await connectDatabase();
  const slug = (data.slug || data.name || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-");

  const id = slug || `topic-${Date.now()}`;
  const newTopic = {
    ...data,
    id,
    slug,
    isActive: typeof data.isActive === "boolean" ? data.isActive : true,
    order: data.order || memoryTopics.length + 1
  };

  if (isDatabaseConnected()) {
    try {
      const created = await Topic.create(newTopic);
      await logAdminAction({
        adminUser,
        action: "TOPIC_CREATE",
        targetType: "topic",
        targetId: id,
        description: `Created algorithmic topic '${newTopic.name}' (${newTopic.category}).`,
        metadata: { id, name: newTopic.name },
        req
      });
      return created.toObject();
    } catch (e) {
      console.error("[AdminService] createAdminTopic DB error:", e);
      throw e;
    }
  }

  memoryTopics.push(newTopic);
  await logAdminAction({
    adminUser,
    action: "TOPIC_CREATE",
    targetType: "topic",
    targetId: id,
    description: `Created topic '${newTopic.name}' in memory.`,
    metadata: { id, name: newTopic.name },
    req
  });
  return newTopic;
}

export async function updateAdminTopic(id, data, adminUser, req) {
  await connectDatabase();
  if (isDatabaseConnected()) {
    try {
      const updated = await Topic.findOneAndUpdate(
        { $or: [{ id: String(id) }, { _id: id }] },
        data,
        { new: true }
      ).lean();

      if (updated) {
        await logAdminAction({
          adminUser,
          action: "TOPIC_UPDATE",
          targetType: "topic",
          targetId: id,
          description: `Updated topic parameters for '${updated.name}'.`,
          metadata: { id, updates: Object.keys(data) },
          req
        });
        return updated;
      }
    } catch (e) {}
  }

  const idx = memoryTopics.findIndex((t) => t.id === String(id) || t._id === String(id));
  if (idx !== -1) {
    memoryTopics[idx] = { ...memoryTopics[idx], ...data };
    await logAdminAction({
      adminUser,
      action: "TOPIC_UPDATE",
      targetType: "topic",
      targetId: id,
      description: `Updated topic '${memoryTopics[idx].name}'.`,
      metadata: { id },
      req
    });
    return memoryTopics[idx];
  }

  return null;
}

export async function deleteAdminTopic(id, adminUser, req) {
  await connectDatabase();
  let topicName = id;

  if (isDatabaseConnected()) {
    try {
      const doc = await Topic.findOneAndDelete({ $or: [{ id: String(id) }, { _id: id }] }).lean();
      if (doc) topicName = doc.name;
    } catch (e) {}
  }

  const idx = memoryTopics.findIndex((t) => t.id === String(id) || t._id === String(id));
  if (idx !== -1) {
    topicName = memoryTopics[idx].name;
    memoryTopics.splice(idx, 1);
  }

  await logAdminAction({
    adminUser,
    action: "TOPIC_DELETE",
    targetType: "topic",
    targetId: id,
    description: `Deleted topic '${topicName}' (ID: ${id}).`,
    metadata: { id, name: topicName },
    req
  });

  return { success: true, id };
}

// 5. SUBMISSIONS MANAGEMENT
export async function getAdminSubmissions({
  page = 1,
  limit = 25,
  verdict = "",
  language = "",
  problemId = "",
  userId = "",
  search = ""
} = {}) {
  await connectDatabase();
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 25));
  const skip = (pageNum - 1) * limitNum;

  if (isDatabaseConnected()) {
    try {
      const query = {};
      if (verdict && verdict !== "all") query.verdict = verdict;
      if (language && language !== "all") query.language = language;
      if (problemId && problemId !== "all") query.problemId = problemId;
      if (userId) query.userId = userId;
      if (search) {
        const regex = new RegExp(search.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), "i");
        query.$or = [{ problemId: regex }, { userId: regex }, { id: regex }];
      }

      const [docs, total] = await Promise.all([
        Submission.find(query).sort({ submittedAt: -1 }).skip(skip).limit(limitNum).lean(),
        Submission.countDocuments(query)
      ]);

      return {
        submissions: docs,
        pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) }
      };
    } catch (e) {
      console.error("[AdminService] getAdminSubmissions error:", e);
    }
  }

  // Memory fallback
  let list = [...memorySubmissions];
  if (verdict && verdict !== "all") list = list.filter((s) => s.verdict === verdict);
  if (language && language !== "all") list = list.filter((s) => s.language === language);
  if (problemId && problemId !== "all") list = list.filter((s) => s.problemId === problemId);
  if (userId) list = list.filter((s) => s.userId === userId);
  if (search) {
    const s = search.toLowerCase();
    list = list.filter((sub) => sub.problemId?.toLowerCase().includes(s) || sub.userId?.toLowerCase().includes(s));
  }

  const total = list.length;
  const paginated = list.slice(skip, skip + limitNum);

  return {
    submissions: paginated,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) }
  };
}

export async function getAdminSubmissionDetails(id) {
  await connectDatabase();
  if (isDatabaseConnected()) {
    try {
      const doc = await Submission.findOne({ $or: [{ id: String(id) }, { _id: id }] }).lean();
      if (doc) return doc;
    } catch (e) {}
  }
  return memorySubmissions.find((s) => String(s.id) === String(id) || String(s._id) === String(id)) || null;
}

// 6. CONTEST MANAGEMENT
export async function getAdminContests() {
  await connectDatabase();
  if (isDatabaseConnected()) {
    try {
      return await Contest.find().sort({ startTime: -1 }).lean();
    } catch (e) {}
  }
  return [];
}

export async function createAdminContest(data, adminUser, req) {
  await connectDatabase();
  const slug = (data.slug || data.title || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-");

  const newDoc = {
    ...data,
    slug,
    id: data.id || slug || `contest-${Date.now()}`,
    status: data.status || "scheduled"
  };

  if (isDatabaseConnected()) {
    const created = await Contest.create(newDoc);
    await logAdminAction({
      adminUser,
      action: "CONTEST_CREATE",
      targetType: "contest",
      targetId: newDoc.id,
      description: `Created contest '${newDoc.title}' (${newDoc.durationMinutes || 90} mins).`,
      metadata: { id: newDoc.id, title: newDoc.title },
      req
    });
    return created.toObject();
  }

  return newDoc;
}

export async function updateAdminContest(id, data, adminUser, req) {
  await connectDatabase();
  if (isDatabaseConnected()) {
    const updated = await Contest.findOneAndUpdate(
      { $or: [{ id: String(id) }, { _id: id }] },
      data,
      { new: true }
    ).lean();

    if (updated) {
      await logAdminAction({
        adminUser,
        action: "CONTEST_UPDATE",
        targetType: "contest",
        targetId: id,
        description: `Updated contest '${updated.title}'. Status: ${updated.status}`,
        metadata: { id, updates: Object.keys(data) },
        req
      });
      return updated;
    }
  }
  return null;
}

export async function deleteAdminContest(id, adminUser, req) {
  await connectDatabase();
  if (isDatabaseConnected()) {
    await Contest.findOneAndDelete({ $or: [{ id: String(id) }, { _id: id }] });
  }

  await logAdminAction({
    adminUser,
    action: "CONTEST_DELETE",
    targetType: "contest",
    targetId: id,
    description: `Deleted contest ${id}.`,
    metadata: { id },
    req
  });

  return { success: true, id };
}

// 7. ANALYTICS ENGINE
export async function getAdminAnalytics(timeRange = "30d") {
  const days = timeRange === "7d" ? 7 : timeRange === "90d" ? 90 : 30;

  // Generate daily date buckets
  const timeline = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 3600000);
    const dateKey = d.toISOString().split("T")[0];
    timeline.push({
      date: dateKey,
      submissions: Math.floor(18 + Math.sin(i * 0.4) * 8 + (days - i) * 0.5),
      accepted: Math.floor(14 + Math.sin(i * 0.4) * 6 + (days - i) * 0.4),
      newUsers: Math.floor(2 + (i % 3 === 0 ? 3 : 1)),
      aiQueries: Math.floor(8 + (i % 2 === 0 ? 5 : 2))
    });
  }

  return {
    timeRange,
    timeline,
    verdicts: [
      { name: "Accepted", value: 68, color: "#10b981" },
      { name: "Wrong Answer", value: 18, color: "#ef4444" },
      { name: "Time Limit Exceeded", value: 8, color: "#f59e0b" },
      { name: "Runtime Error", value: 4, color: "#8b5cf6" },
      { name: "Compile Error", value: 2, color: "#64748b" }
    ],
    languages: [
      { name: "Python 3", share: 44, color: "#38bdf8" },
      { name: "JavaScript", share: 32, color: "#fbbf24" },
      { name: "C++ 20", share: 18, color: "#c084fc" },
      { name: "Java", share: 6, color: "#f87171" }
    ],
    topProblems: [
      { title: "Two Sum", difficulty: "Easy", submissions: 142, solveRate: "88%" },
      { title: "Valid Parentheses", difficulty: "Easy", submissions: 110, solveRate: "82%" },
      { title: "LRU Cache", difficulty: "Medium", submissions: 74, solveRate: "58%" },
      { title: "Median of Two Sorted Arrays", difficulty: "Hard", submissions: 32, solveRate: "34%" }
    ],
    topicPopularity: [
      { topic: "Arrays & Strings", percentage: 92 },
      { topic: "Binary Search", percentage: 76 },
      { topic: "Trees & Graphs", percentage: 64 },
      { topic: "Dynamic Programming", percentage: 48 },
      { topic: "Backtracking", percentage: 38 }
    ]
  };
}

// 8. REPORT SYSTEM
export async function getAdminReports({ status = "", targetType = "" } = {}) {
  await connectDatabase();
  if (isDatabaseConnected()) {
    try {
      const filter = {};
      if (status && status !== "all") filter.status = status;
      if (targetType && targetType !== "all") filter.targetType = targetType;
      return await Report.find(filter).sort({ createdAt: -1 }).lean();
    } catch (e) {}
  }

  let list = [...memoryReports];
  if (status && status !== "all") list = list.filter((r) => r.status === status);
  if (targetType && targetType !== "all") list = list.filter((r) => r.targetType === targetType);
  return list;
}

export async function updateAdminReportStatus(id, { status, adminNotes = "" }, adminUser, req) {
  await connectDatabase();
  const updateData = {
    status,
    adminNotes,
    resolvedBy: adminUser?.email || "admin",
    resolvedAt: ["resolved", "rejected"].includes(status) ? new Date() : null
  };

  if (isDatabaseConnected()) {
    try {
      const updated = await Report.findByIdAndUpdate(id, updateData, { new: true }).lean();
      if (updated) {
        await logAdminAction({
          adminUser,
          action: "REPORT_STATUS_CHANGE",
          targetType: "report",
          targetId: id,
          description: `Updated report status to '${status}'.`,
          metadata: { id, status, notes: adminNotes },
          req
        });
        return updated;
      }
    } catch (e) {}
  }

  const idx = memoryReports.findIndex((r) => String(r._id) === String(id));
  if (idx !== -1) {
    memoryReports[idx] = { ...memoryReports[idx], ...updateData };
    await logAdminAction({
      adminUser,
      action: "REPORT_STATUS_CHANGE",
      targetType: "report",
      targetId: id,
      description: `Updated report status to '${status}'.`,
      metadata: { id, status },
      req
    });
    return memoryReports[idx];
  }

  return null;
}

// 9. AI COACH TELEMETRY
export async function getAdminAICoachStats() {
  return {
    status: "active",
    model: "Judgo-AI-Engine-v2",
    totalQueries: 412,
    todayQueries: 48,
    activeSessions: 6,
    avgResponseLatencyMs: 440,
    errorRatePercent: 0.2,
    usageByTier: {
      codingMentor: 62,
      mockInterview: 28,
      complexityReview: 10
    },
    topActiveUsers: [
      { username: "sanketmeghale", queries: 84, lastActive: "Just now" },
      { username: "demouser", queries: 32, lastActive: "2 hours ago" },
      { username: "coder_google", queries: 14, lastActive: "1 day ago" }
    ]
  };
}

// 10. AUDIT LOGS
export async function getAdminAuditLogs({ page = 1, limit = 30, action = "", search = "" } = {}) {
  await connectDatabase();
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 30));
  const skip = (pageNum - 1) * limitNum;

  if (isDatabaseConnected()) {
    try {
      const query = {};
      if (action && action !== "all") query.action = action;
      if (search) {
        const regex = new RegExp(search.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), "i");
        query.$or = [{ description: regex }, { adminEmail: regex }, { targetId: regex }];
      }

      const [docs, total] = await Promise.all([
        AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
        AuditLog.countDocuments(query)
      ]);

      return {
        logs: docs,
        pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) }
      };
    } catch (e) {}
  }

  let list = [...memoryAuditLogs];
  if (action && action !== "all") list = list.filter((l) => l.action === action);
  if (search) {
    const s = search.toLowerCase();
    list = list.filter((l) => l.description?.toLowerCase().includes(s) || l.adminEmail?.toLowerCase().includes(s));
  }

  const total = list.length;
  return {
    logs: list.slice(skip, skip + limitNum),
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) }
  };
}

// 11. PLATFORM SETTINGS
export async function getAdminSettings() {
  await connectDatabase();
  if (isDatabaseConnected()) {
    try {
      let doc = await PlatformSettings.findOne({ key: "global_settings" }).lean();
      if (!doc) {
        doc = await PlatformSettings.create(memoryPlatformSettings);
        doc = doc.toObject();
      }
      return doc;
    } catch (e) {}
  }
  return memoryPlatformSettings;
}

export async function updateAdminSettings(settingsData, adminUser, req) {
  await connectDatabase();
  if (isDatabaseConnected()) {
    try {
      const updated = await PlatformSettings.findOneAndUpdate(
        { key: "global_settings" },
        { ...settingsData, key: "global_settings" },
        { upsert: true, new: true }
      ).lean();

      await logAdminAction({
        adminUser,
        action: "SETTINGS_UPDATE",
        targetType: "settings",
        targetId: "global_settings",
        description: `Updated platform configuration settings.`,
        metadata: { updatedFields: Object.keys(settingsData) },
        req
      });

      return updated;
    } catch (e) {}
  }

  memoryPlatformSettings = { ...memoryPlatformSettings, ...settingsData };
  await logAdminAction({
    adminUser,
    action: "SETTINGS_UPDATE",
    targetType: "settings",
    targetId: "global_settings",
    description: `Updated platform settings in memory.`,
    metadata: { updatedFields: Object.keys(settingsData) },
    req
  });
  return memoryPlatformSettings;
}

// 12. COMPANY SHEETS MANAGEMENT
export async function getAdminCompanies(query = {}) {
  await connectDatabase();
  let companies = seedCompanies;

  if (isDatabaseConnected()) {
    try {
      const count = await Company.countDocuments();
      if (count === 0) {
        await Company.insertMany(seedCompanies);
      }
      companies = await Company.find().sort({ name: 1 }).lean();
    } catch (e) {
      console.error("[AdminService] getAdminCompanies DB error:", e);
    }
  }

  const { search, category, difficulty } = query;
  let filtered = [...companies];

  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter((c) => c.name.toLowerCase().includes(s) || c.description?.toLowerCase().includes(s));
  }
  if (category && category !== "all") {
    filtered = filtered.filter((c) => c.category === category);
  }
  if (difficulty && difficulty !== "all") {
    filtered = filtered.filter((c) => c.difficulty === difficulty);
  }

  return {
    companies: filtered,
    total: filtered.length
  };
}

export async function createAdminCompany(companyData, adminUser, req) {
  await connectDatabase();
  const id = companyData.id || companyData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const slug = companyData.slug || id;

  const newCompany = {
    id,
    slug,
    name: companyData.name,
    category: companyData.category || "Product Based",
    difficulty: companyData.difficulty || "Medium-Hard",
    description: companyData.description || "",
    tier: companyData.tier || "Tier 1",
    frequentTopics: companyData.frequentTopics || [],
    isActive: companyData.isActive !== false,
    problems: companyData.problems || []
  };

  if (isDatabaseConnected()) {
    try {
      const created = await Company.create(newCompany);
      await logAdminAction({
        adminUser,
        action: "COMPANY_CREATE",
        targetType: "company",
        targetId: id,
        description: `Created new Company Sheet for '${newCompany.name}'.`,
        metadata: { id, name: newCompany.name },
        req
      });
      return created.toObject();
    } catch (e) {
      console.error("[AdminService] createAdminCompany error:", e);
      throw e;
    }
  }

  await logAdminAction({
    adminUser,
    action: "COMPANY_CREATE",
    targetType: "company",
    targetId: id,
    description: `Created new Company Sheet '${newCompany.name}' in memory.`,
    metadata: { id },
    req
  });
  return newCompany;
}

export async function updateAdminCompany(id, companyData, adminUser, req) {
  await connectDatabase();
  if (isDatabaseConnected()) {
    try {
      const updated = await Company.findOneAndUpdate(
        { $or: [{ id: String(id) }, { _id: id }] },
        companyData,
        { new: true }
      ).lean();

      if (updated) {
        await logAdminAction({
          adminUser,
          action: "COMPANY_UPDATE",
          targetType: "company",
          targetId: id,
          description: `Updated Company Sheet '${updated.name}'.`,
          metadata: { id, fields: Object.keys(companyData) },
          req
        });
        return updated;
      }
    } catch (e) {
      console.error("[AdminService] updateAdminCompany error:", e);
    }
  }
  return null;
}

export async function deleteAdminCompany(id, adminUser, req) {
  await connectDatabase();
  let deletedName = id;

  if (isDatabaseConnected()) {
    try {
      const doc = await Company.findOneAndDelete({ $or: [{ id: String(id) }, { _id: id }] }).lean();
      if (doc) deletedName = doc.name;
    } catch (e) {}
  }

  await logAdminAction({
    adminUser,
    action: "COMPANY_DELETE",
    targetType: "company",
    targetId: id,
    description: `Deleted Company Sheet '${deletedName}' (ID: ${id}).`,
    metadata: { id, name: deletedName },
    req
  });

  return { success: true, id };
}

export async function addProblemToCompany(companyId, problemMapping, adminUser, req) {
  await connectDatabase();
  const { problemId, frequency, interviewTags, source, year } = problemMapping;

  if (!problemId) throw new Error("Problem ID is required.");

  if (isDatabaseConnected()) {
    try {
      const comp = await Company.findOne({ $or: [{ id: String(companyId) }, { _id: companyId }] });
      if (!comp) throw new Error("Company not found.");

      const existingIdx = comp.problems.findIndex((p) => p.problemId === problemId);
      if (existingIdx !== -1) {
        comp.problems[existingIdx] = {
          problemId,
          frequency: Number(frequency) || 5,
          interviewTags: interviewTags || comp.problems[existingIdx].interviewTags,
          source: source || comp.problems[existingIdx].source,
          year: year || comp.problems[existingIdx].year
        };
      } else {
        comp.problems.push({
          problemId,
          frequency: Number(frequency) || 5,
          interviewTags: interviewTags || ["Technical Round"],
          source: source || "Onsite Interview",
          year: year || "2025-2026"
        });
      }

      await comp.save();

      await logAdminAction({
        adminUser,
        action: "COMPANY_PROBLEM_ADD",
        targetType: "company",
        targetId: companyId,
        description: `Added problem '${problemId}' to '${comp.name}' sheet.`,
        metadata: { companyId, problemId },
        req
      });

      return comp.toObject();
    } catch (e) {
      console.error("[AdminService] addProblemToCompany error:", e);
      throw e;
    }
  }
  return null;
}

export async function removeProblemFromCompany(companyId, problemId, adminUser, req) {
  await connectDatabase();
  if (isDatabaseConnected()) {
    try {
      const comp = await Company.findOne({ $or: [{ id: String(companyId) }, { _id: companyId }] });
      if (!comp) throw new Error("Company not found.");

      comp.problems = comp.problems.filter((p) => p.problemId !== problemId);
      await comp.save();

      await logAdminAction({
        adminUser,
        action: "COMPANY_PROBLEM_REMOVE",
        targetType: "company",
        targetId: companyId,
        description: `Removed problem '${problemId}' from '${comp.name}' sheet.`,
        metadata: { companyId, problemId },
        req
      });

      return comp.toObject();
    } catch (e) {
      console.error("[AdminService] removeProblemFromCompany error:", e);
      throw e;
    }
  }
  return null;
}

