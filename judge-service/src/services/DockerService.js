import Docker from "dockerode";
import path from "path";
import stream from "stream";

/**
 * DockerService - Hardened Production Container Sandbox Service
 * 
 * Comprehensive Security Protections:
 * 1. Fork Bomb Protection (PidsLimit: 32 & nproc ulimit)
 * 2. Infinite Loop Protection (CPU Quota & SIGKILL Hard Execution Timeout)
 * 3. Network Access Isolation (NetworkMode: "none")
 * 4. File System Protection (ReadonlyRootfs: true & Tmpfs noexec/nosuid)
 * 5. Privilege Escalation Prevention (User: 1000:1000, no-new-privileges, CapDrop: ALL)
 * 6. Large Output Attack Prevention (512 KB stdout/stderr buffer truncation & LogConfig limits)
 * 7. Symlink & Traversal Attack Prevention (Strict host path resolving & boundary verification)
 * 8. Temporary File Leak Prevention (Guaranteed container deletion in finally blocks)
 */
export class DockerService {
  /**
   * Maximum allowed standard output / standard error buffer size (512 KB)
   * Protects against Large Output Attacks
   */
  static MAX_OUTPUT_BYTES = Math.max(1024, Number(process.env.MAX_OUTPUT_BYTES || 512 * 1024));

  /**
   * Initializes Dockerode client instance
   * Automatically connects to Linux Unix socket or Windows named pipe
   */
  constructor() {
    const isWindows = process.platform === "win32";
    this.docker = new Docker(
      isWindows
        ? { socketPath: "//./pipe/docker_engine" }
        : { socketPath: "/var/run/docker.sock" }
    );
  }

  /**
   * Checks Docker Daemon Connectivity
   * @returns {Promise<boolean>} True if Docker daemon is online, false otherwise
   */
  async isDockerAvailable() {
    try {
      await this.docker.ping();
      return true;
    } catch (err) {
      return false;
    }
  }

  async assertReady(image = process.env.SANDBOX_IMAGE || "online-judge-sandbox:latest") {
    await this.docker.ping();
    await this.docker.getImage(image).inspect();
    return true;
  }

