import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
  User
} from "lucide-react";
import { useAuth } from "../auth/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    identifier: "",
    password: "",
    rememberMe: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const redirectTo =
    location.state?.from?.pathname && location.state.from.pathname !== "/"
      ? location.state.from.pathname
      : "/dashboard";

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (error) setError("");
  }

  function handleKeyDown(e) {
    if (e.getModifierState) {
      setCapsLockActive(e.getModifierState("CapsLock"));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.identifier.trim()) {
      setError("Please enter your email address or username.");
      return;
    }

    if (!form.password) {
      setError("Please enter your password.");
      return;
    }

    setIsSubmitting(true);

    try {
      await login({
        email: form.identifier.trim(),
        username: form.identifier.trim(),
        password: form.password
      });
      navigate(redirectTo, { replace: true });
    } catch (authError) {
      setError(authError.message || "Invalid credentials. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSocialLogin(provider) {
    // Quick demo / social placeholder with feedback
    setError("");
    setIsSubmitting(true);
    setTimeout(async () => {
      try {
        await login({
          email: `coder_${provider.toLowerCase()}@judgo.dev`,
          username: `coder_${provider.toLowerCase()}`,
          password: "password123"
        });
        navigate(redirectTo, { replace: true });
      } catch (err) {
        setError(`Failed to connect with ${provider}.`);
      } finally {
        setIsSubmitting(false);
      }
    }, 600);
  }

  return (
    <div className={`auth-glass-panel ${error ? "verdict-shake-wa" : ""}`}>
      {/* Mobile Branding Header */}
      <div className="auth-mobile-header">
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div className="auth-logo-box" style={{ width: "44px", height: "44px" }}>
            <img src="/logo.png" alt="Judgo Logo" />
          </div>
          <span className="auth-brand-name" style={{ fontSize: "1.25rem" }}>Judgo</span>
        </Link>
      </div>

      {/* Header */}
      <div className="auth-card-header">
        <h2>Welcome Back</h2>
        <p>Sign in to your Judgo developer workspace.</p>
      </div>

      {/* Social Login Grid */}
      <div className="auth-social-grid">
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => handleSocialLogin("Google")}
          className="auth-social-btn"
          disabled={isSubmitting}
        >
          <svg viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
            />
          </svg>
          Google
        </motion.button>

        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => handleSocialLogin("GitHub")}
          className="auth-social-btn"
          disabled={isSubmitting}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
          GitHub
        </motion.button>

        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => handleSocialLogin("Discord")}
          className="auth-social-btn"
          disabled={isSubmitting}
        >
          <svg viewBox="0 0 24 24" fill="#5865F2">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
          </svg>
          Discord
        </motion.button>
      </div>

      {/* Divider */}
      <div className="auth-divider">
        <span>or continue with email</span>
      </div>

      {/* Error Alert Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="auth-alert-banner error"
        >
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Form */}
      <form className="auth-form-stack" onSubmit={handleSubmit} noValidate>
        {/* Email or Username */}
        <div className="auth-field-group">
          <label style={{ fontSize: "0.82rem", fontWeight: "600", color: "#cbd5e1" }}>
            Email or Username
          </label>
          <div
            className={`auth-input-container ${focusedField === "identifier" ? "focused" : ""} ${
              form.identifier ? "valid" : ""
            }`}
          >
            <span className="auth-input-icon">
              {form.identifier.includes("@") ? <Mail size={18} /> : <User size={18} />}
            </span>
            <input
              type="text"
              name="identifier"
              className="auth-input-field"
              placeholder="name@company.com or username"
              value={form.identifier}
              onChange={(e) => updateField("identifier", e.target.value)}
              onFocus={() => setFocusedField("identifier")}
              onBlur={() => setFocusedField(null)}
              autoComplete="username"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="auth-field-group">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={{ fontSize: "0.82rem", fontWeight: "600", color: "#cbd5e1" }}>
              Password
            </label>
            <Link to="/forgot-password" className="auth-link">
              Forgot Password?
            </Link>
          </div>
          <div
            className={`auth-input-container ${focusedField === "password" ? "focused" : ""} ${
              form.password.length >= 6 ? "valid" : ""
            }`}
          >
            <span className="auth-input-icon">
              <LockKeyhole size={18} />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className="auth-input-field"
              placeholder="Enter your account password"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              onKeyDown={handleKeyDown}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((prev) => !prev)}
              className="auth-field-action-btn"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Caps Lock Indicator */}
          {capsLockActive && (
            <div className="caps-lock-warning">
              <AlertTriangle size={13} />
              <span>Caps Lock is ON</span>
            </div>
          )}
        </div>

        {/* Remember Me Checkbox */}
        <div className="auth-options-row">
          <label className="auth-checkbox-label">
            <span
              className={`auth-checkbox-custom ${form.rememberMe ? "checked" : ""}`}
              onClick={() => updateField("rememberMe", !form.rememberMe)}
            >
              {form.rememberMe && <Check size={12} strokeWidth={3} />}
            </span>
            <span onClick={() => updateField("rememberMe", !form.rememberMe)}>
              Remember this device for 30 days
            </span>
          </label>
        </div>

        {/* Primary Submit Button */}
        <motion.button
          whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
          type="submit"
          className="auth-submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="auth-btn-spinner" />
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight size={18} />
            </>
          )}
        </motion.button>
      </form>

      {/* Switch to Register */}
      <div className="auth-switch-footer">
        Don't have an account?{" "}
        <Link to="/register" className="auth-link">
          <strong>Create an Account</strong>
        </Link>
      </div>
    </div>
  );
}
