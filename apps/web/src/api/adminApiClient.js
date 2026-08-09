const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const adminApi = {
  // 1. Dashboard
  getDashboardStats: async () => {
    const res = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: getAuthHeaders(),
      credentials: "include"
    });
    return handleResponse(res);
  },

  // 2. Users
  getUsers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/admin/users?${query}`, {
      headers: getAuthHeaders(),
      credentials: "include"
    });
    return handleResponse(res);
  },

  getUserDetails: async (id) => {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      headers: getAuthHeaders(),
      credentials: "include"
    });
    return handleResponse(res);
  },

  updateUserRole: async (id, role) => {
    const res = await fetch(`${API_BASE}/admin/users/${id}/role`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ role }),
      credentials: "include"
    });
    return handleResponse(res);
  },

  updateUserStatus: async (id, status, reason = "") => {
    const res = await fetch(`${API_BASE}/admin/users/${id}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, reason }),
      credentials: "include"
    });
    return handleResponse(res);
  },

  // 3. Problems
  getProblems: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/admin/problems?${query}`, {
      headers: getAuthHeaders(),
      credentials: "include"
    });
    return handleResponse(res);
  },

  getProblemById: async (id) => {
    const res = await fetch(`${API_BASE}/admin/problems/${id}`, {
      headers: getAuthHeaders(),
      credentials: "include"
    });
    return handleResponse(res);
  },

  createProblem: async (problemData) => {
    const res = await fetch(`${API_BASE}/admin/problems`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(problemData),
      credentials: "include"
    });
    return handleResponse(res);
  },

  updateProblem: async (id, problemData) => {
    const res = await fetch(`${API_BASE}/admin/problems/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(problemData),
      credentials: "include"
    });
    return handleResponse(res);
  },

  deleteProblem: async (id) => {
    const res = await fetch(`${API_BASE}/admin/problems/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      credentials: "include"
    });
    return handleResponse(res);
  },

  // 4. Topics
  getTopics: async () => {
    const res = await fetch(`${API_BASE}/admin/topics`, {
      headers: getAuthHeaders(),
      credentials: "include"
    });
    return handleResponse(res);
  },

  createTopic: async (topicData) => {
    const res = await fetch(`${API_BASE}/admin/topics`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(topicData),
      credentials: "include"
    });
    return handleResponse(res);
  },

  updateTopic: async (id, topicData) => {
    const res = await fetch(`${API_BASE}/admin/topics/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(topicData),
      credentials: "include"
    });
    return handleResponse(res);
  },

  deleteTopic: async (id) => {
    const res = await fetch(`${API_BASE}/admin/topics/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      credentials: "include"
    });
    return handleResponse(res);
  },

  // 5. Submissions
  getSubmissions: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/admin/submissions?${query}`, {
      headers: getAuthHeaders(),
      credentials: "include"
    });
    return handleResponse(res);
  },

  getSubmissionDetails: async (id) => {
    const res = await fetch(`${API_BASE}/admin/submissions/${id}`, {
      headers: getAuthHeaders(),
      credentials: "include"
    });
    return handleResponse(res);
  },

  // 6. Contests
  getContests: async () => {
    const res = await fetch(`${API_BASE}/admin/contests`, {
      headers: getAuthHeaders(),
      credentials: "include"
    });
    return handleResponse(res);
  },

  createContest: async (contestData) => {
    const res = await fetch(`${API_BASE}/admin/contests`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(contestData),
      credentials: "include"
    });
    return handleResponse(res);
  },

  updateContest: async (id, contestData) => {
    const res = await fetch(`${API_BASE}/admin/contests/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(contestData),
      credentials: "include"
    });
    return handleResponse(res);
  },

  deleteContest: async (id) => {
    const res = await fetch(`${API_BASE}/admin/contests/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      credentials: "include"
    });
    return handleResponse(res);
  },

  // 7. Analytics
  getAnalytics: async (range = "30d") => {
    const res = await fetch(`${API_BASE}/admin/analytics?range=${range}`, {
      headers: getAuthHeaders(),
      credentials: "include"
    });
    return handleResponse(res);
  },

  // 8. Reports
  getReports: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/admin/reports?${query}`, {
      headers: getAuthHeaders(),
      credentials: "include"
    });
    return handleResponse(res);
  },

  updateReportStatus: async (id, statusData) => {
    const res = await fetch(`${API_BASE}/admin/reports/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(statusData),
      credentials: "include"
    });
    return handleResponse(res);
  },

  // 9. AI Coach Telemetry
  getAICoachStats: async () => {
    const res = await fetch(`${API_BASE}/admin/ai-coach`, {
      headers: getAuthHeaders(),
      credentials: "include"
    });
    return handleResponse(res);
  },

  // 10. Audit Logs
  getAuditLogs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/admin/audit-logs?${query}`, {
      headers: getAuthHeaders(),
      credentials: "include"
    });
    return handleResponse(res);
  },

  // 11. Platform Settings
  getSettings: async () => {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      headers: getAuthHeaders(),
      credentials: "include"
    });
    return handleResponse(res);
  },

  updateSettings: async (settingsData) => {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(settingsData),
      credentials: "include"
    });
    return handleResponse(res);
  }
};