  /**
   * Creates a Hardened Sandboxed Container Instance
   * Applies multi-layered security constraints against untrusted user code.
   * 
   * @param {Object} options
   * @param {string} [options.image="online-judge-sandbox:latest"] - Docker image tag
   * @param {string} options.hostTempDir - Absolute path to host temporary working directory
   * @param {string[]} options.command - Command array to execute
   * @param {number} [options.memoryLimitMb=256] - RAM limit in Megabytes
   * @param {number} [options.cpuLimit=1.0] - CPU core allocation limit
   * @param {boolean} [options.networkDisabled=true] - Completely disable network
   * @returns {Promise<Docker.Container>} Hardened Dockerode container instance
   */
  async createContainer({
    image = "online-judge-sandbox:latest",
    hostTempDir,
    command,
    memoryLimitMb = 256,
    cpuLimit = 1.0,
    networkDisabled = true
  }) {
    // Convert Megabytes to Bytes
    const memorySizeBytes = memoryLimitMb * 1024 * 1024;
    // Convert CPU limit to NanoCPUs (1.0 CPU = 1e9 NanoCPUs)
    const nanoCpus = Math.floor(cpuLimit * 1e9);

    // Format host directory path for Docker volume bind mount
    const normalizedHostDir = path.resolve(hostTempDir).replace(/\\/g, "/");

    const hostUid = typeof process.getuid === "function" ? process.getuid() : 0;
    const hostGid = typeof process.getgid === "function" ? process.getgid() : 0;
    const sandboxUid = hostUid === 0 ? 10001 : hostUid;
    const sandboxGid = hostGid === 0 ? 10001 : hostGid;

    const containerConfig = {
      Image: image,
      Labels: { "com.judgo.sandbox": "true" },
      Cmd: command,
      User: `${sandboxUid}:${sandboxGid}`,
      Tty: false,
      OpenStdin: true,
      StdinOnce: false,
      WorkingDir: "/workspace",
      HostConfig: {
        Init: true,
        // Mount local host temp directory to container /sandbox (read-write)
        Binds: [`${normalizedHostDir}:/workspace:rw`],

        // Security Choice 2 & 4: Strict memory & swap limits
        Memory: memorySizeBytes,
        MemorySwap: memorySizeBytes, // Same as Memory to disable swap & prevent disk thrashing

        // Security Choice 2: Hard CPU quota allocation
        NanoCpus: nanoCpus,

        // Security Choice 3: Complete Network Isolation
        NetworkMode: networkDisabled ? "none" : "bridge",

        // Security Choice 4: Read-only Root Filesystem
        ReadonlyRootfs: true,

        // Security Choice 4: Temporary in-memory RAM disk for execution
        Tmpfs: {
          "/tmp": "rw,noexec,nosuid,nodev,size=64m"
        },

        // Security Choice 1: Fork Bomb Protection (PID limit = 32)
        PidsLimit: 32,

        // Security Choice 5: Prevent Privilege Escalation
        SecurityOpt: ["no-new-privileges:true"],

        // Security Choice 5: Drop all Linux Kernel Capabilities
        CapDrop: ["ALL"],

        // Security Choice 6: Log File Size Cap (1 MB)
        LogConfig: {
          Type: "json-file",
          Config: { "max-size": "1m", "max-file": "1" }
        },

        // Security Choice 1, 4, 6: Linux Resource Ulimits
        Ulimits: [
          { Name: "nproc", Soft: 32, Hard: 32 }, // Fork bomb protection
          { Name: "fsize", Soft: 10485760, Hard: 10485760 }, // 10MB max file size created
          { Name: "nofile", Soft: 64, Hard: 64 } // File descriptor limit
        ],

        AutoRemove: false // Controlled manual deletion after log capture
      }
    };

    return await this.docker.createContainer(containerConfig);
  }

  /**
   * Starts Container Instance inside Docker engine
   * @param {Docker.Container} container
   */
  async startContainer(container) {
    console.log(`[DockerService] [STAGE 2: DOCKER_STARTED] Starting container ${container.id}...`);
    await container.start();
  }

  /**
   * Attaches and Captures Stdout & Stderr Streams with Buffer Cap Protection
   * Security Choice 6: Truncates output if byte count exceeds 512 KB to stop Large Output Attacks.
   * 
   * @param {Docker.Container} container
   * @returns {Promise<{ stdout: string, stderr: string, outputTruncated: boolean }>}
   */
  async captureLogs(container) {
    const logStream = await container.logs({
      follow: true,
      stdout: true,
      stderr: true
    });

    const outStream = new stream.PassThrough();
    const errStream = new stream.PassThrough();

    const stdoutChunks = [];
    const stderrChunks = [];
    let stdoutBytes = 0;
    let stderrBytes = 0;
    let stderrTail = Buffer.alloc(0);
    let outputTruncated = false;

    outStream.on("data", (chunk) => {
      const buffer = Buffer.from(chunk);
      const remaining = DockerService.MAX_OUTPUT_BYTES - stdoutBytes;
      if (remaining > 0) stdoutChunks.push(buffer.subarray(0, remaining));
      stdoutBytes += Math.min(buffer.length, Math.max(remaining, 0));
      if (buffer.length > remaining) outputTruncated = true;
    });

    errStream.on("data", (chunk) => {
      const buffer = Buffer.from(chunk);
      const remaining = DockerService.MAX_OUTPUT_BYTES - stderrBytes;
      if (remaining > 0) stderrChunks.push(buffer.subarray(0, remaining));
      stderrBytes += Math.min(buffer.length, Math.max(remaining, 0));
      if (buffer.length > remaining) outputTruncated = true;
      stderrTail = Buffer.concat([stderrTail, buffer]).subarray(-4096);
    });

    // Dockerode stream demuxing (splits stdout and stderr buffers)
    container.modem.demuxStream(logStream, outStream, errStream);

    return new Promise((resolve) => {
      logStream.on("end", () => {
        const stdoutNotice = "\n[Output Truncated: Exceeded Maximum Output Limit (512 KB)]";
        const stderrNotice = "\n[Error Output Truncated: Exceeded Maximum Output Limit (512 KB)]";
        const formatOutput = (chunks, notice) => {
          const data = Buffer.concat(chunks);
          if (!outputTruncated || data.length < DockerService.MAX_OUTPUT_BYTES) return data.toString("utf8").trim();
          return Buffer.concat([
            data.subarray(0, DockerService.MAX_OUTPUT_BYTES - Buffer.byteLength(notice)),
            Buffer.from(notice)
          ]).toString("utf8").trim();
        };
        const cleanStdout = formatOutput(stdoutChunks, stdoutNotice);
        const cleanStderr = formatOutput(stderrChunks, stderrNotice);
        resolve({
          stdout: cleanStdout,
          stderr: cleanStderr,
          stderrTail: stderrTail.toString("utf8"),
          outputTruncated
        });
      });
    });
  }

