import { evaluateSubmission } from "../services/judge-worker/src/judgeEvaluator.js";
import { problems } from "../apps/api/src/data/problems.js";

async function runTests() {
  console.log("=== RUNNING SUBMISSION PIPELINE TESTS ===");

  const twoSum = problems.find((p) => p.id === "two-sum");

  // Test 1: Python Solution with debug prints
  const pyCode = `
class Solution:
    def twoSum(self, nums, target):
        print("Debugging line")
        lookup = {}
        for i, num in enumerate(nums):
            diff = target - num
            if diff in lookup:
                return [lookup[diff], i]
            lookup[num] = i
`;

  console.log("\n--- Testing Python Submission for two-sum ---");
  const pyResult = await evaluateSubmission({
    submission: { id: "test-py", language: "python", code: pyCode },
    problem: twoSum
  });

  console.log("Verdict:", pyResult.verdict);
  console.log("Status Text:", pyResult.statusText);
  console.log("Passed:", `${pyResult.passedCount} / ${pyResult.totalCases}`);
  console.log("First TC Output:", pyResult.stdout);

  if (pyResult.verdict !== "AC") {
    console.error("FAIL: Python submission failed!");
    process.exit(1);
  }

  // Test 2: JavaScript Solution for two-sum
  const jsCode = `
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff), i];
    }
    map.set(nums[i], i);
  }
}
`;

  console.log("\n--- Testing JavaScript Submission for two-sum ---");
  const jsResult = await evaluateSubmission({
    submission: { id: "test-js", language: "javascript", code: jsCode },
    problem: twoSum
  });

  console.log("Verdict:", jsResult.verdict);
  console.log("Status Text:", jsResult.statusText);
  console.log("Passed:", `${jsResult.passedCount} / ${jsResult.totalCases}`);

  if (jsResult.verdict !== "AC") {
    console.error("FAIL: JavaScript submission failed!");
    process.exit(1);
  }

  // Test 3: C++ Solution for two-sum
  const cppCode = `
#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> mp;
        for (int i = 0; i < nums.size(); ++i) {
            int diff = target - nums[i];
            if (mp.count(diff)) {
                return {mp[diff], i};
            }
            mp[nums[i]] = i;
        }
        return {};
    }
};
`;

  console.log("\n--- Testing C++ Submission for two-sum ---");
  const cppResult = await evaluateSubmission({
    submission: { id: "test-cpp", language: "cpp", code: cppCode },
    problem: twoSum
  });

  console.log("Verdict:", cppResult.verdict);
  console.log("Status Text:", cppResult.statusText);
  console.log("Passed:", `${cppResult.passedCount} / ${cppResult.totalCases}`);

  if (cppResult.verdict !== "AC") {
    console.error("FAIL: C++ submission failed!");
    process.exit(1);
  }

  // Test 4: Java Solution for two-sum
  const javaCode = `
class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int diff = target - nums[i];
            if (map.containsKey(diff)) {
                return new int[]{map.get(diff), i};
            }
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}
`;

  console.log("\n--- Testing Java Submission for two-sum ---");
  const javaResult = await evaluateSubmission({
    submission: { id: "test-java", language: "java", code: javaCode },
    problem: twoSum
  });

  console.log("Verdict:", javaResult.verdict);
  console.log("Status Text:", javaResult.statusText);
  console.log("Passed:", `${javaResult.passedCount} / ${javaResult.totalCases}`);

  if (javaResult.verdict !== "AC") {
    console.error("FAIL: Java submission failed!");
    process.exit(1);
  }

  console.log("\nALL SUBMISSION PIPELINE TESTS PASSED SUCCESSFULLY!");
}

runTests().catch((err) => {
  console.error("Test Error:", err);
  process.exit(1);
});
