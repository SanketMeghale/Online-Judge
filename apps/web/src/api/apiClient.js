const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

function getStoredToken() {
  try {
    const raw = localStorage.getItem("online-judge-session");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.accessToken ?? parsed?.token ?? null;
  } catch {
    return null;
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
  logout: () => request("/auth/logout", { method: "POST" }),
  getMe: () => request("/auth/me"),

  // Problems
  getProblems: () => request("/problems"),
  getProblemById: (id) => request(`/problems/${id}`),

  // Compiler & Submissions
  runCode: (body) => request("/compiler/run", { method: "POST", body: JSON.stringify(body) }),
  submitCode: (body) => request("/submissions/submit", { method: "POST", body: JSON.stringify(body) }),
  getSubmissions: (query = "") => request(`/submissions/history${query ? `?${query}` : ""}`),
  getSubmissionById: (id) => request(`/submissions/${id}`),
  // Alias used in polling logic (AppDataContext + ProblemDetails)
  getSubmission: (id) => request(`/submissions/${id}`)
};
