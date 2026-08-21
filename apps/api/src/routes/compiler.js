import { Router } from "express";
import { wrapCodeWithHarness } from "../lib/codeHarness.js";
import { executeCode } from "../lib/executeCode.js";
import { isDatabaseConnected } from "../lib/db.js";
import { Problem } from "../models/Problem.js";
import { problems as seedProblems } from "../data/problems.js";
import { compareOutputs } from "../lib/outputChecker.js";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../middleware/auth.middleware.js";
import { isValidLanguage, normalizeLanguage } from "@online-judge/shared";

const router = Router();
const executionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many execution requests. Please retry shortly." }
});

function cleanStderr(stderr = "") {
  return stderr
    .replace(/C:\\Users\\[^\\]+\\AppData\\Local\\Temp\\/gi, "")
    .replace(/\/tmp\//g, "")
    .replace(/solution_[a-z0-9_]+\.(py|cpp|java|js|c)/gi, "Solution");
}

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
        const target = parseInt(targetMatch[1], 10);
        return `${nums.length}\n${nums.join(" ")}\n${target}`;
      }
    }

    if (pid === "valid-parentheses") {
      const sMatch = raw.match(/s\s*=\s*"([^"]*)"/) || raw.match(/s\s*=\s*'([^']*)'/);
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

