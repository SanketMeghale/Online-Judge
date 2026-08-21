export const problems = [
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
      { input: "nums = [3, 3], target = 6", output: "[0, 1]" },
      { input: "nums = [-1, -5, 14, 7], target = 6", output: "[0, 3]" },
      { input: "nums = [0, 4, 3, 0], target = 0", output: "[0, 3]" },
      { input: "nums = [1, 5, 7, 11, 14], target = 19", output: "[1, 4]" },
      { input: "nums = [-3, 4, 3, 90], target = 0", output: "[0, 2]" }
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
    hiddenTestCases: [
      { input: 's = "([{}])"', output: "true" },
      { input: 's = "(((())"', output: "false" },
      { input: 's = "{[]}"', output: "true" },
      { input: 's = "]"', output: "false" },
      { input: 's = "(([]){})"', output: "true" }
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
    hiddenTestCases: [
      { input: "x = 10", output: "false" },
      { input: "x = 12321", output: "true" },
      { input: "x = 0", output: "true" },
      { input: "x = 1000021", output: "false" },
      { input: "x = 1234321", output: "true" }
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
    companyTags: ["Meta", "Amazon", "Microsoft"],
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    statement:
      "Write a function that reverses an array of characters `s` in-place with O(1) extra memory.",
    examples: [
      { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' },
      { input: 's = ["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]' }
    ],
    hiddenTestCases: [
      { input: 's = ["a"]', output: '["a"]' },
      { input: 's = ["A","b","C","d"]', output: '["d","C","b","A"]' },
      { input: 's = ["1","2","3","4","5"]', output: '["5","4","3","2","1"]' },
      { input: 's = ["R","a","c","e","c","a","r"]', output: '["r","a","c","e","c","a","R"]' }
    ],
    constraints: ["1 <= s.length <= 10^5"],
    starterCode: {
      python: "class Solution:\n    def reverseString(self, s: list) -> None:\n        pass",
      javascript: "function reverseString(s) {\n  return s.reverse();\n}",
      java: "class Solution {\n    public void reverseString(char[] s) {\n        \n    }\n}",
      cpp: "class Solution {\npublic:\n    void reverseString(vector<char>& s) {\n        \n    }\n};"
    }
  },
  {
    id: "best-time-to-buy-and-sell-stock",
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    topic: "Arrays",
    acceptance: 79,
    submissions: 28400,
    points: 10,
    companyTags: ["Amazon", "Google", "Uber", "Apple"],
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    statement:
      "You are given an array `prices` where `prices[i]` is the price of a given stock on the i-th day. Return the maximum profit you can achieve from one transaction.",
    examples: [
      { input: "prices = [7,1,5,3,6,4]", output: "5" },
      { input: "prices = [7,6,4,3,1]", output: "0" }
    ],
    hiddenTestCases: [
      { input: "prices = [7,1,5,3,6,4]", output: "5" },
      { input: "prices = [7,6,4,3,1]", output: "0" },
      { input: "prices = [2,4,1]", output: "2" }
    ],
    constraints: ["1 <= prices.length <= 10^5", "0 <= prices[i] <= 10^4"],
    starterCode: {
      python: "class Solution:\n    def maxProfit(self, prices: list) -> int:\n        pass",
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
    acceptance: 85,
    submissions: 22100,
    points: 10,
    companyTags: ["Amazon", "Google", "Microsoft"],
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    statement:
      "Given a non-empty array of integers `nums`, every element appears twice except for one. Find that single element.",
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
      python: "class Solution:\n    def singleNumber(self, nums: list) -> int:\n        pass",
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
    acceptance: 84,
    submissions: 26700,
    points: 10,
    companyTags: ["Google", "Amazon", "Adobe"],
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    statement:
      "You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    examples: [
      { input: "n = 2", output: "2" },
      { input: "n = 3", output: "3" }
    ],
    hiddenTestCases: [
      { input: "n = 2", output: "2" },
      { input: "n = 3", output: "3" },
      { input: "n = 5", output: "8" }
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
    id: "cache-stampede",
    title: "Prevent Cache Stampede",
    difficulty: "Medium",
    topic: "Hashing",
    acceptance: 48,
    submissions: 5912,
    points: 20,
    companyTags: ["Uber", "Netflix", "Amazon", "Meta"],
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    statement:
      "Design a function that batches repeated key lookups and prevents duplicate expensive fetches while preserving response order.",
    examples: [{ input: "keys = [a, b, a, c]", output: "fetch(a), fetch(b), fetch(c)" }],
    hiddenTestCases: [
      { input: "keys = [a, b, a, c]", output: "fetch(a), fetch(b), fetch(c)" },
      { input: "keys = [x, x, x, x]", output: "fetch(x)" },
      { input: "keys = [a, b, c, d]", output: "fetch(a), fetch(b), fetch(c), fetch(d)" }
    ],
    constraints: ["1 <= keys.length <= 10^5", "Keys are non-empty strings"],
    starterCode: {
      python: "def prevent_cache_stampede(keys, fetch):\n    pass",
      javascript: "async function preventCacheStampede(keys, fetch) {\n  \n}",
      java: "class Solution {\n    public List<String> preventCacheStampede(List<String> keys) {\n        return new ArrayList<>();\n    }\n}",
      cpp: "class Solution {\npublic:\n    vector<string> preventCacheStampede(vector<string>& keys) {\n        return {};\n    }\n};"
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
    companyTags: ["Google", "Microsoft"],
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    statement:
      "Preprocess a rooted tree so each query returns the k-th ancestor of a node in logarithmic time.",
    examples: [{ input: "parent = [-1,0,0,1,1], query = (4,2)", output: "0" }],
    hiddenTestCases: [
      { input: "parent = [-1,0,0,1,1], query = (4,2)", output: "0" },
      { input: "parent = [-1,0,0], query = (2,1)", output: "0" }
    ],
    constraints: ["1 <= n <= 10^5", "1 <= q <= 10^5"],
    starterCode: {
      python: "class TreeAncestor:\n    def __init__(self, n, parent):\n        pass\n\n    def getKthAncestor(self, node, k):\n        pass",
      javascript: "class TreeAncestor {\n  constructor(n, parent) {}\n  getKthAncestor(node, k) { return 0; }\n}",
      java: "class TreeAncestor {\n    public TreeAncestor(int n, int[] parent) {}\n    public int getKthAncestor(int node, int k) { return 0; }\n}",
      cpp: "class TreeAncestor {\npublic:\n    TreeAncestor(int n, vector<int>& parent) {}\n    int getKthAncestor(int node, int k) { return 0; }\n};"
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
    companyTags: ["Google", "Meta", "Amazon"],
    timeLimitMs: 3000,
    memoryLimitMb: 512,
    statement:
      "A stream of land additions arrives for an empty grid. Return the number of islands after each operation.",
    examples: [{ input: "m = 3, n = 3, positions = [[0,0],[0,1],[1,2]]", output: "[1,1,2]" }],
    hiddenTestCases: [
      { input: "m = 3, n = 3, positions = [[0,0],[0,1],[1,2]]", output: "[1,1,2]" },
      { input: "m = 1, n = 1, positions = [[0,0]]", output: "[1]" }
    ],
    constraints: ["1 <= m, n <= 10^4", "1 <= positions.length <= 10^5"],
    starterCode: {
      python: "class Solution:\n    def numIslands2(self, m, n, positions):\n        pass",
      javascript: "function numIslands2(m, n, positions) {\n  \n}",
      java: "class Solution {\n    public List<Integer> numIslands2(int m, int n, int[][] positions) {\n        return new ArrayList<>();\n    }\n}",
      cpp: "class Solution {\npublic:\n    vector<int> numIslands2(int m, int n, vector<vector<int>>& positions) {\n        return {};\n    }\n};"
    }
  }
];
