import assert from "node:assert/strict";
import { test } from "node:test";
import { analyzeCodeComplexity } from "../src/lib/complexityEngine.js";

test("complexity analysis uses the submitted source for linear time and linear space", () => {
  const result = analyzeCodeComplexity({
    language: "javascript",
    code: `function solve(values) {
      const seen = new Set();
      for (const value of values) seen.add(value);
      return seen.size;
    }`
  });
  assert.equal(result.time, "O(n)");
  assert.equal(result.space, "O(n)");
  assert.notEqual(result.confidence, "High");
});

test("sequential loops are not misclassified as nested loops", () => {
  const result = analyzeCodeComplexity({
    language: "python",
    code: `def solve(values):
    for value in values:
        print(value)
    for value in values:
        print(value)
`
  });
  assert.equal(result.time, "O(n)");
  assert.equal(result.breakdown.nestingDepth, 1);
});

test("unproven while-loop bounds fail closed with low confidence", () => {
  const result = analyzeCodeComplexity({
    language: "cpp",
    code: "while (conditionFromNetwork()) { mutateState(); }"
  });
  assert.equal(result.time, "Unable to determine reliably");
  assert.equal(result.confidence, "Low");
});
