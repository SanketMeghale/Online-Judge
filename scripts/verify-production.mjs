const siteUrl = String(process.env.JUDGO_SITE_URL || process.argv[2] || "").replace(/\/$/, "");
const realtimeUrl = String(process.env.JUDGO_REALTIME_URL || process.argv[3] || "").replace(/\/$/, "");

if (!siteUrl || !realtimeUrl) {
  console.error("Usage: node scripts/verify-production.mjs <site-url> <realtime-url>");
  process.exit(1);
}

async function fetchJson(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  const body = await response.json().catch(() => ({}));
  return { response, body };
}

const checks = [];

try {
  const { response, body } = await fetchJson(`${siteUrl}/api/health`);
  const dependenciesReady = ["database", "queue", "worker"].every(
    (name) => body?.checks?.[name] === "UP"
  );
  checks.push({ name: "API readiness", ok: response.ok && body.ok === true && dependenciesReady, detail: body });
} catch (error) {
  checks.push({ name: "API readiness", ok: false, detail: error.message });
}

try {
  const { response, body } = await fetchJson(`${realtimeUrl}/health`);
  checks.push({ name: "Realtime", ok: response.ok && body.ok === true, detail: body });
} catch (error) {
  checks.push({ name: "Realtime", ok: false, detail: error.message });
}

for (const check of checks) {
  console.log(`${check.ok ? "PASS" : "FAIL"} ${check.name}`);
  if (!check.ok) console.log(JSON.stringify(check.detail, null, 2));
}

if (checks.some((check) => !check.ok)) process.exit(1);
