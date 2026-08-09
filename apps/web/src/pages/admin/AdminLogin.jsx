import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from "lucide-react";
import { useAuth } from "../../auth/AuthContext.jsx";
import "../../styles/admin/adminLogin.css";

export default function AdminLogin() {
  const { login, loginGoogle, loginGitHub, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(location.state?.error || "");

  // If already authenticated and admin, auto redirect to /admin/dashboard
  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!identifier.trim() || !password) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const trimmed = identifier.trim();
      const res = await login({
        username: trimmed,
        email: trimmed,
        identifier: trimmed,
        emailOrUsername: trimmed,
        password
      });

      const loggedUser = res?.user || user;
      if (loggedUser?.role !== "admin") {
        setErrorMessage("You don't have administrator access. Standard user accounts are prohibited.");
      } else {
        navigate("/admin/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("[AdminLogin error]:", err);
      setErrorMessage(err.message || "Invalid administrator credentials.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleAdminLogin() {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const res = await loginGoogle();
      const loggedUser = res?.user || user;
      if (loggedUser?.role !== "admin") {
        setErrorMessage("You don't have administrator access. Standard accounts cannot access Admin.");
      } else {
        navigate("/admin/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("[Admin Google Login error]:", err);
      setErrorMessage(err.message || "Google administrator authentication failed.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGitHubAdminLogin() {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const res = await loginGitHub();
      const loggedUser = res?.user || user;
      if (loggedUser?.role !== "admin") {
        setErrorMessage("You don't have administrator access. Standard accounts cannot access Admin.");
      } else {
        navigate("/admin/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("[Admin GitHub Login error]:", err);
      setErrorMessage(err.message || "GitHub administrator authentication failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-login-icon">
            <ShieldCheck size={26} color="#fff" />
          </div>
          <h1 className="admin-login-title">Judgo Admin</h1>
          <p className="admin-login-subtitle">Secure Platform Management &amp; Control</p>
        </div>

        {errorMessage && (
          <div className="admin-error-box">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-form-group">
            <label className="admin-form-label">Administrator Account</label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="sanket@example.com or admin username"
                required
                className="admin-form-input"
                style={{ width: "100%", paddingLeft: "38px" }}
              />
              <Mail
                size={16}
                color="#64748b"
                style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Admin Security Key / Password</label>
            <div style={{ position: "relative" }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="admin-form-input"
                style={{ width: "100%", paddingLeft: "38px" }}
              />
              <Lock
                size={16}
                color="#64748b"
                style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !identifier.trim() || !password}
            className="admin-btn admin-btn-primary"
            style={{ padding: "12px", marginTop: "6px", width: "100%", opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? (
              <span>Verifying Credentials...</span>
            ) : (
              <>
                <span>Sign in to Control Center</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "4px 0" }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
          <span style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase" }}>or OAuth Admin</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <button
            type="button"
            onClick={handleGoogleAdminLogin}
            disabled={isLoading}
            className="admin-btn admin-btn-secondary"
            style={{ padding: "10px", fontSize: "0.78rem" }}
          >
            Google Admin
          </button>
          <button
            type="button"
            onClick={handleGitHubAdminLogin}
            disabled={isLoading}
            className="admin-btn admin-btn-secondary"
            style={{ padding: "10px", fontSize: "0.78rem" }}
          >
            GitHub Admin
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: "8px" }}>
          <Link
            to="/dashboard"
            style={{ fontSize: "0.76rem", color: "#94a3b8", textDecoration: "none", transition: "color 0.15s" }}
            onMouseEnter={(e) => (e.target.style.color = "#c084fc")}
            onMouseLeave={(e) => (e.target.style.color = "#94a3b8")}
          >
            ← Return to Standard Coding Platform
          </Link>
        </div>
      </div>
    </div>
  );
}
