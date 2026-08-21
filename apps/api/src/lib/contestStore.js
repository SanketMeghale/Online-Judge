import mongoose from "mongoose";
import { connectDatabase, isDatabaseConnected } from "./db.js";
import { Contest } from "../models/Contest.js";
import { ContestRegistration } from "../models/ContestRegistration.js";
import { findUserById } from "./userStore.js";

/**
 * Returns fresh seed contests with timestamps dynamically relative to current system time
 */
export function getFreshSeedContests() {
  const cur = Date.now();

  return [
    {
      id: "live-weekly-412",
      slug: "live-weekly-412",
      title: "Judgo Weekly Contest 412",
      description: "Compete against thousands of competitive programmers in our flagship weekly algorithmic round.",
      organizer: "Judgo Official",
      contestType: "Weekly",
      category: "Algorithm",
      startTime: new Date(cur - 30 * 60 * 1000), // Started 30 minutes ago
      endTime: new Date(cur + 60 * 60 * 1000),    // Ends in 60 minutes
      duration: "1h 30m",
      participantCount: 5420,
      prize: "$500 Cash + Judgo Swag Box",
      badge: "Weekly Champion",
      registrationOpen: true,
      registrationDeadline: new Date(cur + 60 * 60 * 1000),
      problemIds: ["two-sum", "valid-palindrome", "reverse-linked-list", "median-two-sorted-arrays"],
      problems: [
        {
          id: "two-sum",
          name: "A. Two Sum Array Target",
          points: 250,
          diff: "Easy",
          statement: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
          starterCode: { cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write code here\n    return 0;\n}", python: "def twoSum(nums, target):\n    pass", javascript: "function twoSum(nums, target) {\n  return [];\n}" }
        },
        {
          id: "valid-palindrome",
          name: "B. Count Valid Substrings",
          points: 500,
          diff: "Medium",
          statement: "Given a string s, return true if it is a palindrome, or false otherwise.",
          starterCode: { cpp: "class Solution {\npublic:\n    bool isPalindrome(string s) {\n        return true;\n    }\n};", python: "class Solution:\n    def isPalindrome(self, s: str) -> bool:\n        return True", javascript: "function isPalindrome(s) {\n  return true;\n}" }
        },
        {
          id: "reverse-linked-list",
          name: "C. Maximum Flow in Bipartite Graph",
          points: 1000,
          diff: "Hard",
          statement: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
          starterCode: { cpp: "// Reverse linked list", python: "# Reverse linked list", javascript: "// Reverse linked list" }
        },
        {
          id: "median-two-sorted-arrays",
          name: "D. Dynamic Tree Re-Rooting",
          points: 1500,
          diff: "Hard",
          statement: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
          starterCode: { cpp: "// Median of sorted arrays", python: "# Median", javascript: "// Median" }
        }
      ],
      rules: "4 Problems • Penalty of 5 minutes per wrong submission • Plagiarism detection active."
    },
    {
      id: "uber-tech-hiring-2026",
      slug: "uber-tech-hiring-2026",
      title: "Uber Global Engineering Challenge 2026",
      description: "Fast-track your application for L4/L5 Software Engineering roles at Uber Global Tech.",
      organizer: "Uber",
      contestType: "Hiring",
      category: "Company",
      startTime: new Date(cur + 36 * 3600 * 1000), // Starts in 1d 12h
      endTime: new Date(cur + 38 * 3600 * 1000),   // Duration 2h
      duration: "2h 00m",
      participantCount: 9840,
      prize: "Direct L4/L5 Interview & $10k Pool",
      badge: "Uber Hiring Finalist",
      registrationOpen: true,
      registrationDeadline: new Date(cur + 36 * 3600 * 1000),
      problemIds: ["two-sum", "valid-palindrome"],
      problems: [
        { id: "u1", name: "Real-time Driver Dispatch Routing", points: 400, diff: "Medium", statement: "Optimize driver-rider matching in real-time." },
        { id: "u2", name: "Low-latency Geospatial Index", points: 800, diff: "Hard", statement: "Design a spatial indexing structure for H3 hexagons." },
        { id: "u3", name: "Distributed Lock Rate Limiter", points: 1200, diff: "Hard", statement: "Implement a fault-tolerant token bucket algorithm." }
      ],
      rules: "Fast-track interviews for top 50 participants. Algorithmic efficiency strictly evaluated."
    },
    {
      id: "biweekly-134",
      slug: "biweekly-134",
      title: "Judgo Biweekly Contest 134",
      description: "Rated round open for all participants globally to boost global platform rank.",
      organizer: "Judgo Community",
      contestType: "Biweekly",
      category: "Algorithm",
      startTime: new Date(cur + 80 * 3600 * 1000), // Starts in ~3d 8h
      endTime: new Date(cur + 81.5 * 3600 * 1000),
      duration: "1h 30m",
      participantCount: 3820,
      prize: "Knight Badge + 500 XP",
      badge: "Biweekly Competitor",
      registrationOpen: true,
      registrationDeadline: new Date(cur + 80 * 3600 * 1000),
      problemIds: ["two-sum"],
      problems: [
        { id: "b1", name: "Array Prefix Optimization", points: 250, diff: "Easy", statement: "Find max prefix sum under K modifications." },
        { id: "b2", name: "Bitwise XOR Subsets", points: 500, diff: "Medium", statement: "Count number of non-empty subsets with target XOR sum." },
        { id: "b3", name: "Shortest Path with K Teleports", points: 1000, diff: "Hard", statement: "Find min distance in graph using at most K teleports." }
      ],
      rules: "Rated for all participants. Standings update global rating."
    },
    {
      id: "meta-hacker-warmup",
      slug: "meta-hacker-warmup",
      title: "Meta Hacker Cup 2026 Warmup",
      description: "Official Meta Hacker Cup warmup round with specialized test harnesses.",
      organizer: "Meta",
      contestType: "Special",
      category: "Company",
      startTime: new Date(cur + 138 * 3600 * 1000), // Starts in ~5d 18h
      endTime: new Date(cur + 141 * 3600 * 1000),
      duration: "3h 00m",
      participantCount: 14200,
      prize: "Meta T-Shirt & Certificate",
      badge: "Meta Hacker",
      registrationOpen: true,
      registrationDeadline: new Date(cur + 138 * 3600 * 1000),
      problemIds: ["valid-palindrome"],
      problems: [
        { id: "m1", name: "Valid String Expressions", points: 300, diff: "Easy", statement: "Check string expression balance." },
        { id: "m2", name: "Convex Hull Lattice Points", points: 700, diff: "Hard", statement: "Count lattice points inside convex polygon." },
        { id: "m3", name: "Optimal Matrix Partitioning", points: 1000, diff: "Hard", statement: "Partition matrix to minimize max subgrid sum." }
      ],
      rules: "Official Meta test harness supported."
    },
    {
      id: "monthly-masters-2026",
      slug: "monthly-masters-2026",
      title: "Judgo Grand Monthly Masters 2026",
      description: "The biggest monthly competition for top-tier competitive programmers.",
      organizer: "Google Cloud",
      contestType: "Monthly",
      category: "Algorithm",
      startTime: new Date(cur + 204 * 3600 * 1000), // Starts in ~8d 12h
      endTime: new Date(cur + 206.5 * 3600 * 1000),
      duration: "2h 30m",
      participantCount: 8150,
      prize: "$2,000 Grand Pool + Trophy",
      badge: "Grandmaster Candidate",
      registrationOpen: true,
      registrationDeadline: new Date(cur + 204 * 3600 * 1000),
      problemIds: ["two-sum"],
      problems: [
        { id: "g1", name: "Segment Tree Range Queries", points: 400, diff: "Medium", statement: "Process point updates and range GCD queries." },
        { id: "g2", name: "Heavy-Light Decomposition", points: 1000, diff: "Hard", statement: "Path updates on tree using HLD." }
      ],
      rules: "Global Grandmaster Rating Match."
    },
    {
      id: "past-weekly-411",
      slug: "past-weekly-411",
      title: "Judgo Weekly Contest 411",
      description: "Weekly rated contest #411.",
      organizer: "Judgo Official",
      contestType: "Weekly",
      category: "Algorithm",
      startTime: new Date(cur - 72 * 3600 * 1000 - 90 * 60 * 1000),
      endTime: new Date(cur - 72 * 3600 * 1000), // Ended 3 days ago
      duration: "1h 30m",
      participantCount: 6890,
      prize: "Judgo XP & Badges",
      badge: "Weekly Finisher",
      registrationOpen: false,
      registrationDeadline: new Date(cur - 72 * 3600 * 1000),
      problemIds: ["two-sum", "valid-palindrome"],
      problems: [
        { id: "p411-1", name: "Find Peak Element II", points: 250, diff: "Medium", statement: "Find a 2D peak element in grid." },
        { id: "p411-2", name: "Subarray Sums Divisible by K", points: 500, diff: "Medium", statement: "Find number of non-empty subarrays divisible by K." },
        { id: "p411-3", name: "Longest Increasing Path in Matrix", points: 1000, diff: "Hard", statement: "Find length of longest increasing path in matrix." }
      ],
      rules: "Ended."
    },
    {
      id: "past-amazon-hiring",
      slug: "past-amazon-hiring",
      title: "Amazon SDE Hiring Challenge 2026",
      description: "Amazon SDE 1 & SDE 2 hiring challenge.",
      organizer: "Amazon",
      contestType: "Hiring",
      category: "Company",
      startTime: new Date(cur - 168 * 3600 * 1000 - 120 * 60 * 1000),
      endTime: new Date(cur - 168 * 3600 * 1000), // Ended 1 week ago
      duration: "2h 00m",
      participantCount: 11200,
      prize: "Interview Shortlist",
      badge: "Amazon Participant",
      registrationOpen: false,
      registrationDeadline: new Date(cur - 168 * 3600 * 1000),
      problemIds: ["two-sum"],
      problems: [
        { id: "amz-1", name: "Warehouse Item Packing", points: 500, diff: "Medium", statement: "Optimize item packing into minimum bins." },
        { id: "amz-2", name: "K-Closest Delivery Hubs", points: 700, diff: "Medium", statement: "Find K closest delivery hubs from origin." }
      ],
      rules: "Ended."
    }
  ];
}

