import { createContext, useContext, useMemo, useState } from "react";
import {
  computeLeaderboard,
  createSubmission,
  ensureDatabase,
  enrichUser,
  getProblemById,
  listProblemsForUser,
  listSubmissionsForUser,
  readSavedCode,
  simulateRun,
  updateUserAfterSubmission,
  writeDatabase,
  writeSavedCode
} from "./appData.js";

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const [database, setDatabase] = useState(() => ensureDatabase());
  const [savedCode, setSavedCode] = useState(() => readSavedCode());

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

  function getSavedCode(problemId, language, fallbackCode) {
    return savedCode[`${problemId}:${language}`] ?? fallbackCode;
  }

  function getUserById(userId) {
    const user = database.users.find((item) => item.id === userId);
    return user ? enrichUser(database, user) : null;
  }

  function getProblemsForUser(userId) {
    const user = database.users.find((item) => item.id === userId);
    return user ? listProblemsForUser(database, user) : [];
  }

  function getSubmissionsForUser(userId) {
    return listSubmissionsForUser(database, userId);
  }

  function submitSolution({ userId, problemId, language, code }) {
    const problem = getProblemById(database, problemId);
    const user = database.users.find((item) => item.id === userId);

    if (!problem || !user) {
      throw new Error("Unable to submit right now.");
    }

    const result = simulateRun(problem, language, code);
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

  function runSolution({ problemId, language, code }) {
    const problem = getProblemById(database, problemId);

    if (!problem) {
      throw new Error("Problem not found.");
    }

    return simulateRun(problem, language, code);
  }

  const value = useMemo(
    () => ({
      database,
      leaderboard: computeLeaderboard(database),
      getProblemById: (problemId) => getProblemById(database, problemId),
      getProblemsForUser,
      getSubmissionsForUser,
      getSavedCode,
      getUserById,
      refreshDatabase,
      runSolution,
      saveCode,
      submitSolution
    }),
    [database, savedCode]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const value = useContext(AppDataContext);

  if (!value) {
    throw new Error("useAppData must be used inside AppDataProvider.");
  }

  return value;
}
