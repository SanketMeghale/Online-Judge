export const VERDICTS = {
  ACCEPTED: "AC",
  WRONG_ANSWER: "WA",
  TIME_LIMIT_EXCEEDED: "TLE",
  MEMORY_LIMIT_EXCEEDED: "MLE",
  COMPILATION_ERROR: "CE",
  RUNTIME_ERROR: "RE",
  SYSTEM_ERROR: "SYSTEM_ERROR",
  PENDING: "PENDING",
  RUNNING: "RUNNING"
};

export const SUBMISSION_STATUS = Object.freeze({
  QUEUED: "QUEUED",
  COMPILING: "COMPILING",
  RUNNING: "RUNNING",
  JUDGING: "JUDGING",
  ANALYZING: "ANALYZING",
  FINALIZING: "FINALIZING",
  ACCEPTED: "ACCEPTED",
  WRONG_ANSWER: "WRONG_ANSWER",
  RUNTIME_ERROR: "RUNTIME_ERROR",
  TIME_LIMIT_EXCEEDED: "TIME_LIMIT_EXCEEDED",
  MEMORY_LIMIT_EXCEEDED: "MEMORY_LIMIT_EXCEEDED",
  COMPILATION_ERROR: "COMPILATION_ERROR",
  SYSTEM_ERROR: "SYSTEM_ERROR"
});

export const ACTIVE_SUBMISSION_STATUSES = Object.freeze([
  SUBMISSION_STATUS.QUEUED,
  SUBMISSION_STATUS.COMPILING,
  SUBMISSION_STATUS.RUNNING,
  SUBMISSION_STATUS.JUDGING,
  SUBMISSION_STATUS.ANALYZING,
  SUBMISSION_STATUS.FINALIZING
]);

export const TERMINAL_SUBMISSION_STATUSES = Object.freeze([
  SUBMISSION_STATUS.ACCEPTED,
  SUBMISSION_STATUS.WRONG_ANSWER,
  SUBMISSION_STATUS.RUNTIME_ERROR,
  SUBMISSION_STATUS.TIME_LIMIT_EXCEEDED,
  SUBMISSION_STATUS.MEMORY_LIMIT_EXCEEDED,
  SUBMISSION_STATUS.COMPILATION_ERROR,
  SUBMISSION_STATUS.SYSTEM_ERROR
]);

export const SUPPORTED_LANGUAGES = [
  { id: "javascript", label: "JavaScript", extension: "js" },
  { id: "python", label: "Python 3", extension: "py" },
  { id: "c", label: "C17", extension: "c" },
  { id: "cpp", label: "C++ 20", extension: "cpp" },
  { id: "java", label: "Java 17", extension: "java" }
];

export const PROBLEM_DIFFICULTIES = ["Easy", "Medium", "Hard"];
export const JUDGE_QUEUE = Object.freeze({
  queue: "judgo-execution",
  jobName: "judge-submission",
  workerHeartbeatKey: "judgo-execution:worker-heartbeat",
  workerHeartbeatTtlMs: 90_000
});
export const LANGUAGE_ALIASES = Object.freeze({
  js: "javascript",
  py: "python",
  python3: "python",
  "c++": "cpp"
});

export function normalizeLanguage(language = "") {
  const value = String(language).toLowerCase().trim();
  return LANGUAGE_ALIASES[value] || value;
}

export function isValidVerdict(verdict) {
  return Object.values(VERDICTS).includes(verdict);
}

export function isValidLanguage(language) {
  const normalized = normalizeLanguage(language);
  return SUPPORTED_LANGUAGES.some((lang) => lang.id === normalized);
}