// In-memory fallback registrations
const memoryRegistrations = [];

/**
 * Compute real-time status dynamically based on current time
 */
export function computeContestStatus(c) {
  const current = Date.now();
  const start = new Date(c.startTime).getTime();
  const end = new Date(c.endTime).getTime();

  if (current >= start && current < end) return "LIVE";
  if (current < start) return "UPCOMING";
  return "ENDED";
}

/**
 * Format contest for API response
 */
export function formatContest(c, userId = null, includeProblems = false) {
  const status = computeContestStatus(c);

  let isRegistered = false;
  if (userId) {
    const reg = memoryRegistrations.find(
      (r) => r.contestId === c.id && String(r.userId) === String(userId)
    );
    if (reg) isRegistered = true;
  }

  const safeProblems = (c.problems || []).map((problem) => {
    const { hiddenTestCases, judge, solution, solutions, referenceSolution, ...safeProblem } = problem;
    return safeProblem;
  });

  return {
    id: c.id,
    slug: c.slug || c.id,
    title: c.title,
    description: c.description || "",
    organizer: c.organizer || "Judgo Official",
    contestType: c.contestType || "Weekly",
    category: c.category || "Algorithm",
    status,
    startTime: c.startTime,
    endTime: c.endTime,
    duration: c.duration || "1h 30m",
    participantCount: c.participantCount || 0,
    prize: c.prize || "Judgo XP",
    badge: c.badge || "Participant",
    registrationOpen: status !== "ENDED" && (c.registrationOpen !== false),
    registrationDeadline: c.registrationDeadline || c.startTime,
    problems: includeProblems || status === "ENDED" ? safeProblems : [],
    rules: c.rules || "Standard contest rules apply.",
    createdAt: c.createdAt || c.startTime,
    updatedAt: c.updatedAt || c.endTime,
    isRegistered
  };
}

