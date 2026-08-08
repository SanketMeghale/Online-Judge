import { Router } from "express";
import { wrapCodeWithHarness } from "../lib/codeHarness.js";
import { executeCode } from "../lib/executeCode.js";
import { isDatabaseConnected } from "../lib/db.js";
import { Problem } from "../models/Problem.js";
import { problems as seedProblems } from "../data/problems.js";

const router = Router();

function cleanStderr(stderr = "") {
  return stderr
    .replace(/C:\\Users\\[^\\]+\\AppData\\Local\\Temp\\/gi, "")
    .replace(/\/tmp\//g, "")
    .replace(/solution_[a-z0-9_]+\.(py|cpp|java|js|c)/gi, "Solution");
}

function normalize(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
}

function compareOutputs(actual, expected) {
  const normActual = normalize(actual);
  const normExpected = normalize(expected);

  if (!normActual) return false;
  if (normActual === normExpected) return true;

  const lines = normActual.split("\n").map((l) => l.trim()).filter(Boolean);
  const lastLine = lines[lines.length - 1] || normActual;

  for (const candidate of [normActual, lastLine]) {
    try {
      const jsonActual = JSON.parse(candidate);
      const jsonExpected = JSON.parse(normExpected);
      if (JSON.stringify(jsonActual) === JSON.stringify(jsonExpected)) {
        return true;
      }
    } catch (e) {}

    const stripCandidate = candidate.replace(/\s+/g, "");
    const stripExpected = normExpected.replace(/\s+/g, "");
    if (stripCandidate === stripExpected) return true;
  }

  return false;
}

/**
 * Convert a LeetCode-style problem input string to a programmatic stdin
 * for C++ / Java harnesses (which use cin / Scanner).
 *
 * E.g. "nums = [2, 7, 11, 15], target = 9"  ->  "4\n2 7 11 15\n9"
 *      "x = 121"                             ->  "121"
 *      "n = 5"                               ->  "5"
 */
function buildCppJavaStdin(problemId, lcInput) {
  if (!lcInput || !lcInput.trim()) return "";
  const raw = lcInput.trim();
  const pid = (problemId || "").toLowerCase();

  try {
    if (pid === "two-sum") {
      // nums = [...], target = N
      const numsMatch = raw.match(/nums\s*=\s*(\[.*?\])/);
      const targetMatch = raw.match(/target\s*=\s*(-?\d+)/);
      if (numsMatch && targetMatch) {
        const nums = JSON.parse(numsMatch[1]);
        const target = parseInt(targetMatch[1], 10);
        return `${nums.length}\n${nums.join(" ")}\n${target}`;
      }
    }

    if (pid === "valid-parentheses") {
      // s = "..."
      const sMatch = raw.match(/s\s*=\s*"([^"]*)"/);
      if (sMatch) return sMatch[1];
      const sMatch2 = raw.match(/s\s*=\s*'([^']*)'/);
      if (sMatch2) return sMatch2[1];
    }

    if (pid === "palindrome-number") {
      const xMatch = raw.match(/x\s*=\s*(-?\d+)/);
      if (xMatch) return xMatch[1];
    }

    if (pid === "best-time-to-buy-and-sell-stock") {
      const pricesMatch = raw.match(/prices\s*=\s*(\[.*?\])/);
      if (pricesMatch) {
        const prices = JSON.parse(pricesMatch[1]);
        return `${prices.length}\n${prices.join(" ")}`;
      }
    }

    if (pid === "single-number") {
      const numsMatch = raw.match(/nums\s*=\s*(\[.*?\])/);
      if (numsMatch) {
        const nums = JSON.parse(numsMatch[1]);
        return `${nums.length}\n${nums.join(" ")}`;
      }
    }

    if (pid === "climbing-stairs") {
      const nMatch = raw.match(/n\s*=\s*(\d+)/);
      if (nMatch) return nMatch[1];
    }

    if (pid === "reverse-string") {
      const sMatch = raw.match(/s\s*=\s*(\[.*?\])/);
      if (sMatch) {
        const s = JSON.parse(sMatch[1]);
        return `${s.length}\n${s.join(" ")}`;
      }
    }
  } catch (e) {}

  // For unsupported problems or C/Java, return the raw string
  return raw;
}

