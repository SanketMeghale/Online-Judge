import { OutputComparator, outputComparator } from "../src/services/OutputComparator.js";

describe("OutputComparator Unit Tests", () => {
  let comparator;

  beforeEach(() => {
    comparator = new OutputComparator();
  });

  test("1. Returns Accepted (AC) for matching outputs", () => {
    const actual = "1 2 3\n4 5 6";
    const expected = "1 2 3\n4 5 6";
    const result = comparator.compare(actual, expected);

    expect(result.verdict).toBe("AC");
    expect(result.statusText).toBe("Accepted");
    expect(result.isMatch).toBe(true);
    expect(result.firstFailedLine).toBeNull();
  });

  test("2. Ignores trailing spaces on lines (Requirement 1)", () => {
    const actual = "hello   \nworld   \n";
    const expected = "hello\nworld";
    const result = comparator.compare(actual, expected);

    expect(result.verdict).toBe("AC");
    expect(result.isMatch).toBe(true);
  });

  test("3. Ignores line ending differences CRLF vs LF (Requirement 2)", () => {
    const actual = "line1\r\nline2\r\nline3";
    const expected = "line1\nline2\nline3";
    const result = comparator.compare(actual, expected);

    expect(result.verdict).toBe("AC");
    expect(result.isMatch).toBe(true);
  });

  test("4. Supports Exact Comparison mode (Requirement 3)", () => {
    const actual = "hello   \nworld";
    const expected = "hello\nworld";

    // Standard comparison ignores trailing spaces
    const normResult = comparator.compare(actual, expected, { exact: false });
    expect(normResult.verdict).toBe("AC");

    // Exact mode fails on trailing space mismatch
    const exactResult = comparator.compare(actual, expected, { exact: true });
    expect(exactResult.verdict).toBe("WA");
    expect(exactResult.statusText).toBe("Wrong Answer");
    expect(exactResult.isMatch).toBe(false);
  });

  test("5. Identifies First Failed Line number and reason for content mismatch", () => {
    const actual = "line1\nline2_wrong\nline3";
    const expected = "line1\nline2_correct\nline3";
    const result = comparator.compare(actual, expected);

    expect(result.verdict).toBe("WA");
    expect(result.firstFailedLine).toEqual({
      lineNumber: 2,
      actual: "line2_wrong",
      expected: "line2_correct",
      reason: "Content mismatch"
    });
  });

  test("6. Identifies First Failed Line when actual output has extra lines", () => {
    const actual = "line1\nline2\nline3_extra";
    const expected = "line1\nline2";
    const result = comparator.compare(actual, expected);

    expect(result.verdict).toBe("WA");
    expect(result.firstFailedLine).toEqual({
      lineNumber: 3,
      actual: "line3_extra",
      expected: "<EOF>",
      reason: "Unexpected extra output line"
    });
  });

  test("7. Identifies First Failed Line when actual output is missing lines", () => {
    const actual = "line1";
    const expected = "line1\nline2_missing";
    const result = comparator.compare(actual, expected);

    expect(result.verdict).toBe("WA");
    expect(result.firstFailedLine).toEqual({
      lineNumber: 2,
      actual: "<EOF>",
      expected: "line2_missing",
      reason: "Missing expected output line"
    });
  });
});
