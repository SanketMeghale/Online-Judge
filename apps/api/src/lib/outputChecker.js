/**
 * outputChecker.js
 * Production-grade output comparison and diff generation engine.
 *
 * Checks actual program stdout against expected testcase output.
 * Never hardcodes or fabricates results.
 */

/**
 * Normalize text by stripping carriage returns and trimming line ends.
 */
export function normalizeOutput(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
}

/**
 * Parse tokens from string for structural token comparison.
 */
function parseTokens(str) {
  const matches = str.match(/("[^"]*"|'[^']*'|-?\d+(?:\.\d+)?|true|false)/gi);
  if (!matches) return null;
  return matches.map((m) => {
    const s = m.toLowerCase().replace(/^["']|["']$/g, "");
    if (s === "true") return true;
    if (s === "false") return false;
    const num = Number(s);
    return isNaN(num) ? s : num;
  });
}

/**
 * Attempt deep JSON equivalence check.
 */
function tryJsonCompare(actual, expected) {
  try {
    const aJson = JSON.parse(actual);
    const eJson = JSON.parse(expected);

    // Deep equality for arrays or objects
    if (JSON.stringify(aJson) === JSON.stringify(eJson)) {
      return true;
    }

    // Number array element-wise float tolerance check
    if (Array.isArray(aJson) && Array.isArray(eJson) && aJson.length === eJson.length) {
      const match = aJson.every((val, i) => {
        if (typeof val === "number" && typeof eJson[i] === "number") {
          return Math.abs(val - eJson[i]) < 1e-5;
        }
        return val === eJson[i];
      });
      if (match) return true;
    }
  } catch {}
  return false;
}

/**
 * Generate human-readable difference between actual and expected output.
 */
export function generateDifference(actual, expected) {
  const normActual = normalizeOutput(actual);
  const normExpected = normalizeOutput(expected);

  if (!normActual && normExpected) {
    return `Expected '${normExpected}' but received empty output (no output produced).`;
  }

  if (normActual && !normExpected) {
    return `Expected empty output but received '${normActual}'.`;
  }

  // Single line comparison
  if (!normActual.includes("\n") && !normExpected.includes("\n")) {
    return `Expected '${normExpected}' but received '${normActual}'`;
  }

  // Multi-line comparison
  const actualLines = normActual.split("\n");
  const expectedLines = normExpected.split("\n");

  for (let i = 0; i < Math.max(actualLines.length, expectedLines.length); i++) {
    const actLine = actualLines[i] !== undefined ? actualLines[i] : "<end of output>";
    const expLine = expectedLines[i] !== undefined ? expectedLines[i] : "<end of expected>";
    if (actLine !== expLine) {
      return `Line ${i + 1} mismatch: Expected '${expLine}' but received '${actLine}'`;
    }
  }

  return `Expected '${normExpected}' but received '${normActual}'`;
}

/**
 * Compare actual output with expected output using multiple robust strategies.
 *
 * @param {string} actual - Raw stdout from user's program
 * @param {string} expected - Expected output from problem testcase
 * @returns {{ passed: boolean, expectedOutput: string, actualOutput: string, difference: string | null }}
 */
export function compareOutputs(actual, expected) {
  const normActual = normalizeOutput(actual);
  const normExpected = normalizeOutput(expected);

  // 1. Both empty -> Passed
  if (!normActual && !normExpected) {
    return {
      passed: true,
      expectedOutput: normExpected,
      actualOutput: normActual,
      difference: null
    };
  }

  // 2. One is empty while other is not -> Failed
  if (!normActual || !normExpected) {
    return {
      passed: false,
      expectedOutput: normExpected,
      actualOutput: normActual,
      difference: generateDifference(actual, expected)
    };
  }

  // 3. Exact match
  if (normActual === normExpected) {
    return {
      passed: true,
      expectedOutput: normExpected,
      actualOutput: normActual,
      difference: null
    };
  }

  // 4. Boolean / Case-insensitive match (e.g. True vs true, False vs false)
  if (normActual.toLowerCase() === normExpected.toLowerCase()) {
    return {
      passed: true,
      expectedOutput: normExpected,
      actualOutput: normActual,
      difference: null
    };
  }

  // 5. Whitespace-stripped exact match (e.g. [0, 1] vs [0,1])
  const stripActual = normActual.replace(/\s+/g, "");
  const stripExpected = normExpected.replace(/\s+/g, "");
  if (stripActual === stripExpected) {
    return {
      passed: true,
      expectedOutput: normExpected,
      actualOutput: normActual,
      difference: null
    };
  }

  // 6. Direct JSON comparison
  if (tryJsonCompare(normActual, normExpected)) {
    return {
      passed: true,
      expectedOutput: normExpected,
      actualOutput: normActual,
      difference: null
    };
  }

  // 7. Check last non-empty line (if program printed debug logs before returning answer)
  const lines = normActual.split("\n").map((l) => l.trim()).filter(Boolean);
  const lastLine = lines[lines.length - 1] || normActual;

  if (lastLine === normExpected || lastLine.replace(/\s+/g, "") === stripExpected) {
    return {
      passed: true,
      expectedOutput: normExpected,
      actualOutput: normActual,
      difference: null
    };
  }

  if (tryJsonCompare(lastLine, normExpected)) {
    return {
      passed: true,
      expectedOutput: normExpected,
      actualOutput: normActual,
      difference: null
    };
  }

  // 8. Token array comparison
  const actTokens = parseTokens(lastLine || normActual);
  const expTokens = parseTokens(normExpected);
  if (actTokens && expTokens && actTokens.length === expTokens.length) {
    const matchesAll = actTokens.every((val, idx) => {
      if (typeof val === "number" && typeof expTokens[idx] === "number") {
        return Math.abs(val - expTokens[idx]) < 1e-5;
      }
      return val === expTokens[idx];
    });

    if (matchesAll) {
      return {
        passed: true,
        expectedOutput: normExpected,
        actualOutput: normActual,
        difference: null
      };
    }
  }

  // Failed comparison
  return {
    passed: false,
    expectedOutput: normExpected,
    actualOutput: normActual,
    difference: generateDifference(actual, expected)
  };
}
