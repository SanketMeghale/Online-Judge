import { executeWithJudge0 } from "./judge0Service.js";

export async function executeCode({ language, code, stdin = "", timeoutMs = 5000 }) {
  const normalizedLang = (language || "").toLowerCase().trim();
  const safeTimeoutMs = Math.max(1000, Math.min(Number(timeoutMs) || 5000, 10000));

  try {
    return await executeWithJudge0({
      language: normalizedLang,
      code,
      stdin,
      timeoutMs: safeTimeoutMs
    });
  } catch (error) {
    return {
      ok: false,
      exitCode: null,
      stdout: "",
      stderr: "The isolated execution service is currently unavailable.",
      verdict: "SYSTEM_ERROR",
      statusText: "Execution Service Unavailable",
      runtimeMs: 0,
      internalError: process.env.NODE_ENV === "development" ? error.message : undefined
    };
  }
}
