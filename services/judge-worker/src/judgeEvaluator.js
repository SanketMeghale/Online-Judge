import { executeCode } from "../../../apps/api/src/lib/executeCode.js";
import { calculatePercentile } from "../../../apps/api/src/lib/benchmarkEngine.js";
import { wrapCodeWithHarness } from "../../../apps/api/src/lib/codeHarness.js";

/**
 * Convert LeetCode-style problem input to programmatic stdin for C++ / Java harnesses.
 * e.g. "nums = [2, 7, 11, 15], target = 9" → "4\n2 7 11 15\n9"
 */
function buildCppJavaStdin(problemId, lcInput) {
  if (!lcInput || !lcInput.trim()) return "";
  const raw = lcInput.trim();
  const pid = (problemId || "").toLowerCase();
  try {
    if (pid === "two-sum") {
      const numsMatch = raw.match(/nums\s*=\s*(\[.*?\])/);
      const targetMatch = raw.match(/target\s*=\s*(-?\d+)/);
      if (numsMatch && targetMatch) {
        const nums = JSON.parse(numsMatch[1]);
        return `${nums.length}\n${nums.join(" ")}\n${targetMatch[1]}`;
      }
    }
    if (pid === "valid-parentheses") {
      const sMatch = raw.match(/s\s*=\s*"([^"]*)"/);
      if (sMatch) return sMatch[1];
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
  return raw;
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

function parseTokens(str) {
  const matches = str.match(/("[^"]*"|'[^']*'|-?\d+(?:\.\d+)?|true|false)/gi);
  if (!matches) return null;
  return matches.map((m) => {
    const s = m.toLowerCase().replace(/^["']|["']$/g, "");
    if (s === "true") return true;
    if (s === "false") return false;
    const num = Number(s);
    return isNaN(num) ? s : num;
  });
}

function compareOutputs(actual, expected) {
  const normActual = normalize(actual);
  const normExpected = normalize(expected);

  if (!normActual && !normExpected) return true;
  if (!normActual) return false;
  if (normActual === normExpected) return true;

  // Case-insensitive / boolean equivalence (e.g. True vs true)
  if (normActual.toLowerCase() === normExpected.toLowerCase()) return true;

  // Direct whitespace-stripped comparison
  const stripActual = normActual.replace(/\s+/g, "");
  const stripExpected = normExpected.replace(/\s+/g, "");
  if (stripActual === stripExpected) return true;

  // Try candidate strings (entire output and last non-empty line)
  const lines = normActual.split("\n").map((l) => l.trim()).filter(Boolean);
  const candidates = [normActual, lines[lines.length - 1] || normActual];

  for (const candidate of candidates) {
    try {
      const jsonActual = JSON.parse(candidate);
      const jsonExpected = JSON.parse(normExpected);
      if (JSON.stringify(jsonActual) === JSON.stringify(jsonExpected)) return true;
    } catch {}

    const cStrip = candidate.replace(/\s+/g, "");
    if (cStrip === stripExpected) return true;

    // Handle key-value formatted array outputs e.g. [0: 0, 1: 1]
    const kvMatch = candidate.match(/\d+:\s*(-?\d+|"[^"]*"|'[^']*'|true|false)/g);
    if (kvMatch) {
      const extractedVals = kvMatch.map((kv) => kv.split(":")[1].trim());
      const extractedStr = `[${extractedVals.join(", ")}]`;
      if (extractedStr.replace(/\s+/g, "") === stripExpected) return true;
      try {
        if (JSON.stringify(JSON.parse(extractedStr)) === JSON.stringify(JSON.parse(normExpected))) return true;
      } catch {}
    }

    // Token array comparison (e.g. comparing [0, 1] with "0, 1" or "[0, 1]")
    const actTokens = parseTokens(candidate);
    const expTokens = parseTokens(normExpected);
    if (actTokens && expTokens && actTokens.length === expTokens.length) {
      const matchesAll = actTokens.every((val, idx) => val === expTokens[idx]);
      if (matchesAll) return true;
    }
  }

  return false;
}

function cleanErrorMessage(stderr = "") {
  if (!stderr) return "";
  return stderr
    .replace(/C:\\Users\\[^\\]+\\AppData\\Local\\Temp\\/gi, "")
    .replace(/\/tmp\//g, "")
    .replace(/solution_[a-z0-9_]+\.(py|cpp|java|js)/gi, "Solution");
}

export async function evaluateSubmission({ submission, problem }) {
  const { code, language } = submission;
  const submissionId = submission.id || submission.submissionId || "sub-eval";

  console.log(`[JudgeWorker] [STAGE 4: WORKER_PICKED] Evaluating submission '${submissionId}' for problem '${problem?.id}'`);

  const sampleCases = problem?.examples || [];
  const hiddenCases = problem?.hiddenTestCases || [];

  // Combine sample cases and hidden testcases for full testsuite evaluation
  const testCases = [...sampleCases, ...hiddenCases];

  if (!testCases.length) {
    console.log(`[JudgeWorker] [STAGE 5: CONTAINER_STARTED] Running single testcase execution`);
    const execResult = await executeCode({ language, code });
    const cleanErr = cleanErrorMessage(execResult.stderr);
    const runtimeMs = execResult.runtimeMs || 15;
    const memoryMb = Number((12 + (runtimeMs % 8)).toFixed(1));
    const percentiles = calculatePercentile(language, runtimeMs, memoryMb);

    console.log(`[JudgeWorker] [STAGE 7: OUTPUT_CAPTURED] stdout: "${execResult.stdout.trim()}"`);

    return {
      status: "COMPLETED",
      verdict: execResult.ok ? "AC" : execResult.verdict || "RE",
      statusText: execResult.ok ? "Accepted" : "Execution failed",
      runtimeMs,
      memoryMb,
      memory: `${memoryMb} MB`,
      runtimePercentile: percentiles.runtimePercentile,
      memoryPercentile: percentiles.memoryPercentile,
      output: execResult.stdout || cleanErr,
      stdout: execResult.stdout || "",
      stderr: cleanErr,
      testResults: []
    };
  }

  let totalRuntimeMs = 0;
  const testResults = [];
  const needsConvertedStdin = ["cpp", "c++", "java", "c"].includes((language || "").toLowerCase());

  for (let i = 0; i < testCases.length; i++) {
    const testcase = testCases[i];
    console.log(`[JudgeWorker] [STAGE 5: CONTAINER_STARTED] Testcase ${i + 1}/${testCases.length}`);

    const tcStdin = needsConvertedStdin
      ? buildCppJavaStdin(problem?.id, testcase.input)
      : testcase.input;

    const wrappedCode = wrapCodeWithHarness({ code, language, problemId: problem?.id, stdin: tcStdin });
    console.log(`[JudgeWorker] [STAGE 6: INPUT_PASSED] Input: "${testcase.input}" -> stdin: "${tcStdin}"`);

    const execResult = await executeCode({
      language,
      code: wrappedCode,
      stdin: tcStdin
    });

    const runtime = execResult.runtimeMs || 10;
    totalRuntimeMs += runtime;

    const cleanErr = cleanErrorMessage(execResult.stderr);
    console.log(`[JudgeWorker] [STAGE 7: OUTPUT_CAPTURED] stdout: "${execResult.stdout.trim()}", stderr: "${cleanErr}"`);

    if (!execResult.ok) {
      const verdict = execResult.verdict || "RE";
      const avgRuntimeMs = Math.max(1, Math.round(totalRuntimeMs / (i + 1)));
      const memoryMb = Number((14 + (totalRuntimeMs % 6)).toFixed(1));
      const percentiles = calculatePercentile(language, avgRuntimeMs, memoryMb);

      testResults.push({
        testCase: i + 1,
        passed: false,
        input: testcase.input,
        expectedOutput: testcase.output,
        actualOutput: execResult.stdout || cleanErr || "(No output)",
        verdict
      });

      console.log(`[JudgeWorker] [STAGE 8: COMPARISON_RESULT] Testcase ${i + 1} failed with verdict ${verdict}`);

      return {
        status: "COMPLETED",
        verdict,
        statusText: verdict === "CE" ? "Compilation Error" : verdict === "TLE" ? "Time Limit Exceeded" : `Runtime Error on testcase ${i + 1}`,
        failedTestCase: i + 1,
        passedCount: i,
        totalCases: testCases.length,
        runtimeMs: avgRuntimeMs,
        memoryMb,
        memory: `${memoryMb} MB`,
        runtimePercentile: percentiles.runtimePercentile,
        memoryPercentile: percentiles.memoryPercentile,
        stdout: execResult.stdout || "",
        stderr: cleanErr,
        output: execResult.stdout || cleanErr || "Execution failed",
        expectedOutput: testcase.output,
        testResults
      };
    }

    const isMatch = compareOutputs(execResult.stdout, testcase.output);
    console.log(`[JudgeWorker] [STAGE 8: COMPARISON_RESULT] Testcase ${i + 1}/${testCases.length}: ${isMatch ? "PASSED" : "FAILED"}`);

    testResults.push({
      testCase: i + 1,
      passed: isMatch,
      input: testcase.input,
      expectedOutput: testcase.output,
      actualOutput: execResult.stdout.trim() || "(No output)",
      verdict: isMatch ? "AC" : "WA"
    });

    if (!isMatch) {
      const avgRuntimeMs = Math.max(1, Math.round(totalRuntimeMs / (i + 1)));
      const memoryMb = Number((13 + (totalRuntimeMs % 5)).toFixed(1));
      const percentiles = calculatePercentile(language, avgRuntimeMs, memoryMb);

      return {
        status: "COMPLETED",
        verdict: "WA",
        statusText: `Wrong Answer on testcase ${i + 1} / ${testCases.length}`,
        failedTestCase: i + 1,
        passedCount: i,
        totalCases: testCases.length,
        runtimeMs: avgRuntimeMs,
        memoryMb,
        memory: `${memoryMb} MB`,
        runtimePercentile: percentiles.runtimePercentile,
        memoryPercentile: percentiles.memoryPercentile,
        stdout: execResult.stdout || "",
        stderr: cleanErr,
        output: execResult.stdout.trim() || "Incorrect output",
        expectedOutput: testcase.output,
        testResults
      };
    }
  }

  const avgRuntimeMs = Math.max(1, Math.round(totalRuntimeMs / testCases.length));
  const memoryMb = Number((11 + (avgRuntimeMs % 4)).toFixed(1));
  const percentiles = calculatePercentile(language, avgRuntimeMs, memoryMb);

  return {
    status: "COMPLETED",
    verdict: "AC",
    statusText: "Accepted",
    passedCount: testCases.length,
    totalCases: testCases.length,
    runtimeMs: avgRuntimeMs,
    memoryMb,
    memory: `${memoryMb} MB`,
    runtimePercentile: percentiles.runtimePercentile,
    memoryPercentile: percentiles.memoryPercentile,
    stdout: testResults[0]?.actualOutput || "",
    output: testResults[0]?.actualOutput || testCases[0]?.output || "Success",
    expectedOutput: testCases[0]?.output ?? "",
    testResults
  };
}
