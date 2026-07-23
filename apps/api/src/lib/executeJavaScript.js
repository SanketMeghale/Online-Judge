import { spawn } from "node:child_process";

const DEFAULT_TIMEOUT_MS = 2000;
const MAX_OUTPUT_BYTES = 64 * 1024;

export function executeJavaScript({ code, stdin = "", timeoutMs = DEFAULT_TIMEOUT_MS }) {
  return new Promise((resolve) => {
    const start = Date.now();
    const child = spawn(process.execPath, ["-e", code], {
      stdio: "pipe",
      windowsHide: true
    });

    let stdout = "";
    let stderr = "";
    let settled = false;
    let timedOut = false;

    const finish = (result) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timer);
      resolve({
        runtimeMs: Date.now() - start,
        ...result
      });
    };

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill();
      finish({
        ok: false,
        exitCode: null,
        stdout,
        stderr: stderr || "Execution timed out.",
        verdict: "TLE"
      });
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      if (stdout.length < MAX_OUTPUT_BYTES) {
        stdout += chunk.toString();
      }
    });

    child.stderr.on("data", (chunk) => {
      if (stderr.length < MAX_OUTPUT_BYTES) {
        stderr += chunk.toString();
      }
    });

    child.on("error", (error) => {
      finish({
        ok: false,
        exitCode: null,
        stdout,
        stderr: error.message,
        verdict: "SYSTEM_ERROR"
      });
    });

    child.on("close", (exitCode) => {
      if (timedOut) {
        return;
      }

      finish({
        ok: exitCode === 0,
        exitCode,
        stdout,
        stderr,
        verdict: exitCode === 0 ? "OK" : "RUNTIME_ERROR"
      });
    });

    child.stdin.write(stdin);
    child.stdin.end();
  });
}
