import express from "express";
import { connectDatabase, isDatabaseConnected } from "../lib/db.js";
import { User } from "../models/User.js";

const router = express.Router();

export function calculateBadge(rating) {
  if (rating >= 2400) return "Grandmaster";
  if (rating >= 2000) return "Master";
  if (rating >= 1600) return "Expert";
  if (rating >= 1200) return "Knight";
  return "Newbie";
}

/**
 * GET /api/leaderboard
 * Returns global developer rankings based on real user participation, rating, and solved count.
 */
router.get("/", async (_req, res) => {
  try {
    await connectDatabase();

    const userMap = new Map();

    // Fetch real registered users from DB
    if (isDatabaseConnected()) {
      try {
        const docs = await User.find()
          .select("id name username avatar solvedProblemIds attemptedProblemIds xp streak badges")
          .lean();

        for (const u of docs) {
          const solvedCount = u.solvedProblemIds?.length || 0;
          const userXp = typeof u.xp === "number" ? u.xp : solvedCount * 100;
          // Calculate rating dynamically based on solved count + XP participation
          const rating = 1200 + solvedCount * 15 + Math.floor(userXp / 10);
          const badge = calculateBadge(rating);

          userMap.set(u.username.toLowerCase(), {
            userId: String(u.id || u._id),
            username: u.username,
            name: u.name || u.username,
            avatar: u.avatar || "",
            solvedCount,
            xp: userXp,
            rating,
            badge,
            streak: u.streak || 1
          });
        }
      } catch (e) {
        console.error("[LeaderboardAPI] DB fetch error:", e);
      }
    }

    // Convert map to array & sort strictly by Rating desc -> XP desc -> Solved Count desc
    const sorted = Array.from(userMap.values()).sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      if (b.xp !== a.xp) return b.xp - a.xp;
      return b.solvedCount - a.solvedCount;
    });

    // Assign 1-indexed global rank
    const leaderboard = sorted.map((item, index) => ({
      ...item,
      rank: index + 1
    }));

    res.json({
      success: true,
      count: leaderboard.length,
      leaderboard
    });
  } catch (error) {
    console.error("[LeaderboardAPI] GET / error:", error);
    res.status(500).json({ success: false, error: "Failed to load global leaderboard." });
  }
});

export default router;
