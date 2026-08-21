import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import jwt from "jsonwebtoken";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-only-secret-that-is-longer-than-thirty-two-characters";
process.env.REALTIME_JWT_SECRET = "test-only-realtime-secret-longer-than-thirty-two-characters";
process.env.ENABLE_DEMO_USERS = "false";
delete process.env.MONGODB_URI;

const { createApp } = await import("../src/app.js");
const { signToken, verifyToken } = await import("../src/lib/jwt.js");
const { verifyFirebaseIdToken } = await import("../src/lib/firebaseAdmin.js");
const { validateUserCredentials } = await import("../src/lib/userStore.js");
const { createSubmissionRecord } = await import("../src/lib/submissionStore.js");
const { submissionService } = await import("../src/services/submission.service.js");

let server;
let baseUrl;

before(async () => {
  server = createApp().listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test("JWT verification accepts only signed HS256 tokens", () => {
  const signed = signToken({ userId: "u-test" });
  assert.equal(verifyToken(signed).userId, "u-test");

  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const unsigned = `${encode({ alg: "none", typ: "JWT" })}.${encode({ userId: "u-admin" })}.`;
  assert.equal(verifyToken(unsigned), null);
});

test("Firebase authentication rejects unsigned identity tokens", async () => {
  process.env.FIREBASE_PROJECT_ID = "test-project";
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const forged = `${encode({ alg: "none", typ: "JWT" })}.${encode({ sub: "attacker", email: "admin@example.com", email_verified: true })}.`;
  assert.equal(await verifyFirebaseIdToken(forged), null);
});

test("known demo administrator credentials are disabled by default", async () => {
  assert.equal(await validateUserCredentials("admin@judgo.dev", "admin123"), null);
});

test("execution, submission, and evaluation endpoints require authentication", async () => {
  for (const [path, method] of [
    ["/api/compiler/run", "POST"],
    ["/api/submissions/submit", "POST"],
    ["/api/evaluation", "GET"]
  ]) {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      ...(method === "POST" ? { body: JSON.stringify({}) } : {})
    });
    assert.equal(response.status, 401, `${method} ${path}`);
  }
});

test("cookie authentication works without exposing JWTs to browser storage", async () => {
  const email = `security-${Date.now()}@example.com`;
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Security Test", username: `security${Date.now()}`, email, password: "strong-password-123" })
  });
  const body = await response.json();
  assert.equal(response.status, 201);
  assert.equal(body.token, undefined);
  assert.equal(body.accessToken, undefined);

  const cookie = response.headers.get("set-cookie")?.split(";")[0];
  assert.ok(cookie?.startsWith("token="));
  const historyResponse = await fetch(`${baseUrl}/api/submissions/history`, { headers: { Cookie: cookie } });
  assert.equal(historyResponse.status, 200);
  const history = await historyResponse.json();
  assert.deepEqual(history.submissions, []);

  const spoofedCheck = await fetch(
    `${baseUrl}/api/auth/check-username?username=${body.user.username}&currentUserId=${body.user.id}`
  );
  assert.equal((await spoofedCheck.json()).available, false);

  const ownedCheck = await fetch(`${baseUrl}/api/auth/check-username?username=${body.user.username}`, {
    headers: { Cookie: cookie }
  });
  assert.equal((await ownedCheck.json()).available, true);

  const realtimeResponse = await fetch(`${baseUrl}/api/auth/realtime-token`, { headers: { Cookie: cookie } });
  const realtimeBody = await realtimeResponse.json();
  const realtimeClaims = jwt.verify(realtimeBody.token, process.env.REALTIME_JWT_SECRET, { algorithms: ["HS256"] });
  assert.equal(realtimeClaims.userId, body.user.id);
  assert.equal(realtimeClaims.purpose, "realtime");
  assert.throws(() => jwt.verify(realtimeBody.token, process.env.JWT_SECRET));
});

test("public problem responses do not disclose hidden judge data", async () => {
  const response = await fetch(`${baseUrl}/api/problems/two-sum`);
  assert.equal(response.status, 200);
  const body = await response.json();
  const problem = body.problem || body;
  assert.equal(problem.hiddenTestCases, undefined);
  assert.equal(problem.solution, undefined);
  assert.equal(problem.solutions, undefined);
  assert.equal(problem.judge, undefined);
});

test("submission reads enforce ownership and redact hidden test data", async () => {
  const record = await createSubmissionRecord({
    userId: "owner-1",
    problemId: "two-sum",
    language: "python",
    code: "print(1)",
    status: "COMPLETED",
    verdict: "WA",
    testcases: [{ id: 1, input: "secret input", expectedOutput: "secret output", status: "WRONG_ANSWER", verdict: "WA" }]
  });

  assert.equal(await submissionService.getSubmissionById(record.id, { id: "other-user", role: "user" }), null);
  const owned = await submissionService.getSubmissionById(record.id, { id: "owner-1", role: "user" });
  assert.equal(owned.testResults[0].input, undefined);
  assert.equal(owned.testResults[0].expectedOutput, undefined);
});
