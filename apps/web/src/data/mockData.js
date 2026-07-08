export const problems = [
  {
    id: "two-sum",
    title: "Two Sum Revisited",
    difficulty: "Easy",
    topic: "Arrays",
    acceptance: 72,
    submissions: 18420,
    status: "Solved",
    points: 10,
    statement:
      "Given an array of integers and a target, return indices of two numbers that add up to the target. Each input has exactly one valid answer.",
    examples: [
      { input: "nums = [2, 7, 11, 15], target = 9", output: "[0, 1]" },
      { input: "nums = [3, 2, 4], target = 6", output: "[1, 2]" }
    ],
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9"]
  },
  {
    id: "cache-stampede",
    title: "Prevent Cache Stampede",
    difficulty: "Medium",
    topic: "Hashing",
    acceptance: 48,
    submissions: 5912,
    status: "Attempted",
    points: 20,
    statement:
      "Design a function that batches repeated key lookups and prevents duplicate expensive fetches while preserving response order.",
    examples: [{ input: "keys = [a, b, a, c]", output: "fetch(a), fetch(b), fetch(c)" }],
    constraints: ["1 <= keys.length <= 10^5", "Keys are non-empty strings"]
  },
  {
    id: "merge-islands",
    title: "Merge Dynamic Islands",
    difficulty: "Hard",
    topic: "Graphs",
    acceptance: 31,
    submissions: 3788,
    status: "Unsolved",
    points: 50,
    statement:
      "A stream of land additions arrives for an empty grid. Return the number of islands after each operation.",
    examples: [{ input: "m = 3, n = 3, positions = [[0,0],[0,1],[1,2]]", output: "[1,1,2]" }],
    constraints: ["1 <= m, n <= 10^4", "1 <= positions.length <= 10^5"]
  },
  {
    id: "binary-lift",
    title: "Binary Lift Ancestors",
    difficulty: "Medium",
    topic: "Trees",
    acceptance: 55,
    submissions: 8641,
    status: "Unsolved",
    points: 20,
    statement:
      "Preprocess a rooted tree so each query returns the k-th ancestor of a node in logarithmic time.",
    examples: [{ input: "parent = [-1,0,0,1,1], query = (4,2)", output: "0" }],
    constraints: ["1 <= n <= 10^5", "1 <= q <= 10^5"]
  }
];

export const submissions = [
  { id: "S-1042", problem: "Two Sum Revisited", language: "Python", verdict: "AC", runtime: "42 ms", submitted: "Today" },
  { id: "S-1041", problem: "Prevent Cache Stampede", language: "C++", verdict: "WA", runtime: "118 ms", submitted: "Yesterday" },
  { id: "S-1038", problem: "Binary Lift Ancestors", language: "Java", verdict: "TLE", runtime: "2.0 s", submitted: "2 days ago" },
  { id: "S-1032", problem: "Two Sum Revisited", language: "C", verdict: "CE", runtime: "-", submitted: "4 days ago" }
];

export const leaderboard = [
  { rank: 1, name: "Aarav Singh", score: 1340, solved: 142, streak: 19 },
  { rank: 2, name: "Mira Chen", score: 1280, solved: 135, streak: 13 },
  { rank: 3, name: "Nadia Rao", score: 1170, solved: 121, streak: 7 },
  { rank: 4, name: "Dev Patel", score: 990, solved: 98, streak: 3 }
];

export const user = {
  name: "Nadia Rao",
  username: "nadia.codes",
  email: "nadia@example.com",
  ranking: 87,
  xp: 8420,
  streak: 7,
  solved: 121,
  badges: ["7 Day Streak", "Graph Sprinter", "Contest Finisher"]
};
