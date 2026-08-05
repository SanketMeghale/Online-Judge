import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const DEFAULT_TIMEOUT_MS = 2000;
const MAX_OUTPUT_BYTES = 64 * 1024;

export function executePython({ code, stdin = "", timeoutMs = DEFAULT_TIMEOUT_MS }) {
  return new Promise((resolve) => {
    const start = Date.now();
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
        runtimeMs: Date.now() - start
      });
      return;
    }

    const child = spawn("python", [filePath], {
      stdio: "pipe",
      windowsHide: true
    });

    let stdout = "";
    let stderr = "";
    let settled = false;
    let timedOut = false;

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
      resolve({
        runtimeMs: Date.now() - start,
        ...result
      });
    };

    const timer = setTimeout(() => {
      timedOut = true;
      try {
        child.kill();
      } catch {}
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
      if (timedOut) return;
      finish({
        ok: exitCode === 0,
        exitCode,
        stdout,
        stderr,
        verdict: exitCode === 0 ? "OK" : "RUNTIME_ERROR"
      });
    });

    if (stdin) {
      child.stdin.write(stdin);
    }
    child.stdin.end();
  });
}
