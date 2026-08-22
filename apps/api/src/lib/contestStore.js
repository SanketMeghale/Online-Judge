import mongoose from "mongoose";
import { connectDatabase, isDatabaseConnected } from "./db.js";
import { Contest } from "../models/Contest.js";
import { ContestRegistration } from "../models/ContestRegistration.js";
import { findUserById } from "./userStore.js";
import { Submission } from "../models/Submission.js";
import { User } from "../models/User.js";

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

  if (isDatabaseConnected()) {
    try {
      const docs = await Contest.find().lean();

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

  return [];
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

  return null;
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
  if (!contestId) return [];
  await connectDatabase();

  try {
    const contest = await getContestById(contestId);
    if (!contest) return [];

    // 1. Fetch all submissions for this contest where mode === "SUBMIT"
    const submissions = await Submission.find({
      contestId: contest.id,
      mode: "SUBMIT"
    }).sort({ createdAt: 1 }).lean();

    // 2. Fetch all registered users for this contest
    const registrations = await ContestRegistration.find({ contestId: contest.id }).lean();
    const registeredUserIds = new Set(registrations.map((r) => String(r.userId)));

    // 3. Collect all user IDs who have submissions or registrations
    const userIds = new Set([
      ...registeredUserIds,
      ...submissions.map((s) => String(s.userId))
    ]);

    if (userIds.size === 0) return [];

    // Fetch user profiles to display real avatars and badges
    const users = await User.find({
      _id: { $in: Array.from(userIds).filter((id) => mongoose.Types.ObjectId.isValid(id)) }
    }).lean();

    const userMap = new Map();
    for (const u of users) {
      userMap.set(String(u._id || u.id), u);
    }

    // Map contest problems to letters A, B, C, D...
    const problemMap = new Map();
    const contestProblems = contest.problems || [];
    contestProblems.forEach((p, idx) => {
      problemMap.set(p.id, {
        label: String.fromCharCode(65 + idx),
        points: p.points || 250
      });
    });

    const participantData = {};

    function calculateBadge(rating) {
      if (!rating) return "Newbie";
      if (rating >= 2400) return "Grandmaster";
      if (rating >= 2000) return "Master";
      if (rating >= 1600) return "Expert";
      if (rating >= 1200) return "Knight";
      return "Newbie";
    }

    // Initialize participants
    for (const userId of userIds) {
      const user = userMap.get(userId);
      participantData[userId] = {
        userId,
        username: user?.username || `User_${userId.slice(-6)}`,
        avatar: user?.avatar || "👤",
        badge: user?.badges?.[0] || calculateBadge(user?.rating || 1200),
        score: 0,
        penaltySeconds: 0,
        solvedProblems: new Set(),
        problemAttempts: {}
      };
    }

    const contestStart = new Date(contest.startTime).getTime();

    // Process submissions chronologically
    for (const sub of submissions) {
      const userId = String(sub.userId);
      const pData = participantData[userId];
      if (!pData) continue;

      const prob = problemMap.get(sub.problemId);
      if (!prob) continue;

      if (!pData.problemAttempts[sub.problemId]) {
        pData.problemAttempts[sub.problemId] = { solved: false, failedCount: 0, timeSec: 0 };
      }

      const att = pData.problemAttempts[sub.problemId];
      if (att.solved) continue;

      const subTime = new Date(sub.submittedAt).getTime();
      const relativeTimeSec = Math.max(0, Math.floor((subTime - contestStart) / 1000));

      if (sub.status === "Accepted" || sub.status === "ACCEPTED") {
        att.solved = true;
        att.timeSec = relativeTimeSec;
        pData.score += prob.points;
        pData.solvedProblems.add(prob.label);
        // Penalty: relative time + 20 minutes (1200s) for each failed attempt before AC
        pData.penaltySeconds += relativeTimeSec + att.failedCount * 1200;
      } else {
        att.failedCount += 1;
      }
    }

    function formatPenalty(totalSeconds) {
      if (totalSeconds === 0) return "00:00:00";
      const hrs = Math.floor(totalSeconds / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;
      return [
        String(hrs).padStart(2, "0"),
        String(mins).padStart(2, "0"),
        String(secs).padStart(2, "0")
      ].join(":");
    }

    const list = Object.values(participantData).map((p) => ({
      userId: p.userId,
      username: p.username,
      avatar: p.avatar,
      badge: p.badge,
      score: p.score,
      penalty: formatPenalty(p.penaltySeconds),
      solvedProblems: Array.from(p.solvedProblems).sort(),
      penaltySeconds: p.penaltySeconds
    }));

    // Sort by score (desc), then by penalty (asc), then by username
    list.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.penaltySeconds !== b.penaltySeconds) return a.penaltySeconds - b.penaltySeconds;
      return a.username.localeCompare(b.username);
    });

    return list.map((item, index) => {
      const { penaltySeconds, ...rest } = item;
      return {
        ...rest,
        rank: index + 1
      };
    });
  } catch (error) {
    console.error("[ContestStore] getContestLeaderboard error:", error);
    return [];
  }
}
