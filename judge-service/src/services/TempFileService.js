import fs from "fs/promises";
import path from "path";
import os from "os";
import crypto from "crypto";

/**
 * TempFileService - Secure Temporary Directory & File Management Service
 * 
 * Comprehensive Security Protections:
 * 1. UUID v4 unique directory generation (prevents folder collisions)
 * 2. Directory Traversal Attack Prevention (strict filename sanitization & path boundary checks)
 * 3. Symlink Attack Prevention (lstat checks & realpath boundary verification)
 * 4. Temporary File Leak Prevention (try...finally deletion guarantee & background orphan sweep)
 */
export class TempFileService {
  /**
   * Sanitizes filenames and validates that target path stays strictly inside base directory.
   * Prevents Directory Traversal Attacks (e.g. "../../../etc/passwd", "..\\..\\Windows")
   * 
   * Security Choice 7 & 8: Boundary Verification & Traversal Shield
   * 
   * @param {string} baseDir - Base temporary directory path
   * @param {string} filename - Target filename to validate
   * @returns {string} Absolute safe file path
   */
  sanitizeAndResolvePath(baseDir, filename) {
    if (!baseDir || typeof baseDir !== "string") {
      throw new Error("Invalid base directory path.");
    }
    if (!filename || typeof filename !== "string") {
      throw new Error("Invalid filename parameter.");
    }

    const rawFilename = filename.trim();

    // 1. Strict Traversal Attack Detection: Reject any filename containing path separators, '..' or null bytes
    if (
      rawFilename.includes("/") ||
      rawFilename.includes("\\") ||
      rawFilename.includes("..") ||
      rawFilename.includes("\0")
    ) {
      throw new Error(`Directory traversal attack blocked! Illegal filename: '${filename}'`);
    }

    // 2. Strip dangerous characters and obtain basename
    const sanitizedFilename = path.basename(rawFilename);

    if (!sanitizedFilename || sanitizedFilename === "." || sanitizedFilename === "..") {
      throw new Error(`Directory traversal attack blocked! Invalid filename: '${filename}'`);
    }

    // 3. Resolve absolute path
    const resolvedBase = path.resolve(baseDir);
    const resolvedTarget = path.resolve(resolvedBase, sanitizedFilename);

    // 4. Boundary Verification: Target path must start with base directory path
    if (!resolvedTarget.startsWith(resolvedBase)) {
      throw new Error(`Directory traversal attack blocked! Target path '${resolvedTarget}' attempts to escape base dir '${resolvedBase}'.`);
    }

    return resolvedTarget;
  }

  /**
   * Symlink Attack Prevention Check
   * Security Choice 7: Verifies that target file is not a symbolic link pointing outside sandbox
   * 
   * @param {string} filePath
   * @param {string} baseDir
   */
  async verifyNoSymlinkAttack(filePath, baseDir) {
    try {
      const stats = await fs.lstat(filePath);
      if (stats.isSymbolicLink()) {
        const realTargetPath = await fs.realpath(filePath);
        const realBasePath = await fs.realpath(baseDir);

        if (!realTargetPath.startsWith(realBasePath)) {
          throw new Error(`Symlink attack blocked! Link '${filePath}' resolves to out-of-bounds path '${realTargetPath}'`);
        }
      }
    } catch (err) {
      if (err.code === "ENOENT") return; // File does not exist yet (normal)
      throw err;
    }
  }

  /**
   * Function 1: createTempDirectory()
   * Security Choice 8: Generates a unique UUID v4 directory name under OS temp folder (mode 0o700)
   * 
   * @returns {Promise<string>} Absolute path to created UUID temporary directory
   */
  async createTempDirectory() {
    const uuid = crypto.randomUUID();
    const tempDirPath = path.join(os.tmpdir(), `oj-sandbox-${uuid}`);

    await fs.mkdir(tempDirPath, { recursive: true, mode: 0o700 });
    return tempDirPath;
  }

