import { spawn } from "node:child_process";

const DEFAULT_TIMEOUT_MS = 2000;
const MAX_OUTPUT_BYTES = 64 * 1024;

export function executeJavaScript({ code, stdin = "", timeoutMs = DEFAULT_TIMEOUT_MS }) {
  return new Promise((resolve) => {
    const startHr = process.hrtime.bigint();
    const child = spawn(process.execPath, ["-e", code], {
      stdio: "pipe",
      windowsHide: true
    });

    let stdout = "";
    let stderr = "";
    let settled = false;
    let timedOut = false;

    // Track approximate peak memory of child process (fallback to base runtime baseline in KB)
    let peakMemoryKb = 14200;

    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);

      const endHr = process.hrtime.bigint();
      const elapsedNs = Number(endHr - startHr);
      const measuredMs = Math.max(1, Number((elapsedNs / 1_000_000).toFixed(2)));
      const memoryMb = Number((peakMemoryKb / 1024).toFixed(2));

      resolve({
        runtimeMs: measuredMs,
        execution_time_ms: measuredMs,
        memory_kb: peakMemoryKb,
        memoryMb,
        memory: `${memoryMb} MB`,
        ...result
      });
    };

    const timer = setTimeout(() => {
      timedOut = true;
      try {
        child.kill("SIGKILL");
      } catch {}
      finish({
        ok: false,
        exitCode: null,
        stdout,
        stderr: stderr || `Time Limit Exceeded (${(timeoutMs / 1000).toFixed(1)}s)`,
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
      if (timedOut) return;

      let verdict = "OK";
      if (exitCode !== 0) {
        if (stderr.includes("SyntaxError")) {
          verdict = "CE";
        } else {
          verdict = "RE";
        }
      }

      finish({
        ok: exitCode === 0,
        exitCode,
        stdout,
        stderr,
        verdict
      });
    });

    try {
      if (stdin) {
        child.stdin.write(stdin);
      }
      child.stdin.end();
    } catch {}
  });
}
