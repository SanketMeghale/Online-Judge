import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { api } from "../api/apiClient";
import { subscribeToSubmissionUpdates } from "../services/socketService";
import {
  computeLeaderboard,
  createSubmission,
  ensureDatabase,
  getProblemById,
  getProblemsForUser,
  getSavedCode,
  getSubmissionsForUser,
  getUserById,
  readSavedCode,
  updateUserAfterSubmission,
  writeDatabase,
  writeSavedCode
} from "./appData";

const AppDataContext = createContext(null);

// Normalize a raw submission object (from API) into a consistent, crash-proof shape
function normalizeSubmission(raw, problem) {
  if (!raw) return null;

  // The service may return nested under .submission or flat
  const sub = raw.submission || raw;

  const rawVerdict = typeof sub.verdict === "string" ? sub.verdict : typeof sub.status === "string" ? sub.status : "";
  // Map "PENDING"/"QUEUED" → keep as-is; "OK" → "AC"
  const verdict = rawVerdict === "OK" ? "AC" : rawVerdict || "WA";
  const isAc = verdict === "AC";

  const passedCount =
    typeof sub.passedCount === "number"
      ? sub.passedCount
      : typeof sub.passCount === "number"
      ? sub.passCount
      : typeof sub.passed_count === "number"
      ? sub.passed_count
      : isAc
      ? problem?.hiddenTestCases?.length || problem?.examples?.length || 2
      : 0;

  const totalCases =
    typeof sub.totalCases === "number"
      ? sub.totalCases
      : typeof sub.totalCount === "number"
      ? sub.totalCount
      : typeof sub.total_cases === "number"
      ? sub.total_cases
      : problem?.hiddenTestCases?.length || problem?.examples?.length || 2;

  const testResults = Array.isArray(sub.testResults)
    ? sub.testResults
    : Array.isArray(sub.testcases)
    ? sub.testcases
    : [];
  const firstTc = testResults[0] || {};

  let statusText = typeof sub.statusText === "string" ? sub.statusText : "";
  if (!statusText) {
    if (isAc) statusText = "Accepted";
    else if (verdict === "WA") statusText = `Wrong Answer on testcase ${passedCount + 1}`;
    else if (verdict === "TLE") statusText = "Time Limit Exceeded";
    else if (verdict === "MLE") statusText = "Memory Limit Exceeded";
    else if (verdict === "CE") statusText = "Compilation Error";
    else if (verdict === "RE") statusText = "Runtime Error";
    else statusText = String(verdict || "Evaluated");
  }

  const subId = String(sub._id || sub.id || sub.submissionId || raw.submissionId || raw.id || "");
  const runtimeNum = typeof sub.execution_time_ms === "number"
    ? sub.execution_time_ms
    : typeof sub.runtimeMs === "number"
    ? sub.runtimeMs
    : 0;
  const runtimeStr = typeof sub.runtime === "string" && sub.runtime
    ? sub.runtime
    : `${runtimeNum} ms`;

  const memoryKb = typeof sub.memory_kb === "number" ? sub.memory_kb : 0;
  const memoryMb = typeof sub.memoryMb === "number"
    ? sub.memoryMb
    : (memoryKb > 0 ? Number((memoryKb / 1024).toFixed(2)) : 0);
  const memoryStr = typeof sub.memory === "string" && sub.memory
    ? sub.memory
    : (memoryMb > 0 ? `${memoryMb} MB` : "");

  return {
    id: subId || `sub_${Date.now()}`,
    submissionId: subId || `sub_${Date.now()}`,
    verdict: String(verdict),
    status: sub.status || (isAc ? "ACCEPTED" : "FAILED"),
    statusText: String(statusText),
    runtime: String(runtimeStr),
    runtimeMs: runtimeNum,
    execution_time_ms: runtimeNum,
    compilation_time_ms: typeof sub.compilation_time_ms === "number" ? sub.compilation_time_ms : 0,
    memory: String(memoryStr),
    memory_kb: memoryKb,
    memoryMb,
    runtimePercentile: typeof sub.runtimePercentile === "number" ? sub.runtimePercentile : null,
    memoryPercentile: typeof sub.memoryPercentile === "number" ? sub.memoryPercentile : null,
    passedCount,
    passed: passedCount,
    totalCases,
    total: totalCases,
    output: firstTc.actualOutput || firstTc.stdout || sub.stdout || sub.output || "",
    stdout: firstTc.actualOutput || firstTc.stdout || sub.stdout || "",
    stderr: firstTc.stderr || sub.stderr || "",
    compileOutput: sub.compileOutput || "",
    expectedOutput:
      firstTc.expectedOutput || sub.expectedOutput || problem?.examples?.[0]?.output || "",
    testResults,
    testcases: testResults,
    message: isAc ? "Accepted! Your solution passed all test cases." : String(statusText)
  };
}

