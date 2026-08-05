import { exec, spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const DEFAULT_TIMEOUT_MS = 2000;
const MAX_OUTPUT_BYTES = 64 * 1024;

export function executeCpp({ code, stdin = "", timeoutMs = DEFAULT_TIMEOUT_MS }) {
  return new Promise((resolve) => {
    const start = Date.now();
    const tempDir = os.tmpdir();
    const id = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const sourcePath = path.join(tempDir, `solution_${id}.cpp`);
    const exePath = path.join(tempDir, `solution_${id}.exe`);

    try {
      fs.writeFileSync(sourcePath, code, "utf8");
    } catch (err) {
      resolve({
        ok: false,
        exitCode: null,
        stdout: "",
        stderr: `Failed to write C++ source: ${err.message}`,
        verdict: "SYSTEM_ERROR",
        runtimeMs: Date.now() - start
      });
      return;
    }

    const cleanup = () => {
      try {
        if (fs.existsSync(sourcePath)) fs.unlinkSync(sourcePath);
        if (fs.existsSync(exePath)) fs.unlinkSync(exePath);
      } catch {}
    };

    // 1. Compile C++ file with g++
    exec(`g++ -O2 "${sourcePath}" -o "${exePath}"`, (compileErr, _stdout, compileStderr) => {
      if (compileErr) {
        cleanup();
        resolve({
          ok: false,
          exitCode: compileErr.code ?? 1,
          stdout: "",
          stderr: compileStderr || compileErr.message,
          verdict: "CE",
          runtimeMs: Date.now() - start
        });
        return;
      }

      // 2. Run compiled executable
      const child = spawn(exePath, [], { stdio: "pipe", windowsHide: true });

      let stdout = "";
      let stderr = "";
      let settled = false;
      let timedOut = false;

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
        if (stdout.length < MAX_OUTPUT_BYTES) stdout += chunk.toString();
      });

      child.stderr.on("data", (chunk) => {
        if (stderr.length < MAX_OUTPUT_BYTES) stderr += chunk.toString();
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

      if (stdin) child.stdin.write(stdin);
      child.stdin.end();
    });
  });
}
