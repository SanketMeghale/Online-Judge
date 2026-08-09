const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

function getStoredToken() {
  try {
    const raw = localStorage.getItem("online-judge-auth") || localStorage.getItem("online-judge-session");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.accessToken || parsed?.token) {
        return parsed.accessToken || parsed.token;
      }
    }
    return localStorage.getItem("token") || null;
  } catch {
    return localStorage.getItem("token") || null;
  }
}

async function request(endpoint, options = {}) {
  const token = getStoredToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: "include",
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || `API request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  register: (body) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  loginGoogle: (body) => request("/auth/google", { method: "POST", body: JSON.stringify(body) }),
  logout: () => request("/auth/logout", { method: "POST" }),
  getMe: () => request("/auth/me"),
  updateSettings: (body) => request("/auth/settings", { method: "PATCH", body: JSON.stringify(body) }),
  checkUsername: (username, currentUserId = "") =>
    request(`/auth/check-username?username=${encodeURIComponent(username)}${currentUserId ? `&currentUserId=${encodeURIComponent(currentUserId)}` : ""}`),
  changePassword: (body) => request("/auth/change-password", { method: "POST", body: JSON.stringify(body) }),
  deleteAccount: (body) => request("/auth/account", { method: "DELETE", body: JSON.stringify(body) }),

  // Problems
  getProblems: () => request("/problems"),
  getProblemById: (id) => request(`/problems/${id}`),

  // Compiler & Submissions
  runCode: (body) => request("/compiler/run", { method: "POST", body: JSON.stringify(body) }),
  submitCode: (body) => request("/submissions/submit", { method: "POST", body: JSON.stringify(body) }),
  getSubmissions: (query = "") => request(`/submissions/history${query ? `?${query}` : ""}`),
  getSubmissionById: (id) => request(`/submissions/${id}`),
  getSubmission: (id) => request(`/submissions/${id}`),

  // Contests & Arena
  getContests: (query = "") => request(`/contests${query ? `?${query}` : ""}`),
  getContestById: (id) => request(`/contests/${id}`),
  registerContest: (id) => request(`/contests/${id}/register`, { method: "POST" }),
  getContestRegistration: (id) => request(`/contests/${id}/registration`),
  getContestProblems: (id) => request(`/contests/${id}/problems`),
  getContestLeaderboard: (id) => request(`/contests/${id}/leaderboard`),
  getContestResults: (id) => request(`/contests/${id}/results`),

  // Global Leaderboard
  getLeaderboard: () => request("/leaderboard"),

  // Analytics & Progress
  getProgress: (range = "30d") => request(`/progress?range=${range}`),

  // Dashboard Summary & Analytics
  getDashboard: () => request("/dashboard"),

  // AI Mentor & Coach
  getAIProfile: () => request("/ai/profile"),
  getAIConversations: (conversationId) => request(`/ai/conversations${conversationId ? `?conversationId=${conversationId}` : ""}`),
  sendAIMessage: (body) => request("/ai/mentor", { method: "POST", body: JSON.stringify(body) }),
  reviewCodeAI: (body) => request("/ai/review", { method: "POST", body: JSON.stringify(body) }),
  getProblemHintAI: (body) => request("/ai/hint", { method: "POST", body: JSON.stringify(body) }),
  interviewAI: (body) => request("/ai/interview", { method: "POST", body: JSON.stringify(body) }),
  clearAIConversation: (conversationId) => request(`/ai/conversations${conversationId ? `?conversationId=${conversationId}` : ""}`, { method: "DELETE" })
};
