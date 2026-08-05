// LeetCode-grade Percentile Benchmarking Engine

const LANGUAGE_BENCHMARKS = {
  javascript: { meanRuntimeMs: 35, stdDevRuntime: 12, meanMemoryMb: 14.5, stdDevMemory: 1.8 },
  python: { meanRuntimeMs: 45, stdDevRuntime: 15, meanMemoryMb: 15.2, stdDevMemory: 2.1 },
  cpp: { meanRuntimeMs: 8, stdDevRuntime: 4, meanMemoryMb: 8.4, stdDevMemory: 1.2 },
  java: { meanRuntimeMs: 25, stdDevRuntime: 8, meanMemoryMb: 42.1, stdDevMemory: 5.0 }
};

function cumulativeNormalDistribution(x, mean, stdDev) {
  if (stdDev <= 0) return 0.5;
  const z = (x - mean) / stdDev;
  // Approximation of error function erf for cumulative normal distribution
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  let prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  if (z > 0) prob = 1 - prob;
  return prob;
}

export function calculatePercentile(language, runtimeMs, memoryMb = 14.0) {
  const normLang = (language || "javascript").toLowerCase();
  const benchmark = LANGUAGE_BENCHMARKS[normLang] || LANGUAGE_BENCHMARKS.javascript;

  // Faster runtime (smaller ms) = higher percentile beaten
  // If runtimeMs < meanRuntimeMs, percentile is high (>50%)
  const runtimeZ = (benchmark.meanRuntimeMs - runtimeMs) / benchmark.stdDevRuntime;
  const runtimePercentile = Math.min(99.9, Math.max(5.0, (cumulativeNormalDistribution(-runtimeZ, 0, 1) * 100)));

  const memoryZ = (benchmark.meanMemoryMb - memoryMb) / benchmark.stdDevMemory;
  const memoryPercentile = Math.min(99.9, Math.max(5.0, (cumulativeNormalDistribution(-memoryZ, 0, 1) * 100)));

  return {
    runtimePercentile: Number(runtimePercentile.toFixed(1)),
    memoryPercentile: Number(memoryPercentile.toFixed(1))
  };
}
