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

export const SUPPORTED_LANGUAGES = [
  { id: "javascript", label: "JavaScript", extension: "js" },
  { id: "python", label: "Python 3", extension: "py" },
  { id: "c", label: "C17", extension: "c" },
  { id: "cpp", label: "C++ 20", extension: "cpp" },
  { id: "java", label: "Java 17", extension: "java" }
];

export const PROBLEM_DIFFICULTIES = ["Easy", "Medium", "Hard"];
export const JUDGE_QUEUE = Object.freeze({
  exchange: "judge_exchange",
  deadLetterExchange: "judge_dlx_exchange",
  queue: "judge_queue",
  deadLetterQueue: "submission_dlq",
  submissionRoutingKey: "submission.job",
  deadLetterRoutingKey: "submission.dead"
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
