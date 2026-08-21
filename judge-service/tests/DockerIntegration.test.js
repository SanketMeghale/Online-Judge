import { describe, expect, jest, test } from "@jest/globals";
import { languageRegistry } from "../src/config/languages.js";
import { DockerService } from "../src/services/DockerService.js";
import { tempFileService } from "../src/services/TempFileService.js";

const describeDocker = process.env.RUN_DOCKER_INTEGRATION === "true" ? describe : describe.skip;

describeDocker("Docker sandbox integration", () => {
  jest.setTimeout(120_000);
  const dockerService = new DockerService();

  async function execute(language, source, { timeoutMs = 2_000, memoryLimitMb = 128 } = {}) {
    const config = languageRegistry.get(language);
    const tempDir = await tempFileService.createTempDirectory();
    try {
      await tempFileService.writeSourceCode(tempDir, config.sourceFileName, source);
      await tempFileService.writeInput(tempDir, "");
      const compilation = await dockerService.compileInSandbox({
        hostTempDir: tempDir,
        language: config.id,
        image: config.dockerImage,
        timeoutMs: 15_000,
        memoryLimitMb
      });
      if (!compilation.ok) {
        console.error("[DockerIntegration] Compilation failed:", JSON.stringify(compilation));
        return { ...compilation, stderr: compilation.compilation.stderr };
      }
      const execution = await dockerService.executeCompiledInSandbox({
        hostTempDir: tempDir,
        language: config.id,
        image: config.dockerImage,
        timeoutMs,
        memoryLimitMb
      });
      if (!execution.ok) {
        console.error("[DockerIntegration] Execution failed:", JSON.stringify(execution));
      }
      return { ...execution, compilation: compilation.compilation };
    } finally {
      await tempFileService.cleanup(tempDir);
    }
  }

  test.each([
    ["python", 'print("PYTHON_OK")', "PYTHON_OK"],
    ["javascript", 'console.log("JAVASCRIPT_OK")', "JAVASCRIPT_OK"],
    ["c", '#include <stdio.h>\nint main(void) { puts("C_OK"); return 0; }', "C_OK"],
    ["cpp", '#include <iostream>\nint main() { std::cout << "CPP_OK\\n"; }', "CPP_OK"],
    ["java", 'public class Main { public static void main(String[] args) { System.out.println("JAVA_OK"); } }', "JAVA_OK"]
  ])("executes %s inside the sandbox", async (language, source, output) => {
    const result = await execute(language, source);
    expect(result).toMatchObject({ ok: true, verdict: "AC" });
    expect(result.stdout).toBe(output);
    expect(result.compilation.status).toBe("SUCCESS");
    expect(result.compilation.timeMs).toBeGreaterThanOrEqual(0);
  });

  test("reports compilation errors", async () => {
    const result = await execute("cpp", "int main( { this is invalid C++ }");
    expect(result).toMatchObject({ ok: false, verdict: "CE" });
    expect(result.stderr.length).toBeGreaterThan(0);
  });

  test("terminates infinite loops", async () => {
    const result = await execute("python", "while True:\n    pass", { timeoutMs: 1_000 });
    expect(result).toMatchObject({ ok: false, verdict: "TLE" });
  });

  test("blocks outbound network access", async () => {
    const source = 'import socket\nsocket.create_connection(("example.com", 80), timeout=1)';
    const result = await execute("python", source);
    expect(result).toMatchObject({ ok: false, verdict: "RE" });
  });

  test("caps excessive output", async () => {
    const result = await execute("python", 'print("x" * (600 * 1024))');
    expect(Buffer.byteLength(result.stdout)).toBeLessThanOrEqual(DockerService.MAX_OUTPUT_BYTES);
    expect(result.stdout).toContain("[Output Truncated:");
    expect(result.statusText).toContain("Output Truncated");
  });

  test("reports memory-limit violations", async () => {
    const source = "chunks = []\nwhile True:\n    chunks.append(bytearray(8 * 1024 * 1024))";
    const result = await execute("python", source, { timeoutMs: 5_000, memoryLimitMb: 64 });
    expect(result).toMatchObject({ ok: false, verdict: "MLE" });
  });
});
