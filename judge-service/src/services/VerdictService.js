/**
 * VerdictService - Production Verdict Classification & Aggregation Service
 * 
 * Clean Enums:
 * - ACCEPTED (AC)
 * - WRONG_ANSWER (WA)
 * - COMPILATION_ERROR (CE)
 * - RUNTIME_ERROR (RE)
 * - MEMORY_LIMIT_EXCEEDED (MLE)
 * - TIME_LIMIT_EXCEEDED (TLE)
 * - SYSTEM_ERROR (SE)
 */

/**
 * Clean Verdict Enums Object
 */
export const VerdictEnum = Object.freeze({
  ACCEPTED: "AC",
  WRONG_ANSWER: "WA",
  COMPILATION_ERROR: "CE",
  RUNTIME_ERROR: "RE",
  MEMORY_LIMIT_EXCEEDED: "MLE",
  TIME_LIMIT_EXCEEDED: "TLE",
  SYSTEM_ERROR: "SE"
});

/**
 * Detailed Verdict Metadata Definitions
 */
export const VerdictMetadata = Object.freeze({
  [VerdictEnum.ACCEPTED]: {
    code: "AC",
    label: "Accepted",
    description: "Solution passed all testcases cleanly.",
    badgeColor: "emerald",
    priority: 10
  },
  [VerdictEnum.WRONG_ANSWER]: {
    code: "WA",
    label: "Wrong Answer",
    description: "Solution output did not match expected testcase output.",
    badgeColor: "rose",
    priority: 40
  },
  [VerdictEnum.COMPILATION_ERROR]: {
    code: "CE",
    label: "Compilation Error",
    description: "Source code failed to compile.",
    badgeColor: "amber",
    priority: 100 // Highest priority
  },
  [VerdictEnum.RUNTIME_ERROR]: {
    code: "RE",
    label: "Runtime Error",
    description: "Solution crashed or threw an unhandled exception.",
    badgeColor: "violet",
    priority: 50
  },
  [VerdictEnum.MEMORY_LIMIT_EXCEEDED]: {
    code: "MLE",
    label: "Memory Limit Exceeded",
    description: "Solution exceeded maximum memory sandbox allocation.",
    badgeColor: "orange",
    priority: 60
  },
  [VerdictEnum.TIME_LIMIT_EXCEEDED]: {
    code: "TLE",
    label: "Time Limit Exceeded",
    description: "Solution execution time exceeded the time limit.",
    badgeColor: "cyan",
    priority: 70
  },
  [VerdictEnum.SYSTEM_ERROR]: {
    code: "SE",
    label: "System Error",
    description: "Internal judge execution environment failure.",
    badgeColor: "red",
    priority: 90
  }
});

export class VerdictService {
  constructor() {
    this.Enums = VerdictEnum;
    this.Metadata = VerdictMetadata;
  }

  /**
   * Resolves verdict code string into official VerdictEnum
   * @param {string} code
   * @returns {string} Official VerdictEnum code
   */
  resolveVerdict(code = "") {
    if (!code) return VerdictEnum.SYSTEM_ERROR;
    const cleanCode = String(code).toUpperCase().trim();

    switch (cleanCode) {
      case "AC":
      case "ACCEPTED":
        return VerdictEnum.ACCEPTED;
      case "WA":
      case "WRONG ANSWER":
      case "WRONG_ANSWER":
        return VerdictEnum.WRONG_ANSWER;
      case "CE":
      case "COMPILATION ERROR":
      case "COMPILATION_ERROR":
        return VerdictEnum.COMPILATION_ERROR;
      case "RE":
      case "RUNTIME ERROR":
      case "RUNTIME_ERROR":
        return VerdictEnum.RUNTIME_ERROR;
      case "MLE":
      case "MEMORY LIMIT EXCEEDED":
      case "MEMORY_LIMIT_EXCEEDED":
        return VerdictEnum.MEMORY_LIMIT_EXCEEDED;
      case "TLE":
      case "TIME LIMIT EXCEEDED":
      case "TIME_LIMIT_EXCEEDED":
        return VerdictEnum.TIME_LIMIT_EXCEEDED;
      case "SE":
      case "SYSTEM ERROR":
      case "SYSTEM_ERROR":
        return VerdictEnum.SYSTEM_ERROR;
      default:
        return VerdictEnum.RUNTIME_ERROR;
    }
  }

