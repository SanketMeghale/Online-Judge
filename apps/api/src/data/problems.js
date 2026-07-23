export const problems = [
  {
    id: "two-sum",
    title: "Two Sum Revisited",
    difficulty: "Easy",
    topic: "Arrays",
    points: 10,
    statement:
      "Given an array of integers and a target, return indices of two numbers that add up to the target. Each input has exactly one valid answer.",
    examples: [
      { input: "nums = [2, 7, 11, 15], target = 9", output: "[0, 1]" },
      { input: "nums = [3, 2, 4], target = 6", output: "[1, 2]" }
    ]
  },
  {
    id: "cache-stampede",
    title: "Prevent Cache Stampede",
    difficulty: "Medium",
    topic: "Hashing",
    points: 20,
    statement:
      "Design a function that batches repeated key lookups and prevents duplicate expensive fetches while preserving response order.",
    examples: [{ input: "keys = [a, b, a, c]", output: "fetch(a), fetch(b), fetch(c)" }]
  },
  {
    id: "merge-islands",
    title: "Merge Dynamic Islands",
    difficulty: "Hard",
    topic: "Graphs",
    points: 50,
    statement:
      "A stream of land additions arrives for an empty grid. Return the number of islands after each operation.",
    examples: [{ input: "m = 3, n = 3, positions = [[0,0],[0,1],[1,2]]", output: "[1,1,2]" }]
  },
  {
    id: "binary-lift",
    title: "Binary Lift Ancestors",
    difficulty: "Medium",
    topic: "Trees",
    points: 20,
    statement:
      "Preprocess a rooted tree so each query returns the k-th ancestor of a node in logarithmic time.",
    examples: [{ input: "parent = [-1,0,0,1,1], query = (4,2)", output: "0" }]
  }
];
