import { BaseExecutor } from "./BaseExecutor.js";
import { dockerService } from "../services/DockerService.js";

/**
 * The only executor used by judge workers. Untrusted source is compiled and run
 * inside the hardened sandbox image; the worker host never invokes a compiler
 * or language runtime directly.
 */
export class SandboxExecutor extends BaseExecutor {
  async execute({ workingDir, timeoutMs = this.config.timeLimitMs }) {
    if (!workingDir) {
      throw new Error("A sandbox working directory is required.");
    }

    const safeTimeoutMs = Math.max(100, Math.min(Number(timeoutMs) || this.config.timeLimitMs, 10_000));
    return dockerService.runInSandbox({
      hostTempDir: workingDir,
      image: this.config.dockerImage,
      command: [
        "/opt/judge/scripts/run.sh",
        this.config.id,
        String(Math.max(1, Math.ceil(safeTimeoutMs / 1000)))
      ],
      // The runner enforces the user's execution deadline. This outer deadline
      // additionally allows for cold container startup and compilation.
      timeoutMs: safeTimeoutMs + 10_000,
      memoryLimitMb: this.config.memoryLimitMb,
      cpuLimit: 1
    });
  }
}

export default SandboxExecutor;
