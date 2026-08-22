import express from "express";
import mongoose from "mongoose";
import { requireAuth } from "../middleware/auth.middleware.js";
import { connectDatabase, isDatabaseConnected } from "../lib/db.js";
import { Submission } from "../models/Submission.js";
import { Problem } from "../models/Problem.js";
import { User } from "../models/User.js";
import { problems as seedProblems } from "../data/problems.js";
import { findUserById } from "../lib/userStore.js";
import { calculateUserStreak } from "../lib/streakEngine.js";

const router = express.Router();

function parseRangeDays(rangeStr = "30d") {
  switch (rangeStr) {
    case "7d": return 7;
    case "30d": return 30;
    case "90d": return 90;
    case "180d": return 180;
    case "1y":
    case "365d": return 365;
    case "all": return 99999;
    default: return 30;
  }
}

function formatDateKey(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * GET /api/progress
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = String(req.user.id || req.user._id);
    const rangeDays = parseRangeDays(req.query.range);

    await connectDatabase();

    let allUserSubmissions = [];
    let allProblems = seedProblems;
    let userDoc = req.user;

    if (isDatabaseConnected()) {
      try {
        const isObjId = mongoose.Types.ObjectId.isValid(userId);
        const userQuery = isObjId ? { $or: [{ id: userId }, { _id: userId }] } : { id: userId };

        const dbUser = await User.findOne(userQuery).lean();
        if (dbUser) userDoc = dbUser;

        const dbProblems = await Problem.find().lean();
        if (dbProblems && dbProblems.length > 0) {
          allProblems = dbProblems;
        }

        const dbSubmissions = await Submission.find({
          $or: [{ userId }, { user: userId }]
        })
          .sort({ submittedAt: -1, createdAt: -1 })
          .lean();

        if (dbSubmissions) {
          allUserSubmissions = dbSubmissions;
        }
      } catch (e) {
        console.error("[ProgressAPI] DB query error:", e);
      }
    }

    const now = new Date();
    const cutoffDate = rangeDays < 90000 ? new Date(now.getTime() - rangeDays * 24 * 3600 * 1000) : new Date(0);
    const prevCutoffDate = rangeDays < 90000 ? new Date(now.getTime() - rangeDays * 2 * 24 * 3600 * 1000) : new Date(0);

    // Filter submissions in selected time range
    const periodSubmissions = allUserSubmissions.filter((s) => {
      const ts = new Date(s.submittedAt || s.createdAt || 0).getTime();
      return ts >= cutoffDate.getTime();
    });

    // Submissions in previous equivalent time range (for delta calculation)
    const prevPeriodSubmissions = allUserSubmissions.filter((s) => {
      const ts = new Date(s.submittedAt || s.createdAt || 0).getTime();
      return ts >= prevCutoffDate.getTime() && ts < cutoffDate.getTime();
    });

    // 1. UNIQUE SOLVED PROBLEMS
    const solvedProblemSet = new Set(
      periodSubmissions.filter((s) => s.verdict === "AC" || s.verdict === "OK").map((s) => s.problemId || s.problem)
    );

    const prevSolvedProblemSet = new Set(
      prevPeriodSubmissions.filter((s) => s.verdict === "AC" || s.verdict === "OK").map((s) => s.problemId || s.problem)
    );

    const solvedCount = solvedProblemSet.size;
    const prevSolvedCount = prevSolvedProblemSet.size;
    const solvedDelta = solvedCount - prevSolvedCount;

    // 2. VERDICT BREAKDOWN
    const totalSubmissions = periodSubmissions.length;
    const acceptedCount = periodSubmissions.filter((s) => s.verdict === "AC" || s.verdict === "OK").length;
    const waCount = periodSubmissions.filter((s) => s.verdict === "WA").length;
    const reCount = periodSubmissions.filter((s) => s.verdict === "RE").length;
    const ceCount = periodSubmissions.filter((s) => s.verdict === "CE").length;
    const tleCount = periodSubmissions.filter((s) => s.verdict === "TLE").length;

    const acceptanceRate = totalSubmissions > 0 ? Math.round((acceptedCount / totalSubmissions) * 100) : 0;

    // 3. STREAK CALCULATIONS
    const userActiveDates = [];
    for (const s of allUserSubmissions) {
      const dt = new Date(s.submittedAt || s.createdAt || Date.now());
      const k = formatDateKey(dt);
      if (k) userActiveDates.push(k);
    }
    if (userDoc?.activeDates && Array.isArray(userDoc.activeDates)) {
      userDoc.activeDates.forEach((d) => userActiveDates.push(d));
    }
    const streakResult = calculateUserStreak(userActiveDates, new Date());
    let currentStreak = streakResult.currentStreak;
    let bestStreak = Math.max(streakResult.bestStreak, userDoc?.bestStreak || 0, userDoc?.streak || 0);

    if (currentStreak === 0 && userDoc?.streak > 0 && streakResult.isActiveToday) {
      currentStreak = userDoc.streak;
    }

    // 4. DIFFICULTY BREAKDOWN
    const diffMap = {
      Easy: { solved: 0, total: 0 },
      Medium: { solved: 0, total: 0 },
      Hard: { solved: 0, total: 0 }
    };

    const problemMap = new Map();
    for (const p of allProblems) {
      const diff = p.difficulty || "Medium";
      if (!diffMap[diff]) diffMap[diff] = { solved: 0, total: 0 };
      diffMap[diff].total++;
      // Store with string-coerced id for consistent lookup
      problemMap.set(String(p.id || p._id), p);
    }

    // All-time user solved set for total solved ratio
    const allTimeSolvedSet = new Set(
      allUserSubmissions
        .filter((s) => s.verdict === "AC" || s.verdict === "OK")
        .map((s) => String(s.problemId || s.problem))
    );

    for (const probId of allTimeSolvedSet) {
      const p = problemMap.get(probId);
      if (p && diffMap[p.difficulty]) {
        diffMap[p.difficulty].solved++;
      }
    }

    const difficultyBreakdown = {
      Easy: {
        solved: diffMap.Easy.solved,
        total: diffMap.Easy.total,
        percentage: diffMap.Easy.total > 0 ? Math.round((diffMap.Easy.solved / diffMap.Easy.total) * 100) : 0
      },
      Medium: {
        solved: diffMap.Medium.solved,
        total: diffMap.Medium.total,
        percentage: diffMap.Medium.total > 0 ? Math.round((diffMap.Medium.solved / diffMap.Medium.total) * 100) : 0
      },
      Hard: {
        solved: diffMap.Hard.solved,
        total: diffMap.Hard.total,
        percentage: diffMap.Hard.total > 0 ? Math.round((diffMap.Hard.solved / diffMap.Hard.total) * 100) : 0
      }
    };

    // 5. CODING ACTIVITY GRID (HEATMAP)
    // Build dateMap from ALL user submissions before iterating grid
    const dateMap = new Map();
    for (const s of allUserSubmissions) {
      const dt = new Date(s.submittedAt || s.createdAt || Date.now());
      const k = formatDateKey(dt);
      if (k) dateMap.set(k, (dateMap.get(k) || 0) + 1);
    }

    const displayDays = Math.min(rangeDays, 180);
    const activityGrid = [];

    for (let i = displayDays - 1; i >= 0; i--) {
      const dt = new Date(now.getTime() - i * 24 * 3600 * 1000);
      const k = formatDateKey(dt);
      const count = dateMap.get(k) || 0;
      let intensity = 0;
      if (count >= 5) intensity = 4;
      else if (count >= 3) intensity = 3;
      else if (count >= 2) intensity = 2;
      else if (count >= 1) intensity = 1;

      activityGrid.push({
        date: k,
        label: dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        count,
        intensity
      });
    }

    const activeDaysCount = activityGrid.filter((d) => d.count > 0).length;

    // 6. TOPIC PROFICIENCY
    const topicStatsMap = new Map();
    for (const p of allProblems) {
      const topic = p.topic || "General";
      if (!topicStatsMap.has(topic)) {
        topicStatsMap.set(topic, { topic, totalProblems: 0, solvedCount: 0, totalSubmissions: 0, acceptedSubmissions: 0 });
      }
      topicStatsMap.get(topic).totalProblems++;
    }

    for (const s of allUserSubmissions) {
      const p = problemMap.get(s.problemId || s.problem);
      const topic = p?.topic || "General";
      if (!topicStatsMap.has(topic)) {
        topicStatsMap.set(topic, { topic, totalProblems: 1, solvedCount: 0, totalSubmissions: 0, acceptedSubmissions: 0 });
      }
      const tObj = topicStatsMap.get(topic);
      tObj.totalSubmissions++;
      if (s.verdict === "AC" || s.verdict === "OK") {
        tObj.acceptedSubmissions++;
      }
    }

    for (const probId of allTimeSolvedSet) {
      const p = problemMap.get(probId);
      const topic = p?.topic || "General";
      if (topicStatsMap.has(topic)) {
        topicStatsMap.get(topic).solvedCount++;
      }
    }

    const topicProficiency = Array.from(topicStatsMap.values()).map((t) => {
      const accuracy = t.totalSubmissions > 0 ? Math.round((t.acceptedSubmissions / t.totalSubmissions) * 100) : 0;
      const completionRatio = t.totalProblems > 0 ? t.solvedCount / t.totalProblems : 0;
      const proficiency = Math.round(completionRatio * 60 + accuracy * 0.4);

      return {
        ...t,
        accuracy,
        proficiency
      };
    });

    // Contest rating — only show when user has actually solved problems
    const solvedTotal = allTimeSolvedSet.size;
    const userXp = typeof userDoc?.xp === "number" ? userDoc.xp : 0;
    const contestRating = solvedTotal > 0 ? 1200 + solvedTotal * 15 + Math.floor(userXp / 10) : null;

    res.json({
      success: true,
      range: req.query.range || "30d",
      overview: {
        solvedCount,
        solvedDelta: solvedDelta >= 0 ? `+${solvedDelta}` : `${solvedDelta}`,
        totalSubmissions,
        acceptedCount,
        waCount,
        reCount,
        ceCount,
        tleCount,
        acceptanceRate,
        currentStreak,
        bestStreak,
        activeDaysCount,
        contestRating
      },
      difficultyBreakdown,
      activityGrid,
      topicProficiency
    });
  } catch (error) {
    console.error("[ProgressAPI] GET / error:", error);
    res.status(500).json({ success: false, error: "Failed to calculate progress analytics." });
  }
});

export default router;
