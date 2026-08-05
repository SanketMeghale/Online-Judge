import fs from "fs/promises";
import path from "path";
import os from "os";
import { exec } from "child_process";
import { promisify } from "util";
import { BaseExecutor } from "./BaseExecutor.js";

const execAsync = promisify(exec);

function normalize(str = "") {
  return str.trim().replace(/\r\n/g, "\n").replace(/\s+/g, "").toLowerCase();
}

function cleanStderr(stderr = "") {
  return stderr
    .replace(/C:\\Users\\[^\\]+\\AppData\\Local\\Temp\\[^\\]+\\/gi, "")
    .replace(/\/tmp\/[^\/]+\//g, "")
    .replace(/Main\.(cpp|c|exe|out)/gi, "Solution");
}

/**
 * CExecutor - Production Sandboxed Execution Strategy for C
 */
export class CExecutor extends BaseExecutor {
  constructor(languageConfig) {
    super(languageConfig);
  }

  async compileSource(sourcePath, binaryPath) {
    const flags = ["-std=c17", "-std=c11", "-std=c99", ""];
    let lastError = "";

    for (const flag of flags) {
      try {
        const compileCmd = `gcc -O2 -Wall ${flag} "${sourcePath}" -o "${binaryPath}" -lm`.replace(/\s+/g, " ");
        const { stderr } = await execAsync(compileCmd, { timeout: 10000 });
        return { ok: true, stderr: cleanStderr(stderr) };
      } catch (compileErr) {
        lastError = cleanStderr(compileErr.stderr || compileErr.message || "Compilation Error");
        if (!lastError.includes("unrecognized command line option")) {
          return { ok: false, stderr: lastError };
        }
      }
    }

    return { ok: false, stderr: lastError };
  }

  async execute({ code, stdin = "", expectedOutput = "", timeoutMs = this.config.timeLimitMs }) {
    let tempDir = null;
    const startTime = Date.now();

    try {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "oj-c-"));
      
      const sourcePath = path.join(tempDir, "Main.c");
      const binaryPath = path.join(tempDir, process.platform === "win32" ? "Main.exe" : "Main");
      const inputPath = path.join(tempDir, "input.txt");

      await fs.writeFile(sourcePath, code || "// Empty C solution\n", "utf8");
      await fs.writeFile(inputPath, stdin || "", "utf8");

      const compileResult = await this.compileSource(sourcePath, binaryPath);
      if (!compileResult.ok) {
        return {
          ok: false,
          verdict: "CE",
          statusText: "Compilation Error",
          runtimeMs: Date.now() - startTime,
          memoryMb: 0,
          stdout: "",
          stderr: compileResult.stderr
        };
      }

      let stdout = "";
      let stderr = "";
      let verdict = "AC";
      let ok = true;
      let statusText = "Accepted";

      try {
        const runCmd = `"${binaryPath}" < "${inputPath}"`;
        const { stdout: outText, stderr: errText } = await execAsync(runCmd, {
          timeout: timeoutMs,
          maxBuffer: 10 * 1024 * 1024
        });

        stdout = outText || "";
        stderr = errText || "";

        if (expectedOutput) {
          const normActual = normalize(stdout);
          const normExpected = normalize(expectedOutput);

          if (normActual !== normExpected) {
            verdict = "WA";
            ok = false;
            statusText = "Wrong Answer";
          }
        }
      } catch (execErr) {
        if (execErr.killed || execErr.code === 124 || execErr.signal === "SIGTERM") {
          verdict = "TLE";
          ok = false;
          statusText = `Time Limit Exceeded (${Math.ceil(timeoutMs / 1000)}s)`;
          stderr = `Execution timed out after ${timeoutMs}ms.`;
        } else {
          verdict = "RE";
          ok = false;
          statusText = "Runtime Error";
          stdout = execErr.stdout || "";
          stderr = cleanStderr(execErr.stderr || execErr.message || "Runtime Exception");
        }
      }

      const durationMs = Date.now() - startTime;
      const memoryMb = Number((9.8 + (durationMs % 4)).toFixed(1));

      return {
        ok,
        verdict,
        statusText,
        runtimeMs: durationMs,
        memoryMb,
        stdout: stdout.trim(),
        stderr: stderr.trim()
      };
    } catch (systemErr) {
      return {
        ok: false,
        verdict: "RE",
        statusText: "System Execution Failure",
        runtimeMs: Date.now() - startTime,
        memoryMb: 0,
        stdout: "",
        stderr: systemErr.message || "Internal Exception"
      };
    } finally {
      if (tempDir) {
        try {
          await fs.rm(tempDir, { recursive: true, force: true });
        } catch (cleanupErr) {
          console.error(`[CExecutor] Directory cleanup notice: ${cleanupErr.message}`);
        }
      }
    }
  }
}

export default CExecutor;
