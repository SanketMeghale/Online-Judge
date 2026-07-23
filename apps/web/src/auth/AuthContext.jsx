import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearStoredSession, readStoredSession, writeStoredSession } from "./authStorage.js";
import { loginWithEmail, refreshCurrentSession, registerWithEmail } from "./authService.js";
import { useAppData } from "../data/AppDataContext.jsx";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { refreshDatabase } = useAppData();
  const [session, setSession] = useState(() => readStoredSession());
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let isMounted = true;

    async function refreshSession() {
      refreshDatabase();
      const storedSession = readStoredSession();

      if (!storedSession) {
        if (isMounted) {
          setSession(null);
          setStatus("idle");
        }
        return;
      }

      try {
        const nextSession = await refreshCurrentSession(storedSession);

        if (!isMounted) {
          return;
        }

        if (nextSession) {
          writeStoredSession(nextSession);
          setSession(nextSession);
        } else {
          clearStoredSession();
          setSession(null);
        }
      } catch {
        clearStoredSession();
        if (isMounted) {
          setSession(null);
        }
      } finally {
        if (isMounted) {
          setStatus("idle");
        }
      }
    }

    refreshSession();

    return () => {
      isMounted = false;
    };
  }, []);

  async function login(credentials) {
    const nextSession = await loginWithEmail(credentials);
    refreshDatabase();
    writeStoredSession(nextSession);
    setSession(nextSession);
    return nextSession;
  }

  async function register(details) {
    const nextSession = await registerWithEmail(details);
    refreshDatabase();
    writeStoredSession(nextSession);
    setSession(nextSession);
    return nextSession;
  }

  function logout() {
    clearStoredSession();
    setSession(null);
  }

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(session?.accessToken),
      isCheckingSession: status === "checking",
      session,
      user: session?.user ?? null,
      login,
      logout,
      register
    }),
    [session, status]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return value;
}
