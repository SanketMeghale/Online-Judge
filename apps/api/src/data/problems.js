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
  }
];
