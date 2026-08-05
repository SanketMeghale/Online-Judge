import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import { CppExecutor } from "../src/executors/CppExecutor.js";

jest.setTimeout(20000);

describe("CppExecutor Unit Tests (C & C++)", () => {
  let executor;
  const mockConfig = { id: "cpp", name: "C++ 20", timeLimitMs: 2000, memoryLimitMb: 256 };

  beforeEach(() => {
    executor = new CppExecutor(mockConfig);
  });

  test("1. Successfully compiles and executes valid C++ code (AC)", async () => {
    const code = `#include <iostream>
using namespace std;
int main() {
    cout << "Hello C++ Sandbox" << endl;
    return 0;
}`;
    const result = await executor.execute({ code, expectedOutput: "Hello C++ Sandbox" });

    expect(result.ok).toBe(true);
    expect(result.verdict).toBe("AC");
    expect(result.statusText).toBe("Accepted");
    expect(result.stdout).toBe("Hello C++ Sandbox");
  }, 20000);

  test("2. Successfully handles C program execution", async () => {
    const code = `#include <stdio.h>
int main() {
    printf("Hello C Language\\n");
    return 0;
}`;
    const result = await executor.execute({ code, expectedOutput: "Hello C Language" });

    expect(result.ok).toBe(true);
    expect(result.verdict).toBe("AC");
    expect(result.stdout).toBe("Hello C Language");
  }, 20000);

  test("3. Detects Compilation Errors (CE) on invalid C++ syntax", async () => {
    const code = `#include <iostream>
int main() {
    cout << "Missing semicolon"
    return 0;
}`;
    const result = await executor.execute({ code });

    expect(result.ok).toBe(false);
    expect(result.verdict).toBe("CE");
    expect(result.statusText).toBe("Compilation Error");
    expect(result.stderr).toBeTruthy();
  }, 20000);

  test("4. Detects Wrong Answer (WA) when actual output mismatches expected output", async () => {
    const code = `#include <iostream>
int main() {
    std::cout << "100" << std::endl;
    return 0;
}`;
    const result = await executor.execute({ code, expectedOutput: "200" });

    expect(result.ok).toBe(false);
    expect(result.verdict).toBe("WA");
    expect(result.statusText).toBe("Wrong Answer");
  }, 20000);

  test("5. Detects Runtime Error (RE) on process non-zero exit code or crash", async () => {
    const code = `#include <iostream>
int main() {
    return 1; // Non-zero exit code
}`;
    const result = await executor.execute({ code });

    expect(result.ok).toBe(false);
    expect(result.verdict).toBe("RE");
    expect(result.statusText).toBe("Runtime Error");
  }, 20000);
});