  /**
   * Function 2: writeSourceCode(tempDir, filename, code)
   * Writes source code content securely inside temp directory
   * 
   * @param {string} tempDir
   * @param {string} filename
   * @param {string} code
   * @returns {Promise<string>} Absolute path to saved file
   */
  async writeSourceCode(tempDir, filename, code = "") {
    const safeFilePath = this.sanitizeAndResolvePath(tempDir, filename);
    await this.verifyNoSymlinkAttack(safeFilePath, tempDir);
    await fs.writeFile(safeFilePath, code || "", "utf8");
    return safeFilePath;
  }

  /**
   * Function 3: writeInput(tempDir, inputData)
   * Writes STDIN input content securely to "input.txt"
   * 
   * @param {string} tempDir
   * @param {string} inputData
   * @returns {Promise<string>}
   */
  async writeInput(tempDir, inputData = "") {
    const safeFilePath = this.sanitizeAndResolvePath(tempDir, "input.txt");
    await this.verifyNoSymlinkAttack(safeFilePath, tempDir);
    await fs.writeFile(safeFilePath, inputData || "", "utf8");
    return safeFilePath;
  }

  /**
   * Function 4: writeExpectedOutput(tempDir, expectedOutputData)
   * Writes expected output content securely to "expected_output.txt"
   * 
   * @param {string} tempDir
   * @param {string} expectedOutputData
   * @returns {Promise<string>}
   */
  async writeExpectedOutput(tempDir, expectedOutputData = "") {
    const safeFilePath = this.sanitizeAndResolvePath(tempDir, "expected_output.txt");
    await this.verifyNoSymlinkAttack(safeFilePath, tempDir);
    await fs.writeFile(safeFilePath, expectedOutputData || "", "utf8");
    return safeFilePath;
  }

  /**
   * Function 5: cleanup(tempDir)
   * Security Choice 8: Automatically & safely deletes temporary directory and all contained files
   * 
   * @param {string} tempDir
   * @returns {Promise<boolean>}
   */
  async cleanup(tempDir) {
    if (!tempDir || typeof tempDir !== "string") return false;

    try {
      // Safety check: ensure tempDir contains 'oj-sandbox-' to prevent accidental root deletes
      const normalizedPath = path.resolve(tempDir);
      if (!normalizedPath.includes("oj-sandbox-")) {
        console.warn(`[TempFileService] Refusing to delete path without 'oj-sandbox-' marker: '${tempDir}'`);
        return false;
      }

      await fs.rm(normalizedPath, { recursive: true, force: true });
      return true;
    } catch (err) {
      console.error(`[TempFileService] Directory cleanup notice for '${tempDir}': ${err.message}`);
      return false;
    }
  }

  /**
   * Security Choice 8: Sweeps OS temporary folder and deletes orphan oj-sandbox- directories older than maxAgeMs
   * Prevents Temporary File Leaks due to unhandled host crashes or unkilled processes.
   * 
   * @param {number} [maxAgeMs=300000] - Max age in ms (default: 5 minutes)
   * @returns {Promise<number>} Number of orphan directories swept
   */
  async sweepOrphanDirectories(maxAgeMs = 300000) {
    let sweptCount = 0;
    const sysTmp = os.tmpdir();
    const now = Date.now();

    try {
      const files = await fs.readdir(sysTmp);
      for (const file of files) {
        if (file.startsWith("oj-sandbox-")) {
          const dirPath = path.join(sysTmp, file);
          try {
            const stats = await fs.stat(dirPath);
            const ageMs = now - stats.mtimeMs;
            if (ageMs > maxAgeMs) {
              await fs.rm(dirPath, { recursive: true, force: true });
              sweptCount++;
            }
          } catch {}
        }
      }
    } catch (err) {
      console.warn(`[TempFileService] Orphan sweep notice: ${err.message}`);
    }

    return sweptCount;
  }
}

// Export singleton instance
export const tempFileService = new TempFileService();

// Default export for import flexibility
export default tempFileService;
