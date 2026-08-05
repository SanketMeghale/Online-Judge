import { PythonExecutor } from "../src/executors/PythonExecutor.js";
import { dockerService } from "../src/services/DockerService.js";

describe("Timeout Detection & Process Kill Unit Tests", () => {
  test("1. PythonExecutor detects process timeout and returns TLE verdict", async () => {
    const executor = new PythonExecutor({ id: "python", timeLimitMs: 100 });
    const code = "import time\ntime.sleep(2)"; // Sleep 2 seconds with 100ms timeout
    const result = await executor.execute({ code, timeoutMs: 100 });

    expect(result.ok).toBe(false);
    expect(result.verdict).toBe("TLE");
    expect(result.statusText).toContain("Time Limit Exceeded");
  });

  test("2. DockerService.waitForContainerWithTimeout kills container process with SIGKILL on timeout", async () => {
    let killCalledWith = null;

    const mockContainer = {
      kill: async ({ signal }) => {
        killCalledWith = signal;
      },
      wait: () => new Promise(() => {}) // Hangs indefinitely
    };

    const res = await dockerService.waitForContainerWithTimeout(mockContainer, 100);

    expect(res.timedOut).toBe(true);
    expect(res.statusCode).toBe(124);
    expect(killCalledWith).toBe("SIGKILL");
  });

  test("3. DockerService.waitForContainerWithTimeout returns statusCode 0 when process completes before timeout", async () => {
    const mockContainer = {
      kill: async () => {},
      wait: async () => ({ StatusCode: 0 })
    };

    const res = await dockerService.waitForContainerWithTimeout(mockContainer, 2000);

    expect(res.timedOut).toBe(false);
    expect(res.statusCode).toBe(0);
  });
});
