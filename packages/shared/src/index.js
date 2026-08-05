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
  { id: "cpp", label: "C++ 20", extension: "cpp" },
  { id: "java", label: "Java 17", extension: "java" }
];

export const PROBLEM_DIFFICULTIES = ["Easy", "Medium", "Hard"];

export function isValidVerdict(verdict) {
  return Object.values(VERDICTS).includes(verdict);
}

export function isValidLanguage(language) {
  return SUPPORTED_LANGUAGES.some((lang) => lang.id === language.toLowerCase());
}
