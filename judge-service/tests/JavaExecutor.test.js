import { JavaExecutor } from "../src/executors/JavaExecutor.js";

describe("JavaExecutor Unit Tests", () => {
  let executor;
  const mockConfig = { id: "java", name: "Java 21", timeLimitMs: 3000, memoryLimitMb: 256 };

  beforeEach(() => {
    executor = new JavaExecutor(mockConfig);
  });

  test("1. Pre-processes Java code to ensure class is public class Main", () => {
    const codeWithSolution = "class Solution { public static void main(String[] args) {} }";
    const prepared = executor.prepareJavaCode(codeWithSolution);
    expect(prepared).toContain("public class Main");

    const codeWithoutMain = "public static void main(String[] args) { System.out.println('hi'); }";
    const wrapped = executor.prepareJavaCode(codeWithoutMain);
    expect(wrapped).toContain("public class Main");
  });

  test("2. Successfully compiles and executes valid Java code (AC)", async () => {
    const code = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello Java Sandbox");
    }
}`;
    const result = await executor.execute({ code, expectedOutput: "Hello Java Sandbox" });

    expect(result.ok).toBe(true);
    expect(result.verdict).toBe("AC");
    expect(result.statusText).toBe("Accepted");
    expect(result.stdout).toBe("Hello Java Sandbox");
  });

  test("3. Detects Compilation Error (CE) on invalid Java syntax", async () => {
    const code = `public class Main {
    public static void main(String[] args) {
        System.out.println("Missing quotes)
    }
}`;
    const result = await executor.execute({ code });

    expect(result.ok).toBe(false);
    expect(result.verdict).toBe("CE");
    expect(result.statusText).toBe("Compilation Error");
    expect(result.stderr).toBeTruthy();
  });

  test("4. Detects Memory Limit Exceeded (MLE) on Java OutOfMemoryError", async () => {
    const code = `public class Main {
    public static void main(String[] args) {
        throw new OutOfMemoryError("java.lang.OutOfMemoryError: Java heap space");
    }
}`;
    const result = await executor.execute({ code });

    expect(result.ok).toBe(false);
    expect(result.verdict).toBe("MLE");
    expect(result.statusText).toBe("Memory Limit Exceeded");
  });
});
