import express from "express";
import mongoose from "mongoose";
import { optionalAuth } from "../middleware/auth.middleware.js";
import { connectDatabase, isDatabaseConnected } from "../lib/db.js";
import { Submission } from "../models/Submission.js";
import { Problem } from "../models/Problem.js";
import { User } from "../models/User.js";
import { problems as seedProblems } from "../data/problems.js";
import { getAllContests } from "../lib/contestStore.js";
import { listSubmissionRecords } from "../lib/submissionStore.js";
import { calculateUserStreak } from "../lib/streakEngine.js";

const router = express.Router();

function getStartOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  // Monday is 1, Sunday is 0 -> adjust so Monday is first day of week
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateKey(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getDailyChallengeProblem(allProblems) {
  if (!allProblems || allProblems.length === 0) return null;
  const todayKey = formatDateKey(new Date());
  // Deterministic index hash based on date string
  let hash = 0;
  for (let i = 0; i < todayKey.length; i++) {
    hash = (hash << 5) - hash + todayKey.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % allProblems.length;
  return allProblems[index];
}

/**
 * GET /api/dashboard/stats or GET /api/dashboard
 */
router.get("/", optionalAuth, async (req, res) => {
  try {
    await connectDatabase();

    const userId = req.user?.id || req.user?._id || null;

    let allProblems = seedProblems;
    if (isDatabaseConnected()) {
      try {
        const dbProblems = await Problem.find().lean();
        if (dbProblems && dbProblems.length > 0) {
          allProblems = dbProblems;
        }
      } catch (err) {
        console.warn("[DashboardAPI] Problem query notice:", err.message);
      }
    }

    const problemMap = new Map();
    for (const p of allProblems) {
      problemMap.set(p.id, p);
    }

    let userDoc = null;
    let userSubmissions = [];

    if (userId) {
      if (isDatabaseConnected()) {
        try {
          const isObjId = mongoose.Types.ObjectId.isValid(String(userId));
          const userQuery = isObjId ? { $or: [{ id: String(userId) }, { _id: userId }] } : { id: String(userId) };
          userDoc = await User.findOne(userQuery).lean();

          userSubmissions = await Submission.find({
            $or: [{ userId: String(userId) }, { user: String(userId) }]
          })
            .sort({ createdAt: -1, submittedAt: -1 })
            .lean();
        } catch (dbErr) {
          console.error("[DashboardAPI] DB fetch error:", dbErr);
        }
      }

      if (!userDoc || userSubmissions.length === 0) {
        const memSubs = await listSubmissionRecords();
        const matched = memSubs.filter((s) => String(s.userId || "") === String(userId));
        if (matched.length > 0) {
          userSubmissions = matched.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        }
      }
    }

    // 1. UNIQUE SOLVED & ATTEMPTED PROBLEMS
    const distinctSolvedSet = new Set();
    const distinctAttemptedSet = new Set();
    const dateMap = new Map();

    for (const sub of userSubmissions) {
      const pid = sub.problemId || sub.problem;
      if (!pid) continue;

      distinctAttemptedSet.add(pid);

      const isAc = sub.verdict === "AC" || sub.verdict === "OK" || sub.verdict === "Accepted";
      if (isAc) {
        distinctSolvedSet.add(pid);
        const subDate = new Date(sub.submittedAt || sub.createdAt || Date.now());
        const k = formatDateKey(subDate);
        dateMap.set(k, (dateMap.get(k) || 0) + 1);
      }
    }

    if (userDoc?.solvedProblemIds && Array.isArray(userDoc.solvedProblemIds)) {
      userDoc.solvedProblemIds.forEach((pid) => distinctSolvedSet.add(pid));
    }
    if (userDoc?.attemptedProblemIds && Array.isArray(userDoc.attemptedProblemIds)) {
      userDoc.attemptedProblemIds.forEach((pid) => distinctAttemptedSet.add(pid));
    }

    const solvedCount = distinctSolvedSet.size;

    // Difficulty breakdown
    let easySolved = 0;
    let mediumSolved = 0;
    let hardSolved = 0;
    let totalEasy = 0;
    let totalMedium = 0;
    let totalHard = 0;

    for (const p of allProblems) {
      const diff = p.difficulty || "Medium";
      if (diff === "Easy") totalEasy++;
      else if (diff === "Medium") totalMedium++;
      else if (diff === "Hard") totalHard++;

      if (distinctSolvedSet.has(p.id)) {
        if (diff === "Easy") easySolved++;
        else if (diff === "Medium") mediumSolved++;
        else if (diff === "Hard") hardSolved++;
      }
    }

    // 2. SUBMISSION BREAKDOWN
    const totalSubmissions = userSubmissions.length;
    const acceptedCount = userSubmissions.filter((s) => s.verdict === "AC" || s.verdict === "OK" || s.verdict === "Accepted").length;
    const waCount = userSubmissions.filter((s) => s.verdict === "WA" || s.verdict === "Wrong Answer").length;
    const reCount = userSubmissions.filter((s) => s.verdict === "RE" || s.verdict === "Runtime Error").length;
    const tleCount = userSubmissions.filter((s) => s.verdict === "TLE" || s.verdict === "Time Limit Exceeded").length;
    const ceCount = userSubmissions.filter((s) => s.verdict === "CE" || s.verdict === "Compilation Error").length;

    const acceptanceRate = totalSubmissions > 0 ? ((acceptedCount / totalSubmissions) * 100).toFixed(1) : "0.0";

    // 3. STREAK CALCULATIONS
    const userActiveDates = Array.from(dateMap.keys());
    if (userDoc?.activeDates && Array.isArray(userDoc.activeDates)) {
      userDoc.activeDates.forEach((d) => userActiveDates.push(d));
    }
    const streakResult = calculateUserStreak(userActiveDates, new Date());
    let currentStreak = streakResult.currentStreak;
    let bestStreak = Math.max(streakResult.bestStreak, userDoc?.bestStreak || 0, userDoc?.streak || 0);

    if (currentStreak === 0 && userDoc?.streak > 0 && streakResult.isActiveToday) {
      currentStreak = userDoc.streak;
    }

    // 4. GLOBAL RANK & RATING
    const userXp = typeof userDoc?.xp === "number" ? userDoc.xp : solvedCount * 100;
    const userRating = 1200 + solvedCount * 15 + Math.floor(userXp / 10);

    // Compute rank against benchmarks and other users
    const benchmarkRatings = [2840, 2790, 2680, 2610, 1850, 1620, 1450];
    let higherCount = 0;
    for (const r of benchmarkRatings) {
      if (r > userRating) higherCount++;
    }
    const globalRank = higherCount + 1;

    // 5. WEEKLY GOAL
    const startOfWeek = getStartOfWeek();
    const thisWeekSolvedSet = new Set();

    for (const sub of userSubmissions) {
      const isAc = sub.verdict === "AC" || sub.verdict === "OK" || sub.verdict === "Accepted";
      if (!isAc) continue;
      const subTime = new Date(sub.submittedAt || sub.createdAt || 0).getTime();
      if (subTime >= startOfWeek.getTime()) {
        const pid = sub.problemId || sub.problem;
        if (pid) thisWeekSolvedSet.add(pid);
      }
    }

    const weeklyGoalTarget = 5;
    const weeklySolvedCount = thisWeekSolvedSet.size;
    const weeklyRemaining = Math.max(0, weeklyGoalTarget - weeklySolvedCount);
    const weeklyProgressPct = Math.min(100, Math.round((weeklySolvedCount / weeklyGoalTarget) * 100));

    // 6. NEXT CONTEST
    let nextContest = null;
    try {
      const allContests = await getAllContests(userId);
      const activeOrUpcoming = allContests.filter((c) => c.status === "LIVE" || c.status === "UPCOMING");
      if (activeOrUpcoming.length > 0) {
        nextContest = activeOrUpcoming[0];
      }
    } catch (cErr) {
      console.warn("[DashboardAPI] Contest notice:", cErr.message);
    }

    // 7. CONTINUE SOLVING PROBLEM
    let continueProblem = null;
    // Look for most recent non-AC attempted problem first
    for (const sub of userSubmissions) {
      const pid = sub.problemId || sub.problem;
      if (pid && !distinctSolvedSet.has(pid)) {
        const pObj = problemMap.get(pid);
        if (pObj) {
          continueProblem = {
            id: pObj.id,
            title: pObj.title,
            difficulty: pObj.difficulty || "Easy",
            topic: pObj.topic || "Algorithms",
            timeAgo: "Recently attempted"
          };
          break;
        }
      }
    }

    // Fallback: recommend first unsolved problem
    if (!continueProblem) {
      const unsolved = allProblems.find((p) => !distinctSolvedSet.has(p.id));
      if (unsolved) {
        continueProblem = {
          id: unsolved.id,
          title: unsolved.title,
          difficulty: unsolved.difficulty || "Easy",
          topic: unsolved.topic || "Algorithms",
          timeAgo: "Recommended next"
        };
      } else if (allProblems.length > 0) {
        continueProblem = {
          id: allProblems[0].id,
          title: allProblems[0].title,
          difficulty: allProblems[0].difficulty || "Easy",
          topic: allProblems[0].topic || "Algorithms",
          timeAgo: "Completed"
        };
      }
    }

    // 8. RECOMMENDED PROBLEM
    let recommendedProblem = null;
    const recommendedUnsolved = allProblems.find(
      (p) => !distinctSolvedSet.has(p.id) && p.id !== continueProblem?.id
    ) || allProblems.find((p) => !distinctSolvedSet.has(p.id)) || allProblems[1] || allProblems[0];

    if (recommendedUnsolved) {
      recommendedProblem = {
        id: recommendedUnsolved.id,
        title: recommendedUnsolved.title,
        difficulty: recommendedUnsolved.difficulty || "Medium",
        topic: recommendedUnsolved.topic || "Data Structures",
        reason: `Targeted ${recommendedUnsolved.difficulty || "Medium"} challenge to boost rating`
      };
    }

    // 9. DAILY CHALLENGE PROBLEM
    const dailyChallengeObj = getDailyChallengeProblem(allProblems);
    const dailyChallenge = dailyChallengeObj
      ? {
          id: dailyChallengeObj.id,
          title: dailyChallengeObj.title,
          difficulty: dailyChallengeObj.difficulty || "Easy",
          topic: dailyChallengeObj.topic || "Algorithms",
          points: dailyChallengeObj.points || 10,
          solved: distinctSolvedSet.has(dailyChallengeObj.id)
        }
      : null;

    // 10. RECENT SUBMISSIONS
    const recentSubmissions = userSubmissions.slice(0, 8).map((s) => {
      const p = problemMap.get(s.problemId || s.problem);
      return {
        id: String(s._id || s.id || s.submissionId || ""),
        problemId: s.problemId || s.problem,
        problemTitle: p?.title || s.problemTitle || s.problemId || "Problem",
        difficulty: p?.difficulty || "Medium",
        verdict: s.verdict,
        statusText: s.statusText || (s.verdict === "AC" ? "Accepted" : "Wrong Answer"),
        language: s.language || "python",
        runtimeMs: Number(s.executionTimeMs ?? s.runtimeMs ?? 0),
        memoryMb: Number(s.memoryMb ?? 0),
        submittedAt: s.submittedAt || s.createdAt || new Date().toISOString()
      };
    });

    res.json({
      success: true,
      stats: {
        globalRank,
        rating: userRating,
        currentStreak,
        bestStreak,
        acceptanceRate: `${acceptanceRate}%`,
        acceptanceRateNum: Number(acceptanceRate),
        solvedCount,
        totalProblems: allProblems.length,
        easySolved,
        mediumSolved,
        hardSolved,
        totalEasy,
        totalMedium,
        totalHard,
        totalSubmissions,
        acceptedCount,
        waCount,
        reCount,
        tleCount,
        ceCount
      },
      weeklyGoal: {
        target: weeklyGoalTarget,
        solved: weeklySolvedCount,
        remaining: weeklyRemaining,
        progressPct: weeklyProgressPct,
        isCompleted: weeklySolvedCount >= weeklyGoalTarget
      },
      nextContest,
      continueProblem,
      recommendedProblem,
      dailyChallenge,
      recentSubmissions
    });
  } catch (error) {
    console.error("[DashboardAPI] Error:", error);
    res.status(500).json({ success: false, error: "Failed to load dashboard data." });
  }
});

export default router;
