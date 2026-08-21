import { languageRegistry } from "../config/languages.js";
import { SandboxExecutor } from "./SandboxExecutor.js";

/**
 * ExecutorFactory - Production SOLID Compliant Factory
 * Dynamically resolves, instantiates, and caches language execution strategy instances.
 * 
 * - Single Responsibility Principle (SRP): Factory is strictly responsible for executor resolution & creation.
 * - Open/Closed Principle (OCP): New languages can be registered dynamically via `register()` without altering factory code.
 * - Liskov Substitution Principle (LSP): All returned executors inherit from `BaseExecutor`.
 * - Dependency Inversion Principle (DIP): Callers depend on abstract `BaseExecutor` interface, not concrete implementations.
 */
export class ExecutorFactory {
  constructor() {
    this.registry = new Map();

    // Default registered executor classes
    this.register("python", SandboxExecutor);
    this.register("javascript", SandboxExecutor);
    this.register("c", SandboxExecutor);
    this.register("cpp", SandboxExecutor);
    this.register("java", SandboxExecutor);
  }

  /**
   * Registers a new Executor class dynamically (OCP Compliance)
   * @param {string} languageId - Unique language key ('rust', 'go', 'python')
   * @param {typeof import("./BaseExecutor.js").BaseExecutor} ExecutorClass
   */
  register(languageId, ExecutorClass) {
    if (!languageId || typeof languageId !== "string") {
      throw new Error("Invalid languageId: must be a non-empty string.");
    }
    if (typeof ExecutorClass !== "function") {
      throw new Error("Invalid ExecutorClass: must be a constructor function/class.");
    }
    const cleanId = languageId.toLowerCase().trim();
    this.registry.set(cleanId, ExecutorClass);
  }

  /**
   * Factory Method: Resolves and instantiates the appropriate Executor for a given language
   * @param {string} languageKey - Language ID or alias ('py', 'python', 'c++', 'cpp', 'java')
   * @returns {import("./BaseExecutor.js").BaseExecutor} Concrete Executor Instance
   */
  getExecutor(languageKey) {
    if (!languageKey || typeof languageKey !== "string") {
      throw new Error("Language key is required to create an Executor.");
    }

    // 1. Resolve Language Config from LanguageRegistry
    const langConfig = languageRegistry.get(languageKey);
    if (!langConfig) {
      throw new Error(`Unsupported programming language: '${languageKey}'.`);
    }

    // 2. Resolve Executor Class from Factory Registry
    const ExecutorClass = this.registry.get(langConfig.id);
    if (!ExecutorClass) {
      throw new Error(`No Executor registered for language ID '${langConfig.id}'.`);
    }

    // 3. Instantiate and return Concrete Executor (DIP & LSP compliant)
    return new ExecutorClass(langConfig);
  }

  /**
   * Lists all currently registered language IDs
   * @returns {string[]}
   */
  getRegisteredLanguages() {
    return Array.from(this.registry.keys());
  }
}

// Export singleton factory instance
export const executorFactory = new ExecutorFactory();

// Default export for module import flexibility
export default executorFactory;