router.post("/run", requireAuth, executionLimiter, async (request, response) => {
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

  const normLang = normalizeLanguage(language);
  if (!isValidLanguage(normLang)) {
    response.status(400).json({
      error: `Unsupported language: '${language}'. Supported languages: Python, JavaScript, C++, Java, C.`
    });
    return;
  }

  // 2. Fetch Problem definition
  let problem = null;
  if (isDatabaseConnected()) {
    try {
      problem = await Problem.findOne({ id: problemId }).lean();
    } catch {}
  }
  if (!problem) {
    problem = seedProblems.find((p) => p.id === problemId);
  }

  const needsConvertedStdin = normLang === "cpp" || normLang === "c++" || normLang === "java" || normLang === "c";

  // 3. Custom STDIN Execution Mode
  if (stdin || !problem || !problem.examples || problem.examples.length === 0) {
    const resolvedStdin = needsConvertedStdin
      ? buildCppJavaStdin(problemId, stdin || problem?.examples?.[0]?.input || "")
      : (stdin || "");

    const wrappedCode = wrapCodeWithHarness({ code, language: normLang, problemId, stdin: resolvedStdin });
    const result = await executeCode({ language: normLang, code: wrappedCode, stdin: resolvedStdin, timeoutMs });
    const cleanErr = cleanStderr(result.stderr || result.compileOutput || "");
    const runtimeMs = result.execution_time_ms ?? result.runtimeMs ?? 0;
    const memoryKb = result.memory_kb ?? 0;
    const memoryMb = result.memoryMb ?? (memoryKb > 0 ? Number((memoryKb / 1024).toFixed(2)) : 0);

    const verdict = result.ok ? "AC" : (result.verdict === "CE" ? "CE" : result.verdict === "TLE" ? "TLE" : "RE");
    const status = verdict === "AC" ? "ACCEPTED" : verdict === "CE" ? "COMPILATION_ERROR" : verdict === "TLE" ? "TIME_LIMIT_EXCEEDED" : "RUNTIME_ERROR";

    response.json({
      language: normLang,
      ok: result.ok,
      verdict,
      status,
      statusText: result.ok
        ? "Code executed successfully"
        : verdict === "CE"
        ? "Compilation Error"
        : verdict === "TLE"
        ? "Time Limit Exceeded"
        : "Runtime Error",
      execution_time_ms: runtimeMs,
      runtimeMs,
      runtime: `${runtimeMs} ms`,
      compilation_time_ms: result.compilation_time_ms ?? 0,
      memory_kb: memoryKb,
      memoryMb,
      memory: memoryMb > 0 ? `${memoryMb} MB` : undefined,
      stdout: result.stdout || "",
      stderr: cleanErr,
      compileOutput: result.compileOutput || "",
      output: result.stdout.trim() || cleanErr || "Code executed successfully.",
      testResults: []
    });
    return;
  }

  // 4. Multi-Sample Testcase Evaluation Mode
  const sampleCases = problem.examples;
  const testResults = [];
  let passedCount = 0;
  let totalRuntimeMs = 0;
  let maxMemoryKb = 0;
  let compilationTimeMs = 0;
  let overallVerdict = "AC";

  for (let i = 0; i < sampleCases.length; i++) {
    const tc = sampleCases[i];
    const tcStdin = needsConvertedStdin
      ? buildCppJavaStdin(problemId, tc.input)
      : tc.input;

    const wrappedCode = wrapCodeWithHarness({ code, language: normLang, problemId, stdin: tcStdin });
    const res = await executeCode({ language: normLang, code: wrappedCode, stdin: tcStdin, timeoutMs });

    const execMs = res.execution_time_ms ?? res.runtimeMs ?? 0;
    totalRuntimeMs += execMs;
    compilationTimeMs = Math.max(compilationTimeMs, res.compilation_time_ms ?? 0);
    maxMemoryKb = Math.max(maxMemoryKb, res.memory_kb ?? 0);

    const cleanErr = cleanStderr(res.stderr || res.compileOutput || "");

    // If compilation error occurs, immediately stop further testcases
    if (res.verdict === "CE") {
      overallVerdict = "CE";
      testResults.push({
        id: i + 1,
        testCase: i + 1,
        status: "COMPILATION_ERROR",
        passed: false,
        input: tc.input,
        expectedOutput: tc.output,
        actualOutput: cleanErr || "Compilation Error",
        difference: "Program failed to compile.",
        verdict: "CE",
        execution_time_ms: 0,
        memory_kb: 0,
        stdout: "",
        stderr: cleanErr
      });
      break;
    }

    if (!res.ok) {
      const v = res.verdict || "RE";
      if (overallVerdict === "AC") overallVerdict = v;
      testResults.push({
        id: i + 1,
        testCase: i + 1,
        status: v === "TLE" ? "TIME_LIMIT_EXCEEDED" : "RUNTIME_ERROR",
        passed: false,
        input: tc.input,
        expectedOutput: tc.output,
        actualOutput: res.stdout || cleanErr || "(No output)",
        difference: cleanErr || (v === "TLE" ? "Time Limit Exceeded" : "Runtime Error"),
        verdict: v,
        execution_time_ms: execMs,
        memory_kb: res.memory_kb ?? 0,
        stdout: res.stdout || "",
        stderr: cleanErr
      });
      continue;
    }

    // Output comparison
    const comparison = compareOutputs(res.stdout, tc.output);
    if (comparison.passed) {
      passedCount++;
    } else if (overallVerdict === "AC") {
      overallVerdict = "WA";
    }

    testResults.push({
      id: i + 1,
      testCase: i + 1,
      status: comparison.passed ? "PASSED" : "WRONG_ANSWER",
      passed: comparison.passed,
      input: tc.input,
      expectedOutput: tc.output,
      actualOutput: res.stdout.trim() || "(No output)",
      difference: comparison.difference,
      verdict: comparison.passed ? "AC" : "WA",
      execution_time_ms: execMs,
      memory_kb: res.memory_kb ?? 0,
      stdout: res.stdout || "",
      stderr: cleanErr
    });
  }

  const avgRuntime = testResults.length > 0
    ? Number((totalRuntimeMs / testResults.length).toFixed(2))
    : 0;
  const memoryMb = maxMemoryKb > 0 ? Number((maxMemoryKb / 1024).toFixed(2)) : 0;

  const status =
    overallVerdict === "AC"
      ? "ACCEPTED"
      : overallVerdict === "WA"
      ? "WRONG_ANSWER"
      : overallVerdict === "CE"
      ? "COMPILATION_ERROR"
      : overallVerdict === "TLE"
      ? "TIME_LIMIT_EXCEEDED"
      : "RUNTIME_ERROR";

  const statusText =
    overallVerdict === "AC"
      ? "Accepted"
      : overallVerdict === "WA"
      ? `Wrong Answer on sample case`
      : overallVerdict === "CE"
      ? "Compilation Error"
      : overallVerdict === "TLE"
      ? "Time Limit Exceeded"
      : "Runtime Error";

  response.json({
    language: normLang,
    ok: overallVerdict === "AC",
    verdict: overallVerdict,
    status,
    statusText,
    passed: passedCount,
    passedCount,
    total: sampleCases.length,
    totalCases: sampleCases.length,
    execution_time_ms: avgRuntime,
    runtimeMs: avgRuntime,
    runtime: `${avgRuntime} ms`,
    compilation_time_ms: compilationTimeMs,
    memory_kb: maxMemoryKb,
    memoryMb,
    memory: memoryMb > 0 ? `${memoryMb} MB` : undefined,
    output: testResults[0]?.actualOutput || "",
    stdout: testResults[0]?.stdout || "",
    stderr: testResults[0]?.stderr || "",
    compileOutput: overallVerdict === "CE" ? (testResults[0]?.stderr || "") : "",
    testcases: testResults,
    testResults
  });
});

export default router;
