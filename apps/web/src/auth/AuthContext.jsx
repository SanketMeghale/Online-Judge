import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/apiClient.js";
import { clearStoredSession, readStoredSession, writeStoredSession } from "./authStorage.js";
import { loginWithEmail, loginWithGoogle, loginWithGitHub, refreshCurrentSession, registerWithEmail } from "./authService.js";
import { useAppData } from "../data/AppDataContext.jsx";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { refreshDatabase, updateDatabase } = useAppData();
  const [session, setSession] = useState(() => readStoredSession());
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let isMounted = true;

    async function refreshSession() {
      refreshDatabase();
      const storedSession = readStoredSession();

      if (!storedSession || (!storedSession.accessToken && !storedSession.token)) {
        if (isMounted) {
          setSession(null);
          setStatus("idle");
        }
        return;
      }

      try {
        const nextSession = await refreshCurrentSession(storedSession);

        if (!isMounted) return;

        if (nextSession && nextSession.user) {
          writeStoredSession(nextSession);
          setSession(nextSession);

          // Synchronize user into database.users
          updateDatabase((current) => {
            const uid = String(nextSession.user.id || nextSession.user._id || "");
            const exists = current.users?.some((u) => String(u.id) === uid || String(u._id) === uid);
            if (exists) {
              return {
                ...current,
                users: current.users.map((u) =>
                  String(u.id) === uid || String(u._id) === uid ? { ...u, ...nextSession.user } : u
                )
              };
            }
            return {
              ...current,
              users: [...(current.users || []), nextSession.user]
            };
          });
        } else {
          clearStoredSession();
          setSession(null);
        }
      } catch (err) {
        console.warn("[AuthContext refresh error]:", err);
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

    if (nextSession?.user) {
      updateDatabase((current) => {
        const uid = String(nextSession.user.id || nextSession.user._id || "");
        const exists = current.users?.some((u) => String(u.id) === uid || String(u._id) === uid);
        if (exists) {
          return {
            ...current,
            users: current.users.map((u) =>
              String(u.id) === uid || String(u._id) === uid ? { ...u, ...nextSession.user } : u
            )
          };
        }
        return {
          ...current,
          users: [...(current.users || []), nextSession.user]
        };
      });
    }

    return nextSession;
  }

  async function loginGoogle() {
    const nextSession = await loginWithGoogle();
    refreshDatabase();
    writeStoredSession(nextSession);
    setSession(nextSession);

    if (nextSession?.user) {
      updateDatabase((current) => {
        const uid = String(nextSession.user.id || nextSession.user._id || "");
        const exists = current.users?.some((u) => String(u.id) === uid || String(u._id) === uid);
        if (exists) {
          return {
            ...current,
            users: current.users.map((u) =>
              String(u.id) === uid || String(u._id) === uid ? { ...u, ...nextSession.user } : u
            )
          };
        }
        return {
          ...current,
          users: [...(current.users || []), nextSession.user]
        };
      });
    }

    return nextSession;
  }

  async function loginGitHub() {
    const nextSession = await loginWithGitHub();
    refreshDatabase();
    writeStoredSession(nextSession);
    setSession(nextSession);

    if (nextSession?.user) {
      updateDatabase((current) => {
        const uid = String(nextSession.user.id || nextSession.user._id || "");
        const exists = current.users?.some((u) => String(u.id) === uid || String(u._id) === uid);
        if (exists) {
          return {
            ...current,
            users: current.users.map((u) =>
              String(u.id) === uid || String(u._id) === uid ? { ...u, ...nextSession.user } : u
            )
          };
        }
        return {
          ...current,
          users: [...(current.users || []), nextSession.user]
        };
      });
    }

    return nextSession;
  }

  async function register(details) {
    const nextSession = await registerWithEmail(details);
    refreshDatabase();
    writeStoredSession(nextSession);
    setSession(nextSession);

    if (nextSession?.user) {
      updateDatabase((current) => {
        const uid = String(nextSession.user.id || nextSession.user._id || "");
        const exists = current.users?.some((u) => String(u.id) === uid || String(u._id) === uid);
        if (exists) {
          return {
            ...current,
            users: current.users.map((u) =>
              String(u.id) === uid || String(u._id) === uid ? { ...u, ...nextSession.user } : u
            )
          };
        }
        return {
          ...current,
          users: [...(current.users || []), nextSession.user]
        };
      });
    }

    return nextSession;
  }

  async function logout() {
    try {
      await api.logout();
    } catch {}
    clearStoredSession();
    setSession(null);
  }

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(session?.accessToken || session?.token),
      isCheckingSession: status === "checking",
      session,
      user: session?.user ?? null,
      login,
      loginGoogle,
      loginGitHub,
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
