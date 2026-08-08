const AUTH_STORAGE_KEY = "online-judge-auth";

export function readStoredSession() {
  try {
    const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!rawSession) {
      return null;
    }
    const parsed = JSON.parse(rawSession);
    if (parsed && (parsed.accessToken || parsed.token)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function writeStoredSession(session) {
  if (!session) {
    clearStoredSession();
    return;
  }
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
  try {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("user");
  } catch {}
}
