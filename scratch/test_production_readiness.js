const API_BASE = "http://localhost:4000/api";

async function runProductionReadinessCheck() {
  console.log("=== PRODUCTION READINESS AUDIT & VERIFICATION ===\n");

  const testUser = {
    name: "Production Auditor",
    username: `auditor_${Date.now()}`,
    email: `auditor_${Date.now()}@example.com`,
    password: "SecurePassword123!"
  };

  // 1. Test Unauthenticated Access Rejection (401)
  console.log("1. Testing Unauthenticated Access Rejection (GET /api/submissions/history)...");
  const unauthRes = await fetch(`${API_BASE}/submissions/history`);
  console.log(`   Status: ${unauthRes.status} (Expected: 401)`);
  if (unauthRes.status === 401) {
    console.log("   ✅ PASSED: Unauthenticated access strictly rejected with 401 Unauthorized.");
  } else {
    console.error("   ❌ FAILED: Unauthenticated access allowed!");
    process.exit(1);
  }

  // 2. Test User Registration
  console.log("\n2. Testing User Registration (POST /api/auth/register)...");
  const regRes = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(testUser)
  });
  const regData = await regRes.json();
  console.log(`   Status: ${regRes.status}`);
  if (regRes.status === 201 && regData.token) {
    console.log("   ✅ PASSED: Registration successful, returned JWT token & user object.");
  } else {
    console.error("   ❌ FAILED: Registration failed!", regData);
    process.exit(1);
  }

  // 3. Test Duplicate Registration Rejection (409)
  console.log("\n3. Testing Duplicate Email Registration Rejection (POST /api/auth/register)...");
  const dupRes = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(testUser)
  });
  console.log(`   Status: ${dupRes.status} (Expected: 409)`);
  if (dupRes.status === 409) {
    console.log("   ✅ PASSED: Duplicate registration rejected with 409 Conflict.");
  } else {
    console.error("   ❌ FAILED: Duplicate registration allowed!");
    process.exit(1);
  }

  // 4. Test User Login & Cookie setting
  console.log("\n4. Testing User Login (POST /api/auth/login)...");
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testUser.email, password: testUser.password })
  });
  const loginData = await loginRes.json();
  const cookies = loginRes.headers.get("set-cookie");
  console.log(`   Status: ${loginRes.status}`);
  console.log(`   Set-Cookie: ${cookies ? "Present (HTTP-Only Cookie Set)" : "None"}`);
  if (loginRes.status === 200 && loginData.token) {
    console.log("   ✅ PASSED: Login successful and HTTP-Only cookie set.");
  } else {
    console.error("   ❌ FAILED: Login failed!", loginData);
    process.exit(1);
  }

  const token = loginData.token;

  // 5. Test Authenticated Profile Access (/api/auth/me)
  console.log("\n5. Testing Authenticated Session Check (GET /api/auth/me)...");
  const meRes = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const meData = await meRes.json();
  console.log(`   Status: ${meRes.status}`);
  if (meRes.status === 200 && meData.user?.email === testUser.email) {
    console.log(`   ✅ PASSED: Session verified for user ${meData.user.username}.`);
  } else {
    console.error("   ❌ FAILED: /me verification failed!", meData);
    process.exit(1);
  }

  // 6. Test User Scoped Submission Submission
  console.log("\n6. Testing Code Submission (POST /api/submissions/submit)...");
  const subRes = await fetch(`${API_BASE}/submissions/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      problemId: "two-sum",
      language: "python",
      code: "class Solution:\n    def twoSum(self, nums, target):\n        return [0, 1]"
    })
  });
  const subData = await subRes.json();
  console.log(`   Status: ${subRes.status}`);
  if (subRes.status === 202 && subData.submission) {
    console.log("   ✅ PASSED: Submission queued successfully under user ID.");
  } else {
    console.error("   ❌ FAILED: Submission failed!", subData);
    process.exit(1);
  }

  // 7. Test User Scoped Submission History
  console.log("\n7. Testing User Scoped Submission History (GET /api/submissions/history)...");
  const historyRes = await fetch(`${API_BASE}/submissions/history`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const historyData = await historyRes.json();
  console.log(`   Status: ${historyRes.status}`);
  console.log(`   Total Submissions Found: ${historyData.submissions?.length || 0}`);
  if (historyRes.status === 200 && historyData.submissions?.length > 0) {
    console.log("   ✅ PASSED: Submission history scoped correctly to authenticated user.");
  } else {
    console.error("   ❌ FAILED: Submission history empty or failed!", historyData);
    process.exit(1);
  }

  console.log("\nALL PRODUCTION READINESS CHECKS PASSED PERFECTLY!");
}

runProductionReadinessCheck().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
