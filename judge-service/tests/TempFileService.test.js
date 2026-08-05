import { TempFileService, tempFileService } from "../src/services/TempFileService.js";
import fs from "fs/promises";
import path from "path";

describe("TempFileService Unit Tests", () => {
  let tempService;
  let createdDirs = [];

  beforeEach(() => {
    tempService = new TempFileService();
    createdDirs = [];
  });

  afterEach(async () => {
    for (const dir of createdDirs) {
      await tempService.cleanup(dir);
    }
  });

  test("1. Creates isolated UUID v4 directory with oj-sandbox- prefix", async () => {
    const dir = await tempService.createTempDirectory();
    createdDirs.push(dir);

    expect(dir).toContain("oj-sandbox-");
    const stat = await fs.stat(dir);
    expect(stat.isDirectory()).toBe(true);
  });

  test("2. Writes source code, input stdin, and expected output files safely", async () => {
    const dir = await tempService.createTempDirectory();
    createdDirs.push(dir);

    const sourceFile = await tempService.writeSourceCode(dir, "Main.py", "print('hello')");
    const inputFile = await tempService.writeInput(dir, "1 2 3");
    const outputFile = await tempService.writeExpectedOutput(dir, "6");

    expect(await fs.readFile(sourceFile, "utf8")).toBe("print('hello')");
    expect(await fs.readFile(inputFile, "utf8")).toBe("1 2 3");
    expect(await fs.readFile(outputFile, "utf8")).toBe("6");
  });

  test("3. Blocks directory traversal attacks attempting to escape base dir", () => {
    const mockBase = "C:/tmp/oj-sandbox-12345";

    expect(() => tempService.sanitizeAndResolvePath(mockBase, "../../../etc/passwd"))
      .toThrow("Directory traversal attack blocked!");

    expect(() => tempService.sanitizeAndResolvePath(mockBase, "sub/file.txt"))
      .toThrow("Directory traversal attack blocked!");
  });

  test("4. Sweeps orphan directories older than maxAgeMs", async () => {
    const swept = await tempService.sweepOrphanDirectories(1000);
    expect(typeof swept).toBe("number");
  });
});
