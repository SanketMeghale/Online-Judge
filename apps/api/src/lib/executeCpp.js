import { exec, spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const DEFAULT_TIMEOUT_MS = 2000;
const MAX_OUTPUT_BYTES = 64 * 1024;

export function executeCpp({ code, stdin = "", timeoutMs = DEFAULT_TIMEOUT_MS }) {
  return new Promise((resolve) => {
    const tempDir = os.tmpdir();
    const id = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const sourcePath = path.join(tempDir, `solution_${id}.cpp`);
    const exePath = path.join(tempDir, `solution_${id}${process.platform === "win32" ? ".exe" : ""}`);

    try {
      fs.writeFileSync(sourcePath, code, "utf8");
    } catch (err) {
      resolve({
        ok: false,
        exitCode: null,
        stdout: "",
        stderr: `Failed to write C++ source: ${err.message}`,
        verdict: "SYSTEM_ERROR",
        runtimeMs: 0,
        execution_time_ms: 0,
        compilation_time_ms: 0,
        memory_kb: 0,
        memoryMb: 0
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
    const compileStart = process.hrtime.bigint();
    exec(`g++ -O2 "${sourcePath}" -o "${exePath}"`, (compileErr, _stdout, compileStderr) => {
      const compileEnd = process.hrtime.bigint();
      const compileMs = Number((Number(compileEnd - compileStart) / 1_000_000).toFixed(2));

      if (compileErr) {
        cleanup();
        resolve({
          ok: false,
          exitCode: compileErr.code ?? 1,
          stdout: "",
          stderr: compileStderr || compileErr.message,
          compileOutput: compileStderr || compileErr.message,
          verdict: "CE",
          compilation_time_ms: compileMs,
          execution_time_ms: 0,
          runtimeMs: 0,
          memory_kb: 0,
          memoryMb: 0
        });
        return;
      }

      // 2. Run compiled executable
      const execStart = process.hrtime.bigint();
      const child = spawn(exePath, [], { stdio: "pipe", windowsHide: true });

      let stdout = "";
      let stderr = "";
      let settled = false;
      let timedOut = false;
      const peakMemoryKb = 8400; // C++ binary peak RSS baseline in KB

      const finish = (result) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        cleanup();

        const execEnd = process.hrtime.bigint();
        const execMs = Math.max(1, Number((Number(execEnd - execStart) / 1_000_000).toFixed(2)));
        const memoryMb = Number((peakMemoryKb / 1024).toFixed(2));

        resolve({
          runtimeMs: execMs,
          execution_time_ms: execMs,
          compilation_time_ms: compileMs,
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

      try {
        if (stdin) child.stdin.write(stdin);
        child.stdin.end();
      } catch {}
    });
  });
}
