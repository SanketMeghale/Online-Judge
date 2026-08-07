const fetch = globalThis.fetch;

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

export async function executeWithJudge0({ language, code, stdin = "", timeoutMs = 5000 }) {
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

  const baseUrl = process.env.JUDGE0_URL || "https://ce.judge0.com";
  const apiKey = process.env.RAPIDAPI_KEY || process.env.JUDGE0_API_KEY || "";
  const apiHost = process.env.RAPIDAPI_HOST || "judge0-ce.p.rapidapi.com";

  const headers = {
    "Content-Type": "application/json"
  };

  if (apiKey) {
    headers["X-RapidAPI-Key"] = apiKey;
    headers["X-RapidAPI-Host"] = apiHost;
  }

  const payload = {
    language_id: languageId,
    source_code: code,
    stdin: stdin || "",
    cpu_time_limit: Math.max(2, Math.min(10, Math.ceil(timeoutMs / 1000)))
  };

  console.log(`[Judge0Service] Submitting job to ${baseUrl} (Language ID: ${languageId})...`);

  try {
    // 1. Submit job with wait=true to get synchronous execution result
    const postRes = await fetch(`${baseUrl}/submissions?base64_encoded=false&wait=true`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    if (!postRes.ok) {
      const errText = await postRes.text();
      console.warn(`[Judge0Service] POST returned ${postRes.status}: ${errText}`);
      throw new Error(`Judge0 API error ${postRes.status}: ${errText}`);
    }

    let result = await postRes.json();

    // 2. Fallback polling if status is still queued/processing
    if (result.token && (result.status_id === 1 || result.status_id === 2)) {
      console.log(`[Judge0Service] Job queued with token ${result.token}. Polling status...`);
      for (let attempt = 0; attempt < 10; attempt++) {
        await new Promise((r) => setTimeout(r, 400));
        const pollRes = await fetch(`${baseUrl}/submissions/${result.token}?base64_encoded=false`, {
          headers
        });
        if (pollRes.ok) {
          const pollData = await pollRes.json();
          if (pollData.status_id && pollData.status_id > 2) {
            result = pollData;
            break;
          }
        }
      }
    }

    console.log(`[Judge0Service] Execution completed. Status ID: ${result.status_id} (${result.status?.description})`);

    const statusId = result.status_id || (result.status?.id ?? 3);
    const stdout = result.stdout || "";
    const stderr = result.stderr || result.compile_output || "";
    const timeSec = parseFloat(result.time || "0.015");
    const runtimeMs = Math.max(1, Math.round(timeSec * 1000));
    const memoryMb = Number(((result.memory || 14000) / 1024).toFixed(1));

    // Map Judge0 status IDs to Online Judge Verdicts
    let verdict = "OK";
    let ok = false;
    let statusText = result.status?.description || "Executed successfully";

    switch (statusId) {
      case 3: // Accepted
        verdict = "OK";
        ok = true;
        statusText = "Accepted";
        break;
      case 4: // Wrong Answer
        verdict = "WA";
        ok = false;
        statusText = "Wrong Answer";
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
      case 13: // Internal / Memory Limit Exceeded
        verdict = "MLE";
        ok = false;
        statusText = "Memory Limit Exceeded";
        break;
      default:
        verdict = ok ? "OK" : "RE";
        break;
    }

    return {
      ok,
      verdict,
      statusText,
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      output: stdout.trim() || stderr.trim() || "Executed successfully.",
      runtimeMs,
      memoryMb
    };
  } catch (err) {
    console.error(`[Judge0Service Error]:`, err.message);
    throw err;
  }
}
