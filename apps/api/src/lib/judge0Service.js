const fetch = globalThis.fetch;

// Judge0 CE Language IDs (official)
const JUDGE0_LANGUAGE_IDS = {
  python: 71,
  python3: 71,
  py: 71,
  javascript: 63,
  js: 63,
  cpp: 54,
  "c++": 54,
  c: 50,
  java: 62
};

/**
 * Execute code via Judge0.
 * Uses wait=true for fast results; falls back to polling if still queued.
 * Correctly sends to RapidAPI endpoint if RAPIDAPI_KEY is set.
 */
export async function executeWithJudge0({ language, code, stdin = "", timeoutMs = 8000 }) {
  const normLang = (language || "").toLowerCase().trim();
  const languageId = JUDGE0_LANGUAGE_IDS[normLang];

  if (!languageId) {
    return {
      ok: false,
      verdict: "SYSTEM_ERROR",
      statusText: `Unsupported language for Judge0: ${language}`,
      stdout: "",
      stderr: `Unsupported language: ${language}`,
      runtimeMs: 0
    };
  }

  const rapidApiKey = process.env.RAPIDAPI_KEY || process.env.JUDGE0_API_KEY || "";
  const rapidApiHost = process.env.RAPIDAPI_HOST || "judge0-ce.p.rapidapi.com";

  // Determine the correct base URL:
  // If using RapidAPI key, must use RapidAPI endpoint, not the public ce.judge0.com
  let baseUrl;
  if (rapidApiKey) {
    baseUrl = `https://${rapidApiHost}`;
  } else if (process.env.JUDGE0_URL) {
    baseUrl = process.env.JUDGE0_URL.replace(/\/$/, "");
  } else {
    baseUrl = "https://ce.judge0.com";
  }

  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json"
  };

  if (rapidApiKey) {
    headers["X-RapidAPI-Key"] = rapidApiKey;
    headers["X-RapidAPI-Host"] = rapidApiHost;
  }

  const cpuLimit = Math.max(2, Math.min(10, Math.ceil(timeoutMs / 1000)));

  const payload = {
    language_id: languageId,
    source_code: code,
    stdin: stdin || "",
    cpu_time_limit: cpuLimit,
    wall_time_limit: cpuLimit + 2
  };

  console.log(`[Judge0Service] POST to ${baseUrl} | Lang: ${normLang} (${languageId}) | CPU limit: ${cpuLimit}s`);

  try {
    // Submit with wait=true for synchronous result
    const submitUrl = `${baseUrl}/submissions?base64_encoded=false&wait=true`;
    const postRes = await fetch(submitUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(timeoutMs + 3000)
    });

    if (!postRes.ok) {
      const errText = await postRes.text();
      console.warn(`[Judge0Service] POST ${postRes.status}: ${errText.slice(0, 300)}`);
      throw new Error(`Judge0 API error ${postRes.status}: ${errText.slice(0, 200)}`);
    }

    let result = await postRes.json();
    const statusId = result.status?.id ?? result.status_id ?? 0;

    console.log(`[Judge0Service] Initial status_id: ${statusId} (${result.status?.description}), token: ${result.token}`);

    // If still processing, poll until done
    if (result.token && (statusId === 1 || statusId === 2)) {
      console.log(`[Judge0Service] Still queued/processing. Polling token ${result.token}...`);
      const pollUrl = `${baseUrl}/submissions/${result.token}?base64_encoded=false`;

      for (let attempt = 0; attempt < 20; attempt++) {
        await sleep(600);
        try {
          const pollRes = await fetch(pollUrl, { headers, signal: AbortSignal.timeout(5000) });
          if (pollRes.ok) {
            const pollData = await pollRes.json();
            const pStatusId = pollData.status?.id ?? pollData.status_id ?? 0;
            console.log(`[Judge0Service] Poll attempt ${attempt + 1}: status_id=${pStatusId}`);
            if (pStatusId > 2) {
              result = pollData;
              break;
            }
          }
        } catch (pollErr) {
          console.warn(`[Judge0Service] Poll attempt ${attempt + 1} failed: ${pollErr.message}`);
        }
      }
    }

    return mapJudge0Result(result);
  } catch (err) {
    console.error(`[Judge0Service Error]: ${err.message}`);
    throw err;
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function mapJudge0Result(result) {
  const statusId = result.status?.id ?? result.status_id ?? 0;
  const stdout = (result.stdout || "").trim();
  const stderr = (result.stderr || result.compile_output || "").trim();
  const timeSec = parseFloat(result.time || "0");
  const runtimeMs = timeSec > 0 ? Math.max(1, Math.round(timeSec * 1000)) : 15;
  const memoryKb = result.memory || 14000;
  const memoryMb = Number((memoryKb / 1024).toFixed(1));

  console.log(`[Judge0Service] Final status_id: ${statusId} | stdout: "${stdout.slice(0, 100)}" | stderr: "${stderr.slice(0, 100)}"`);

  let verdict = "RE";
  let ok = false;
  let statusText = result.status?.description || "Runtime Error";

  switch (statusId) {
    case 3: // Accepted
      verdict = "OK";
      ok = true;
      statusText = "Accepted";
      break;
    case 4: // Wrong Answer (Judge0 WA — treated as RE here; WA is determined by output comparison)
      verdict = "OK"; // output comparison done in compiler.js / judgeEvaluator.js
      ok = true;
      statusText = "Executed";
      break;
    case 5: // Time Limit Exceeded
      verdict = "TLE";
      ok = false;
      statusText = "Time Limit Exceeded";
      break;
    case 6: // Compilation Error
      verdict = "CE";
      ok = false;
      statusText = "Compilation Error";
      break;
    case 7:
    case 8:
    case 9:
    case 10:
    case 11:
    case 12: // Runtime Errors
      verdict = "RE";
      ok = false;
      statusText = "Runtime Error";
      break;
    case 13: // Internal Error / Memory Limit Exceeded
      verdict = "MLE";
      ok = false;
      statusText = "Memory Limit Exceeded";
      break;
    case 14: // Exec Format Error
      verdict = "RE";
      ok = false;
      statusText = "Execution Format Error";
      break;
    default:
      // statusId 0, 1, 2 means still pending — treat as execution error
      verdict = statusId === 0 ? "SYSTEM_ERROR" : "RE";
      ok = false;
      statusText = result.status?.description || "Execution failed";
      break;
  }

  return {
    ok,
    verdict,
    statusText,
    stdout,
    stderr,
    output: stdout || stderr || "Executed successfully.",
    runtimeMs,
    memoryMb
  };
}