/**
 * Get all contests
 */
export async function getAllContests(userId = null) {
  await connectDatabase();

  const freshSeeds = getFreshSeedContests();

  if (isDatabaseConnected()) {
    try {
      let docs = await Contest.find().lean();

      // Check if DB is empty or all contests have expired
      const hasLiveOrUpcoming = docs && docs.some((d) => {
        const s = computeContestStatus(d);
        return s === "LIVE" || s === "UPCOMING";
      });

      if (!docs || docs.length === 0 || !hasLiveOrUpcoming) {
        console.log("[ContestStore] Seeding/Updating active contests collection...");
        for (const seed of freshSeeds) {
          await Contest.findOneAndUpdate(
            { id: seed.id },
            { $set: seed },
            { upsert: true, new: true }
          );
        }
        docs = await Contest.find().lean();
      }

      // Check DB user registrations if userId provided
      let userRegs = [];
      if (userId) {
        userRegs = await ContestRegistration.find({ userId: String(userId) }).lean();
      }

      const registeredSet = new Set(userRegs.map((r) => r.contestId));

      return docs.map((doc) => {
        const formatted = formatContest(doc, userId);
        if (registeredSet.has(doc.id)) formatted.isRegistered = true;
        return formatted;
      });
    } catch (e) {
      console.error("[ContestStore] getAllContests DB error:", e);
    }
  }

  return freshSeeds.map((c) => formatContest(c, userId));
}

