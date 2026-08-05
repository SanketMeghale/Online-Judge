import { executeCode } from "../../../apps/api/src/lib/executeCode.js";
import { calculatePercentile } from "../../../apps/api/src/lib/benchmarkEngine.js";
import { wrapCodeWithHarness } from "../../../apps/api/src/lib/codeHarness.js";

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

  const testCases = problem?.hiddenTestCases && problem.hiddenTestCases.length > 0 
    ? problem.hiddenTestCases 
    : problem?.examples || [];

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

  for (let i = 0; i < testCases.length; i++) {
    const testcase = testCases[i];
    console.log(`[JudgeWorker] [STAGE 5: CONTAINER_STARTED] Testcase ${i + 1}/${testCases.length}`);

    const wrappedCode = wrapCodeWithHarness({ code, language, problemId: problem?.id, stdin: testcase.input });
    console.log(`[JudgeWorker] [STAGE 6: INPUT_PASSED] Input: "${testcase.input}"`);

    const execResult = await executeCode({
      language,
      code: wrappedCode,
      stdin: testcase.input
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
        input: testcase.input,
        expectedOutput: testcase.output,
        output: execResult.stdout || cleanErr || "(No output)",
        stdout: execResult.stdout || "",
        stderr: cleanErr,
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
        input: testcase.input,
        expectedOutput: testcase.output,
        output: execResult.stdout.trim() || "Incorrect output",
        stdout: execResult.stdout || "",
        stderr: cleanErr,
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
    input: testCases[0]?.input || "",
    expectedOutput: testCases[0]?.output || "",
    stdout: testResults[0]?.actualOutput || "",
    output: testResults[0]?.actualOutput || testCases[0]?.output || "Success",
    testResults
  };
}
