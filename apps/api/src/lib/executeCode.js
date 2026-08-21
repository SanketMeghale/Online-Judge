import { executeRealCode } from "./executionEngine.js";

export async function executeCode({ language, code, stdin = "", timeoutMs = 5000 }) {
  const normalizedLang = (language || "").toLowerCase().trim();
  const safeTimeoutMs = Math.max(1000, Math.min(Number(timeoutMs) || 5000, 10000));

  try {
    return await executeRealCode({
      language: normalizedLang,
      code,
      stdin,
      timeoutMs: safeTimeoutMs
    });
  } catch (error) {
    return {
      compiler: {
        name: normalizedLang,
        version: "unknown",
        status: "FAILED",
        timeMs: 0,
        stdout: "",
        stderr: error.message || "Failed to launch compiler process."
      },
      execution: null,
      ok: false,
      exitCode: 1,
      stdout: "",
      stderr: "The isolated execution service encountered an error: " + error.message,
      verdict: "SYSTEM_ERROR",
      statusText: "Execution Service Unavailable",
      runtimeMs: 0,
      execution_time_ms: 0,
      compilation_time_ms: 0,
      memory_kb: 0,
      memoryMb: 0,
      internalError: process.env.NODE_ENV === "development" ? error.message : undefined
    };
  }
}
