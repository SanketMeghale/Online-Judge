import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

export function RequireAuth() {
  const { isAuthenticated, isCheckingSession } = useAuth();
  const location = useLocation();

  if (isCheckingSession) {
    return <AuthLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { isAuthenticated, isCheckingSession } = useAuth();
  const location = useLocation();
  const fallbackPath = location.state?.from?.pathname ?? "/";

  if (isCheckingSession) {
    return <AuthLoading />;
  }

  if (isAuthenticated) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
}

function AuthLoading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-app, #050a18)",
        color: "var(--text-primary, #f8fafc)",
        fontFamily: "var(--font-family, sans-serif)"
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            border: "3px solid rgba(124, 58, 237, 0.2)",
            borderTopColor: "#7c3aed",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite"
          }}
        />
        <span style={{ fontSize: "0.9rem", color: "var(--text-muted, #94a3b8)", fontWeight: 500 }}>
          Loading your session…
        </span>
      </div>
    </div>
  );
}