  /**
   * Function 1: evaluateResult(executionResult, comparatorResult)
   * Converts raw sandbox execution results & output comparator results into a clean Verdict object
   * 
   * @param {Object} executionResult - Raw executor output object ({ ok, verdict, stderr, stdout, runtimeMs, memoryMb })
   * @param {Object} [comparatorResult] - OutputComparator output object
   * @returns {{ verdict: string, statusText: string, description: string, badgeColor: string, runtimeMs: number, memoryMb: number, firstFailedLine?: Object }}
   */
  evaluateResult(executionResult, comparatorResult) {
    if (!executionResult) {
      const seMeta = VerdictMetadata[VerdictEnum.SYSTEM_ERROR];
      return {
        verdict: seMeta.code,
        statusText: seMeta.label,
        description: seMeta.description,
        badgeColor: seMeta.badgeColor,
        runtimeMs: 0,
        memoryMb: 0
      };
    }

    const rawVerdict = executionResult.verdict || (executionResult.ok ? "AC" : "RE");
    const resolvedCode = this.resolveVerdict(rawVerdict);

    // If execution was non-AC (CE, TLE, MLE, RE, SE), return execution verdict directly
    if (resolvedCode !== VerdictEnum.ACCEPTED) {
      const meta = VerdictMetadata[resolvedCode] || VerdictMetadata[VerdictEnum.RUNTIME_ERROR];
      return {
        verdict: meta.code,
        statusText: meta.label,
        description: meta.description,
        badgeColor: meta.badgeColor,
        runtimeMs: executionResult.runtimeMs || 0,
        memoryMb: executionResult.memoryMb || 0,
        stdout: executionResult.stdout || "",
        stderr: executionResult.stderr || ""
      };
    }

    // Execution completed cleanly, evaluate against comparator if available
    let finalCode = VerdictEnum.ACCEPTED;
    let firstFailedLine = null;

    if (comparatorResult) {
      finalCode = comparatorResult.isMatch ? VerdictEnum.ACCEPTED : VerdictEnum.WRONG_ANSWER;
      firstFailedLine = comparatorResult.firstFailedLine || null;
    }

    const finalMeta = VerdictMetadata[finalCode];

    return {
      verdict: finalMeta.code,
      statusText: finalMeta.label,
      description: finalMeta.description,
      badgeColor: finalMeta.badgeColor,
      runtimeMs: executionResult.runtimeMs || 0,
      memoryMb: executionResult.memoryMb || 0,
      stdout: executionResult.stdout || "",
      stderr: executionResult.stderr || "",
      firstFailedLine
    };
  }

  /**
   * Function 2: aggregateTestcaseVerdicts(testcaseResults)
   * Aggregates multiple testcase evaluation results into a single final submission verdict
   * 
   * Priority Order:
   * 1. Compilation Error (CE)
   * 2. System Error (SE)
   * 3. First non-AC failing verdict (TLE, MLE, RE, WA)
   * 4. Accepted (AC) - Only if ALL testcases passed!
   * 
   * @param {Array<Object>} testcaseResults - Array of testcase evaluation objects
   * @returns {{ verdict: string, statusText: string, passCount: number, totalCount: number, runtimeMs: number, memoryMb: number, testcases: Array }}
   */
  aggregateTestcaseVerdicts(testcaseResults = []) {
    if (!Array.isArray(testcaseResults) || testcaseResults.length === 0) {
      const seMeta = VerdictMetadata[VerdictEnum.SYSTEM_ERROR];
      return {
        verdict: seMeta.code,
        statusText: seMeta.label,
        passCount: 0,
        totalCount: 0,
        runtimeMs: 0,
        memoryMb: 0,
        testcases: []
      };
    }

    let overallVerdictCode = VerdictEnum.ACCEPTED;
    let highestPriority = 0;
    let passCount = 0;
    let maxRuntimeMs = 0;
    let maxMemoryMb = 0;

    const evaluatedTestcases = testcaseResults.map((tc, index) => {
      const evalRes = this.evaluateResult(tc.executionResult || tc, tc.comparatorResult);
      
      const tcCode = evalRes.verdict;
      const tcMeta = VerdictMetadata[tcCode] || VerdictMetadata[VerdictEnum.RUNTIME_ERROR];

      if (tcCode === VerdictEnum.ACCEPTED) {
        passCount++;
      } else {
        // Track highest priority failure
        if (tcMeta.priority > highestPriority) {
          highestPriority = tcMeta.priority;
          overallVerdictCode = tcCode;
        }
      }

      maxRuntimeMs = Math.max(maxRuntimeMs, evalRes.runtimeMs || 0);
      maxMemoryMb = Math.max(maxMemoryMb, evalRes.memoryMb || 0);

      return {
        testcaseIndex: index + 1,
        id: tc.id || index + 1,
        verdict: evalRes.verdict,
        statusText: evalRes.statusText,
        runtimeMs: evalRes.runtimeMs,
        memoryMb: evalRes.memoryMb,
        stdout: evalRes.stdout,
        stderr: evalRes.stderr,
        firstFailedLine: evalRes.firstFailedLine || null
      };
    });

    const overallMeta = VerdictMetadata[overallVerdictCode];

    return {
      verdict: overallMeta.code,
      statusText: overallMeta.label,
      description: overallMeta.description,
      badgeColor: overallMeta.badgeColor,
      passCount,
      totalCount: testcaseResults.length,
      runtimeMs: maxRuntimeMs,
      memoryMb: maxMemoryMb,
      testcases: evaluatedTestcases
    };
  }
}

// Export singleton instance
export const verdictService = new VerdictService();

// Default export for import flexibility
export default verdictService;
