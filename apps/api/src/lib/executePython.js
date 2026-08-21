import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const DEFAULT_TIMEOUT_MS = 2000;
const MAX_OUTPUT_BYTES = 64 * 1024;

export function executePython({ code, stdin = "", timeoutMs = DEFAULT_TIMEOUT_MS }) {
  return new Promise((resolve) => {
    const startHr = process.hrtime.bigint();
    const tempDir = os.tmpdir();
    const fileName = `solution_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.py`;
    const filePath = path.join(tempDir, fileName);

    try {
      fs.writeFileSync(filePath, code, "utf8");
    } catch (err) {
      resolve({
        ok: false,
        exitCode: null,
        stdout: "",
        stderr: `Failed to write python temp file: ${err.message}`,
        verdict: "SYSTEM_ERROR",
        runtimeMs: 0,
        execution_time_ms: 0,
        memory_kb: 0,
        memoryMb: 0
      });
      return;
    }

    const pyCmd = process.platform === "win32" ? (process.env.PYTHON_PATH || "python") : "python3";
    const child = spawn(pyCmd, [filePath], {
      stdio: "pipe",
      windowsHide: true
    });

    let stdout = "";
    let stderr = "";
    let settled = false;
    let timedOut = false;

    // Python interpreter base peak memory (approx 15.6 MB = ~15980 KB)
    const peakMemoryKb = 15980;

    const cleanup = () => {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch {}
    };

    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      cleanup();

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
        if (stderr.includes("SyntaxError") || stderr.includes("IndentationError") || stderr.includes("TabError")) {
          verdict = "CE";
        } else {
          verdict = "RUNTIME_ERROR";
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
