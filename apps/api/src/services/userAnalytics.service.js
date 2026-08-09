import { connectDatabase, isDatabaseConnected } from "../lib/db.js";
import { Submission } from "../models/Submission.js";
import { Problem } from "../models/Problem.js";
import { User } from "../models/User.js";
import { problems as seedProblems } from "../data/problems.js";
import { listSubmissionRecords } from "../lib/submissionStore.js";
import { calculateUserStreak, formatDateKey } from "../lib/streakEngine.js";

/**
 * Normalizes all platform problems from DB or seeds
 */
export async function getAllPlatformProblems() {
  await connectDatabase();
  if (isDatabaseConnected()) {
    try {
      const dbProblems = await Problem.find().lean();
      if (dbProblems && dbProblems.length > 0) {
        return dbProblems;
      }
    } catch (e) {
      console.warn("[UserAnalytics] Problem.find fallback:", e.message);
    }
  }
  return seedProblems;
}

/**
 * Fetches all submissions for a user from DB or store
 */
export async function getUserSubmissions(userId) {
  if (!userId) return [];
  await connectDatabase();

  if (isDatabaseConnected()) {
    try {
      const dbSubs = await Submission.find({
        $or: [{ userId: String(userId) }, { userId: userId }]
      })
        .sort({ submittedAt: -1, createdAt: -1 })
        .lean();

      if (dbSubs && dbSubs.length > 0) {
        return dbSubs;
      }
    } catch (e) {
      console.warn("[UserAnalytics] Submission.find fallback:", e.message);
    }
  }

  const memSubs = listSubmissionRecords(userId);
  return memSubs || [];
}

/**
 * Computes deep topic performance analytics and mastery metrics
 */
export async function computeUserTopicAnalytics(userId) {
  const allProblems = await getAllPlatformProblems();
  const userSubmissions = await getUserSubmissions(userId);

  // Map problems by ID
  const problemMap = new Map();
  const topicTotalMap = new Map();

  for (const p of allProblems) {
    problemMap.set(p.id, p);
    const t = p.topic || "General Algorithms";
    topicTotalMap.set(t, (topicTotalMap.get(t) || 0) + 1);
  }

  // Topic metrics accumulator
  const topicStatsMap = new Map();

  // Initialize all known topics
  for (const [topic, totalCount] of topicTotalMap.entries()) {
    topicStatsMap.set(topic, {
      topic,
      totalSubmissions: 0,
      acceptedSubmissions: 0,
      waCount: 0,
      reCount: 0,
      tleCount: 0,
      ceCount: 0,
      attemptedProblemIds: new Set(),
      solvedProblemIds: new Set(),
      totalInTopic: totalCount,
      recentFailures: 0
    });
  }

  // Aggregate user submissions
  const allSolvedSet = new Set();
  const allAttemptedSet = new Set();

  for (const sub of userSubmissions) {
    const pId = sub.problemId || sub.problem;
    const problem = problemMap.get(pId);
    const topic = problem?.topic || "General Algorithms";

    allAttemptedSet.add(pId);

    let stat = topicStatsMap.get(topic);
    if (!stat) {
      stat = {
        topic,
        totalSubmissions: 0,
        acceptedSubmissions: 0,
        waCount: 0,
        reCount: 0,
        tleCount: 0,
        ceCount: 0,
        attemptedProblemIds: new Set(),
        solvedProblemIds: new Set(),
        totalInTopic: topicTotalMap.get(topic) || 1,
        recentFailures: 0
      };
      topicStatsMap.set(topic, stat);
    }

    stat.totalSubmissions++;
    stat.attemptedProblemIds.add(pId);

    const isAc = sub.verdict === "AC" || sub.verdict === "OK" || sub.verdict === "Accepted";
    if (isAc) {
      stat.acceptedSubmissions++;
      stat.solvedProblemIds.add(pId);
      allSolvedSet.add(pId);
    } else {
      if (sub.verdict === "WA" || sub.verdict === "Wrong Answer") stat.waCount++;
      else if (sub.verdict === "RE" || sub.verdict === "Runtime Error") stat.reCount++;
      else if (sub.verdict === "TLE" || sub.verdict === "Time Limit Exceeded") stat.tleCount++;
      else if (sub.verdict === "CE" || sub.verdict === "Compilation Error") stat.ceCount++;
      stat.recentFailures++;
    }
  }

  // Calculate final percentage and mastery tier
  const topicList = [];

  for (const [topic, s] of topicStatsMap.entries()) {
    const accuracy =
      s.totalSubmissions > 0
        ? Math.round((s.acceptedSubmissions / s.totalSubmissions) * 100)
        : 0;

    const attemptedCount = s.attemptedProblemIds.size;
    const solvedCount = s.solvedProblemIds.size;

    let tier = "Unattempted";
    if (attemptedCount > 0) {
      if (accuracy < 60 || (s.recentFailures > 2 && solvedCount < attemptedCount)) {
        tier = "Weak";
      } else if (accuracy >= 80 && solvedCount >= 1) {
        tier = "Mastered";
      } else {
        tier = "Developing";
      }
    }

    topicList.push({
      topic,
      accuracy,
      totalSubmissions: s.totalSubmissions,
      acceptedSubmissions: s.acceptedSubmissions,
      waCount: s.waCount,
      reCount: s.reCount,
      tleCount: s.tleCount,
      attemptedCount,
      solvedCount,
      totalInTopic: s.totalInTopic,
      tier
    });
  }

  // Filter weak topics (lowest accuracy among attempted, or default prioritized unattempted)
  const weakTopics = topicList
    .filter((t) => t.attemptedCount > 0 && t.tier === "Weak")
    .sort((a, b) => a.accuracy - b.accuracy);

  // If user has few weak topics recorded, append unattempted core tracks
  if (weakTopics.length < 3) {
    const unattempted = topicList
      .filter((t) => t.attemptedCount === 0)
      .slice(0, 3 - weakTopics.length);
    weakTopics.push(...unattempted);
  }

  const strongTopics = topicList
    .filter((t) => t.solvedCount > 0 && (t.tier === "Mastered" || t.tier === "Developing"))
    .sort((a, b) => b.accuracy - a.accuracy);

  return {
    topics: topicList,
    weakTopics,
    strongTopics,
    solvedProblemIds: Array.from(allSolvedSet),
    attemptedProblemIds: Array.from(allAttemptedSet)
  };
}

