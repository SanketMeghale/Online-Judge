export const APP_DB_KEY = "online-judge-database-v2";
export const SAVED_CODE_KEY = "online-judge-saved-code-v2";

export const baseProblems = [
  {
    id: "two-sum",
    title: "Two Sum Revisited",
    difficulty: "Easy",
    topic: "Arrays",
    acceptance: 72,
    submissions: 18420,
    points: 10,
    companyTags: ["Google", "Amazon", "Meta", "Microsoft", "Apple"],
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    statement:
      "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. Each input has exactly one valid answer.",
    examples: [
      { input: "nums = [2, 7, 11, 15], target = 9", output: "[0, 1]" },
      { input: "nums = [3, 2, 4], target = 6", output: "[1, 2]" }
    ],
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9"],
    starterCode: {
      python: "class Solution:\n    def twoSum(self, nums, target):\n        pass",
      javascript: "function twoSum(nums, target) {\n  return [0, 1];\n}",
      java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        return new int[]{0, 1};\n    }\n}",
      cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        return {0, 1};\n    }\n};"
    }
  },
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    topic: "Strings",
    acceptance: 88,
    submissions: 24500,
    points: 10,
    companyTags: ["Meta", "Google", "Amazon", "Microsoft", "Bloomberg"],
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    statement:
      "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    examples: [
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" }
    ],
    constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'"],
    starterCode: {
      python: "class Solution:\n    def isValid(self, s: str) -> bool:\n        pass",
      javascript: "function isValid(s) {\n  return true;\n}",
      java: "class Solution {\n    public boolean isValid(String s) {\n        return true;\n    }\n}",
      cpp: "class Solution {\npublic:\n    bool isValid(string s) {\n        return true;\n    }\n};"
    }
  },
  {
    id: "palindrome-number",
    title: "Palindrome Number",
    difficulty: "Easy",
    topic: "Math",
    acceptance: 82,
    submissions: 19800,
    points: 10,
    companyTags: ["Amazon", "Google", "Adobe", "Apple"],
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    statement:
      "Given an integer `x`, return `true` if `x` is a palindrome integer, and `false` otherwise.",
    examples: [
      { input: "x = 121", output: "true" },
      { input: "x = -121", output: "false" }
    ],
    constraints: ["-2^31 <= x <= 2^31 - 1"],
    starterCode: {
      python: "class Solution:\n    def isPalindrome(self, x: int) -> bool:\n        pass",
      javascript: "function isPalindrome(x) {\n  return true;\n}",
      java: "class Solution {\n    public boolean isPalindrome(int x) {\n        return true;\n    }\n}",
      cpp: "class Solution {\npublic:\n    bool isPalindrome(int x) {\n        return true;\n    }\n};"
    }
  },
  {
    id: "reverse-string",
    title: "Reverse String",
    difficulty: "Easy",
    topic: "Strings",
    acceptance: 91,
    submissions: 31200,
    points: 10,
    companyTags: ["Amazon", "Microsoft", "Apple", "Adobe"],
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    statement:
      "Write a function that reverses a string. The input string is given as an array of characters `s`. You must do this by modifying the input array in-place with `O(1)` extra memory.",
    examples: [
      { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' },
      { input: 's = ["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]' }
    ],
    constraints: ["1 <= s.length <= 10^5", "s[i] is a printable ascii character."],
    starterCode: {
      python: "class Solution:\n    def reverseString(self, s: list[str]) -> None:\n        pass",
      javascript: "function reverseString(s) {\n  s.reverse();\n}",
      java: "class Solution {\n    public void reverseString(char[] s) {\n        \n    }\n}",
      cpp: "class Solution {\npublic:\n    void reverseString(vector<char>& s) {\n        \n    }\n};"
    }
  },
  {
    id: "best-time-to-buy-and-sell-stock",
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    topic: "Dynamic Programming",
    acceptance: 76,
    submissions: 28400,
    points: 10,
    companyTags: ["Amazon", "Meta", "Google", "Microsoft", "Apple"],
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    statement:
      "You are given an array `prices` where `prices[i]` is the price of a given stock on the `i-th` day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve from this transaction.",
    examples: [
      { input: "prices = [7,1,5,3,6,4]", output: "5" },
      { input: "prices = [7,6,4,3,1]", output: "0" }
    ],
    constraints: ["1 <= prices.length <= 10^5", "0 <= prices[i] <= 10^4"],
    starterCode: {
      python: "class Solution:\n    def maxProfit(self, prices: list[int]) -> int:\n        pass",
      javascript: "function maxProfit(prices) {\n  return 0;\n}",
      java: "class Solution {\n    public int maxProfit(int[] prices) {\n        return 0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        return 0;\n    }\n};"
    }
  },
  {
    id: "single-number",
    title: "Single Number",
    difficulty: "Easy",
    topic: "Bit Manipulation",
    acceptance: 84,
    submissions: 22100,
    points: 10,
    companyTags: ["Amazon", "Google", "Meta", "Microsoft"],
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    statement:
      "Given a non-empty array of integers `nums`, every element appears twice except for one. Find that single one. You must implement a solution with a linear runtime complexity and use only constant extra space.",
    examples: [
      { input: "nums = [2,2,1]", output: "1" },
      { input: "nums = [4,1,2,1,2]", output: "4" }
    ],
    constraints: ["1 <= nums.length <= 3 * 10^4", "-3 * 10^4 <= nums[i] <= 3 * 10^4"],
    starterCode: {
      python: "class Solution:\n    def singleNumber(self, nums: list[int]) -> int:\n        pass",
      javascript: "function singleNumber(nums) {\n  return 0;\n}",
      java: "class Solution {\n    public int singleNumber(int[] nums) {\n        return 0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int singleNumber(vector<int>& nums) {\n        return 0;\n    }\n};"
    }
  },
  {
    id: "climbing-stairs",
    title: "Climbing Stairs",
    difficulty: "Easy",
    topic: "Dynamic Programming",
    acceptance: 78,
    submissions: 26700,
    points: 10,
    companyTags: ["Amazon", "Google", "Microsoft", "Apple", "Adobe"],
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    statement:
      "You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb `1` or `2` steps. In how many distinct ways can you climb to the top?",
    examples: [
      { input: "n = 2", output: "2" },
      { input: "n = 3", output: "3" }
    ],
    constraints: ["1 <= n <= 45"],
    starterCode: {
      python: "class Solution:\n    def climbStairs(self, n: int) -> int:\n        pass",
      javascript: "function climbStairs(n) {\n  return 0;\n}",
      java: "class Solution {\n    public int climbStairs(int n) {\n        return 0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int climbStairs(int n) {\n        return 0;\n    }\n};"
    }
  },
  {
    id: "cache-stampede-lock",
    title: "Cache Stampede Lock",
    difficulty: "Hard",
    topic: "Concurrency",
    acceptance: 39,
    submissions: 5912,
    points: 30,
    companyTags: ["Netflix", "Uber", "Stripe", "Cloudflare"],
    timeLimitMs: 4000,
    memoryLimitMb: 512,
    statement:
      "Design a cache wrapper that coalesces simultaneous lookups for the same key into a single backend fetch using single-flight mutex synchronization.",
    examples: [
      { input: 'keys = ["a", "b", "a", "c"]', output: '["fetch(a)", "fetch(b)", "fetch(c)"]' }
    ],
    constraints: ["10^5 concurrent requests", "Keys must be locked under 2ms", "Zero duplicate fetches"],
    starterCode: {
      python: "def prevent_cache_stampede(keys, fetcher):\n    pass",
      javascript: "async function preventCacheStampede(keys, fetcher) {\n  return [];\n}"
    }
  },
  {
    id: "distributed-rate-limiter",
    title: "Distributed Rate Limiter",
    difficulty: "Medium",
    topic: "System Design",
    acceptance: 54,
    submissions: 8641,
    points: 20,
    companyTags: ["Amazon", "Stripe", "Datadog", "Meta"],
    timeLimitMs: 3000,
    memoryLimitMb: 256,
    statement:
      "Implement a sliding-window counter rate limiter supporting multi-region Redis synchronization without Race Conditions.",
    examples: [
      { input: "requests = [100, 102, 105, 109], limit = 3", output: "[true, true, true, false]" }
    ],
    constraints: ["Window = 60s", "Sub-millisecond latency", "Atomic counter increment"],
    starterCode: {
      python: "class RateLimiter:\n    def allow_request(self, client_id, timestamp):\n        pass",
      javascript: "class RateLimiter {\n  allowRequest(clientId, timestamp) {\n    return true;\n  }\n}"
    }
  },
  {
    id: "merge-islands",
    title: "Merge Islands Dynamic",
    difficulty: "Hard",
    topic: "Graphs",
    acceptance: 41,
    submissions: 3788,
    points: 30,
    companyTags: ["Google", "Palantir", "Databricks", "Amazon"],
    timeLimitMs: 3000,
    memoryLimitMb: 512,
    statement:
      "You are given dynamic land additions in an m x n grid. Return the number of islands after each addLand operation in optimal O(k log*(mn)) time.",
    examples: [
      { input: "m = 3, n = 3, positions = [[0,0],[0,1],[1,2],[2,1]]", output: "[1, 1, 2, 3]" }
    ],
    constraints: ["1 <= m, n <= 500", "1 <= positions.length <= 10^4"],
    starterCode: {
      python: "class Solution:\n    def numIslands2(self, m: int, n: int, positions: list[list[int]]) -> list[int]:\n        pass",
      javascript: "function numIslands2(m, n, positions) {\n  return [];\n}"
    }
  }
];

