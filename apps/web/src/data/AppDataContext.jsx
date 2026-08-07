import { createContext, useContext, useEffect, useMemo, useState } from "react";
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
  simulateRun,
  updateUserAfterSubmission,
  writeDatabase,
  writeSavedCode
} from "./appData";

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const [database, setDatabase] = useState(() => ensureDatabase());
  const [savedCode, setSavedCode] = useState(() => readSavedCode());

  // Fetch & sync problems from backend API
  useEffect(() => {
    let isMounted = true;
    api.getProblems().then((res) => {
      const fetched = res?.problems || res;
      if (Array.isArray(fetched) && fetched.length > 0 && isMounted) {
        setDatabase((current) => {
          const existingIds = new Set(current.problems.map((p) => p.id));
          let changed = false;
          const merged = [...current.problems];

          for (const item of fetched) {
            if (!existingIds.has(item.id)) {
              merged.push(item);
              changed = true;
            }
          }

          if (!changed) return current;
          const next = { ...current, problems: merged };
          writeDatabase(next);
          return next;
        });
      }
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Listen for real-time Socket.IO submission:update events emitted by Judge Worker
  useEffect(() => {
    const unsubscribe = subscribeToSubmissionUpdates((payload) => {
      if (!payload || !payload.submissionId) return;

      setDatabase((current) => {
        const subId = String(payload.submissionId);
        const existingIdx = current.submissions.findIndex(
          (s) => String(s.id) === subId || String(s.submissionId) === subId
        );

        const updatedVerdict = payload.verdict || "AC";
        const updatedStatus = payload.status || (updatedVerdict === "AC" ? "ACCEPTED" : "EVALUATED");

        let updatedSubmissions = [...current.submissions];
        const updatedObj = {
          id: subId,
          submissionId: subId,
          problemId: payload.problemId || "two-sum",
          userId: payload.userId || "u-demo-1",
          language: payload.language || "Python",
          verdict: updatedVerdict,
          statusText: payload.statusText || updatedStatus,
          runtime: payload.runtime || (payload.runtimeMs ? `${payload.runtimeMs} ms` : "25 ms"),
          runtimeMs: payload.runtimeMs,
          memory: payload.memory || (payload.memoryMb ? `${payload.memoryMb} MB` : "14.2 MB"),
          memoryMb: payload.memoryMb,
          passCount: payload.passCount ?? payload.passedCount ?? 0,
          totalCount: payload.totalCount ?? payload.totalCases ?? 0,
          stdout: payload.stdout || "",
          stderr: payload.stderr || "",
          output: payload.output || payload.stdout || payload.stderr || "",
          expectedOutput: payload.expectedOutput || "",
          testcases: payload.testcases || [],
          submittedAt: new Date().toISOString()
        };

        if (existingIdx >= 0) {
          updatedSubmissions[existingIdx] = {
            ...updatedSubmissions[existingIdx],
            ...updatedObj
          };
        } else {
          updatedSubmissions.unshift(updatedObj);
        }

        const nextDb = {
          ...current,
          submissions: updatedSubmissions
        };
        writeDatabase(nextDb);
        return nextDb;
      });
    });

    return () => {
      unsubscribe();
    };
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
      const next = {
        ...current,
        [`${problemId}:${language}`]: code
      };

      writeSavedCode(next);
      return next;
    });
  }

  async function runSolution({ problemId, language, code, stdin = "" }) {
    const problem = getProblemById(database, problemId);
    const effectiveStdin = stdin || problem?.examples?.[0]?.input || "";

    try {
      const response = await api.runCode({
        problemId,
        language: language.toLowerCase(),
        code,
        stdin: effectiveStdin
      });

      return {
        verdict: response.verdict || (response.ok ? "AC" : "RE"),
        statusText: response.statusText || (response.ok ? "Code executed successfully" : "Execution failed"),
        runtime: response.runtime || `${response.runtimeMs || 15} ms`,
        runtimeMs: response.runtimeMs || 15,
        memory: response.memory || "14.2 MB",
        output: response.output || response.stdout || response.stderr || "Execution completed.",
        stdout: response.stdout || "",
        stderr: response.stderr || "",
        expectedOutput: problem?.examples?.[0]?.output ?? "",
        passedCount: response.passedCount ?? (response.verdict === "AC" ? (problem?.examples?.length || 1) : 0),
        totalCases: response.totalCases ?? (problem?.examples?.length || 1),
        testResults: response.testResults || [],
        message: response.ok ? "Code executed via backend compiler engine." : response.stderr || "Execution completed."
      };
    } catch {
      if (!problem) {
        throw new Error("Problem not found.");
      }
      return simulateRun(problem, language, code);
    }
  }

  async function submitSolution({ userId, problemId, language, code, stdin = "" }) {
    const problem = getProblemById(database, problemId);
    const user = database.users.find((item) => item.id === userId);

    if (!problem || !user) {
      throw new Error("Unable to submit right now.");
    }

    let result;

    try {
      const response = await api.submitCode({
        problemId,
        language: language.toLowerCase(),
        code,
        stdin
      });

      const exec = response.execution || {};
      let sub = response.submission || response;
      const subId = String(sub._id || sub.id || sub.submissionId || response.submissionId || "");

      // Poll if needed until evaluation completes (up to 10 attempts, 300ms apart)
      if (subId && (sub.verdict === "PENDING" || sub.status === "QUEUED" || !sub.verdict)) {
        for (let attempt = 0; attempt < 10; attempt++) {
          await new Promise((resolve) => setTimeout(resolve, 300));
          try {
            const fetched = await api.getSubmission(subId);
            const s = fetched?.submission || fetched;
            if (s && s.verdict && s.verdict !== "PENDING" && s.status !== "QUEUED") {
              sub = s;
              break;
            }
          } catch (e) {}
        }
      }

      const rawVerdict = sub.verdict || exec.verdict || "WA";
      const verdict = (rawVerdict === "OK" || rawVerdict === "AC") ? "AC" : rawVerdict;
      const isAc = verdict === "AC";

      const passCount = sub.passedCount ?? sub.passCount ?? exec.passedCount ?? (isAc ? (problem.hiddenTestCases?.length || problem.examples.length) : 0);
      const totalCount = sub.totalCases ?? sub.totalCount ?? exec.totalCases ?? (problem.hiddenTestCases?.length || problem.examples.length);
      const testResults = sub.testcases || sub.testResults || exec.testResults || [];
      const firstTc = testResults[0] || {};

      let defaultStatusText = "Accepted";
      if (!isAc) {
        if (verdict === "WA") defaultStatusText = `Wrong Answer on testcase ${passCount + 1}`;
        else if (verdict === "TLE") defaultStatusText = "Time Limit Exceeded";
        else if (verdict === "MLE") defaultStatusText = "Memory Limit Exceeded";
        else if (verdict === "CE") defaultStatusText = "Compilation Error";
        else defaultStatusText = "Runtime Error";
      }

      result = {
        id: subId,
        submissionId: subId,
        verdict,
        statusText: sub.statusText || exec.statusText || defaultStatusText,
        runtime: `${sub.runtimeMs || exec.runtimeMs || 25} ms`,
        runtimeMs: sub.runtimeMs || exec.runtimeMs || 25,
        memory: `${sub.memoryMb || exec.memoryMb || 14.2} MB`,
        memoryMb: sub.memoryMb || exec.memoryMb || 14.2,
        runtimePercentile: sub.runtimePercentile || exec.runtimePercentile || 84.6,
        memoryPercentile: sub.memoryPercentile || exec.memoryPercentile || 76.2,
        passedCount: passCount,
        totalCases: totalCount,
        output: firstTc.actualOutput || firstTc.stdout || sub.stdout || sub.output || exec.stdout || exec.output || "",
        stdout: firstTc.actualOutput || firstTc.stdout || sub.stdout || exec.stdout || "",
        stderr: firstTc.stderr || sub.stderr || exec.stderr || "",
        expectedOutput: firstTc.expectedOutput || sub.expectedOutput || exec.expectedOutput || problem.examples[0]?.output || "",
        testResults,
        message: isAc ? "Accepted! Your solution passed all test cases." : sub.statusText || defaultStatusText
      };
    } catch (err) {
      console.warn("[AppDataContext] Submission API error, using fallback simulation:", err);
      result = simulateRun(problem, language, code);
    }


    const { submission, nextSubmissionId } = createSubmission(database, userId, problem, language, result);

    updateDatabase((current) => ({
      ...current,
      nextSubmissionId,
      submissions: [submission, ...current.submissions],
      users: current.users.map((item) =>
        item.id === userId ? updateUserAfterSubmission(item, problem, result.verdict) : item
      )
    }));

    return result;
  }

  const value = useMemo(
    () => ({
      database,
      leaderboard: computeLeaderboard(database),
      getProblemById: (problemId) => getProblemById(database, problemId),
      getProblemsForUser: (userId, query, difficulty, status) =>
        getProblemsForUser(database, userId, query, difficulty, status),
      getSubmissionsForUser: (userId) => getSubmissionsForUser(database, userId),
      getSavedCode: (problemId, language, starter) => getSavedCode(savedCode, problemId, language, starter),
      getUserById: (userId) => getUserById(database, userId),
      runSolution,
      submitSolution,
      saveCode,
      refreshDatabase
    }),
    [database, savedCode]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used within an AppDataProvider");
  }
  return context;
}
