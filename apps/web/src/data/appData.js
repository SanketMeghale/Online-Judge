const APP_DB_KEY = "online-judge-db";
const SAVED_CODE_KEY = "online-judge-saved-code";

const nowIso = () => new Date().toISOString();

const baseProblems = [
  {
    id: "two-sum",
    title: "Two Sum Revisited",
    difficulty: "Easy",
    topic: "Arrays",
    acceptance: 72,
    submissions: 18420,
    points: 10,
    statement:
      "Given an array of integers and a target, return indices of two numbers that add up to the target. Each input has exactly one valid answer.",
    examples: [
      { input: "nums = [2, 7, 11, 15], target = 9", output: "[0, 1]" },
      { input: "nums = [3, 2, 4], target = 6", output: "[1, 2]" }
    ],
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9"],
    starterCode: {
      Python: "class Solution:\n    def twoSum(self, nums, target):\n        pass",
      JavaScript: "function twoSum(nums, target) {\n  \n}",
      Java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        return new int[]{};\n    }\n}"
    },
    judge: {
      acceptedTokens: ["hash", "map", "dict", "indices", "target -"],
      output: "[0, 1]"
    }
  },
  {
    id: "cache-stampede",
    title: "Prevent Cache Stampede",
    difficulty: "Medium",
    topic: "Hashing",
    acceptance: 48,
    submissions: 5912,
    points: 20,
    statement:
      "Design a function that batches repeated key lookups and prevents duplicate expensive fetches while preserving response order.",
    examples: [{ input: "keys = [a, b, a, c]", output: "fetch(a), fetch(b), fetch(c)" }],
    constraints: ["1 <= keys.length <= 10^5", "Keys are non-empty strings"],
    starterCode: {
      Python: "def prevent_cache_stampede(keys, fetch):\n    pass",
      JavaScript: "async function preventCacheStampede(keys, fetch) {\n  \n}",
      Java: "class Solution {\n    public List<String> preventCacheStampede(List<String> keys) {\n        return new ArrayList<>();\n    }\n}"
    },
    judge: {
      acceptedTokens: ["cache", "promise", "pending", "dedupe", "fetch"],
      output: "fetch(a), fetch(b), fetch(c)"
    }
  },
  {
    id: "merge-islands",
    title: "Merge Dynamic Islands",
    difficulty: "Hard",
    topic: "Graphs",
    acceptance: 31,
    submissions: 3788,
    points: 50,
    statement:
      "A stream of land additions arrives for an empty grid. Return the number of islands after each operation.",
    examples: [{ input: "m = 3, n = 3, positions = [[0,0],[0,1],[1,2]]", output: "[1,1,2]" }],
    constraints: ["1 <= m, n <= 10^4", "1 <= positions.length <= 10^5"],
    starterCode: {
      Python: "class Solution:\n    def numIslands2(self, m, n, positions):\n        pass",
      JavaScript: "function numIslands2(m, n, positions) {\n  \n}",
      Java: "class Solution {\n    public List<Integer> numIslands2(int m, int n, int[][] positions) {\n        return new ArrayList<>();\n    }\n}"
    },
    judge: {
      acceptedTokens: ["union", "parent", "rank", "find", "positions"],
      output: "[1,1,2]"
    }
  },
  {
    id: "binary-lift",
    title: "Binary Lift Ancestors",
    difficulty: "Medium",
    topic: "Trees",
    acceptance: 55,
    submissions: 8641,
    points: 20,
    statement:
      "Preprocess a rooted tree so each query returns the k-th ancestor of a node in logarithmic time.",
    examples: [{ input: "parent = [-1,0,0,1,1], query = (4,2)", output: "0" }],
    constraints: ["1 <= n <= 10^5", "1 <= q <= 10^5"],
    starterCode: {
      Python: "class TreeAncestor:\n    def __init__(self, n, parent):\n        pass\n\n    def getKthAncestor(self, node, k):\n        pass",
      JavaScript: "class TreeAncestor {\n  constructor(n, parent) {\n    \n  }\n\n  getKthAncestor(node, k) {\n    \n  }\n}",
      Java: "class TreeAncestor {\n    public TreeAncestor(int n, int[] parent) {\n    }\n\n    public int getKthAncestor(int node, int k) {\n        return -1;\n    }\n}"
    },
    judge: {
      acceptedTokens: ["ancestor", "lift", "table", "log", "parent"],
      output: "0"
    }
  }
];