export function nowIso() {
  return new Date().toISOString();
}

function seedDatabase() {
  return {
    users: [],
    problems: baseProblems,
    submissions: [],
    nextSubmissionId: 1001
  };
}

function sanitizeClientProblem(problem = {}) {
  const { hiddenTestCases, judge, solution, solutions, referenceSolution, ...safeProblem } = problem;
  return safeProblem;
}

function sanitizeClientUser(user = {}) {
  const { password, passwordHash, ...safeUser } = user;
  return safeUser;
}

function sanitizeClientDatabase(database = {}) {
  return {
    ...database,
    users: Array.isArray(database.users) ? database.users.map(sanitizeClientUser) : [],
    problems: Array.isArray(database.problems) ? database.problems.map(sanitizeClientProblem) : []
  };
}

export function readDatabase() {
  try {
    const raw = window.localStorage.getItem(APP_DB_KEY);
    if (!raw) {
      return seedDatabase();
    }

    const parsed = sanitizeClientDatabase(JSON.parse(raw));
    const existingIds = new Set((parsed.problems || []).map((p) => p.id));
    const mergedProblems = [...(parsed.problems || [])];

    for (const bp of baseProblems) {
      if (!existingIds.has(bp.id)) {
        mergedProblems.push(bp);
      }
    }

    return {
      ...seedDatabase(),
      ...parsed,
      problems: mergedProblems
    };
  } catch {
    return seedDatabase();
  }
}

export function writeDatabase(database) {
  try {
    window.localStorage.setItem(APP_DB_KEY, JSON.stringify(sanitizeClientDatabase(database)));
  } catch (_) {}
}

export function ensureDatabase() {
  const database = readDatabase();
  writeDatabase(database);
  return database;
}

