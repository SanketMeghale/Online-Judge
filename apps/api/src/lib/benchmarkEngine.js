import { Submission } from "../models/Submission.js";
import { isDatabaseConnected } from "./db.js";
import { listSubmissionRecords } from "./submissionStore.js";

const MIN_BENCHMARK_SAMPLE_SIZE = 5;

/**
 * Calculate percentile against real historical accepted submissions.
 * If insufficient real benchmark data exists (< 5 submissions), returns null.
 * Never invents, estimates, or randomly generates percentiles.
 *
 * @param {string} problemId - Problem ID
 * @param {string} language - Programming language
 * @param {number} runtimeMs - Measured runtime in milliseconds
 * @param {number} memoryMb - Measured memory in megabytes
 * @returns {Promise<{ runtimePercentile: number | null, memoryPercentile: number | null, sampleSize: number }>}
 */
export async function calculateRealPercentile({ problemId, language, runtimeMs, memoryMb }) {
  const normLang = (language || "").toLowerCase().trim();
  const pid = (problemId || "").toLowerCase().trim();

  let historicalRecords = [];

  // 1. Fetch real historical submissions from MongoDB if connected
  if (isDatabaseConnected()) {
    try {
      const dbRecords = await Submission.find({
        problemId: pid,
        language: normLang,
        verdict: "AC",
        runtimeMs: { $gt: 0 }
      })
        .select("runtimeMs memoryMb")
        .lean();
      historicalRecords = dbRecords || [];
    } catch (err) {
      console.warn("[BenchmarkEngine] Failed to query MongoDB submissions:", err.message);
    }
  }

  // 2. Combine with in-memory submission records if any
  try {
    const memRecords = listSubmissionRecords({ problemId: pid, language: normLang, verdict: "AC" }) || [];
    for (const rec of memRecords) {
      if (rec && rec.runtimeMs > 0 && !historicalRecords.some((h) => String(h._id || h.id) === String(rec.id || rec._id))) {
        historicalRecords.push(rec);
      }
    }
  } catch {}

  const sampleSize = historicalRecords.length;

  // 3. If fewer than MIN_BENCHMARK_SAMPLE_SIZE accepted submissions exist, return null
  if (sampleSize < MIN_BENCHMARK_SAMPLE_SIZE) {
    return {
      runtimePercentile: null,
      memoryPercentile: null,
      sampleSize
    };
  }

  // 4. Calculate actual percentile against real historical dataset
  // Percentile = % of submissions that this solution was faster than (larger runtimeMs)
  const slowerCount = historicalRecords.filter((s) => s.runtimeMs > runtimeMs).length;
  const equalCount = historicalRecords.filter((s) => s.runtimeMs === runtimeMs).length;
  const runtimePercentile = Number((((slowerCount + equalCount * 0.5) / sampleSize) * 100).toFixed(1));

  // Memory percentile
  let memoryPercentile = null;
  if (typeof memoryMb === "number" && memoryMb > 0) {
    const higherMemCount = historicalRecords.filter((s) => s.memoryMb > memoryMb).length;
    const equalMemCount = historicalRecords.filter((s) => s.memoryMb === memoryMb).length;
    memoryPercentile = Number((((higherMemCount + equalMemCount * 0.5) / sampleSize) * 100).toFixed(1));
  }

  return {
    runtimePercentile: Math.min(100, Math.max(0, runtimePercentile)),
    memoryPercentile: memoryPercentile !== null ? Math.min(100, Math.max(0, memoryPercentile)) : null,
    sampleSize
  };
}

/**
 * Synchronous fallback wrapper for inline usage where async is not possible
 */
export function calculatePercentile(language, runtimeMs, memoryMb) {
  // Return null percentiles by default unless populated from real database
  return {
    runtimePercentile: null,
    memoryPercentile: null
  };
}
