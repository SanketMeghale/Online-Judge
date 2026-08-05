import { PythonExecutor } from "../src/executors/PythonExecutor.js";

describe("PythonExecutor Unit Tests", () => {
  let executor;
  const mockConfig = { id: "python", name: "Python 3", timeLimitMs: 5000, memoryLimitMb: 256 };

  beforeEach(() => {
    executor = new PythonExecutor(mockConfig);
  });

  test("1. Successfully executes valid Python 3 code and captures stdout", async () => {
    const code = "print('Hello, Python Sandbox!')";
    const result = await executor.execute({ code, timeoutMs: 5000 });

    expect(result.ok).toBe(true);
    expect(result.verdict).toBe("AC");
    expect(result.stdout).toBe("Hello, Python Sandbox!");
    expect(result.stderr).toBe("");
    expect(result.runtimeMs).toBeGreaterThanOrEqual(0);
    expect(result.memoryMb).toBeGreaterThan(0);
  });

  test("2. Handles STDIN input correctly in Python code", async () => {
    const code = "import sys\nline = sys.stdin.read().strip()\nprint(f'Received: {line}')";
    const stdin = "Test Input String";
    const result = await executor.execute({ code, stdin, timeoutMs: 5000 });

    expect(result.ok).toBe(true);
    expect(result.verdict).toBe("AC");
    expect(result.stdout).toBe("Received: Test Input String");
  });

  test("3. Handles Python Runtime Error (RE) on uncaught exception", async () => {
    const code = "x = 10 / 0"; // ZeroDivisionError
    const result = await executor.execute({ code, timeoutMs: 5000 });

    expect(result.ok).toBe(false);
    expect(result.verdict).toBe("RE");
    expect(result.statusText).toBe("Runtime Error");
    expect(result.stderr).toContain("ZeroDivisionError");
  });

  test("4. Detects Time Limit Exceeded (TLE) when Python code execution times out", async () => {
    const code = "import time\ntime.sleep(5)"; // Exceeds 200ms timeout
    const result = await executor.execute({ code, timeoutMs: 200 });

    expect(result.ok).toBe(false);
    expect(result.verdict).toBe("TLE");
    expect(result.statusText).toContain("Time Limit Exceeded");
    expect(result.stderr).toContain("Execution timed out after 200ms.");
  });

  test("5. Handles empty code input gracefully", async () => {
    const result = await executor.execute({ code: "", timeoutMs: 5000 });
    expect(result.ok).toBe(true);
    expect(result.verdict).toBe("AC");
  });
});