/**
 * Get contest by ID or Slug
 */
export async function getContestById(idOrSlug, userId = null, options = {}) {
  if (!idOrSlug) return null;
  await connectDatabase();

  if (isDatabaseConnected()) {
    try {
      const doc = await Contest.findOne({
        $or: [{ id: idOrSlug }, { slug: idOrSlug }]
      }).lean();

      if (doc) {
        const formatted = formatContest(doc, userId, Boolean(options.includeProblems));
        if (userId) {
          const reg = await ContestRegistration.findOne({
            contestId: doc.id,
            userId: String(userId)
          }).lean();
          if (reg) formatted.isRegistered = true;
        }
        return formatted;
      }
    } catch (e) {
      console.error("[ContestStore] getContestById DB error:", e);
    }
  }

  const fresh = getFreshSeedContests();
  const c = fresh.find((item) => item.id === idOrSlug || item.slug === idOrSlug);
  return c ? formatContest(c, userId, Boolean(options.includeProblems)) : null;
}

/**
 * Register user for contest
 */
export async function registerUserForContest(contestId, userId) {
  if (!contestId || !userId) return { success: false, error: "Missing contestId or userId" };
  await connectDatabase();

  if (isDatabaseConnected()) {
    try {
      const existing = await ContestRegistration.findOne({
        contestId,
        userId: String(userId)
      }).lean();

      if (existing) {
        return { success: true, alreadyRegistered: true };
      }

      await ContestRegistration.create({
        contestId,
        userId: String(userId),
        registeredAt: new Date()
      });

      await Contest.findOneAndUpdate(
        { id: contestId },
        { $inc: { participantCount: 1 } }
      );

      return { success: true, alreadyRegistered: false };
    } catch (e) {
      console.error("[ContestStore] registerUserForContest DB error:", e);
    }
  }

  const memoryExists = memoryRegistrations.some(
    (r) => r.contestId === contestId && String(r.userId) === String(userId)
  );

  if (memoryExists) {
    return { success: true, alreadyRegistered: true };
  }

  memoryRegistrations.push({
    contestId,
    userId: String(userId),
    registeredAt: new Date()
  });

  return { success: true, alreadyRegistered: false };
}

/**
 * Get contest leaderboard
 */
export async function getContestLeaderboard(contestId) {
  return [
    { rank: 1, userId: "u-tourist", username: "Tourist", avatar: "👑", badge: "Grandmaster", score: 3250, penalty: "00:42:15", solvedProblems: ["A", "B", "C", "D"] },
    { rank: 2, userId: "u-benq", username: "Benq", avatar: "⚡", badge: "Grandmaster", score: 3100, penalty: "00:48:30", solvedProblems: ["A", "B", "C", "D"] },
    { rank: 3, userId: "u-neal", username: "Neal", avatar: "🔥", badge: "Master", score: 2750, penalty: "01:05:12", solvedProblems: ["A", "B", "C"] },
    { rank: 4, userId: "u-ecner", username: "ecnerwala", avatar: "🚀", badge: "Master", score: 2600, penalty: "01:12:40", solvedProblems: ["A", "B", "C"] },
    { rank: 5, userId: "u-petr", username: "Petr", avatar: "🛡️", badge: "Expert", score: 2200, penalty: "01:18:05", solvedProblems: ["A", "B"] }
  ];
}
