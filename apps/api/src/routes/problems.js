import { Router } from "express";
import { optionalAuth } from "../middleware/auth.middleware.js";
import { problems as seedProblems } from "../data/problems.js";
import { isDatabaseConnected } from "../lib/db.js";
import { Problem } from "../models/Problem.js";
import { Submission } from "../models/Submission.js";
import { User } from "../models/User.js";
import { listSubmissionRecords } from "../lib/submissionStore.js";
import mongoose from "mongoose";

const router = Router();

function sanitizeProblemForClient(problem) {
  if (!problem) return null;
  const { hiddenTestCases, judge, _id, __v, ...safeProblem } = problem;
  return safeProblem;
}

router.get("/", optionalAuth, async (req, res) => {
  try {
    let dbProblems = seedProblems;

    if (isDatabaseConnected()) {
      try {
        for (const seed of seedProblems) {
          await Problem.updateOne({ id: seed.id }, { $setOnInsert: seed }, { upsert: true }).catch(() => {});
        }
        const fetched = await Problem.find().lean();
        if (fetched && fetched.length > 0) {
          dbProblems = fetched;
        }
      } catch (err) {
        console.warn("[ProblemsAPI] DB sync error:", err.message);
      }
    }

    const userId = req.user?.id || req.user?._id || null;

    if (!userId) {
      return res.json({
        success: true,
        problems: dbProblems.map((p) => ({
          ...sanitizeProblemForClient(p),
          status: "Unsolved",
          userStats: { solved: false, attempts: 0, lastVerdict: null }
        }))
      });
    }

    // Resolve user's solved and attempted problems from database
    const solvedSet = new Set();
    const attemptedSet = new Set();
    const attemptsMap = new Map();
    const lastVerdictMap = new Map();

    if (isDatabaseConnected()) {
      try {
        const isObjId = mongoose.Types.ObjectId.isValid(String(userId));
        const userQuery = isObjId ? { $or: [{ id: String(userId) }, { _id: userId }] } : { id: String(userId) };

        const userDoc = await User.findOne(userQuery).lean();
        if (userDoc) {
          (userDoc.solvedProblemIds || []).forEach((pid) => solvedSet.add(pid));
          (userDoc.attemptedProblemIds || []).forEach((pid) => attemptedSet.add(pid));
        }

        const userSubs = await Submission.find({
          $or: [{ userId: String(userId) }, { user: String(userId) }]
        })
          .sort({ createdAt: 1 })
          .lean();

        for (const s of userSubs) {
          const pid = s.problemId || s.problem;
          if (!pid) continue;
          attemptedSet.add(pid);
          attemptsMap.set(pid, (attemptsMap.get(pid) || 0) + 1);
          lastVerdictMap.set(pid, s.verdict);

          if (s.verdict === "AC" || s.verdict === "OK" || s.verdict === "Accepted") {
            solvedSet.add(pid);
          }
        }
      } catch (dbErr) {
        console.error("[ProblemsAPI] Error resolving user submission status:", dbErr);
      }
    } else {
      const memorySubs = await listSubmissionRecords();
      const userSubs = memorySubs.filter((s) => String(s.userId || "") === String(userId));
      for (const s of userSubs) {
        const pid = s.problemId || s.problem;
        if (!pid) continue;
        attemptedSet.add(pid);
        attemptsMap.set(pid, (attemptsMap.get(pid) || 0) + 1);
        lastVerdictMap.set(pid, s.verdict);

        if (s.verdict === "AC" || s.verdict === "OK" || s.verdict === "Accepted") {
          solvedSet.add(pid);
        }
      }
    }

    const enrichedProblems = dbProblems.map((p) => {
      const isSolved = solvedSet.has(p.id);
      const isAttempted = attemptedSet.has(p.id);
      const status = isSolved ? "Solved" : isAttempted ? "Attempted" : "Unsolved";

      return {
        ...sanitizeProblemForClient(p),
        status,
        userStats: {
          solved: isSolved,
          attempts: attemptsMap.get(p.id) || (isSolved ? 1 : isAttempted ? 1 : 0),
          lastVerdict: lastVerdictMap.get(p.id) || null
        }
      };
    });

    res.json({
      success: true,
      problems: enrichedProblems
    });
  } catch (error) {
    console.error("[ProblemsAPI] GET / error:", error);
    res.status(500).json({ success: false, error: "Failed to load problems." });
  }
});

router.get("/:problemId", optionalAuth, async (req, res) => {
  try {
    const { problemId } = req.params;
    let problem = null;

    if (isDatabaseConnected()) {
      try {
        problem = await Problem.findOne({ id: problemId }).lean();
      } catch {}
    }

    if (!problem) {
      problem = seedProblems.find((item) => item.id === problemId);
    }

    if (!problem) {
      return res.status(404).json({ success: false, error: "Problem not found." });
    }

    res.json({ success: true, problem: sanitizeProblemForClient(problem) });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch problem." });
  }
});

export default router;