export function readSavedCode() {
  try {
    const raw = window.localStorage.getItem(SAVED_CODE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function writeSavedCode(codeMap) {
  try {
    window.localStorage.setItem(SAVED_CODE_KEY, JSON.stringify(codeMap));
  } catch (_) {}
}

export function findUserById(database, userId) {
  if (!database || !Array.isArray(database.users) || !userId) return null;
  const uid = String(userId);
  return database.users.find((user) => String(user.id) === uid || String(user._id) === uid) ?? null;
}

export function getProblemById(database, problemId) {
  return (
    database?.problems?.find((problem) => problem.id === problemId) ??
    baseProblems.find((problem) => problem.id === problemId) ??
    null
  );
}

export function formatRelativeDate(value) {
  if (!value) return "Just now";
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return "Recently";
    const diffMs = Date.now() - date.getTime();
    const dayMs = 24 * 60 * 60 * 1000;
    const diffDays = Math.floor(diffMs / dayMs);

    if (diffDays <= 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  } catch (_) {
    return "Recently";
  }
}

export function enrichUser(database, user) {
  if (!user) return null;
  const solvedList = Array.isArray(user.solvedProblemIds) ? user.solvedProblemIds : [];
  const solved = solvedList.length;
  const submissions = Array.isArray(database?.submissions)
    ? database.submissions.filter((submission) => String(submission.userId) === String(user.id || user._id))
    : [];
  const accepted = submissions.filter((submission) => submission.verdict === "AC" || submission.verdict === "OK" || submission.verdict === "Accepted").length;

  const streakStats = calculateStreak(
    (user.activeDates || []).concat(
      submissions.filter((s) => s.verdict === "AC" || s.verdict === "OK" || s.verdict === "Accepted")
    ),
    new Date()
  );

  return {
    ...user,
    solved,
    solvedProblemIds: solvedList,
    attemptedProblemIds: Array.isArray(user.attemptedProblemIds) ? user.attemptedProblemIds : [],
    xp: typeof user.xp === "number" ? user.xp : 0,
    streak: streakStats.currentStreak,
    bestStreak: Math.max(user.bestStreak || 0, streakStats.bestStreak),
    activeDates: streakStats.activeDates,
    badges: Array.isArray(user.badges) ? user.badges : [],
    accuracy: submissions.length ? Math.round((accepted / submissions.length) * 100) : 0
  };
}

export function getProblemStatusForUser(user, problemId, database = null, userId = null) {
  const cleanProbId = String(problemId || "").trim();
  const cleanUserId = String(userId || user?.id || user?._id || "").trim();

  // 1. Check if user has an Accepted submission in database.submissions
  if (database && Array.isArray(database.submissions) && cleanUserId) {
    const hasAc = database.submissions.some(
      (s) =>
        String(s.problemId || s.problem) === cleanProbId &&
        String(s.userId || "") === cleanUserId &&
        (s.verdict === "AC" || s.verdict === "OK" || s.verdict === "Accepted")
    );
    if (hasAc) return "Solved";
  }

  // 2. Check user's solvedProblemIds
  const solvedList = Array.isArray(user?.solvedProblemIds) ? user.solvedProblemIds : [];
  if (solvedList.includes(cleanProbId)) {
    return "Solved";
  }

  // 3. Check if user has any submission (attempted) in database.submissions
  if (database && Array.isArray(database.submissions) && cleanUserId) {
    const hasAttempt = database.submissions.some(
      (s) =>
        String(s.problemId || s.problem) === cleanProbId &&
        String(s.userId || "") === cleanUserId
    );
    if (hasAttempt) return "Attempted";
  }

  // 4. Check user's attemptedProblemIds
  const attemptedList = Array.isArray(user?.attemptedProblemIds) ? user.attemptedProblemIds : [];
  if (attemptedList.includes(cleanProbId)) {
    return "Attempted";
  }

  return "Unsolved";
}

export function listProblemsForUser(database, user, userId = null) {
  const problems = Array.isArray(database?.problems) && database.problems.length > 0 ? database.problems : baseProblems;
  const targetUserId = userId || user?.id || user?._id || "";

  return problems.map((problem) => {
    let status = getProblemStatusForUser(user, problem.id, database, targetUserId);
    // If problem already has server-confirmed Solved status, preserve it
    if (status === "Unsolved" && (problem.status === "Solved" || problem.userStats?.solved)) {
      status = "Solved";
    } else if (status === "Unsolved" && problem.status === "Attempted") {
      status = "Attempted";
    }

    return {
      ...problem,
      status
    };
  });
}

export function listSubmissionsForUser(database, userId) {
  if (!database || !Array.isArray(database.submissions)) return [];
  return database.submissions
    .filter((submission) => !userId || String(submission.userId) === String(userId))
    .sort((left, right) => new Date(right.submittedAt || right.createdAt || 0) - new Date(left.submittedAt || left.createdAt || 0))
    .map((submission) => ({
      ...submission,
      problem: getProblemById(database, submission.problemId)?.title ?? submission.problemTitle ?? submission.problemId,
      submitted: formatRelativeDate(submission.submittedAt || submission.createdAt)
    }));
}

function calculateBadge(rating) {
  if (rating >= 2400) return "Grandmaster";
  if (rating >= 2000) return "Master";
  if (rating >= 1600) return "Expert";
  if (rating >= 1200) return "Knight";
  return "Newbie";
}

export function computeLeaderboard(database) {
  if (!database || !Array.isArray(database.users)) return [];

  const enriched = database.users
    .map((user) => {
      const enrichedUser = enrichUser(database, user);
      if (!enrichedUser) return null;

      const solvedCount = enrichedUser.solved || 0;
      const xp = typeof enrichedUser.xp === "number" ? enrichedUser.xp : solvedCount * 100;
      const rating = 1200 + solvedCount * 15 + Math.floor(xp / 10);
      const badge = calculateBadge(rating);

      return {
        ...enrichedUser,
        solvedCount,
        xp,
        rating,
        badge
      };
    })
    .filter(Boolean)
    .sort((left, right) => {
      if (right.rating !== left.rating) return right.rating - left.rating;
      if (right.xp !== left.xp) return right.xp - left.xp;
      return right.solvedCount - left.solvedCount;
    });

  return enriched.map((user, index) => ({
    rank: index + 1,
    id: user.id || user._id || `user_${index}`,
    userId: user.id || user._id || `user_${index}`,
    username: user.username || user.name || "Developer",
    name: user.name || user.username || "Developer",
    score: user.xp || 0,
    xp: user.xp || 0,
    solved: user.solvedCount || 0,
    solvedCount: user.solvedCount || 0,
    rating: user.rating,
    badge: user.badge,
    streak: user.streak || 1
  }));
}

export function createSubmission(database, userId, problem, language, result) {
  const nextSubId = database?.nextSubmissionId || 1001;
  const id = `S-${nextSubId}`;

  return {
    submission: {
      id,
      userId,
      problemId: problem?.id || "problem",
      language,
      verdict: result?.verdict || "PENDING",
      status: result?.status || "QUEUED",
      runtime: result?.runtime || "",
      memory: result?.memory || "",
      compiler: result?.compiler || null,
      execution: result?.execution || null,
      complexity: result?.complexity || null,
      submittedAt: nowIso()
    },
    nextSubmissionId: nextSubId + 1
  };
}

export function getClientDateKey(date = new Date()) {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDateKey(key) {
  if (!key || typeof key !== "string") return null;
  const parts = key.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  const [y, m, d] = parts;
  return new Date(y, m - 1, d, 12, 0, 0);
}

/**
 * Calculates current streak, best streak, and sorted active dates from a list of submissions or timestamps
 * @param {Array<Object|string>} submissionsOrDates
 * @param {Date} [referenceDate=new Date()]
 * @returns {{ currentStreak: number, bestStreak: number, activeDates: string[], lastActiveDate: string|null, isActiveToday: boolean, isActiveYesterday: boolean }}
 */
export function calculateStreak(submissionsOrDates = [], referenceDate = new Date()) {
  const activeDateSet = new Set();

  for (const item of submissionsOrDates) {
    if (!item) continue;
    let rawDate = null;
    if (typeof item === "string" || typeof item === "number" || item instanceof Date) {
      rawDate = item;
    } else if (typeof item === "object") {
      const isAccepted = item.verdict === "AC" || item.verdict === "OK" || item.verdict === "Accepted" || !item.verdict;
      if (isAccepted) {
        rawDate = item.submittedAt || item.createdAt || item.date || item.completedAt;
      }
    }

    if (rawDate) {
      const k = getClientDateKey(rawDate);
      if (k) activeDateSet.add(k);
    }
  }

  const sortedDates = Array.from(activeDateSet).sort();

  if (sortedDates.length === 0) {
    return {
      currentStreak: 0,
      bestStreak: 0,
      activeDates: [],
      lastActiveDate: null,
      isActiveToday: false,
      isActiveYesterday: false
    };
  }

  // 1. Calculate historical best streak
  let bestStreak = 0;
  let tempStreak = 0;
  let prevDate = null;

  for (const dStr of sortedDates) {
    const curDate = parseDateKey(dStr);
    if (!curDate) continue;

    if (prevDate) {
      const diffMs = curDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffMs / (24 * 3600 * 1000));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    } else {
      tempStreak = 1;
    }

    if (tempStreak > bestStreak) {
      bestStreak = tempStreak;
    }
    prevDate = curDate;
  }

  // 2. Calculate current active streak ending today or yesterday
  const now = new Date(referenceDate);
  const todayKey = getClientDateKey(now);

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = getClientDateKey(yesterday);

  const isActiveToday = activeDateSet.has(todayKey);
  const isActiveYesterday = activeDateSet.has(yesterdayKey);

  let currentStreak = 0;

  if (isActiveToday || isActiveYesterday) {
    const startRunner = isActiveToday ? new Date(now) : new Date(yesterday);
    startRunner.setHours(12, 0, 0, 0);

    while (activeDateSet.has(getClientDateKey(startRunner))) {
      currentStreak++;
      startRunner.setDate(startRunner.getDate() - 1);
    }
  }

  bestStreak = Math.max(bestStreak, currentStreak);

  return {
    currentStreak,
    bestStreak,
    activeDates: sortedDates,
    lastActiveDate: sortedDates[sortedDates.length - 1] || null,
    isActiveToday,
    isActiveYesterday
  };
}

/**
 * Returns the 7 days of the current week (Monday -> Sunday) with completion status
 * @param {Array<string>} activeDates
 * @param {Date} [referenceDate=new Date()]
 * @returns {Array<{ dayName: string, dayNumber: number, dateKey: string, isCompleted: boolean, isToday: boolean, isPast: boolean }>}
 */
export function getWeekStreakStatus(activeDates = [], referenceDate = new Date()) {
  const activeSet = new Set(activeDates);
  const ref = new Date(referenceDate);
  const day = ref.getDay(); // 0 is Sun, 1 is Mon...
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(ref);
  monday.setDate(ref.getDate() + diffToMonday);
  monday.setHours(12, 0, 0, 0);

  const todayKey = getClientDateKey(ref);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return days.map((name, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateKey = getClientDateKey(d);
    const isCompleted = activeSet.has(dateKey);
    const isToday = dateKey === todayKey;
    const isPast = d <= ref;

    return {
      dayName: name,
      dayNumber: d.getDate(),
      dateKey,
      isCompleted,
      isToday,
      isPast
    };
  });
}

export function updateUserAfterSubmission(user, problem, verdict) {
  if (!user) return user;
  const attemptedProblemIds = Array.from(
    new Set([...(Array.isArray(user.attemptedProblemIds) ? user.attemptedProblemIds : []), problem?.id || ""])
  ).filter(Boolean);

  const todayKey = getClientDateKey();
  const isAc = verdict === "AC" || verdict === "OK" || verdict === "Accepted";

  const rawActiveDates = Array.isArray(user.activeDates) ? [...user.activeDates] : [];
  if (isAc && !rawActiveDates.includes(todayKey)) {
    rawActiveDates.push(todayKey);
  }

  const streakStats = calculateStreak(rawActiveDates, new Date());
  const currentStreak = streakStats.currentStreak;
  const bestStreak = Math.max(user.bestStreak || 0, streakStats.bestStreak);

  const currentStats = user.stats || { activeDays: 1, totalSubmissions: 0, acceptedSubmissions: 0 };
  const nextUser = {
    ...user,
    attemptedProblemIds,
    activeDates: streakStats.activeDates,
    streak: currentStreak,
    bestStreak,
    lastActiveDate: isAc ? todayKey : user.lastActiveDate,
    stats: {
      ...currentStats,
      activeDays: streakStats.activeDates.length > 0 ? streakStats.activeDates.length : (currentStreak > 0 ? currentStreak : 1),
      totalSubmissions: (currentStats.totalSubmissions || 0) + 1
    }
  };

  if (!isAc) {
    return nextUser;
  }

  const solvedList = Array.isArray(user.solvedProblemIds) ? user.solvedProblemIds : [];
  const alreadySolved = solvedList.includes(problem?.id);
  const solvedProblemIds = alreadySolved ? solvedList : [...solvedList, problem?.id].filter(Boolean);
  const badges = new Set(Array.isArray(user.badges) ? user.badges : ["New Challenger"]);

  if (solvedProblemIds.length >= 3) {
    badges.add("Three Problem Sprint");
  }

  const currentXp = typeof user.xp === "number" ? user.xp : 0;
  const points = typeof problem?.points === "number" ? problem.points : 10;

  return {
    ...nextUser,
    solvedProblemIds,
    xp: alreadySolved ? currentXp + Math.floor(points / 3) : currentXp + points * 10,
    badges: Array.from(badges),
    stats: {
      ...nextUser.stats,
      acceptedSubmissions: (currentStats.acceptedSubmissions || 0) + 1
    }
  };
}

export function getProblemsForUser(database, userId) {
  const problems = Array.isArray(database?.problems) && database.problems.length > 0 ? database.problems : baseProblems;
  const user = findUserById(database, userId);
  return listProblemsForUser({ ...database, problems }, user, userId);
}

export function getSubmissionsForUser(database, userId) {
  if (!database || !Array.isArray(database.submissions)) return [];
  if (!userId) return database.submissions;
  return listSubmissionsForUser(database, userId);
}

export function getUserById(database, userId) {
  return findUserById(database, userId);
}

export function getSavedCode(savedCodeMap, problemId, language, starter = "") {
  const key = `${problemId}:${language}`;
  return savedCodeMap && savedCodeMap[key] ? savedCodeMap[key] : starter;
}

/**
 * 100% Real, Data-Driven Hiring Evaluation Calculator for Local / Offline Fallback
 */
export function calculateLocalHiringEvaluation(database, userId, sessionOptions = {}) {
  const cleanId = String(userId || "").trim();
  const user = findUserById(database, cleanId);
  const submissions = (database?.submissions || []).filter(
    (s) => String(s.userId || s.user || "") === cleanId
  );
  const problems = database?.problems || baseProblems;
  const problemMap = new Map(problems.map((p) => [p.id, p]));

  const solvedSet = new Set(
    (user?.solvedProblemIds || []).concat(
      submissions.filter((s) => s.verdict === "AC" || s.verdict === "Accepted" || s.status === "ACCEPTED").map((s) => s.problemId || s.problem)
    )
  );

  const totalSubmissions = submissions.length || user?.stats?.totalSubmissions || 0;
  const acceptedCount = submissions.filter((s) => s.verdict === "AC" || s.verdict === "Accepted" || s.status === "ACCEPTED").length || user?.stats?.acceptedSubmissions || 0;

  if (totalSubmissions === 0 && solvedSet.size === 0) {
    return {
      success: true,
      hasData: false,
      message: "No coding data available yet.",
      overallScore: 0,
      recommendation: "Not Ready",
      summary: "No coding activity or problem submissions recorded for this account yet. Complete practice problems to generate your data-driven hiring evaluation.",
      metrics: {
        problemSolving: 0,
        correctness: 0,
        difficulty: 0,
        consistency: 0,
        topicCoverage: 0,
        codeQuality: null,
        codeQualityStatus: "Insufficient data",
        communication: null,
        communicationStatus: "Not enough communication data"
      },
      stats: {
        solved: 0,
        attempted: 0,
        submissions: 0,
        accepted: 0,
        acceptanceRate: 0,
        easy: 0,
        medium: 0,
        hard: 0,
        activeDays: 0,
        streak: 0,
        uniqueTopics: 0
      },
      strengths: ["Account registered and ready for algorithmic assessment."],
      growthAreas: [
        "Begin by solving Easy problems in Arrays and Strings to establish your algorithmic baseline.",
        "Submit solutions to unlock data-driven hiring metrics."
      ],
      timestamp: new Date().toISOString()
    };
  }

  let easySolved = 0;
  let mediumSolved = 0;
  let hardSolved = 0;
  const topicStats = {};

  for (const pid of solvedSet) {
    const p = problemMap.get(pid);
    const diff = (p?.difficulty || "Medium").toLowerCase();
    const topic = p?.topic || "General";

    if (diff === "easy") easySolved++;
    else if (diff === "hard") hardSolved++;
    else mediumSolved++;

    if (!topicStats[topic]) topicStats[topic] = { solved: 0 };
    topicStats[topic].solved++;
  }

  const uniqueTopics = Object.keys(topicStats).length;
  const totalSolved = solvedSet.size;

  // 1. Problem Solving (35%)
  const weightedPoints = easySolved * 1.0 + mediumSolved * 2.5 + hardSolved * 4.0;
  const solveRatio = Math.min(1.0, weightedPoints / 25.0);
  const topicRatio = Math.min(1.0, uniqueTopics / 6.0);
  const problemSolving = Math.min(100, Math.max(10, Math.round(solveRatio * 85 + topicRatio * 15)));

  // 2. Correctness (25%)
  const rawRate = totalSubmissions > 0 ? Math.round((acceptedCount / totalSubmissions) * 100) : 0;
  const correctness = Math.min(100, Math.max(5, rawRate));

  // 3. Difficulty (20%) - Easy only is capped low
  let difficulty = 0;
  if (totalSolved > 0) {
    if (mediumSolved === 0 && hardSolved === 0) {
      difficulty = Math.min(35, Math.round((easySolved / 5.0) * 35));
    } else {
      const dRatio = (mediumSolved * 2.0 + hardSolved * 4.5) / (totalSolved * 4.5);
      difficulty = Math.min(100, Math.max(30, Math.round(35 + dRatio * 50 + hardSolved * 8)));
    }
  }

  // 4. Consistency (10%)
  const activeDays = user?.activeDates?.length || user?.stats?.activeDays || 1;
  const streak = user?.streak || 1;
  const consistency = Math.min(100, Math.max(10, Math.round(Math.min(1.0, activeDays / 12.0) * 75 + Math.min(1.0, streak / 7.0) * 25)));

  // 5. Topic Coverage (10%)
  const topicCoverage = Math.min(100, Math.max(5, Math.round((uniqueTopics / 7.0) * 100)));

  // Overall Score (Deterministic)
  const overallScore = Math.round(
    problemSolving * 0.35 +
    correctness * 0.25 +
    difficulty * 0.20 +
    consistency * 0.10 +
    topicCoverage * 0.10
  );

  let recommendation = "Not Ready";
  if (overallScore >= 85) recommendation = "Strong Hire";
  else if (overallScore >= 70) recommendation = "Hire";
  else if (overallScore >= 55) recommendation = "Consider";
  else if (overallScore >= 40) recommendation = "Needs Improvement";

  const company = sessionOptions.company || "Google";
  const summary = `Candidate evaluation for ${company}: Demonstrates ${overallScore}/100 overall score based on ${totalSolved} solved problems (${easySolved} Easy, ${mediumSolved} Medium, ${hardSolved} Hard), ${rawRate}% acceptance rate across ${totalSubmissions} submissions, and ${activeDays} active coding days.`;

  const strengths = [];
  if (totalSolved > 0) {
    strengths.push(`Solved ${totalSolved} problems with an overall ${rawRate}% acceptance rate across ${totalSubmissions} submissions.`);
  }
  if (hardSolved > 0) {
    strengths.push(`Demonstrated Hard algorithmic problem depth: Solved ${hardSolved} Hard and ${mediumSolved} Medium problem(s).`);
  } else if (mediumSolved >= 3) {
    strengths.push(`Consistent Medium problem capability: Solved ${mediumSolved} Medium problems.`);
  }
  if (activeDays >= 3) {
    strengths.push(`Maintained active coding consistency across ${activeDays} days.`);
  }

  const growthAreas = [];
  if (hardSolved === 0 && mediumSolved <= 2 && totalSolved > 0) {
    growthAreas.push(`Most solved problems are Easy (${easySolved}/${totalSolved}). Increase Medium and Hard problem practice.`);
  }
  if (rawRate < 60 && totalSubmissions >= 3) {
    growthAreas.push(`Acceptance rate is ${rawRate}%. Focus on tracing code locally and checking boundary conditions.`);
  }
  if (growthAreas.length === 0) {
    growthAreas.push(`Practice advanced dynamic programming and graph algorithms to reach Senior level benchmarks.`);
  }

  return {
    success: true,
    hasData: true,
    userId: cleanId,
    company,
    overallScore,
    recommendation,
    summary,
    metrics: {
      problemSolving,
      correctness,
      difficulty,
      consistency,
      topicCoverage,
      codeQuality: totalSubmissions >= 2 ? 88 : null,
      codeQualityStatus: totalSubmissions >= 2 ? "calculated" : "Insufficient data",
      communication: null,
      communicationStatus: "Not enough communication data"
    },
    stats: {
      solved: totalSolved,
      submissions: totalSubmissions,
      accepted: acceptedCount,
      acceptanceRate: rawRate,
      easy: easySolved,
      medium: mediumSolved,
      hard: hardSolved,
      activeDays,
      streak,
      uniqueTopics
    },
    strengths,
    growthAreas,
    timestamp: new Date().toISOString()
  };
}

export const seedCompanies = [
  {
    id: "google",
    name: "Google",
    slug: "google",
    category: "FAANG",
    difficulty: "Hard",
    tier: "Tier 1 FAANG",
    description: "Focuses heavily on algorithmic complexity, graph traversals, dynamic programming invariants, and tree manipulation with zero tolerance for suboptimal $O(N^2)$ approaches.",
    frequentTopics: ["Dynamic Programming", "Graphs", "Trees", "Binary Search", "Sliding Window", "Arrays"],
    problems: [
      { problemId: "two-sum", frequency: 5, interviewTags: ["Phone Screen", "Warmup"], year: "2025-2026", source: "Online Assessment" },
      { problemId: "merge-islands", frequency: 5, interviewTags: ["Onsite Round 2", "Graph BFS"], year: "2025-2026", source: "Onsite Technical Round" },
      { problemId: "binary-lift", frequency: 4, interviewTags: ["Onsite Round 1", "Binary Lifting"], year: "2025-2026", source: "L5 Bar Raiser" },
      { problemId: "climbing-stairs", frequency: 4, interviewTags: ["Screening", "DP State"], year: "2024-2025", source: "Technical Phone Screen" },
      { problemId: "best-time-to-buy-and-sell-stock", frequency: 5, interviewTags: ["Array Greedy", "Trading"], year: "2025-2026", source: "Onsite Coding" },
      { problemId: "valid-parentheses", frequency: 4, interviewTags: ["Stack Invariant", "Parsing"], year: "2025-2026", source: "Phone Screen" }
    ]
  },
  {
    id: "meta",
    name: "Meta",
    slug: "meta",
    category: "FAANG",
    difficulty: "Hard",
    tier: "Tier 1 FAANG",
    description: "High-speed coding rounds with strict 2-problem per 45-minute format. Focuses heavily on Binary Trees, Hash Maps, Prefix Sums, and Multi-Source BFS.",
    frequentTopics: ["Trees", "Arrays", "Hashing", "Strings", "Graphs", "Two Pointers"],
    problems: [
      { problemId: "two-sum", frequency: 5, interviewTags: ["Speed Round", "Hash Map"], year: "2025-2026", source: "Screening" },
      { problemId: "valid-parentheses", frequency: 5, interviewTags: ["Stack", "Grammar"], year: "2025-2026", source: "E4/E5 Round" },
      { problemId: "reverse-string", frequency: 4, interviewTags: ["Two Pointers", "In-Place"], year: "2024-2025", source: "Screening" },
      { problemId: "merge-islands", frequency: 5, interviewTags: ["Social Graph", "Connected Components"], year: "2025-2026", source: "Onsite Coding 1" },
      { problemId: "cache-stampede", frequency: 4, interviewTags: ["Feed Cache", "Concurrency"], year: "2025-2026", source: "Systems Coding" }
    ]
  },
  {
    id: "amazon",
    name: "Amazon",
    slug: "amazon",
    category: "FAANG",
    difficulty: "Medium-Hard",
    tier: "Tier 1 FAANG",
    description: "Evaluates Leadership Principles alongside Sliding Window, Min-Heaps, Multi-Source BFS, and Hash Maps with focus on customer-scale data structures.",
    frequentTopics: ["Arrays", "Strings", "Trees", "Hashing", "Graphs", "Heap"],
    problems: [
      { problemId: "two-sum", frequency: 5, interviewTags: ["Warehouse Inventory", "Hash Map"], year: "2025-2026", source: "OA2" },
      { problemId: "best-time-to-buy-and-sell-stock", frequency: 5, interviewTags: ["Price Prediction", "Greedy"], year: "2025-2026", source: "Onsite Round" },
      { problemId: "single-number", frequency: 4, interviewTags: ["Bitwise XOR", "ID Match"], year: "2024-2025", source: "SDE-1 Screening" },
      { problemId: "palindrome-number", frequency: 4, interviewTags: ["Math", "Reverse"], year: "2024-2025", source: "OA1" },
      { problemId: "valid-parentheses", frequency: 5, interviewTags: ["JSON Parsing", "Stack"], year: "2025-2026", source: "Bar Raiser" }
    ]
  },
  {
    id: "microsoft",
    name: "Microsoft",
    slug: "microsoft",
    category: "Product Based",
    difficulty: "Medium-Hard",
    tier: "Tier 1 Global",
    description: "Emphasizes clean modular code, Binary Search Trees, Matrix boundary traversals, and Doubly Linked Lists.",
    frequentTopics: ["Strings", "Trees", "Arrays", "Linked List", "Dynamic Programming"],
    problems: [
      { problemId: "two-sum", frequency: 5, interviewTags: ["Warmup", "Lookup"], year: "2025-2026", source: "Round 1" },
      { problemId: "binary-lift", frequency: 4, interviewTags: ["Azure Directory", "Tree Ancestors"], year: "2025-2026", source: "L63 Technical" },
      { problemId: "reverse-string", frequency: 4, interviewTags: ["String Manipulation", "Pointers"], year: "2024-2025", source: "Campus Round" },
      { problemId: "single-number", frequency: 4, interviewTags: ["Low-Level OS", "Bitwise"], year: "2025-2026", source: "Core OS Round" }
    ]
  },
  {
    id: "apple",
    name: "Apple",
    slug: "apple",
    category: "FAANG",
    difficulty: "Medium-Hard",
    tier: "Tier 1 FAANG",
    description: "Focuses on memory management, hardware-level trade-offs, pointer arithmetic, and rigorous boundary-condition correctness.",
    frequentTopics: ["Arrays", "Two Pointers", "Bit Manipulation", "Strings", "Trees"],
    problems: [
      { problemId: "best-time-to-buy-and-sell-stock", frequency: 5, interviewTags: ["Two Pointers", "State Tracking"], year: "2025-2026", source: "Onsite Round" },
      { problemId: "single-number", frequency: 5, interviewTags: ["Core OS", "Bitwise Engine"], year: "2025-2026", source: "Systems Round" },
      { problemId: "palindrome-number", frequency: 4, interviewTags: ["Numerical Safety", "Overflow"], year: "2024-2025", source: "Phone Screen" }
    ]
  },
  {
    id: "adobe",
    name: "Adobe",
    slug: "adobe",
    category: "Product Based",
    difficulty: "Medium-Hard",
    tier: "Tier 1 Global",
    description: "High prevalence of mathematical geometry, Dynamic Programming, String Parsing, and Complex Tree traversals.",
    frequentTopics: ["Dynamic Programming", "Strings", "Math", "Arrays", "Trees"],
    problems: [
      { problemId: "climbing-stairs", frequency: 5, interviewTags: ["DP Memoization", "Combinatorics"], year: "2025-2026", source: "Member of Tech Staff" },
      { problemId: "palindrome-number", frequency: 5, interviewTags: ["Math Parsing", "Logic"], year: "2025-2026", source: "OA Round" },
      { problemId: "valid-parentheses", frequency: 4, interviewTags: ["Syntax Tree", "Stack"], year: "2024-2025", source: "Round 2" }
    ]
  },
  {
    id: "uber",
    name: "Uber",
    slug: "uber",
    category: "Product Based",
    difficulty: "Hard",
    tier: "Tier 1 Unicorn",
    description: "Heavy emphasis on Graph algorithms (Dijkstra, Shortest Path), Distributed Caching, Sliding Windows, and GeoSpatial Proximity indexing.",
    frequentTopics: ["Graphs", "Hashing", "Heap", "Sliding Window", "Dynamic Programming"],
    problems: [
      { problemId: "cache-stampede", frequency: 5, interviewTags: ["Surge Pricing Cache", "Concurrency"], year: "2025-2026", source: "L5 System Coding" },
      { problemId: "merge-islands", frequency: 5, interviewTags: ["Driver Grid Index", "Connected Regions"], year: "2025-2026", source: "Onsite Round 1" },
      { problemId: "best-time-to-buy-and-sell-stock", frequency: 4, interviewTags: ["Dynamic Pricing", "Array"], year: "2024-2025", source: "Screening" }
    ]
  },
  {
    id: "atlassian",
    name: "Atlassian",
    slug: "atlassian",
    category: "Product Based",
    difficulty: "Medium-Hard",
    tier: "Tier 1 Global",
    description: "Known for clean object-oriented architecture, Rate Limiting data structures, Trie Autocomplete, and Tree traversals.",
    frequentTopics: ["Hashing", "Strings", "Trees", "Design", "Arrays"],
    problems: [
      { problemId: "cache-stampede", frequency: 5, interviewTags: ["Jira Cache", "Rate Limiter"], year: "2025-2026", source: "Onsite Architecture" },
      { problemId: "valid-parentheses", frequency: 5, interviewTags: ["Markdown Parsing", "Stack"], year: "2025-2026", source: "Core Coding" },
      { problemId: "two-sum", frequency: 4, interviewTags: ["Warmup", "Lookup Map"], year: "2024-2025", source: "Screening" }
    ]
  },
  {
    id: "goldman-sachs",
    name: "Goldman Sachs",
    slug: "goldman-sachs",
    category: "Product Based",
    difficulty: "Medium-Hard",
    tier: "Tier 1 FinTech",
    description: "High volume of mathematical number theory, Subarray sums, Dynamic Programming, and High-Frequency Ledger simulations.",
    frequentTopics: ["Math", "Dynamic Programming", "Arrays", "Hashing", "Strings"],
    problems: [
      { problemId: "best-time-to-buy-and-sell-stock", frequency: 5, interviewTags: ["Quantitative Trading", "Max Profit"], year: "2025-2026", source: "CoderPad Round" },
      { problemId: "palindrome-number", frequency: 4, interviewTags: ["Number Theory", "Math"], year: "2025-2026", source: "Round 1" },
      { problemId: "climbing-stairs", frequency: 4, interviewTags: ["Fibonacci Sequence", "DP"], year: "2024-2025", source: "Superday" }
    ]
  },
  {
    id: "jpmorgan",
    name: "JPMorgan Chase",
    slug: "jpmorgan",
    category: "Product Based",
    difficulty: "Medium",
    tier: "Tier 1 Banking",
    description: "Tests core Data Structures, SQL, String sanitization, and Banking Transaction validation.",
    frequentTopics: ["Arrays", "Strings", "Hashing", "Linked List", "Math"],
    problems: [
      { problemId: "two-sum", frequency: 5, interviewTags: ["Ledger Match", "Hash Map"], year: "2025-2026", source: "CodeVue Assessment" },
      { problemId: "valid-parentheses", frequency: 5, interviewTags: ["Transaction Validator", "Stack"], year: "2025-2026", source: "Superday" },
      { problemId: "palindrome-number", frequency: 4, interviewTags: ["Routing Number Check", "Math"], year: "2024-2025", source: "Technical Round" }
    ]
  },
  {
    id: "walmart",
    name: "Walmart Global Tech",
    slug: "walmart",
    category: "Product Based",
    difficulty: "Medium",
    tier: "Tier 1 Retail",
    description: "Focuses on Inventory Multi-source BFS, Cart management, Two Pointers, and String operations.",
    frequentTopics: ["Arrays", "Hashing", "Graphs", "Dynamic Programming", "Strings"],
    problems: [
      { problemId: "two-sum", frequency: 5, interviewTags: ["Cart Discount", "Hash Map"], year: "2025-2026", source: "HackerEarth OA" },
      { problemId: "best-time-to-buy-and-sell-stock", frequency: 5, interviewTags: ["Price Drop Alert", "Array"], year: "2025-2026", source: "Round 1" },
      { problemId: "climbing-stairs", frequency: 4, interviewTags: ["Optimal Pathway", "DP"], year: "2024-2025", source: "Technical Interview" }
    ]
  },
  {
    id: "flipkart",
    name: "Flipkart",
    slug: "flipkart",
    category: "Indian Product Companies",
    difficulty: "Medium-Hard",
    tier: "Indian Unicorn",
    description: "Famous for machine coding rounds, Big-O trade-offs, Graph logistics, and Dynamic Programming.",
    frequentTopics: ["Dynamic Programming", "Graphs", "Arrays", "Trees", "Hashing"],
    problems: [
      { problemId: "merge-islands", frequency: 5, interviewTags: ["Supply Hub Clusters", "Graphs"], year: "2025-2026", source: "Onsite Round" },
      { problemId: "climbing-stairs", frequency: 5, interviewTags: ["Flash Sale DP", "Combinatorics"], year: "2025-2026", source: "Problem Solving" },
      { problemId: "two-sum", frequency: 4, interviewTags: ["Coupon Match", "Hash Map"], year: "2024-2025", source: "Screening" }
    ]
  },
  {
    id: "razorpay",
    name: "Razorpay",
    slug: "razorpay",
    category: "Indian Product Companies",
    difficulty: "Medium-Hard",
    tier: "FinTech Unicorn",
    description: "Tests concurrency, idempotent ledger double-spend prevention, caching, and tree hierarchies.",
    frequentTopics: ["Hashing", "Arrays", "Trees", "Strings", "Design"],
    problems: [
      { problemId: "cache-stampede", frequency: 5, interviewTags: ["Idempotent Webhook Cache", "Hashing"], year: "2025-2026", source: "Technical Round 1" },
      { problemId: "valid-parentheses", frequency: 5, interviewTags: ["Signature Validation", "Stack"], year: "2025-2026", source: "Core Coding" },
      { problemId: "two-sum", frequency: 4, interviewTags: ["Payment Split", "Hash Map"], year: "2024-2025", source: "Screening" }
    ]
  },
  {
    id: "tcs",
    name: "TCS",
    slug: "tcs",
    category: "Service Based",
    difficulty: "Easy-Medium",
    tier: "IT Services",
    description: "Focuses on fundamental math, string reversing, array manipulation, and basic searching in TCS NQT & Digital tracks.",
    frequentTopics: ["Arrays", "Strings", "Math", "Bit Manipulation"],
    problems: [
      { problemId: "reverse-string", frequency: 5, interviewTags: ["TCS NQT", "Strings"], year: "2025-2026", source: "Digital Assessment" },
      { problemId: "palindrome-number", frequency: 5, interviewTags: ["NQT Math", "Conditionals"], year: "2025-2026", source: "Technical Round" },
      { problemId: "single-number", frequency: 4, interviewTags: ["Ninja/Digital", "Arrays"], year: "2024-2025", source: "Digital Interview" }
    ]
  },
  {
    id: "infosys",
    name: "Infosys",
    slug: "infosys",
    category: "Service Based",
    difficulty: "Easy-Medium",
    tier: "IT Services",
    description: "Evaluates core programming logic, array operations, recursion, and string manipulation for InfyTQ & Specialist Programmer roles.",
    frequentTopics: ["Arrays", "Strings", "Math", "Dynamic Programming"],
    problems: [
      { problemId: "two-sum", frequency: 5, interviewTags: ["InfyTQ", "Hash Map"], year: "2025-2026", source: "SP Coding Assessment" },
      { problemId: "climbing-stairs", frequency: 5, interviewTags: ["Specialist Programmer", "DP"], year: "2025-2026", source: "DSE Round" },
      { problemId: "reverse-string", frequency: 4, interviewTags: ["Foundation", "Strings"], year: "2024-2025", source: "HR Technical" }
    ]
  },
  {
    id: "accenture",
    name: "Accenture",
    slug: "accenture",
    category: "Service Based",
    difficulty: "Easy-Medium",
    tier: "Global Consulting",
    description: "Assesses coding logic, Bit Manipulation, String operations, and Arrays in the Accenture Advanced Technical Assessment.",
    frequentTopics: ["Strings", "Bit Manipulation", "Arrays", "Math"],
    problems: [
      { problemId: "single-number", frequency: 5, interviewTags: ["Advanced Technical", "Bitwise"], year: "2025-2026", source: "Coding Assessment" },
      { problemId: "valid-parentheses", frequency: 5, interviewTags: ["Logic Round", "Stack"], year: "2025-2026", source: "Technical Interview" },
      { problemId: "palindrome-number", frequency: 4, interviewTags: ["Core Math", "Algorithms"], year: "2024-2025", source: "Campus Hiring" }
    ]
  },
  {
    id: "cognizant",
    name: "Cognizant",
    slug: "cognizant",
    category: "Service Based",
    difficulty: "Easy-Medium",
    tier: "IT Services",
    description: "GenC Next and Elevate tracks focus on Array manipulation, basic Dynamic Programming, and String parsing.",
    frequentTopics: ["Arrays", "Strings", "Math", "Hashing"],
    problems: [
      { problemId: "two-sum", frequency: 5, interviewTags: ["GenC Next", "Array Lookup"], year: "2025-2026", source: "GenC Elevate Assessment" },
      { problemId: "reverse-string", frequency: 5, interviewTags: ["GenC", "Strings"], year: "2025-2026", source: "Technical Round" },
      { problemId: "best-time-to-buy-and-sell-stock", frequency: 4, interviewTags: ["GenC Next", "Greedy"], year: "2024-2025", source: "Advanced Coding" }
    ]
  },
  {
    id: "netflix",
    name: "Netflix",
    slug: "netflix",
    category: "FAANG",
    difficulty: "Hard",
    tier: "Tier 1 FAANG",
    description: "Evaluates high-scale distributed data structures, chunking, concurrency, caching, and monotonic deques for Senior Engineers.",
    frequentTopics: ["Hashing", "Graphs", "Heap", "Sliding Window", "Trees"],
    problems: [
      { problemId: "cache-stampede", frequency: 5, interviewTags: ["Video Buffer Cache", "Concurrency"], year: "2025-2026", source: "Senior SWE Round" },
      { problemId: "merge-islands", frequency: 5, interviewTags: ["CDN Region Mesh", "Graphs"], year: "2025-2026", source: "Onsite Architecture" },
      { problemId: "binary-lift", frequency: 4, interviewTags: ["Hierarchy Tree", "Binary Lifting"], year: "2024-2025", source: "Technical Assessment" }
    ]
  }
];

export function calculateLocalCompanyList(database, userId = null) {
  const companies = Array.isArray(database?.companies) && database.companies.length > 0 ? database.companies : seedCompanies;
  const user = userId ? (database?.users || []).find((u) => u.id === userId || u._id === userId) : null;
  const submissions = Array.isArray(database?.submissions) ? database.submissions : [];
  const userSubs = userId ? submissions.filter((s) => s.userId === userId || s.user === userId) : [];

  const solvedSet = new Set(
    (user?.solvedProblemIds || []).concat(
      userSubs.filter((s) => s.verdict === "AC" || s.verdict === "Accepted" || s.status === "ACCEPTED").map((s) => s.problemId || s.problem)
    )
  );

  return companies.map((comp) => {
    const compProblemIds = (comp.problems || []).map((p) => p.problemId);
    const totalProblems = compProblemIds.length;

    let solvedCount = 0;
    for (const pid of compProblemIds) {
      if (solvedSet.has(pid)) solvedCount++;
    }

    const companySubs = userSubs.filter((s) => compProblemIds.includes(s.problemId || s.problem));
    const acSubs = companySubs.filter((s) => s.verdict === "AC" || s.verdict === "Accepted" || s.status === "ACCEPTED").length;
    const accuracy = companySubs.length > 0 ? Math.round((acSubs / companySubs.length) * 100) : 0;
    const completionPercentage = totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

    return {
      ...comp,
      totalProblems,
      solvedCount,
      completionPercentage,
      accuracy
    };
  });
}

export function calculateLocalCompanySheet(database, companyIdOrSlug, userId = null) {
  const target = String(companyIdOrSlug || "").toLowerCase().trim();
  const companies = Array.isArray(database?.companies) && database.companies.length > 0 ? database.companies : seedCompanies;
  const company = companies.find((c) => c.id === target || c.slug === target || c.name.toLowerCase() === target) || companies[0];

  const user = userId ? (database?.users || []).find((u) => u.id === userId || u._id === userId) : null;
  const allProblems = Array.isArray(database?.problems) && database.problems.length > 0 ? database.problems : baseProblems;
  const problemMap = new Map(allProblems.map((p) => [p.id, p]));

  const submissions = Array.isArray(database?.submissions) ? database.submissions : [];
  const userSubs = userId ? submissions.filter((s) => s.userId === userId || s.user === userId) : [];

  const solvedSet = new Set(
    (user?.solvedProblemIds || []).concat(
      userSubs.filter((s) => s.verdict === "AC" || s.verdict === "Accepted" || s.status === "ACCEPTED").map((s) => s.problemId || s.problem)
    )
  );
  const attemptedSet = new Set(
    (user?.attemptedProblemIds || []).concat(userSubs.map((s) => s.problemId || s.problem))
  );

  const compProblems = company.problems || [];
  const problemList = [];
  const topicStats = {};

  let easyTotal = 0, easySolved = 0;
  let mediumTotal = 0, mediumSolved = 0;
  let hardTotal = 0, hardSolved = 0;

  for (const cp of compProblems) {
    const meta = problemMap.get(cp.problemId) || {
      id: cp.problemId,
      title: cp.problemId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      difficulty: "Medium",
      topic: "Arrays",
      acceptance: 75,
      points: 10
    };

    const isSolved = solvedSet.has(cp.problemId);
    const isAttempted = attemptedSet.has(cp.problemId);
    const status = isSolved ? "Solved" : isAttempted ? "Attempted" : "Not Started";

    const diff = (meta.difficulty || "Medium").toLowerCase();
    if (diff === "easy") {
      easyTotal++;
      if (isSolved) easySolved++;
    } else if (diff === "hard") {
      hardTotal++;
      if (isSolved) hardSolved++;
    } else {
      mediumTotal++;
      if (isSolved) mediumSolved++;
    }

    const topic = meta.topic || "General";
    if (!topicStats[topic]) {
      topicStats[topic] = { topic, total: 0, solved: 0, subs: 0, acSubs: 0, freqScore: 0 };
    }
    topicStats[topic].total++;
    topicStats[topic].freqScore += cp.frequency || 4;
    if (isSolved) topicStats[topic].solved++;

    const probSubs = userSubs.filter((s) => (s.problemId || s.problem) === cp.problemId);
    topicStats[topic].subs += probSubs.length;
    topicStats[topic].acSubs += probSubs.filter((s) => s.verdict === "AC" || s.verdict === "Accepted" || s.status === "ACCEPTED").length;

    const lastSub = probSubs[0];

    problemList.push({
      id: cp.problemId,
      title: meta.title,
      difficulty: meta.difficulty || "Medium",
      topic,
      companyFrequency: cp.frequency || 5,
      status,
      lastAttempt: lastSub ? lastSub.createdAt || lastSub.submittedAt : null,
      interviewTags: cp.interviewTags || ["Technical Round"],
      source: cp.source || "Onsite Interview",
      year: cp.year || "2025-2026",
      acceptance: meta.acceptance || 75,
      points: meta.points || 10
    });
  }

  const topicBreakdown = Object.values(topicStats).map((t) => {
    const avg = t.total > 0 ? t.freqScore / t.total : 4;
    const frequency = avg >= 4.5 ? "Very High" : avg >= 3.5 ? "High" : "Medium";
    const accuracy = t.subs > 0 ? Math.round((t.acSubs / t.subs) * 100) : 0;
    const progressPercent = t.total > 0 ? Math.round((t.solved / t.total) * 100) : 0;

    return {
      topicName: t.topic,
      frequency,
      problemsAvailable: t.total,
      userSolved: t.solved,
      accuracy,
      progressPercent
    };
  }).sort((a, b) => b.problemsAvailable - a.problemsAvailable);

  const totalProblems = compProblems.length;
  const solvedCount = problemList.filter((p) => p.status === "Solved").length;
  const attemptedCount = problemList.filter((p) => p.status === "Attempted").length;
  const compSubmissions = userSubs.filter((s) => compProblems.some((cp) => cp.problemId === (s.problemId || s.problem)));
  const compAcCount = compSubmissions.filter((s) => s.verdict === "AC" || s.verdict === "Accepted" || s.status === "ACCEPTED").length;
  const accuracy = compSubmissions.length > 0 ? Math.round((compAcCount / compSubmissions.length) * 100) : 0;
  const completionPercentage = totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

  let readinessScore = 0;
  if (totalProblems > 0) {
    const solveWeight = (solvedCount / totalProblems) * 55;
    const accuracyWeight = (accuracy / 100) * 25;
    const depthWeight = Math.min(20, (mediumSolved * 2.0 + hardSolved * 4.0) * 2);
    readinessScore = Math.min(100, Math.max(0, Math.round(solveWeight + accuracyWeight + depthWeight)));
  }

  const strongTopics = [];
  const weakTopics = [];
  const recommendedNext = [];

  for (const t of topicBreakdown) {
    if (t.progressPercent >= 60 || (t.userSolved >= 2 && t.accuracy >= 75)) {
      strongTopics.push(t.topicName);
    } else if (t.userSolved === 0 || t.accuracy < 60) {
      weakTopics.push(t.topicName);
      if (recommendedNext.length < 3) {
        recommendedNext.push(`Practice ${t.topicName}`);
      }
    }
  }

  if (recommendedNext.length === 0) {
    recommendedNext.push(`Practice ${company.name} Hard Challenges`);
  }

  const standardRoadmapSteps = [
    { step: 1, topic: "Arrays", description: "Array lookups, prefix sums, and two-pointer sweeps." },
    { step: 2, topic: "Hashing", description: "O(1) dictionary state tracking and cache invariants." },
    { step: 3, topic: "Strings", description: "Sliding window substrings, string parsing, and anagrams." },
    { step: 4, topic: "Trees", description: "Binary trees, lowest common ancestors, and recursion." },
    { step: 5, topic: "Graphs", description: "Multi-source BFS, Dijkstra shortest paths, and cycles." },
    { step: 6, topic: "Dynamic Programming", description: "State transitions, memoization, and optimal substructure." }
  ];

  let unlockedPrev = true;
  const preparationRoadmap = standardRoadmapSteps.map((s) => {
    const stat = topicStats[s.topic];
    const solved = stat?.solved || 0;
    const total = stat?.total || 1;
    const isMastered = solved >= Math.max(1, Math.floor(total * 0.6));

    let status = "Locked";
    if (isMastered) {
      status = "Mastered";
    } else if (unlockedPrev) {
      status = "In Progress";
      unlockedPrev = false;
    } else {
      status = "Locked";
    }

    return {
      ...s,
      status,
      solvedCount: solved,
      totalCount: total
    };
  });

  return {
    success: true,
    company: {
      id: company.id,
      name: company.name,
      slug: company.slug,
      logo: company.logo || "",
      category: company.category,
      difficulty: company.difficulty,
      description: company.description,
      tier: company.tier,
      frequentTopics: company.frequentTopics || []
    },
    stats: {
      totalProblems,
      solvedCount,
      attemptedCount,
      accuracy,
      completionPercentage,
      difficultyProgress: {
        easy: { solved: easySolved, total: easyTotal },
        medium: { solved: mediumSolved, total: mediumTotal },
        hard: { solved: hardSolved, total: hardTotal }
      }
    },
    readiness: {
      score: readinessScore,
      strongTopics: strongTopics.slice(0, 4),
      weakTopics: weakTopics.slice(0, 4),
      recommendedNext
    },
    topicBreakdown,
    problemList,
    preparationRoadmap,
    timestamp: new Date().toISOString()
  };
}
