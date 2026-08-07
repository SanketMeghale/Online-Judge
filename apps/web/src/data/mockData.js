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
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    topic: "Strings",
    acceptance: 88,
    submissions: 24500,
    status: "Unsolved",
    points: 10,
    statement:
      "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    examples: [
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" }
    ],
    constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'"]
  },
  {
    id: "palindrome-number",
    title: "Palindrome Number",
    difficulty: "Easy",
    topic: "Math",
    acceptance: 82,
    submissions: 19800,
    status: "Unsolved",
    points: 10,
    statement:
      "Given an integer `x`, return `true` if `x` is a palindrome integer, and `false` otherwise.",
    examples: [
      { input: "x = 121", output: "true" },
      { input: "x = -121", output: "false" }
    ],
    constraints: ["-2^31 <= x <= 2^31 - 1"]
  },
  {
    id: "reverse-string",
    title: "Reverse String",
    difficulty: "Easy",
    topic: "Strings",
    acceptance: 91,
    submissions: 31200,
    status: "Unsolved",
    points: 10,
    statement:
      "Write a function that reverses an array of characters `s` in-place with O(1) extra memory.",
    examples: [
      { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' },
      { input: 's = ["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]' }
    ],
    constraints: ["1 <= s.length <= 10^5"]
  },
  {
    id: "best-time-to-buy-and-sell-stock",
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    topic: "Arrays",
    acceptance: 79,
    submissions: 28400,
    status: "Unsolved",
    points: 10,
    statement:
      "You are given an array `prices` where `prices[i]` is the price of a given stock on the i-th day. Return the maximum profit you can achieve from one transaction.",
    examples: [
      { input: "prices = [7,1,5,3,6,4]", output: "5" },
      { input: "prices = [7,6,4,3,1]", output: "0" }
    ],
    constraints: ["1 <= prices.length <= 10^5", "0 <= prices[i] <= 10^4"]
  },
  {
    id: "single-number",
    title: "Single Number",
    difficulty: "Easy",
    topic: "Bit Manipulation",
    acceptance: 85,
    submissions: 22100,
    status: "Unsolved",
    points: 10,
    statement:
      "Given a non-empty array of integers `nums`, every element appears twice except for one. Find that single element.",
    examples: [
      { input: "nums = [2,2,1]", output: "1" },
      { input: "nums = [4,1,2,1,2]", output: "4" }
    ],
    constraints: ["1 <= nums.length <= 3 * 10^4", "-3 * 10^4 <= nums[i] <= 3 * 10^4"]
  },
  {
    id: "climbing-stairs",
    title: "Climbing Stairs",
    difficulty: "Easy",
    topic: "Dynamic Programming",
    acceptance: 84,
    submissions: 26700,
    status: "Unsolved",
    points: 10,
    statement:
      "You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    examples: [
      { input: "n = 2", output: "2" },
      { input: "n = 3", output: "3" }
    ],
    constraints: ["1 <= n <= 45"]
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
