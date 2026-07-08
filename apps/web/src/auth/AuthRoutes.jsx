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
    <main className="auth-page">
      <section className="auth-card auth-loading-card">
        <span className="section-kicker">Session</span>
        <h1>Checking your session...</h1>
      </section>
    </main>
  );
}
