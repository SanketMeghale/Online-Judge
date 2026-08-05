const API_BASE_URL = "http://localhost:4000/api";

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
    ...options,
    credentials: "include", // Transmit HTTP-only cookies
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `API request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  register: (body) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  logout: () => request("/auth/logout", { method: "POST" }),
  getMe: () => request("/auth/me"),

  // User & Dashboard
  getUserDashboard: () => request("/users/dashboard"),

  // Problems
  getProblems: () => request("/problems"),
  getProblemById: (id) => request(`/problems/${id}`),

  // Compiler & Submissions
  runCode: (body) => request("/compiler/run", { method: "POST", body: JSON.stringify(body) }),
  submitCode: (body) => request("/submissions", { method: "POST", body: JSON.stringify(body) }),
  getSubmissions: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/submissions/history${queryString ? `?${queryString}` : ""}`);
  },
  getSubmissionById: (id) => request(`/submissions/${id}`)
};

export default api;
