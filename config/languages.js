/**
 * Clean Object-Oriented Language Configuration Module
 * Defines execution contracts, compilers, run commands, limits, and Docker images
 * for Python, C, C++, and Java.
 */

export class LanguageConfig {
  /**
   * @param {Object} options
   * @param {string} options.id - Unique language identifier ('python', 'c', 'cpp', 'java')
   * @param {string} options.name - Human readable display name ('Python 3', 'C17', etc.)
   * @param {string} options.extension - File extension ('.py', '.c', '.cpp', '.java')
   * @param {string} options.sourceFileName - Source filename ('solution.py', 'Solution.java')
   * @param {string|null} options.compiledBinaryName - Output binary name ('solution', 'Solution.class', null)
   * @param {string} options.dockerImage - Docker sandbox image name
   * @param {number} options.memoryLimitMb - Memory limit in Megabytes (default: 256MB)
   * @param {number} options.timeLimitMs - Time limit in Milliseconds (default: 2000ms)
   */
  constructor({
    id,
    name,
    extension,
    sourceFileName,
    compiledBinaryName = null,
    dockerImage = "online-judge-sandbox:latest",
    memoryLimitMb = 256,
    timeLimitMs = 2000
  }) {
    this.id = id.toLowerCase().trim();
    this.name = name;
    this.extension = extension;
    this.sourceFileName = sourceFileName;
    this.compiledBinaryName = compiledBinaryName;
    this.dockerImage = dockerImage;
    this.memoryLimitMb = memoryLimitMb;
    this.timeLimitMs = timeLimitMs;
    this.memoryLimit = `${memoryLimitMb}m`;
    this.timeLimit = `${Math.ceil(timeLimitMs / 1000)}s`;
  }

  /**
   * Generates compilation command (Override in subclasses)
   * @param {string} [sourcePath]
   * @param {string} [outputPath]
   * @returns {string|null} Compilation shell command string or null if interpreted
   */
  getCompileCommand(sourcePath = this.sourceFileName, outputPath = this.compiledBinaryName) {
    return null;
  }

  /**
   * Generates runtime execution command (Override in subclasses)
   * @param {string} [sourceOrBinaryPath]
   * @returns {string} Execution shell command string
   */
  getRunCommand(sourceOrBinaryPath = this.compiledBinaryName || this.sourceFileName) {
    throw new Error(`getRunCommand() not implemented for language ${this.id}`);
  }
}

/**
 * Python 3 Language Configuration Class
 */
export class PythonConfig extends LanguageConfig {
  constructor(overrides = {}) {
    super({
      id: "python",
      name: "Python 3.12",
      extension: ".py",
      sourceFileName: "solution.py",
      compiledBinaryName: null,
      dockerImage: "online-judge-sandbox:latest",
      memoryLimitMb: 256,
      timeLimitMs: 3000,
      ...overrides
    });
  }

  getCompileCommand() {
    // Python is an interpreted language; no compilation step required
    return null;
  }

  getRunCommand(sourcePath = this.sourceFileName) {
    return `python3 ${sourcePath}`;
  }
}

export class JavaScriptConfig extends LanguageConfig {
  constructor(overrides = {}) {
    super({
      id: "javascript",
      name: "JavaScript (Node.js)",
      extension: ".js",
      sourceFileName: "solution.js",
      compiledBinaryName: null,
      dockerImage: "online-judge-sandbox:latest",
      memoryLimitMb: 256,
      timeLimitMs: 3000,
      ...overrides
    });
  }

  getRunCommand(sourcePath = this.sourceFileName) {
    return `node ${sourcePath}`;
  }
}

/**
 * C Language Configuration Class (GCC C17)
 */
export class CConfig extends LanguageConfig {
  constructor(overrides = {}) {
    super({
      id: "c",
      name: "C (GCC 13 / C17)",
      extension: ".c",
      sourceFileName: "solution.c",
      compiledBinaryName: "solution",
      dockerImage: "online-judge-sandbox:latest",
      memoryLimitMb: 256,
      timeLimitMs: 2000,
      ...overrides
    });
  }

  getCompileCommand(sourcePath = this.sourceFileName, outputPath = this.compiledBinaryName) {
    return `gcc -O2 -Wall -std=c17 ${sourcePath} -o ${outputPath} -lm`;
  }

  getRunCommand(outputPath = this.compiledBinaryName) {
    return `./${outputPath}`;
  }
}

/**
 * C++ Language Configuration Class (G++ C++20)
 */
export class CppConfig extends LanguageConfig {
  constructor(overrides = {}) {
    super({
      id: "cpp",
      name: "C++ (G++ 13 / C++20)",
      extension: ".cpp",
      sourceFileName: "solution.cpp",
      compiledBinaryName: "solution",
      dockerImage: "online-judge-sandbox:latest",
      memoryLimitMb: 256,
      timeLimitMs: 2000,
      ...overrides
    });
  }

  getCompileCommand(sourcePath = this.sourceFileName, outputPath = this.compiledBinaryName) {
    return `g++ -O2 -Wall -std=c++20 ${sourcePath} -o ${outputPath} -lm`;
  }

  getRunCommand(outputPath = this.compiledBinaryName) {
    return `./${outputPath}`;
  }
}

/**
 * Java Language Configuration Class (OpenJDK 21)
 */
export class JavaConfig extends LanguageConfig {
  constructor(overrides = {}) {
    super({
      id: "java",
      name: "Java (OpenJDK 21)",
      extension: ".java",
      sourceFileName: "Solution.java",
      compiledBinaryName: "Solution.class",
      dockerImage: "online-judge-sandbox:latest",
      memoryLimitMb: 256,
      timeLimitMs: 3000,
      ...overrides
    });
  }

  getCompileCommand(sourcePath = this.sourceFileName) {
    return `javac ${sourcePath}`;
  }

  getRunCommand() {
    return `java -Xmx128m -cp . Solution`;
  }
}

/**
 * Centralized Language Registry (Manager Pattern)
 */
export class LanguageRegistry {
  constructor() {
    this.languages = new Map();
    this.aliasMap = new Map();

    // Register supported language instances
    this.register(new PythonConfig());
    this.register(new JavaScriptConfig());
    this.register(new CConfig());
    this.register(new CppConfig());
    this.register(new JavaConfig());

    // Register language alias lookups
    this.aliasMap.set("py", "python");
    this.aliasMap.set("python3", "python");
    this.aliasMap.set("js", "javascript");
    this.aliasMap.set("c++", "cpp");
  }

  register(config) {
    if (!(config instanceof LanguageConfig)) {
      throw new Error("Invalid config: must be an instance of LanguageConfig");
    }
    this.languages.set(config.id, config);
  }

  /**
   * Resolves language configuration by ID or alias
   * @param {string} langId
   * @returns {LanguageConfig|null}
   */
  get(langId) {
    if (!langId || typeof langId !== "string") return null;
    const cleanId = langId.toLowerCase().trim();
    const resolvedId = this.aliasMap.get(cleanId) || cleanId;
    return this.languages.get(resolvedId) || null;
  }

  has(langId) {
    return this.get(langId) !== null;
  }

  getAll() {
    return Array.from(this.languages.values());
  }
}

// Export singleton instance
export const languageRegistry = new LanguageRegistry();
