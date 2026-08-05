/**
 * BaseExecutor - Abstract Base Class for Language Execution (SRP & LSP Compliance)
 * Defines the contract that all concrete language executors must implement.
 */

export class BaseExecutor {
  /**
   * @param {import("../../config/languages.js").LanguageConfig} languageConfig
   */
  constructor(languageConfig) {
    if (new.target === BaseExecutor) {
      throw new TypeError("Cannot instantiate abstract class BaseExecutor directly.");
    }
    if (!languageConfig) {
      throw new Error("LanguageConfig is required for Executor initialization.");
    }
    this.config = languageConfig;
  }

  /**
   * Compiles source code (Optional, override in compiled languages)
   * @param {string} sourceCode
   * @param {string} workingDir
   * @returns {Promise<{ ok: boolean, stderr?: string, binaryPath?: string }>}
   */
  async compile(sourceCode, workingDir) {
    return { ok: true };
  }

  /**
   * Runs binary or interpreted script inside sandbox
   * @param {Object} params
   * @param {string} params.workingDir
   * @param {string} params.stdin
   * @param {number} [params.timeoutMs]
   * @returns {Promise<{ ok: boolean, verdict: string, stdout: string, stderr: string, runtimeMs: number, memoryMb: number }>}
   */
  async run({ workingDir, stdin = "", timeoutMs = this.config.timeLimitMs }) {
    throw new Error(`Method 'run()' must be implemented by subclass ${this.constructor.name}`);
  }

  /**
   * Master execution flow (Compile -> Run -> Cleanup)
   * @param {Object} params
   * @param {string} params.code
   * @param {string} [params.stdin]
   * @param {number} [params.timeoutMs]
   * @param {string} [params.workingDir]
   */
  async execute({ code, stdin = "", timeoutMs, workingDir = "/sandbox" }) {
    const effectiveTimeoutMs = timeoutMs || this.config.timeLimitMs;

    // 1. Compilation Phase
    const compileResult = await this.compile(code, workingDir);
    if (!compileResult.ok) {
      return {
        ok: false,
        verdict: "CE",
        statusText: "Compilation Error",
        runtimeMs: 0,
        memoryMb: 0,
        stdout: "",
        stderr: compileResult.stderr || "Compilation failed."
      };
    }

    // 2. Execution Phase
    return await this.run({ workingDir, stdin, timeoutMs: effectiveTimeoutMs });
  }
}