router.post("/run", async (request, response) => {
  const { problemId, language, code, stdin = "", timeoutMs } = request.body ?? {};

  // 1. Validations
  if (!code || !code.trim()) {
    response.status(400).json({ error: "Code cannot be empty." });
    return;
  }

  if (!language) {
    response.status(400).json({ error: "Language is required." });
    return;
  }

  const normLang = language.toLowerCase().trim();
  const supportedLangs = ["javascript", "js", "python", "py", "python3", "cpp", "c++", "java", "c"];
  if (!supportedLangs.includes(normLang)) {
    response.status(400).json({
      error: `Unsupported language: '${language}'. Supported languages: Python, JavaScript, C++, Java, C.`
    });
    return;
  }

  // 2. Fetch Problem
  let problem = null;
  if (isDatabaseConnected()) {
    try {
      problem = await Problem.findOne({ id: problemId }).lean();
    } catch {}
  }
  if (!problem) {
    problem = seedProblems.find((p) => p.id === problemId);
  }

  // Determine if C++/Java (need programmatic stdin, not LeetCode format)
  const needsConvertedStdin = normLang === "cpp" || normLang === "c++" || normLang === "java" || normLang === "c";

  // If custom STDIN is provided or problem has no examples, run single execution
  if (stdin || !problem || !problem.examples || problem.examples.length === 0) {
    const resolvedStdin = needsConvertedStdin
      ? buildCppJavaStdin(problemId, stdin || problem?.examples?.[0]?.input || "")
      : (stdin || "");

    const wrappedCode = wrapCodeWithHarness({ code, language: normLang, problemId, stdin: resolvedStdin });
    const result = await executeCode({ language: normLang, code: wrappedCode, stdin: resolvedStdin, timeoutMs });
    const cleanErr = cleanStderr(result.stderr);
    const runtimeMs = result.runtimeMs || 10;
    const memory = `${(12 + (runtimeMs % 7)).toFixed(1)} MB`;

    response.json({
      language: normLang,
      ok: result.ok,
      verdict: result.ok ? "AC" : result.verdict || "RE",
      statusText: result.ok
        ? "Code executed successfully"
        : result.verdict === "CE"
        ? "Compilation Error"
        : result.verdict === "TLE"
        ? "Time Limit Exceeded"
        : "Runtime Error",
      runtime: `${runtimeMs} ms`,
      runtimeMs,
      memory,
      stdout: result.stdout || "",
      stderr: cleanErr,
      output: result.stdout.trim() || cleanErr || "Code executed successfully.",
      testResults: []
    });
    return;
  }

  // 3. Evaluate against all sample testcases
  const sampleCases = problem.examples;
  const testResults = [];
  let passedCount = 0;
  let totalRuntimeMs = 0;
  let overallVerdict = "AC";

  for (let i = 0; i < sampleCases.length; i++) {
    const tc = sampleCases[i];

    // Convert stdin format for C++ / Java
    const tcStdin = needsConvertedStdin
      ? buildCppJavaStdin(problemId, tc.input)
      : tc.input;

    const wrappedCode = wrapCodeWithHarness({ code, language: normLang, problemId, stdin: tcStdin });
    const res = await executeCode({ language: normLang, code: wrappedCode, stdin: tcStdin, timeoutMs });

    totalRuntimeMs += res.runtimeMs || 10;
    const cleanErr = cleanStderr(res.stderr);

    if (!res.ok) {
      const v = res.verdict || "RE";
      if (overallVerdict === "AC") overallVerdict = v;
      testResults.push({
        testCase: i + 1,
        passed: false,
        input: tc.input,
        expectedOutput: tc.output,
        actualOutput: res.stdout || cleanErr || "(No output)",
        verdict: v,
        stdout: res.stdout || "",
        stderr: cleanErr
      });
      continue;
    }

    const passed = compareOutputs(res.stdout, tc.output);
    if (passed) {
      passedCount++;
    } else if (overallVerdict === "AC") {
      overallVerdict = "WA";
    }

    testResults.push({
      testCase: i + 1,
      passed,
      input: tc.input,
      expectedOutput: tc.output,
      actualOutput: res.stdout.trim() || "(No output)",
      verdict: passed ? "AC" : "WA",
      stdout: res.stdout || "",
      stderr: cleanErr
    });
  }

  const avgRuntime = Math.max(1, Math.round(totalRuntimeMs / sampleCases.length));
  const memory = `${(12.5 + (avgRuntime % 5)).toFixed(1)} MB`;

  response.json({
    language: normLang,
    ok: overallVerdict === "AC",
    verdict: overallVerdict,
    statusText:
      overallVerdict === "AC"
        ? "Accepted"
        : overallVerdict === "WA"
        ? "Wrong Answer on sample case"
        : overallVerdict === "CE"
        ? "Compilation Error"
        : overallVerdict === "TLE"
        ? "Time Limit Exceeded"
        : "Runtime Error",
    passedCount,
    totalCases: sampleCases.length,
    runtime: `${avgRuntime} ms`,
    runtimeMs: avgRuntime,
    memory,
    output: testResults[0]?.actualOutput || "",
    testResults
  });
});

export default router;
