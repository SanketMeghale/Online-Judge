import express from "express";
import { authenticate, optionalAuth, requireAuth } from "../middleware/auth.middleware.js";
import {
  getAllContests,
  getContestById,
  getContestLeaderboard,
  registerUserForContest
} from "../lib/contestStore.js";
import { findUserById } from "../lib/userStore.js";

const router = express.Router();

/**
 * GET /api/contests
 * Query params: status (LIVE, UPCOMING, ENDED), type (Weekly, Biweekly, Hiring, Special), search
 */
router.get("/", optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || null;
    let contests = await getAllContests(userId);

    const { status, type, search } = req.query;

    if (status && status !== "ALL") {
      contests = contests.filter((c) => c.status.toUpperCase() === status.toUpperCase());
    }

    if (type && type !== "ALL") {
      contests = contests.filter((c) => c.contestType.toUpperCase() === type.toUpperCase());
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      contests = contests.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.organizer.toLowerCase().includes(q) ||
          c.contestType.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      count: contests.length,
      contests
    });
  } catch (error) {
    console.error("[ContestAPI] GET / error:", error);
    res.status(500).json({ success: false, error: "Failed to load contests." });
  }
});

/**
 * GET /api/contests/:id
 */
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || null;
    const contest = await getContestById(req.params.id, userId);

    if (!contest) {
      return res.status(404).json({ success: false, error: "Contest not found." });
    }

    res.json({
      success: true,
      contest
    });
  } catch (error) {
    console.error("[ContestAPI] GET /:id error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch contest details." });
  }
});

/**
 * POST /api/contests/:id/register
 */
router.post("/:id/register", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const result = await registerUserForContest(req.params.id, userId);

    res.json({
      success: true,
      message: result.alreadyRegistered ? "Already registered for this contest." : "Successfully registered for contest!",
      alreadyRegistered: result.alreadyRegistered,
      registration: result.registration
    });
  } catch (error) {
    console.error("[ContestAPI] POST /:id/register error:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to register for contest."
    });
  }
});

/**
 * GET /api/contests/:id/registration
 */
router.get("/:id/registration", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const contest = await getContestById(req.params.id, userId);

    if (!contest) {
      return res.status(404).json({ success: false, error: "Contest not found." });
    }

    res.json({
      success: true,
      isRegistered: !!contest.isRegistered
    });
  } catch (error) {
    console.error("[ContestAPI] GET /:id/registration error:", error);
    res.status(500).json({ success: false, error: "Failed to check registration status." });
  }
});

/**
 * GET /api/contests/:id/problems
 */
router.get("/:id/problems", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const contest = await getContestById(req.params.id, userId, { includeProblems: true });

    if (!contest) {
      return res.status(404).json({ success: false, error: "Contest not found." });
    }

    if (contest.status === "UPCOMING") {
      return res.status(403).json({
        success: false,
        error: "Contest problem set is locked until the contest begins."
      });
    }

    if (contest.status === "LIVE" && !contest.isRegistered) {
      return res.status(403).json({ success: false, error: "Register for the contest to access its problem set." });
    }

    res.json({
      success: true,
      contestId: contest.id,
      title: contest.title,
      status: contest.status,
      startTime: contest.startTime,
      endTime: contest.endTime,
      problems: contest.problems || []
    });
  } catch (error) {
    console.error("[ContestAPI] GET /:id/problems error:", error);
    res.status(500).json({ success: false, error: "Failed to load contest problems." });
  }
});

/**
 * GET /api/contests/:id/leaderboard
 */
router.get("/:id/leaderboard", async (req, res) => {
  try {
    const leaderboard = await getContestLeaderboard(req.params.id);
    res.json({
      success: true,
      contestId: req.params.id,
      count: leaderboard.length,
      leaderboard
    });
  } catch (error) {
    console.error("[ContestAPI] GET /:id/leaderboard error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch contest leaderboard." });
  }
});

/**
 * GET /api/contests/:id/results
 */
router.get("/:id/results", optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || null;
    const contest = await getContestById(req.params.id, userId);

    if (!contest) {
      return res.status(404).json({ success: false, error: "Contest not found." });
    }

    const leaderboard = await getContestLeaderboard(contest.id);
    let myResult = null;

    if (userId) {
      const idx = leaderboard.findIndex((r) => String(r.userId) === String(userId));
      if (idx !== -1) {
        myResult = {
          rank: idx + 1,
          score: leaderboard[idx].score,
          solvedCount: leaderboard[idx].solvedCount,
          totalParticipants: contest.participantCount || leaderboard.length,
          ratingChange: "+32"
        };
      }
    }

    res.json({
      success: true,
      contest: {
        id: contest.id,
        title: contest.title,
        status: contest.status,
        participants: contest.participantCount,
        endedAt: contest.endTime
      },
      myResult,
      leaderboard
    });
  } catch (error) {
    console.error("[ContestAPI] GET /:id/results error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch contest results." });
  }
});

export default router;