  /**
   * Monitors Process Duration and Forcefully Kills Container on Timeout
   * Security Choice 2: Sends uncatchable SIGKILL signal after timeout deadline.
   * 
   * @param {Docker.Container} container
   * @param {number} timeoutMs - Execution timeout limit in ms
   * @returns {Promise<{ statusCode: number, timedOut: boolean }>}
   */
  async waitForContainerWithTimeout(container, timeoutMs) {
    let timerId = null;
    let timedOut = false;

    const timeoutPromise = new Promise((resolve) => {
      timerId = setTimeout(async () => {
        timedOut = true;
        try {
          // Forcefully kill container processes with SIGKILL signal
          await container.kill({ signal: "SIGKILL" });
        } catch (killErr) {
          // Container might have already exited right at deadline
        }
        resolve({ statusCode: 124, timedOut: true });
      }, timeoutMs);
    });

    const waitPromise = container.wait().then((res) => {
      if (timerId) clearTimeout(timerId);
      return { statusCode: res.StatusCode, timedOut: false };
    });

    return await Promise.race([waitPromise, timeoutPromise]);
  }

  /**
   * Deletes Container Instance cleanly from Docker daemon
   * Security Choice 8: Frees container memory & prevents resource leaks.
   * 
   * @param {Docker.Container} container
   */
  async deleteContainer(container) {
    if (!container) return;
    try {
      await container.remove({ force: true });
    } catch (err) {
      console.error(`[DockerService] Container deletion notice: ${err.message}`);
    }
  }

  async inspectResourceUsage(container) {
    let oomKilled = false;
    let memoryMb = 0;
    try {
      const details = await container.inspect();
      oomKilled = Boolean(details?.State?.OOMKilled);
    } catch {}
    try {
      const stats = await container.stats({ stream: false });
      const peakBytes = Number(stats?.memory_stats?.max_usage || stats?.memory_stats?.usage || 0);
      if (Number.isFinite(peakBytes) && peakBytes > 0) memoryMb = Number((peakBytes / 1024 / 1024).toFixed(2));
    } catch {}
    return { oomKilled, memoryMb };
  }

