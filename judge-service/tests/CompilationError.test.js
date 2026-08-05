import { CppExecutor } from "../src/executors/CppExecutor.js";
import { JavaExecutor } from "../src/executors/JavaExecutor.js";

describe("Compilation Errors Unit Tests", () => {
  test("1. CppExecutor returns CE verdict with formatted compiler stderr", async () => {
    const cppExecutor = new CppExecutor({ id: "cpp", timeLimitMs: 2000 });
    const invalidCpp = `int main() { syntax_error }`;
    const result = await cppExecutor.execute({ code: invalidCpp });

    expect(result.ok).toBe(false);
    expect(result.verdict).toBe("CE");
    expect(result.statusText).toBe("Compilation Error");
    expect(result.runtimeMs).toBeGreaterThanOrEqual(0);
    expect(result.memoryMb).toBe(0);
  });

  test("2. JavaExecutor returns CE verdict on invalid Java source code", async () => {
    const javaExecutor = new JavaExecutor({ id: "java", timeLimitMs: 3000 });
    const invalidJava = `public class Main { invalid syntax here }`;
    const result = await javaExecutor.execute({ code: invalidJava });

    expect(result.ok).toBe(false);
    expect(result.verdict).toBe("CE");
    expect(result.statusText).toBe("Compilation Error");
    expect(result.stderr).toBeTruthy();
  });
});
