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
      command: ["python3", "/sandbox/Main.py"],
      memoryLimitMb: 256,
      cpuLimit: 1.0,
      networkDisabled: true
    });

    expect(createdConfig).toBeDefined();
    expect(createdConfig.User).toBe("1000:1000");
    expect(createdConfig.HostConfig.PidsLimit).toBe(32);
    expect(createdConfig.HostConfig.NetworkMode).toBe("none");
    expect(createdConfig.HostConfig.ReadonlyRootfs).toBe(true);
    expect(createdConfig.HostConfig.SecurityOpt).toEqual(["no-new-privileges:true"]);
    expect(createdConfig.HostConfig.CapDrop).toEqual(["ALL"]);
    expect(createdConfig.HostConfig.Tmpfs["/tmp"]).toBe("rw,noexec,nosuid,nodev,size=64m");
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
});
