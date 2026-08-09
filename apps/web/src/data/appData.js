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
    hiddenTestCases: [
      { input: "nums = [2, 7, 11, 15], target = 9", output: "[0, 1]" },
      { input: "nums = [3, 2, 4], target = 6", output: "[1, 2]" },
      { input: "nums = [3, 3], target = 6", output: "[0, 1]" },
      { input: "nums = [-1, -8, 14, 7], target = 6", output: "[1, 2]" },
      { input: "nums = [0, 4, 3, 0], target = 0", output: "[0, 3]" }
    ],
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9"],
    starterCode: {
      python: "class Solution:\n    def twoSum(self, nums, target):\n        pass",
      javascript: "function twoSum(nums, target) {\n  return [0, 1];\n}",
      java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        return new int[]{0, 1};\n    }\n}",
      cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        return {0, 1};\n    }\n};"
    },
    judge: {
      acceptedTokens: ["map", "dict", "target", "complement", "hash", "seen"],
      output: "[0, 1]"
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
    hiddenTestCases: [
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" },
      { input: 's = "([{}])"', output: "true" },
      { input: 's = "(((())"', output: "false" }
    ],
    constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'"],
    starterCode: {
      python: "class Solution:\n    def isValid(self, s: str) -> bool:\n        pass",
      javascript: "function isValid(s) {\n  return true;\n}",
      java: "class Solution {\n    public boolean isValid(String s) {\n        return true;\n    }\n}",
      cpp: "class Solution {\npublic:\n    bool isValid(string s) {\n        return true;\n    }\n};"
    },
    judge: {
      acceptedTokens: ["stack", "pop", "push", "bracket", "pair", "dict", "{}"],
      output: "true"
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
    hiddenTestCases: [
      { input: "x = 121", output: "true" },
      { input: "x = -121", output: "false" },
      { input: "x = 10", output: "false" },
      { input: "x = 12321", output: "true" }
    ],
    constraints: ["-2^31 <= x <= 2^31 - 1"],
    starterCode: {
      python: "class Solution:\n    def isPalindrome(self, x: int) -> bool:\n        pass",
      javascript: "function isPalindrome(x) {\n  return true;\n}",
      java: "class Solution {\n    public boolean isPalindrome(int x) {\n        return true;\n    }\n}",
      cpp: "class Solution {\npublic:\n    bool isPalindrome(int x) {\n        return true;\n    }\n};"
    },
    judge: {
      acceptedTokens: ["str", "reverse", "rev", "%", "//", "10", "palindrome"],
      output: "true"
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
    hiddenTestCases: [
      { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' },
      { input: 's = ["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]' },
      { input: 's = ["a"]', output: '["a"]' }
    ],
    constraints: ["1 <= s.length <= 10^5", "s[i] is a printable ascii character."],
    starterCode: {
      python: "class Solution:\n    def reverseString(self, s: list[str]) -> None:\n        pass",
      javascript: "function reverseString(s) {\n  s.reverse();\n}",
      java: "class Solution {\n    public void reverseString(char[] s) {\n        \n    }\n}",
      cpp: "class Solution {\npublic:\n    void reverseString(vector<char>& s) {\n        \n    }\n};"
    },
    judge: {
      acceptedTokens: ["reverse", "left", "right", "swap", "two pointers", "[::-1]"],
      output: '["o","l","l","e","h"]'
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
    hiddenTestCases: [
      { input: "prices = [7,1,5,3,6,4]", output: "5" },
      { input: "prices = [7,6,4,3,1]", output: "0" },
      { input: "prices = [2,4,1]", output: "2" },
      { input: "prices = [1,2]", output: "1" }
    ],
    constraints: ["1 <= prices.length <= 10^5", "0 <= prices[i] <= 10^4"],
    starterCode: {
      python: "class Solution:\n    def maxProfit(self, prices: list[int]) -> int:\n        pass",
      javascript: "function maxProfit(prices) {\n  return 0;\n}",
      java: "class Solution {\n    public int maxProfit(int[] prices) {\n        return 0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        return 0;\n    }\n};"
    },
    judge: {
      acceptedTokens: ["min", "max", "profit", "buy", "sell", "dp"],
      output: "5"
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
    hiddenTestCases: [
      { input: "nums = [2,2,1]", output: "1" },
      { input: "nums = [4,1,2,1,2]", output: "4" },
      { input: "nums = [1]", output: "1" }
    ],
    constraints: ["1 <= nums.length <= 3 * 10^4", "-3 * 10^4 <= nums[i] <= 3 * 10^4"],
    starterCode: {
      python: "class Solution:\n    def singleNumber(self, nums: list[int]) -> int:\n        pass",
      javascript: "function singleNumber(nums) {\n  return 0;\n}",
      java: "class Solution {\n    public int singleNumber(int[] nums) {\n        return 0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int singleNumber(vector<int>& nums) {\n        return 0;\n    }\n};"
    },
    judge: {
      acceptedTokens: ["^", "xor", "reduce", "accumulate", "bit"],
      output: "1"
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
    hiddenTestCases: [
      { input: "n = 2", output: "2" },
      { input: "n = 3", output: "3" },
      { input: "n = 4", output: "5" },
      { input: "n = 5", output: "8" }
    ],
    constraints: ["1 <= n <= 45"],
    starterCode: {
      python: "class Solution:\n    def climbStairs(self, n: int) -> int:\n        pass",
      javascript: "function climbStairs(n) {\n  return 0;\n}",
      java: "class Solution {\n    public int climbStairs(int n) {\n        return 0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int climbStairs(int n) {\n        return 0;\n    }\n};"
    },
    judge: {
      acceptedTokens: ["dp", "fib", "ways", "a, b", "range", "memo"],
      output: "2"
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
    },
    judge: {
      acceptedTokens: ["lock", "mutex", "promise", "singleflight", "map"],
      output: '["fetch(a)", "fetch(b)", "fetch(c)"]'
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
    },
    judge: {
      acceptedTokens: ["window", "sliding", "timestamp", "count", "expire"],
      output: "[true, true, true, false]"
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
    },
    judge: {
      acceptedTokens: ["union", "find", "parent", "rank", "disjoint"],
      output: "[1, 1, 2, 3]"
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

export function readDatabase() {
  try {
    const raw = window.localStorage.getItem(APP_DB_KEY);
    if (!raw) {
      return seedDatabase();
    }

    const parsed = JSON.parse(raw);
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
    window.localStorage.setItem(APP_DB_KEY, JSON.stringify(database));
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

export function createUserRecord({ name, username, email, password }) {
  return {
    id: `u-${Date.now()}`,
    name: (name || "").trim(),
    username: (username || "").trim(),
    email: (email || "").trim().toLowerCase(),
    password,
    ranking: 999,
    xp: 0,
    streak: 1,
    badges: ["New Challenger"],
    solvedProblemIds: [],
    attemptedProblemIds: [],
    stats: {
      activeDays: 1,
      totalSubmissions: 0,
      acceptedSubmissions: 0
    }
  };
}

export function findUserByEmail(database, email) {
  if (!database || !Array.isArray(database.users) || !email) return null;
  const target = String(email).trim().toLowerCase();
  return database.users.find((user) => String(user.email || "").toLowerCase() === target) ?? null;
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
  const accepted = submissions.filter((submission) => submission.verdict === "AC").length;

  return {
    ...user,
    solved,
    solvedProblemIds: solvedList,
    attemptedProblemIds: Array.isArray(user.attemptedProblemIds) ? user.attemptedProblemIds : [],
    xp: typeof user.xp === "number" ? user.xp : 0,
    streak: typeof user.streak === "number" ? user.streak : 1,
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

export function simulateRun(problem, language, code) {
  const normalizedCode = (code || "").toLowerCase();
  const tokens = problem?.judge?.acceptedTokens || ["solution", "return"];
  const hits = tokens.filter((token) => normalizedCode.includes(token)).length;

  if (!code || !code.trim()) {
    return {
      verdict: "CE",
      statusText: "No code to run",
      runtime: "-",
      memory: "-",
      output: "No code provided.",
      expectedOutput: problem?.examples?.[0]?.output ?? "",
      message: "Add code before running."
    };
  }

  if (language === "Java" && !normalizedCode.includes("class")) {
    return {
      verdict: "CE",
      statusText: "Compilation error",
      runtime: "-",
      memory: "-",
      output: "Compilation failed: expected class declaration.",
      expectedOutput: problem?.examples?.[0]?.output ?? "",
      message: "Java submissions need a class declaration."
    };
  }

  if (hits >= 1) {
    return {
      verdict: "AC",
      statusText: "All test cases passed",
      runtime: `${20 + (problem?.points || 10)} ms`,
      memory: `${12 + Math.floor((problem?.points || 10) / 4)} MB`,
      output: problem?.judge?.output || "true",
      expectedOutput: problem?.examples?.[0]?.output ?? "",
      message: "Accepted. Your solution passed all visible test cases."
    };
  }

  return {
    verdict: "WA",
    statusText: "Test case 1 failed",
    runtime: `${35 + (problem?.points || 10)} ms`,
    memory: `${14 + Math.floor((problem?.points || 10) / 4)} MB`,
    output: "Incorrect output",
    expectedOutput: problem?.examples?.[0]?.output ?? "",
    message: "Wrong answer. Your output did not match the expected result."
  };
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
      verdict: result?.verdict || "AC",
      runtime: result?.runtime || "25 ms",
      memory: result?.memory || "14 MB",
      submittedAt: nowIso()
    },
    nextSubmissionId: nextSubId + 1
  };
}

export function updateUserAfterSubmission(user, problem, verdict) {
  if (!user) return user;
  const attemptedProblemIds = Array.from(
    new Set([...(Array.isArray(user.attemptedProblemIds) ? user.attemptedProblemIds : []), problem?.id || ""])
  ).filter(Boolean);

  const currentStats = user.stats || { activeDays: 1, totalSubmissions: 0, acceptedSubmissions: 0 };
  const nextUser = {
    ...user,
    attemptedProblemIds,
    stats: {
      ...currentStats,
      totalSubmissions: (currentStats.totalSubmissions || 0) + 1
    }
  };

  if (verdict !== "AC") {
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
