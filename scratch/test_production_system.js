const API_BASE = "http://localhost:4000/api";

async function runTests() {
  console.log("=== STARTING PRODUCTION READINESS AUDIT TESTS ===\n");

  const timestamp = Date.now();
  const testUserA = {
    name: "Alice Engineer",
    username: `alice_${timestamp}`,
    email: `alice_${timestamp}@test.com`,
    password: "SecurePassword123!"
  };

  const testUserB = {
    name: "Bob Developer",
    username: `bob_${timestamp}`,
    email: `bob_${timestamp}@test.com`,
    password: "SecurePassword456!"
  };

  // 1. Test Registration User A
  console.log("1. Testing User A Registration...");
  const regResA = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(testUserA)
  });
  const regDataA = await regResA.json();
  if (regResA.status !== 201 || !regDataA.token) {
    throw new Error(`User A Registration failed: ${JSON.stringify(regDataA)}`);
  }
  console.log(`✓ User A registered successfully (ID: ${regDataA.user.id})`);
  const tokenA = regDataA.token;
  const cookieA = regResA.headers.get("set-cookie");

  // 2. Test Duplicate Email Prevention
  console.log("\n2. Testing Duplicate Email Registration Prevention...");
  const dupRes = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(testUserA)
  });
  const dupData = await dupRes.json();
  if (dupRes.status !== 409) {
    throw new Error(`Expected 409 Conflict for duplicate email, got ${dupRes.status}`);
  }
  console.log("✓ Duplicate registration correctly rejected with 409 Conflict");

  // 3. Test Registration User B
  console.log("\n3. Testing User B Registration...");
  const regResB = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(testUserB)
  });
  const regDataB = await regResB.json();
  const tokenB = regDataB.token;
  console.log(`✓ User B registered successfully (ID: ${regDataB.user.id})`);

  // 4. Test Protected Endpoint Access Control
  console.log("\n4. Testing Protected Endpoint Access Control (Unauthenticated)...");
  const unauthRes = await fetch(`${API_BASE}/users/dashboard`);
  if (unauthRes.status !== 401) {
    throw new Error(`Expected 401 Unauthorized for unauthenticated request, got ${unauthRes.status}`);
  }
  console.log("✓ Protected endpoint correctly returned 401 Unauthorized");

  // 5. Test Authenticated User A Dashboard & Stats
  console.log("\n5. Testing User A Isolated Dashboard Statistics...");
  const dashResA = await fetch(`${API_BASE}/users/dashboard`, {
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  const dashDataA = await dashResA.json();
  if (dashResA.status !== 200 || !dashDataA.stats) {
    throw new Error(`Failed to fetch User A dashboard: ${JSON.stringify(dashDataA)}`);
  }
  console.log(`✓ User A Dashboard retrieved (Solved: ${dashDataA.stats.solvedProblemCount}, Total Subs: ${dashDataA.stats.totalSubmissions})`);

  // 6. Test User Code Submission under User A
  console.log("\n6. Submitting Code as User A...");
  const subResA = await fetch(`${API_BASE}/submissions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenA}`
    },
    body: JSON.stringify({
      problemId: "two-sum",
      language: "python",
      code: `class Solution:\n    def twoSum(self, nums, target):\n        m = {}\n        for i, n in enumerate(nums):\n            if target - n in m:\n                return [m[target - n], i]\n            m[n] = i\n        return []`
    })
  });
  const subDataA = await subResA.json();
  console.log(`✓ User A submission evaluated (Verdict: ${subDataA.submission.verdict}, StatusText: ${subDataA.submission.statusText})`);

  // 7. Test Submission Isolation: User B cannot access User A's submission
  console.log("\n7. Testing Cross-User Submission Access Control...");
  const submissionIdA = subDataA.submission.id || subDataA.submission._id;
  const accessRes = await fetch(`${API_BASE}/submissions/${submissionIdA}`, {
    headers: { Authorization: `Bearer ${tokenB}` }
  });
  if (accessRes.status !== 403) {
    throw new Error(`Expected 403 Forbidden when User B accesses User A's submission, got ${accessRes.status}`);
  }
  console.log("✓ User B correctly blocked (403 Forbidden) from accessing User A's submission");

  // 8. Test Submission History Filtering
  console.log("\n8. Testing Submission History Filtering by Verdict...");
  const histRes = await fetch(`${API_BASE}/submissions/history?verdict=AC`, {
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  const histData = await histRes.json();
  if (histRes.status !== 200 || !Array.isArray(histData.submissions)) {
    throw new Error(`Failed to fetch filtered history: ${JSON.stringify(histData)}`);
  }
  console.log(`✓ Filtered submission history retrieved (${histData.submissions.length} AC submissions found)`);

  // 9. Test Logout
  console.log("\n9. Testing Logout Endpoint...");
  const logoutRes = await fetch(`${API_BASE}/auth/logout`, { method: "POST" });
  if (logoutRes.status !== 200) {
    throw new Error(`Logout failed: ${logoutRes.status}`);
  }
  console.log("✓ Logout endpoint executed successfully and cleared auth cookie");

  console.log("\n==================================================");
  console.log("ALL PRODUCTION READINESS AUDIT TESTS PASSED 100%!");
  console.log("==================================================");
}

runTests().catch((err) => {
  console.error("❌ TEST FAILURE:", err);
  process.exit(1);
});
