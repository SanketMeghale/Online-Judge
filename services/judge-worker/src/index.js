import { evaluateSubmission } from "./judgeEvaluator.js";

console.log("--------------------------------------------------");
console.log("Online Judge Worker Service initialized");
console.log("Mode: Local Standalone Worker (Queue-Ready)");
console.log("Supported Runtimes: JavaScript, Python 3, C++ (GCC), Java");
console.log("--------------------------------------------------");

export async function processSubmissionJob(submissionJob) {
  console.log(`[Worker] Evaluating submission ${submissionJob.id} (${submissionJob.language})...`);
  const result = await evaluateSubmission(submissionJob);
  console.log(`[Worker] Verdict for ${submissionJob.id}: ${result.verdict} (${result.runtimeMs}ms)`);
  return result;
}