const seedUsers = [
  {
    id: "u-demo-1",
    name: "Nadia Rao",
    username: "nadia.codes",
    email: "nadia@example.com",
    password: "password123",
    ranking: 87,
    xp: 8420,
    streak: 7,
    badges: ["7 Day Streak", "Graph Sprinter", "Contest Finisher"],
    solvedProblemIds: ["two-sum"],
    attemptedProblemIds: ["cache-stampede", "binary-lift"],
    stats: {
      activeDays: 41,
      totalSubmissions: 4,
      acceptedSubmissions: 1
    }
  }
];

const seedSubmissions = [
  {
    id: "S-1042",
    userId: "u-demo-1",
    problemId: "two-sum",
    language: "Python",
    verdict: "AC",
    runtime: "42 ms",
    memory: "14.2 MB",
    submittedAt: "2026-07-23T08:15:00.000Z"
  },
  {
    id: "S-1041",
    userId: "u-demo-1",
    problemId: "cache-stampede",
    language: "JavaScript",
    verdict: "WA",
    runtime: "118 ms",
    memory: "18.1 MB",
    submittedAt: "2026-07-22T10:30:00.000Z"
  },
  {
    id: "S-1038",
    userId: "u-demo-1",
    problemId: "binary-lift",
    language: "Java",
    verdict: "TLE",
    runtime: "2.0 s",
    memory: "52 MB",
    submittedAt: "2026-07-21T06:40:00.000Z"
  },
  {
    id: "S-1032",
    userId: "u-demo-1",
    problemId: "two-sum",
    language: "Java",
    verdict: "CE",
    runtime: "-",
    memory: "-",
    submittedAt: "2026-07-19T13:20:00.000Z"
  }
];

function seedDatabase() {
  return {
    users: seedUsers,
    problems: baseProblems,
    submissions: seedSubmissions,
    nextSubmissionId: 1043
  };
}

export function readDatabase() {
  try {
    const raw = window.localStorage.getItem(APP_DB_KEY);
    if (!raw) {
      return seedDatabase();
    }

    const parsed = JSON.parse(raw);
    return {
      ...seedDatabase(),
      ...parsed
    };
  } catch {
    return seedDatabase();
  }
}

export function writeDatabase(database) {
  window.localStorage.setItem(APP_DB_KEY, JSON.stringify(database));
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
  window.localStorage.setItem(SAVED_CODE_KEY, JSON.stringify(codeMap));
}

export function createUserRecord({ name, username, email, password }) {
  return {
    id: `u-${Date.now()}`,
    name: name.trim(),
    username: username.trim(),
    email: email.trim().toLowerCase(),
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
  return database.users.find((user) => user.email.toLowerCase() === email.trim().toLowerCase()) ?? null;
}

export function findUserById(database, userId) {
  return database.users.find((user) => user.id === userId) ?? null;
}

export function getProblemById(database, problemId) {
  return database.problems.find((problem) => problem.id === problemId) ?? null;
}

export function formatRelativeDate(value) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor(diffMs / dayMs);

  if (diffDays <= 0) {
    return "Today";
  }

  if (diffDays === 1) {
    return "Yesterday";
  }

  return `${diffDays} days ago`;
}

export function enrichUser(database, user) {
  const solved = user.solvedProblemIds.length;
  const submissions = database.submissions.filter((submission) => submission.userId === user.id);
  const accepted = submissions.filter((submission) => submission.verdict === "AC").length;

  return {
    ...user,
    solved,
    accuracy: submissions.length ? Math.round((accepted / submissions.length) * 100) : 0
  };
}

export function getProblemStatusForUser(user, problemId) {
  if (user.solvedProblemIds.includes(problemId)) {
    return "Solved";
  }

  if (user.attemptedProblemIds.includes(problemId)) {
    return "Attempted";
  }

  return "Unsolved";
}