// Poll the backend until a submission is no longer PENDING/QUEUED
// Returns the final normalized submission or null on timeout
async function pollUntilComplete(subId, problem, maxAttempts = 24, intervalMs = 500) {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, intervalMs));
    try {
      const fetched = await api.getSubmission(subId);
      const raw = fetched?.submission || fetched;
      const v = raw?.verdict || raw?.status || "";
      const isDone = v && v !== "PENDING" && v !== "QUEUED" && v !== "processing";
      if (isDone) {
        return normalizeSubmission(raw, problem);
      }
    } catch (_) {
      // Network error during polling — keep trying
    }
  }
  return null; // timed out
}

export function AppDataProvider({ children }) {
  const [database, setDatabase] = useState(() => ensureDatabase());
  const [savedCode, setSavedCode] = useState(() => readSavedCode());

  // Dedicated sync function to fetch problems (with server-calculated status) and submissions from backend
  const syncBackendData = useCallback(async () => {
    try {
      const [problemsRes, subsRes] = await Promise.allSettled([
        api.getProblems(),
        api.getSubmissions()
      ]);

      setDatabase((current) => {
        let nextProblems = current.problems;
        let nextSubs = current.submissions;
        let hasChanges = false;

        if (problemsRes.status === "fulfilled" && Array.isArray(problemsRes.value?.problems)) {
          nextProblems = problemsRes.value.problems;
          hasChanges = true;
        }

        if (subsRes.status === "fulfilled") {
          const subsList = Array.isArray(subsRes.value) ? subsRes.value : subsRes.value?.submissions || null;
          if (Array.isArray(subsList) && subsList.length > 0) {
            nextSubs = subsList.map((s) => ({
              ...s,
              id: String(s._id || s.id || s.submissionId || ""),
              submissionId: String(s._id || s.id || s.submissionId || "")
            }));
            hasChanges = true;
          }
        }

        if (!hasChanges) return current;

        const next = {
          ...current,
          problems: nextProblems,
          submissions: nextSubs
        };
        writeDatabase(next);
        return next;
      });
    } catch (err) {
      console.warn("[AppDataContext] syncBackendData notice:", err);
    }
  }, []);

  // Fetch & sync on mount
  useEffect(() => {
    syncBackendData();
  }, []);

  // Real-time Socket.IO updates from Judge Worker
  useEffect(() => {
    const unsubscribe = subscribeToSubmissionUpdates((payload) => {
      if (!payload?.submissionId) return;

      setDatabase((current) => {
        const subId = String(payload.submissionId);
        const existingIdx = current.submissions.findIndex(
          (s) => String(s.id) === subId || String(s.submissionId) === subId
        );

        const updatedVerdict = payload.verdict || "AC";
        const updatedObj = {
          id: subId,
          submissionId: subId,
          problemId: payload.problemId || "",
          userId: payload.userId || "",
          language: payload.language || "python",
          verdict: updatedVerdict,
          statusText: payload.statusText || (updatedVerdict === "AC" ? "Accepted" : "Evaluated"),
          runtime: payload.runtime || (payload.runtimeMs ? `${payload.runtimeMs} ms` : "25 ms"),
          runtimeMs: payload.runtimeMs || 25,
          memory: payload.memory || (payload.memoryMb ? `${payload.memoryMb} MB` : "14.2 MB"),
          memoryMb: payload.memoryMb || 14.2,
          passedCount: payload.passCount ?? payload.passedCount ?? 0,
          totalCases: payload.totalCount ?? payload.totalCases ?? 0,
          stdout: payload.stdout || "",
          stderr: payload.stderr || "",
          output: payload.output || payload.stdout || "",
          expectedOutput: payload.expectedOutput || "",
          testResults: payload.testcases || [],
          submittedAt: new Date().toISOString()
        };

        let updatedSubmissions = [...current.submissions];
        if (existingIdx >= 0) {
          updatedSubmissions[existingIdx] = {
            ...updatedSubmissions[existingIdx],
            ...updatedObj
          };
        } else {
          updatedSubmissions.unshift(updatedObj);
        }

        const nextDb = { ...current, submissions: updatedSubmissions };
        writeDatabase(nextDb);
        return nextDb;
      });
    });

    return () => unsubscribe();
  }, []);

  function refreshDatabase() {
    setDatabase(ensureDatabase());
  }

  function updateDatabase(updater) {
    setDatabase((current) => {
      const next = typeof updater === "function" ? updater(current) : updater;
      writeDatabase(next);
      return next;
    });
  }

  function saveCode(problemId, language, code) {
    setSavedCode((current) => {
      const next = { ...current, [`${problemId}:${language}`]: code };
      writeSavedCode(next);
      return next;
    });
  }

  // ── Run Solution ─────────────────────────────────────────────────────────────
  async function runSolution({ problemId, language, code, stdin = "" }) {
    const problem = getProblemById(database, problemId);

    const response = await api.runCode({
      problemId,
      language: language.toLowerCase(),
      code,
      stdin
    });

    const isAc = response.verdict === "AC" || (response.ok && response.verdict !== "WA");
    const runtimeNum = typeof response.execution_time_ms === "number"
      ? response.execution_time_ms
      : typeof response.runtimeMs === "number"
      ? response.runtimeMs
      : 0;
    const runtimeStr = response.runtime || `${runtimeNum} ms`;

    const memoryKb = typeof response.memory_kb === "number" ? response.memory_kb : 0;
    const memoryMb = typeof response.memoryMb === "number"
      ? response.memoryMb
      : (memoryKb > 0 ? Number((memoryKb / 1024).toFixed(2)) : 0);
    const memoryStr = response.memory || (memoryMb > 0 ? `${memoryMb} MB` : "");

    const testResults = Array.isArray(response.testcases)
      ? response.testcases
      : Array.isArray(response.testResults)
      ? response.testResults
      : [];

    return {
      ok: Boolean(response.ok),
      verdict: response.verdict || (isAc ? "AC" : "RE"),
      status: response.status || (isAc ? "ACCEPTED" : "FAILED"),
      statusText:
        response.statusText ||
        (isAc ? "Accepted" : "Execution failed"),
      runtime: runtimeStr,
      runtimeMs: runtimeNum,
      execution_time_ms: runtimeNum,
      compilation_time_ms: response.compilation_time_ms || 0,
      memory: memoryStr,
      memory_kb: memoryKb,
      memoryMb,
      output: response.output || response.stdout || response.stderr || "",
      stdout: response.stdout || "",
      stderr: response.stderr || "",
      compileOutput: response.compileOutput || "",
      expectedOutput: testResults[0]?.expectedOutput || problem?.examples?.[0]?.output || "",
      passedCount:
        typeof response.passed === "number"
          ? response.passed
          : typeof response.passedCount === "number"
          ? response.passedCount
          : isAc ? testResults.length || 1 : 0,
      totalCases:
        typeof response.total === "number"
          ? response.total
          : typeof response.totalCases === "number"
          ? response.totalCases
          : testResults.length || problem?.examples?.length || 1,
      testResults,
      testcases: testResults
    };
  }

  // ── Submit Solution ───────────────────────────────────────────────────────────
  async function submitSolution({ userId, problemId, language, code, stdin = "" }) {
    const problem = getProblemById(database, problemId);
    if (!problem) throw new Error("Problem not found.");

    const userFallback = (
      database.users?.find((u) => u.id === userId || u._id === userId)
    ) || {
      id: userId || "guest_coder",
      username: "Coder",
      stats: { totalSubmissions: 0, acceptedSubmissions: 0 },
      solvedProblemIds: [],
      attemptedProblemIds: [],
      badges: [],
      xp: 0
    };

    // 1. POST to backend — may return QUEUED or already-evaluated result
    const response = await api.submitCode({
      userId,
      problemId,
      language: language.toLowerCase(),
      code,
      stdin
    });

    if (!response) {
      throw new Error("Empty submission response from API.");
    }

    // 2. Unwrap the submission object
    const rawSub = response.submission || response;
    if (!rawSub) {
      throw new Error("Invalid submission payload structure.");
    }

    const subId = String(
      rawSub._id || rawSub.id || rawSub.submissionId || response.submissionId || ""
    );
    const currentVerdict = rawSub.verdict || rawSub.status || "";
    const isPending =
      !currentVerdict ||
      currentVerdict === "PENDING" ||
      currentVerdict === "QUEUED" ||
      currentVerdict === "processing";

    let result;
    if (isPending && subId) {
      const polled = await pollUntilComplete(subId, problem);
      result = polled || normalizeSubmission(rawSub, problem);
    } else {
      result = normalizeSubmission(rawSub, problem);
    }

    // 3. Persist submission locally (localStorage) for immediate UI display
    try {
      const { submission, nextSubmissionId } = createSubmission(
        database,
        userId,
        problem,
        language,
        result
      );

      const isAc = result.verdict === "AC" || result.verdict === "OK" || result.verdict === "Accepted";

      updateDatabase((current) => {
        const userExists = current.users?.some((u) => u.id === userId || u._id === userId);
        const updatedUsers = userExists
          ? current.users.map((u) =>
              u.id === userId || u._id === userId
                ? updateUserAfterSubmission(u, problem, result.verdict)
                : u
            )
          : [...(current.users || []), updateUserAfterSubmission(userFallback, problem, result.verdict)];

        // Update problem's own status in problems list
        const updatedProblems = (current.problems || []).map((p) => {
          if (p.id === problem.id) {
            return {
              ...p,
              status: isAc ? "Solved" : p.status === "Solved" ? "Solved" : "Attempted",
              userStats: {
                solved: isAc ? true : !!p.userStats?.solved,
                attempts: (p.userStats?.attempts || 0) + 1,
                lastVerdict: result.verdict
              }
            };
          }
          return p;
        });

        return {
          ...current,
          nextSubmissionId,
          submissions: [submission, ...(current.submissions || [])],
          users: updatedUsers,
          problems: updatedProblems
        };
      });
      // Background re-sync with server
      setTimeout(() => {
        syncBackendData();
      }, 500);
    } catch (dbErr) {
      console.warn("[Submit] Local DB update notice:", dbErr.message);
    }

    return result;
  }

  const value = useMemo(
    () => ({
      database,
      refreshDatabase,
      syncBackendData,
      updateDatabase,
      getProblemById: (id) => getProblemById(database, id),
      getProblemsForUser: (userId, query, difficulty, status) =>
        getProblemsForUser(database, userId, query, difficulty, status),
      getSubmissionsForUser: (userId) => getSubmissionsForUser(database, userId),
      getUserById: (userId) => getUserById(database, userId),
      getSavedCode: (problemId, language, starterCode) =>
        getSavedCode(savedCode, problemId, language, starterCode),
      saveCode,
      runSolution,
      submitSolution,
      leaderboard: computeLeaderboard(database)
    }),
    [database, savedCode]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within an AppDataProvider");
  return ctx;
}