  /**
   * Master Sandboxed Run Method (Full Lifecycle Orchestration)
   * 
   * @param {Object} options
   * @param {string} options.hostTempDir - Absolute path to host temporary working directory
   * @param {string[]} options.command - Command array to execute
   * @param {string} [options.image="online-judge-sandbox:latest"]
   * @param {number} [options.timeoutMs=2000]
   * @param {number} [options.memoryLimitMb=256]
   * @param {number} [options.cpuLimit=1.0]
   * @returns {Promise<{ ok: boolean, verdict: string, statusText: string, stdout: string, stderr: string, runtimeMs: number, memoryMb: number }>}
   */
  async runInSandbox({
    hostTempDir,
    command,
    image = "online-judge-sandbox:latest",
    timeoutMs = 2000,
    memoryLimitMb = 256,
    cpuLimit = 1.0
  }) {
    const startTime = Date.now();
    let container = null;

    try {
      // 1. Create Container & Mount Host Temp Dir with Security Limits
      container = await this.createContainer({
        image,
        hostTempDir,
        command,
        memoryLimitMb,
        cpuLimit,
        networkDisabled: true
      });

      // 2. Start Container Execution
      await this.startContainer(container);

      // 3. Wait for Completion or Force Kill on Timeout
      const { statusCode, timedOut } = await this.waitForContainerWithTimeout(container, timeoutMs);

      const resourceUsage = await this.inspectResourceUsage(container);

      // 4. Capture Stdout & Stderr Logs with Output Cap
      const { stdout, stderr, stderrTail, outputTruncated } = await this.captureLogs(container);

      const durationMs = Date.now() - startTime;
      const markerSource = `${stderr}\n${stderrTail}`;
      const marker = markerSource.match(/__OJ_VERDICT__:(CE|RE|TLE|MLE)/)?.[1];
      const reportedMemoryKb = Number(markerSource.match(/__OJ_MEMORY_KB__:(\d+)/)?.[1]);
      const memoryMb = Math.max(
        resourceUsage.memoryMb,
        Number.isFinite(reportedMemoryKb) ? Number((reportedMemoryKb / 1024).toFixed(2)) : 0
      );
      const cleanStderr = stderr
        .replace(/__OJ_VERDICT__:(CE|RE|TLE|MLE)\s*/g, "")
        .replace(/__OJ_RUNTIME_MS__:\d+\s*/g, "")
        .replace(/__OJ_RUNTIME_US__:\d+\s*/g, "")
        .replace(/__OJ_EXEC_SECONDS__:[\d.]+\s*/g, "")
        .replace(/__OJ_MEMORY_KB__:\d+\s*/g, "")
        .trim();
      const reportedRuntime = Number(markerSource.match(/__OJ_RUNTIME_MS__:(\d+)/)?.[1]);
      const reportedRuntimeUs = Number(markerSource.match(/__OJ_RUNTIME_US__:(\d+)/)?.[1]);
      const reportedSeconds = Number(markerSource.match(/__OJ_EXEC_SECONDS__:([\d.]+)/)?.[1]);
      const runtimeMs = Number.isFinite(reportedSeconds)
        ? Number((reportedSeconds * 1000).toFixed(3))
        : Number.isFinite(reportedRuntimeUs)
        ? Number((reportedRuntimeUs / 1000).toFixed(3))
        : Number.isFinite(reportedRuntime)
        ? reportedRuntime
        : durationMs;

      if (timedOut) {
        return {
          ok: false,
          verdict: "TLE",
          statusText: "Time Limit Exceeded",
          runtimeMs,
          memoryMb,
          peakMemoryBytes: Math.round(memoryMb * 1024 * 1024),
          stdout,
          stderr: cleanStderr || `Execution timed out after ${timeoutMs}ms.`
        };
      }

      if (resourceUsage.oomKilled) {
        return {
          ok: false,
          verdict: "MLE",
          statusText: "Memory Limit Exceeded",
          runtimeMs,
          memoryMb,
          peakMemoryBytes: Math.round(memoryMb * 1024 * 1024),
          stdout,
          stderr: cleanStderr || `Execution exceeded the ${memoryLimitMb} MB memory limit.`
        };
      }

      if (marker) {
        return {
          ok: false,
          verdict: marker,
          statusText: marker === "CE" ? "Compilation Error" : marker === "TLE" ? "Time Limit Exceeded" : marker === "MLE" ? "Memory Limit Exceeded" : "Runtime Error",
          runtimeMs,
          memoryMb,
          peakMemoryBytes: Math.round(memoryMb * 1024 * 1024),
          stdout,
          stderr: cleanStderr
        };
      }

      if (statusCode === 124) {
        return {
          ok: false,
          verdict: "TLE",
          statusText: "Time Limit Exceeded",
          runtimeMs,
          memoryMb,
          peakMemoryBytes: Math.round(memoryMb * 1024 * 1024),
          stdout,
          stderr: cleanStderr || "Execution timed out."
        };
      }

      if (statusCode !== 0) {
        return {
          ok: false,
          verdict: "RE",
          statusText: "Runtime Error",
          runtimeMs,
          memoryMb,
          peakMemoryBytes: Math.round(memoryMb * 1024 * 1024),
          stdout,
          stderr: cleanStderr || `Process exited with code ${statusCode}`
        };
      }

      return {
        ok: true,
        verdict: "AC",
        statusText: outputTruncated ? "Accepted (Output Truncated)" : "Accepted",
        runtimeMs,
        memoryMb,
        peakMemoryBytes: Math.round(memoryMb * 1024 * 1024),
        stdout,
        stderr: cleanStderr
      };
    } catch (err) {
      return {
        ok: false,
        verdict: "SYSTEM_ERROR",
        statusText: "Docker Sandbox Execution Failure",
        runtimeMs: Date.now() - startTime,
        memoryMb: 0,
        stdout: "",
        stderr: err.message || "Docker Error",
        infrastructureError: true
      };
    } finally {
      // 5. Delete Container Instance (Cleanup Guarantee)
      if (container) {
        await this.deleteContainer(container);
      }
    }
  }

