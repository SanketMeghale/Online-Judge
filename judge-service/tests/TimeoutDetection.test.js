import { dockerService } from "../src/services/DockerService.js";

describe("Timeout Detection & Process Kill Unit Tests", () => {
  test("1. DockerService.waitForContainerWithTimeout kills container process with SIGKILL on timeout", async () => {
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

  test("2. DockerService.waitForContainerWithTimeout returns statusCode 0 when process completes before timeout", async () => {
    const mockContainer = {
      kill: async () => {},
      wait: async () => ({ StatusCode: 0 })
    };

    const res = await dockerService.waitForContainerWithTimeout(mockContainer, 2000);

    expect(res.timedOut).toBe(false);
    expect(res.statusCode).toBe(0);
  });
});
