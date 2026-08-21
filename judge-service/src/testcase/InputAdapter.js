export function adaptTestcaseInput(problemId, language, input = "") {
  const normalizedLanguage = String(language).toLowerCase();
  if (!["c", "cpp", "java"].includes(normalizedLanguage)) return String(input || "");
  const raw = String(input || "").trim();
  const problem = String(problemId || "").toLowerCase();

  try {
    if (problem === "two-sum") {
      const nums = JSON.parse(raw.match(/nums\s*=\s*(\[.*?\])/)?.[1]);
      const target = raw.match(/target\s*=\s*(-?\d+)/)?.[1];
      if (Array.isArray(nums) && target !== undefined) return `${nums.length}\n${nums.join(" ")}\n${target}`;
    }
    if (problem === "valid-parentheses") {
      return raw.match(/s\s*=\s*["']([^"']*)["']/)?.[1] ?? raw;
    }
    if (problem === "palindrome-number") {
      return raw.match(/x\s*=\s*(-?\d+)/)?.[1] ?? raw;
    }
    if (["best-time-to-buy-and-sell-stock", "single-number"].includes(problem)) {
      const key = problem === "single-number" ? "nums" : "prices";
      const values = JSON.parse(raw.match(new RegExp(`${key}\\s*=\\s*(\\[.*?\\])`))?.[1]);
      if (Array.isArray(values)) return `${values.length}\n${values.join(" ")}`;
    }
    if (problem === "climbing-stairs") {
      return raw.match(/n\s*=\s*(\d+)/)?.[1] ?? raw;
    }
    if (problem === "reverse-string") {
      const values = JSON.parse(raw.match(/s\s*=\s*(\[.*?\])/)?.[1]);
      if (Array.isArray(values)) return `${values.length}\n${values.join(" ")}`;
    }
  } catch {
    return raw;
  }
  return raw;
}
