/**
 * OutputComparator - Production Testcase Output Comparison Service
 * 
 * Requirements:
 * 1. Ignore trailing spaces on each line (line.trimEnd())
 * 2. Ignore line ending differences (CRLF \r\n vs LF \n)
 * 3. Support Exact Comparison mode (strict character-by-character check)
 * 4. Return verdicts: "Accepted" ("AC") or "Wrong Answer" ("WA")
 * 5. Return Expected Output, Actual Output, and First Failed Line metadata
 */

export class OutputComparator {
  /**
   * Requirement 7: Standard Output Normalization Function
   * - trim()
   * - remove trailing spaces
   * - normalize CRLF/LF (\r\n -> \n)
   * - ignore final newline
   * @param {string} output
   * @returns {string} Normalized string
   */
  static normalize(output) {
    if (typeof output !== "string") return "";
    return output
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n")
      .map((line) => line.trimEnd())
      .join("\n")
      .trim();
  }

  /**
   * Normalizes output string into line array
   */
  normalizeLines(text = "", options = {}) {
    if (text === null || text === undefined) return [];
    let str = String(text);
    if (options.ignoreLineEndings !== false) {
      str = str.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    }
    let lines = str.split("\n");
    if (options.ignoreTrailingSpaces !== false) {
      lines = lines.map((line) => line.trimEnd());
    }
    if (options.ignoreEmptyTrailingLines !== false) {
      while (lines.length > 0 && lines[lines.length - 1] === "") {
        lines.pop();
      }
    }
    return lines;
  }

  /**
   * Main Comparison Function: Compares actual vs expected output
   * 
   * Requirement 9 Detailed Logs:
   * - Log expected output
   * - Log normalized output
   * - Log comparison result
   */
  compare(actualOutput = "", expectedOutput = "", options = {}) {
    const rawActual = String(actualOutput || "");
    const rawExpected = String(expectedOutput || "");

    // Exact Mode Check
    if (options.exact) {
      const isExactMatch = rawActual === rawExpected;
      return {
        verdict: isExactMatch ? "AC" : "WA",
        statusText: isExactMatch ? "Accepted" : "Wrong Answer",
        isMatch: isExactMatch,
        expectedOutput: rawExpected,
        actualOutput: rawActual,
        firstFailedLine: isExactMatch ? null : {
          lineNumber: 1,
          expected: rawExpected,
          actual: rawActual,
          reason: "Exact match failure (whitespace / byte mismatch)"
        }
      };
    }

    const normActual = OutputComparator.normalize(rawActual);
    const normExpected = OutputComparator.normalize(rawExpected);

    const normActualLines = this.normalizeLines(rawActual, options);
    const normExpectedLines = this.normalizeLines(rawExpected, options);

    const maxLines = Math.max(normActualLines.length, normExpectedLines.length);
    let firstFailedLine = null;

    for (let i = 0; i < maxLines; i++) {
      const actualLine = normActualLines[i];
      const expectedLine = normExpectedLines[i];
      const lineNumber = i + 1;

      if (expectedLine === undefined && actualLine !== undefined) {
        firstFailedLine = {
          lineNumber,
          expected: "<EOF>",
          actual: actualLine,
          reason: "Unexpected extra output line"
        };
        break;
      }

      if (actualLine === undefined && expectedLine !== undefined) {
        firstFailedLine = {
          lineNumber,
          expected: expectedLine,
          actual: "<EOF>",
          reason: "Missing expected output line"
        };
        break;
      }

      if (actualLine !== expectedLine) {
        firstFailedLine = {
          lineNumber,
          expected: expectedLine,
          actual: actualLine,
          reason: "Content mismatch"
        };
        break;
      }
    }

    const isMatch = firstFailedLine === null;

    return {
      verdict: isMatch ? "AC" : "WA",
      statusText: isMatch ? "Accepted" : "Wrong Answer",
      isMatch,
      expectedOutput: rawExpected,
      actualOutput: rawActual,
      normalizedActual: normActual,
      normalizedExpected: normExpected,
      firstFailedLine
    };
  }
}

// Export singleton instance
export const outputComparator = new OutputComparator();

// Default export for import flexibility
export default outputComparator;