export function listProblemsForUser(database, user) {
  return database.problems.map((problem) => ({
    ...problem,
    status: getProblemStatusForUser(user, problem.id)
  }));
}

export function listSubmissionsForUser(database, userId) {
  return database.submissions
    .filter((submission) => submission.userId === userId)
    .sort((left, right) => new Date(right.submittedAt) - new Date(left.submittedAt))
    .map((submission) => ({
      ...submission,
      problem: getProblemById(database, submission.problemId)?.title ?? submission.problemId,
      submitted: formatRelativeDate(submission.submittedAt)
    }));
}

export function computeLeaderboard(database) {
  return database.users
    .map((user) => enrichUser(database, user))
    .sort((left, right) => {
      if (right.xp !== left.xp) {
        return right.xp - left.xp;
      }

      return right.solved - left.solved;
    })
    .map((user, index) => ({
      rank: index + 1,
      id: user.id,
      name: user.name,
      score: user.xp,
      solved: user.solved,
      streak: user.streak
    }));
}

export function simulateRun(problem, language, code) {
  const normalizedCode = code.toLowerCase();
  const tokens = problem.judge.acceptedTokens;
  const hits = tokens.filter((token) => normalizedCode.includes(token)).length;

  if (!code.trim()) {
    return {
      verdict: "CE",
      statusText: "No code to run",
      runtime: "-",
      memory: "-",
      output: "No code provided.",
      expectedOutput: problem.examples[0]?.output ?? "",
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
      expectedOutput: problem.examples[0]?.output ?? "",
      message: "Java submissions need a class declaration."
    };
  }

  if (hits >= 2) {
    return {
      verdict: "AC",
      statusText: "All test cases passed",
      runtime: `${20 + problem.points} ms`,
      memory: `${12 + Math.floor(problem.points / 4)} MB`,
      output: problem.judge.output,
      expectedOutput: problem.examples[0]?.output ?? "",
      message: "Accepted. Your solution passed all visible test cases."
    };
  }

  if (hits === 1) {
    return {
      verdict: "WA",
      statusText: "Test case 1 failed",
      runtime: `${35 + problem.points} ms`,
      memory: `${14 + Math.floor(problem.points / 4)} MB`,
      output: "Incorrect output",
      expectedOutput: problem.examples[0]?.output ?? "",
      message: "Wrong answer. Your output did not match the expected result."
    };
  }

  return {
    verdict: "TLE",
    statusText: "Time limit exceeded",
    runtime: "2.0 s",
    memory: "64 MB",
    output: "Execution exceeded the time limit.",
    expectedOutput: problem.examples[0]?.output ?? "",
    message: "Time limit exceeded on visible test cases. Try a faster approach."
  };
}

export function createSubmission(database, userId, problem, language, result) {
  const id = `S-${database.nextSubmissionId}`;

  return {
    submission: {
      id,
      userId,
      problemId: problem.id,
      language,
      verdict: result.verdict,
      runtime: result.runtime,
      memory: result.memory,
      submittedAt: nowIso()
    },
    nextSubmissionId: database.nextSubmissionId + 1
  };
}

export function updateUserAfterSubmission(user, problem, verdict) {
  const attemptedProblemIds = Array.from(new Set([...user.attemptedProblemIds, problem.id]));
  const nextUser = {
    ...user,
    attemptedProblemIds,
    stats: {
      ...user.stats,
      totalSubmissions: user.stats.totalSubmissions + 1
    }
  };

  if (verdict !== "AC") {
    return nextUser;
  }

  const alreadySolved = user.solvedProblemIds.includes(problem.id);
  const solvedProblemIds = alreadySolved ? user.solvedProblemIds : [...user.solvedProblemIds, problem.id];
  const badges = new Set(user.badges);

  if (solvedProblemIds.length >= 3) {
    badges.add("Three Problem Sprint");
  }

  return {
    ...nextUser,
    solvedProblemIds,
    xp: alreadySolved ? user.xp + Math.floor(problem.points / 3) : user.xp + problem.points * 10,
    badges: Array.from(badges),
    stats: {
      ...nextUser.stats,
      acceptedSubmissions: user.stats.acceptedSubmissions + 1
    }
  };
}
