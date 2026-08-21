import { executeCode } from "../../../apps/api/src/lib/executeCode.js";
import { calculateRealPercentile } from "../../../apps/api/src/lib/benchmarkEngine.js";
import { wrapCodeWithHarness } from "../../../apps/api/src/lib/codeHarness.js";
import { compareOutputs } from "../../../apps/api/src/lib/outputChecker.js";

/**
 * Convert LeetCode-style problem input to programmatic stdin for C++ / Java harnesses.
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
  const testCases = [...sampleCases, ...hiddenCases];
  const normLang = (language || "").toLowerCase().trim();

  if (!testCases.length) {
    console.log(`[JudgeWorker] [STAGE 5: CONTAINER_STARTED] Running single testcase execution`);
    const execResult = await executeCode({ language: normLang, code });
    const cleanErr = cleanErrorMessage(execResult.stderr || execResult.compileOutput || "");
    const runtimeMs = execResult.execution_time_ms ?? execResult.runtimeMs ?? 0;
    const memoryKb = execResult.memory_kb ?? 0;
    const memoryMb = execResult.memoryMb ?? (memoryKb > 0 ? Number((memoryKb / 1024).toFixed(2)) : 0);

    const verdict = execResult.ok ? "AC" : (execResult.verdict === "CE" ? "CE" : execResult.verdict === "TLE" ? "TLE" : "RE");
    const percentiles = await calculateRealPercentile({
      problemId: problem?.id,
      language: normLang,
      runtimeMs,
      memoryMb
    });

    return {
      status: "COMPLETED",
      verdict,
      statusText: execResult.ok ? "Accepted" : verdict === "CE" ? "Compilation Error" : verdict === "TLE" ? "Time Limit Exceeded" : "Execution failed",
      passedCount: execResult.ok ? 1 : 0,
      totalCases: 1,
      runtimeMs,
      execution_time_ms: runtimeMs,
      compilation_time_ms: execResult.compilation_time_ms ?? 0,
      memory_kb: memoryKb,
      memoryMb,
      memory: memoryMb > 0 ? `${memoryMb} MB` : undefined,
      runtimePercentile: percentiles.runtimePercentile,
      memoryPercentile: percentiles.memoryPercentile,
      output: execResult.stdout || cleanErr,
      stdout: execResult.stdout || "",
      stderr: cleanErr,
      testResults: []
    };
  }

  let totalRuntimeMs = 0;
  let maxMemoryKb = 0;
  let compilationTimeMs = 0;
  const testResults = [];
  const needsConvertedStdin = ["cpp", "c++", "java", "c"].includes(normLang);

  for (let i = 0; i < testCases.length; i++) {
    const testcase = testCases[i];
    console.log(`[JudgeWorker] [STAGE 5: CONTAINER_STARTED] Testcase ${i + 1}/${testCases.length}`);

    const tcStdin = needsConvertedStdin
      ? buildCppJavaStdin(problem?.id, testcase.input)
      : testcase.input;

    const wrappedCode = wrapCodeWithHarness({ code, language: normLang, problemId: problem?.id, stdin: tcStdin });
    console.log(`[JudgeWorker] [STAGE 6: INPUT_PASSED] Input: "${testcase.input}" -> stdin: "${tcStdin}"`);

    const execResult = await executeCode({
      language: normLang,
      code: wrappedCode,
      stdin: tcStdin
    });

    const execMs = execResult.execution_time_ms ?? execResult.runtimeMs ?? 0;
    totalRuntimeMs += execMs;
    compilationTimeMs = Math.max(compilationTimeMs, execResult.compilation_time_ms ?? 0);
    maxMemoryKb = Math.max(maxMemoryKb, execResult.memory_kb ?? 0);

    const cleanErr = cleanErrorMessage(execResult.stderr || execResult.compileOutput || "");
    console.log(`[JudgeWorker] [STAGE 7: OUTPUT_CAPTURED] stdout: "${execResult.stdout.trim()}", stderr: "${cleanErr}"`);

    // Compilation error on compiled languages
    if (execResult.verdict === "CE") {
      testResults.push({
        id: i + 1,
        testCase: i + 1,
        status: "COMPILATION_ERROR",
        passed: false,
        input: testcase.input,
        expectedOutput: testcase.output,
        actualOutput: cleanErr || "Compilation Error",
        difference: "Program failed to compile.",
        verdict: "CE",
        execution_time_ms: 0,
        memory_kb: 0,
        stdout: "",
        stderr: cleanErr
      });

      return {
        status: "COMPLETED",
        verdict: "CE",
        statusText: "Compilation Error",
        failedTestCase: i + 1,
        passedCount: 0,
        totalCases: testCases.length,
        runtimeMs: 0,
        execution_time_ms: 0,
        compilation_time_ms: compilationTimeMs,
        memory_kb: 0,
        memoryMb: 0,
        runtimePercentile: null,
        memoryPercentile: null,
        output: cleanErr || "Compilation Error",
        stdout: "",
        stderr: cleanErr,
        testcases: testResults,
        testResults
      };
    }

    if (!execResult.ok) {
      const verdict = execResult.verdict || "RE";
      const avgRuntimeMs = Number((totalRuntimeMs / (i + 1)).toFixed(2));
      const memoryMb = maxMemoryKb > 0 ? Number((maxMemoryKb / 1024).toFixed(2)) : 0;

      testResults.push({
        id: i + 1,
        testCase: i + 1,
        status: verdict === "TLE" ? "TIME_LIMIT_EXCEEDED" : "RUNTIME_ERROR",
        passed: false,
        input: testcase.input,
        expectedOutput: testcase.output,
        actualOutput: execResult.stdout || cleanErr || "(No output)",
        difference: cleanErr || (verdict === "TLE" ? "Time Limit Exceeded" : "Runtime Error"),
        verdict,
        execution_time_ms: execMs,
        memory_kb: execResult.memory_kb ?? 0,
        stdout: execResult.stdout || "",
        stderr: cleanErr
      });

      console.log(`[JudgeWorker] [STAGE 8: COMPARISON_RESULT] Testcase ${i + 1} failed with verdict ${verdict}`);

      return {
        status: "COMPLETED",
        verdict,
        statusText: verdict === "TLE" ? "Time Limit Exceeded" : `Runtime Error on testcase ${i + 1}`,
        failedTestCase: i + 1,
        passedCount: i,
        totalCases: testCases.length,
        runtimeMs: avgRuntimeMs,
        execution_time_ms: avgRuntimeMs,
        compilation_time_ms: compilationTimeMs,
        memory_kb: maxMemoryKb,
        memoryMb,
        memory: memoryMb > 0 ? `${memoryMb} MB` : undefined,
        runtimePercentile: null,
        memoryPercentile: null,
        output: execResult.stdout || cleanErr,
        stdout: execResult.stdout || "",
        stderr: cleanErr,
        testcases: testResults,
        testResults
      };
    }

    const comparison = compareOutputs(execResult.stdout, testcase.output);
    testResults.push({
      id: i + 1,
      testCase: i + 1,
      status: comparison.passed ? "PASSED" : "WRONG_ANSWER",
      passed: comparison.passed,
      input: testcase.input,
      expectedOutput: testcase.output,
      actualOutput: execResult.stdout.trim() || "(No output)",
      difference: comparison.difference,
      verdict: comparison.passed ? "AC" : "WA",
      execution_time_ms: execMs,
      memory_kb: execResult.memory_kb ?? 0,
      stdout: execResult.stdout || "",
      stderr: cleanErr
    });

    if (!comparison.passed) {
      const avgRuntimeMs = Number((totalRuntimeMs / (i + 1)).toFixed(2));
      const memoryMb = maxMemoryKb > 0 ? Number((maxMemoryKb / 1024).toFixed(2)) : 0;

      console.log(`[JudgeWorker] [STAGE 8: COMPARISON_RESULT] Testcase ${i + 1} WA: Expected "${testcase.output}", Got "${execResult.stdout.trim()}"`);

      return {
        status: "COMPLETED",
        verdict: "WA",
        statusText: `Wrong Answer on testcase ${i + 1} / ${testCases.length}`,
        failedTestCase: i + 1,
        passedCount: i,
        totalCases: testCases.length,
        runtimeMs: avgRuntimeMs,
        execution_time_ms: avgRuntimeMs,
        compilation_time_ms: compilationTimeMs,
        memory_kb: maxMemoryKb,
        memoryMb,
        memory: memoryMb > 0 ? `${memoryMb} MB` : undefined,
        runtimePercentile: null,
        memoryPercentile: null,
        output: execResult.stdout || "Wrong Answer",
        stdout: execResult.stdout || "",
        stderr: cleanErr,
        testcases: testResults,
        testResults
      };
    }
  }

  const avgRuntimeMs = Number((totalRuntimeMs / testCases.length).toFixed(2));
  const memoryMb = maxMemoryKb > 0 ? Number((maxMemoryKb / 1024).toFixed(2)) : 0;

  const percentiles = await calculateRealPercentile({
    problemId: problem?.id,
    language: normLang,
    runtimeMs: avgRuntimeMs,
    memoryMb
  });

  console.log(`[JudgeWorker] [STAGE 8: COMPARISON_RESULT] All ${testCases.length} testcases AC! Runtime: ${avgRuntimeMs}ms, Memory: ${memoryMb}MB`);

  return {
    status: "COMPLETED",
    verdict: "AC",
    statusText: "Accepted",
    passedCount: testCases.length,
    totalCases: testCases.length,
    runtimeMs: avgRuntimeMs,
    execution_time_ms: avgRuntimeMs,
    compilation_time_ms: compilationTimeMs,
    memory_kb: maxMemoryKb,
    memoryMb,
    memory: memoryMb > 0 ? `${memoryMb} MB` : undefined,
    runtimePercentile: percentiles.runtimePercentile,
    memoryPercentile: percentiles.memoryPercentile,
    output: testResults[0]?.actualOutput || "All test cases passed.",
    stdout: testResults[0]?.stdout || "",
    stderr: "",
    testcases: testResults,
    testResults
  };
}
