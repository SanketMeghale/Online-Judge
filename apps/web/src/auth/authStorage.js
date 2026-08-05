const AUTH_STORAGE_KEY = "online-judge-auth";

const DEFAULT_DEMO_SESSION = {
  accessToken: "demo-token",
  refreshToken: "demo-refresh-token",
  user: {
    id: "u-demo-1",
    name: "Sanket Meghale",
    username: "sanket.codes",
    email: "sanket@onlinejudge.com",
    role: "candidate",
    ranking: 87,
    xp: 8420,
    streak: 5,
    solved: 3,
    accuracy: 72,
    badges: ["7 Day Streak", "Graph Sprinter", "Contest Finisher"],
    solvedProblemIds: ["two-sum"],
    attemptedProblemIds: ["cache-stampede", "binary-lift"],
    stats: {
      activeDays: 41,
      totalSubmissions: 4,
      acceptedSubmissions: 1
    }
  }
};

export function readStoredSession() {
  try {
    const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!rawSession) {
      // Auto seed demo session so user immediately sees the Judgo Dashboard UI
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEFAULT_DEMO_SESSION));
      return DEFAULT_DEMO_SESSION;
    }
    return JSON.parse(rawSession);
  } catch {
    return DEFAULT_DEMO_SESSION;
  }
}

export function writeStoredSession(session) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}