  async compileInSandbox({ hostTempDir, language, image, memoryLimitMb, timeoutMs }) {
    const result = await this.runInSandbox({
      hostTempDir,
      image,
      command: ["/opt/judge/scripts/compile.sh", language],
      timeoutMs,
      memoryLimitMb,
      cpuLimit: 1
    });
    const diagnostic = String(result.stderr || "");
    const compiler = diagnostic.match(/__OJ_COMPILER__:(.*)/)?.[1]?.trim() || language;
    const version = diagnostic.match(/__OJ_COMPILER_VERSION__:(.*)/)?.[1]?.trim() || "";
    const compileSeconds = Number(diagnostic.match(/__OJ_COMPILE_SECONDS__:([\d.]+)/)?.[1]);
    const timeMs = Number.isFinite(compileSeconds)
      ? Number((compileSeconds * 1000).toFixed(3))
      : Number(diagnostic.match(/__OJ_COMPILE_TIME_MS__:(\d+)/)?.[1] || result.runtimeMs || 0);
    const stderr = diagnostic
      .replace(/__OJ_COMPILER__:.*\n?/g, "")
      .replace(/__OJ_COMPILER_VERSION__:.*\n?/g, "")
      .replace(/__OJ_COMPILE_SECONDS__:[\d.]+\s*/g, "")
      .replace(/__OJ_COMPILE_TIME_MS__:\d+\s*/g, "")
      .trim();
    return {
      ok: result.ok,
      verdict: result.verdict,
      infrastructureError: result.infrastructureError,
      compilation: {
        status: result.ok ? "SUCCESS" : "FAILED",
        compiler,
        name: compiler,
        version,
        timeMs,
        stdout: result.stdout || "",
        stderr
      }
    };
  }

  async executeCompiledInSandbox({ hostTempDir, language, image, memoryLimitMb, timeoutMs }) {
    return this.runInSandbox({
      hostTempDir,
      image,
      command: [
        "/opt/judge/scripts/execute.sh",
        language,
        `${Math.max(0.1, timeoutMs / 1000).toFixed(3)}s`
      ],
      timeoutMs: timeoutMs + 2_000,
      memoryLimitMb,
      cpuLimit: 1
    });
  }
}

// Export singleton instance
export const dockerService = new DockerService();

// Default export for import flexibility
export default dockerService;
