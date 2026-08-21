import { beforeEach, describe, expect, jest, test } from "@jest/globals";

const runInSandbox = jest.fn();
jest.unstable_mockModule("../src/services/DockerService.js", () => ({
  dockerService: { runInSandbox }
}));

const { SandboxExecutor } = await import("../src/executors/SandboxExecutor.js");

describe("SandboxExecutor", () => {
  beforeEach(() => runInSandbox.mockReset());

  test("requires a worker-created sandbox directory", async () => {
    const executor = new SandboxExecutor({ id: "python", timeLimitMs: 2000, memoryLimitMb: 256 });
    await expect(executor.execute({})).rejects.toThrow("working directory");
    expect(runInSandbox).not.toHaveBeenCalled();
  });

  test("delegates execution exclusively to the hardened Docker service", async () => {
    const expected = { ok: true, verdict: "AC", stdout: "42", stderr: "", runtimeMs: 12, memoryMb: 0 };
    runInSandbox.mockResolvedValue(expected);
    const executor = new SandboxExecutor({
      id: "python",
      timeLimitMs: 2000,
      memoryLimitMb: 128,
      dockerImage: "online-judge-sandbox:latest"
    });

    await expect(executor.execute({ workingDir: "/tmp/job", timeoutMs: 1500 })).resolves.toEqual(expected);
    expect(runInSandbox).toHaveBeenCalledWith(expect.objectContaining({
      hostTempDir: "/tmp/job",
      command: ["/opt/judge/scripts/run.sh", "python", "2"],
      memoryLimitMb: 128,
      timeoutMs: 11500
    }));
  });

  test("caps attacker-controlled timeout values", async () => {
    runInSandbox.mockResolvedValue({ ok: true, verdict: "AC" });
    const executor = new SandboxExecutor({ id: "cpp", timeLimitMs: 2000, memoryLimitMb: 256 });
    await executor.execute({ workingDir: "/tmp/job", timeoutMs: 999999 });
    expect(runInSandbox).toHaveBeenCalledWith(expect.objectContaining({ timeoutMs: 20000 }));
  });
});