/**
 * Dynamically selects Today's Focus problem based on user history and calculates actual progress
 */
export async function getTodaysFocus(userId) {
  const allProblems = await getAllPlatformProblems();
  const analytics = await computeUserTopicAnalytics(userId);
  const userSubmissions = await getUserSubmissions(userId);

  const solvedSet = new Set(analytics.solvedProblemIds);
  const attemptedSet = new Set(analytics.attemptedProblemIds);

  // 1. Identify priority target topics (weakest first)
  const priorityTopics = analytics.weakTopics.map((w) => w.topic);
  if (priorityTopics.length === 0) {
    priorityTopics.push("Dynamic Programming", "Graphs", "Trees", "Sliding Window", "Arrays");
  }

  // 2. Find ideal unsolved problem
  let focusProblem = null;

  // Search in weak topics first
  for (const t of priorityTopics) {
    const candidate = allProblems.find(
      (p) => p.topic === t && !solvedSet.has(p.id)
    );
    if (candidate) {
      focusProblem = candidate;
      break;
    }
  }

  // Fallback: search any unsolved problem
  if (!focusProblem) {
    focusProblem = allProblems.find((p) => !solvedSet.has(p.id)) || allProblems[0];
  }

  // 3. Calculate REAL progress for this problem
  const isSolved = solvedSet.has(focusProblem.id);
  const isAttempted = attemptedSet.has(focusProblem.id);

  let progressPercent = 0;
  let progressText = "Not started";

  if (isSolved) {
    progressPercent = 100;
    progressText = "Solved ✓";
  } else if (isAttempted) {
    const problemSubs = userSubmissions.filter(
      (s) => (s.problemId || s.problem) === focusProblem.id
    );
    const attempts = problemSubs.length;

    // Calculate highest testcase pass ratio if available
    let maxPassRatio = 0.5;
    for (const sub of problemSubs) {
      if (sub.passedCount && sub.totalCases && sub.totalCases > 0) {
        maxPassRatio = Math.max(maxPassRatio, sub.passedCount / sub.totalCases);
      }
    }

    progressPercent = Math.min(85, Math.max(30, Math.round(attempts * 15 + maxPassRatio * 40)));
    progressText = `In progress (${attempts} attempt${attempts > 1 ? "s" : ""})`;
  }

  return {
    problem: {
      id: focusProblem.id,
      title: focusProblem.title,
      difficulty: focusProblem.difficulty || "Medium",
      topic: focusProblem.topic || "Algorithms",
      points: focusProblem.points || 10,
      description: focusProblem.description || focusProblem.statement || ""
    },
    progressPercent,
    progressText,
    isSolved,
    isAttempted
  };
}

/**
 * Builds the comprehensive skill and learning profile for AI Coach
 */
export async function getUserLearningProfile(userId) {
  const analytics = await computeUserTopicAnalytics(userId);
  const todaysFocus = await getTodaysFocus(userId);
  const userSubmissions = await getUserSubmissions(userId);

  // Streak & Activity
  const streakData = calculateUserStreak(userSubmissions, new Date());

  const totalSubs = userSubmissions.length;
  const acceptedSubs = userSubmissions.filter(
    (s) => s.verdict === "AC" || s.verdict === "OK" || s.verdict === "Accepted"
  ).length;
  const overallAccuracy = totalSubs > 0 ? Math.round((acceptedSubs / totalSubs) * 100) : 0;

  return {
    userId,
    solvedCount: analytics.solvedProblemIds.length,
    attemptedCount: analytics.attemptedProblemIds.length,
    totalSubmissions: totalSubs,
    acceptedSubmissions: acceptedSubs,
    overallAccuracy,
    currentStreak: streakData.currentStreak,
    bestStreak: streakData.bestStreak,
    activeDates: streakData.activeDates,
    todaysFocus,
    weakTopics: analytics.weakTopics,
    strongTopics: analytics.strongTopics,
    allTopics: analytics.topics,
    recentSubmissions: userSubmissions.slice(0, 5).map((s) => ({
      problemId: s.problemId || s.problem,
      verdict: s.verdict,
      language: s.language,
      submittedAt: s.submittedAt || s.createdAt
    }))
  };
}
