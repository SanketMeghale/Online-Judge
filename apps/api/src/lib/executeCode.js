import { executeWithJudge0 } from "./judge0Service.js";
import { executeCpp } from "./executeCpp.js";
import { executeJava } from "./executeJava.js";
import { executeJavaScript } from "./executeJavaScript.js";
import { executePython } from "./executePython.js";

export async function executeCode({ language, code, stdin = "", timeoutMs = 5000 }) {
  const normalizedLang = (language || "").toLowerCase().trim();

  // 1. Attempt Judge0 execution first if configured or in production
  if (process.env.JUDGE0_URL || process.env.RAPIDAPI_KEY || process.env.VERCEL || process.env.NODE_ENV === "production") {
    try {
      const judge0Result = await executeWithJudge0({ language: normalizedLang, code, stdin, timeoutMs });
      if (judge0Result && judge0Result.verdict) {
        return judge0Result;
      }
    } catch (judge0Err) {
      console.warn(`[executeCode] Judge0 execution unavailable (${judge0Err.message}). Falling back to local engine...`);
    }
  }

  // 2. Local Fallback Execution Engine
  switch (normalizedLang) {
    case "js":
    case "javascript":
      return executeJavaScript({ code, stdin, timeoutMs });

    case "py":
    case "python":
    case "python3":
      return executePython({ code, stdin, timeoutMs });

    case "c":
    case "cpp":
    case "c++":
      return executeCpp({ code, stdin, timeoutMs });

    case "java":
      return executeJava({ code, stdin, timeoutMs });

    default:
      return {
        ok: false,
        exitCode: null,
        stdout: "",
        stderr: `Unsupported language: '${language}'. Supported languages: javascript, python, cpp, java, c.`,
        verdict: "SYSTEM_ERROR",
        runtimeMs: 0
      };
  }
}
