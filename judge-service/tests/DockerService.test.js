import { DockerService, dockerService } from "../src/services/DockerService.js";

describe("DockerService Hardened Security & Execution Unit Tests", () => {
  let service;

  beforeEach(() => {
    service = new DockerService();
  });

  test("1. Configures container with full security options (PidsLimit, NetworkMode: none, ReadonlyRootfs, CapDrop)", async () => {
    let createdConfig = null;

    service.docker = {
      createContainer: async (config) => {
        createdConfig = config;
        return { start: async () => {}, id: "test-container-id" };
      }
    };

    await service.createContainer({
      image: "online-judge-sandbox:latest",
      hostTempDir: "C:/tmp/oj-sandbox-test",
      command: ["/opt/judge/scripts/run.sh", "python", "2"],
      memoryLimitMb: 256,
      cpuLimit: 1.0,
      networkDisabled: true
    });

    expect(createdConfig).toBeDefined();
    expect(createdConfig.User).toBe("10001:10001");
    expect(createdConfig.WorkingDir).toBe("/workspace");
    expect(createdConfig.HostConfig.PidsLimit).toBe(32);
    expect(createdConfig.HostConfig.NetworkMode).toBe("none");
    expect(createdConfig.HostConfig.ReadonlyRootfs).toBe(true);
    expect(createdConfig.HostConfig.SecurityOpt).toEqual(["no-new-privileges:true"]);
    expect(createdConfig.HostConfig.CapDrop).toEqual(["ALL"]);
    expect(createdConfig.HostConfig.Tmpfs["/tmp"]).toBe("rw,noexec,nosuid,nodev,size=64m");
    expect(createdConfig.HostConfig.Privileged).not.toBe(true);
    expect(createdConfig.HostConfig.Binds.join(" ")).not.toContain("docker.sock");
    expect(createdConfig.Env).toBeUndefined();
  });

  test("2. Captures stdout and stderr correctly from container modem demuxStream", async () => {
    const mockContainer = {
      logs: async () => {
        const stream = new (await import("stream")).PassThrough();
        setTimeout(() => {
          stream.write("Output line 1\n");
          stream.end();
        }, 10);
        return stream;
      },
      modem: {
        demuxStream: (src, stdout, stderr) => {
          src.pipe(stdout);
        }
      }
    };

    const logs = await service.captureLogs(mockContainer);
    expect(logs.stdout).toBe("Output line 1");
    expect(logs.outputTruncated).toBe(false);
  });

  test("3. Truncates stdout at MAX_OUTPUT_BYTES (512 KB) to prevent Large Output Attacks", async () => {
    const mockContainer = {
      logs: async () => {
        const stream = new (await import("stream")).PassThrough();
        setTimeout(() => {
          const bigChunk = Buffer.alloc(600 * 1024, "X");
          stream.write(bigChunk);
          stream.end();
        }, 10);
        return stream;
      },
      modem: {
        demuxStream: (src, stdout, stderr) => {
          src.pipe(stdout);
        }
      }
    };

    const logs = await service.captureLogs(mockContainer);
    expect(logs.outputTruncated).toBe(true);
    expect(logs.stdout).toContain("[Output Truncated: Exceeded Maximum Output Limit (512 KB)]");
    expect(Buffer.byteLength(logs.stdout)).toBeLessThanOrEqual(DockerService.MAX_OUTPUT_BYTES);
  });

  test("4. Forcefully kills container process with SIGKILL on execution timeout", async () => {
    let killSignalSent = null;

    const mockContainer = {
      kill: async ({ signal }) => {
        killSignalSent = signal;
      },
      wait: () => new Promise(() => {}) // Never finishes
    };

    const res = await service.waitForContainerWithTimeout(mockContainer, 50);
    expect(res.timedOut).toBe(true);
    expect(res.statusCode).toBe(124);
    expect(killSignalSent).toBe("SIGKILL");
  });

  test("5. Safely handles container deletion cleanup", async () => {
    let deleted = false;
    const mockContainer = {
      remove: async ({ force }) => {
        deleted = force;
      }
    };

    await service.deleteContainer(mockContainer);
    expect(deleted).toBe(true);
  });

  test("6. Detects container OOM kills and reports measured memory", async () => {
    const usage = await service.inspectResourceUsage({
      inspect: async () => ({ State: { OOMKilled: true } }),
      stats: async () => ({ memory_stats: { max_usage: 64 * 1024 * 1024 } })
    });
    expect(usage).toEqual({ oomKilled: true, memoryMb: 64 });
  });
});
