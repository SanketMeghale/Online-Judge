import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  AtSign,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
  UserRound,
  X
} from "lucide-react";
import { useAuth } from "../auth/AuthContext.jsx";

export default function Register() {
  const { register, loginGoogle, loginGitHub } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (error) setError("");
  }

  function handleKeyDown(e) {
    if (e.getModifierState) {
      setCapsLockActive(e.getModifierState("CapsLock"));
    }
  }

  // Password Requirements Verification
  const requirements = useMemo(() => {
    const pwd = form.password || "";
    return {
      hasLength: pwd.length >= 12,
      hasUpper: /[A-Z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)
    };
  }, [form.password]);

  // Password Strength Score (0 to 4)
  const strengthScore = useMemo(() => {
    let score = 0;
    if (requirements.hasLength) score++;
    if (requirements.hasUpper) score++;
    if (requirements.hasNumber) score++;
    if (requirements.hasSpecial) score++;
    return score;
  }, [requirements]);

  const strengthLabels = ["Weak", "Fair", "Good", "Strong", "Excellent"];
  const strengthClasses = ["weak", "fair", "good", "strong", "strong"];

  // Email Validation
  const isValidEmail = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email || "");
  }, [form.email]);

  // Passwords Match Check
  const passwordsMatch = useMemo(() => {
    return form.password && form.confirmPassword && form.password === form.confirmPassword;
  }, [form.password, form.confirmPassword]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!form.username.trim()) {
      setError("Please choose a username.");
      return;
    }

    if (!form.email.trim() || !isValidEmail) {
      setError("Please enter a valid email address.");
      return;
    }

    if (strengthScore < 2) {
      setError("Please create a stronger password with at least 12 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!form.agreeTerms) {
      setError("You must agree to the Terms of Service & Privacy Policy.");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        name: form.name.trim(),
        username: form.username.trim().toLowerCase(),
        email: form.email.trim().toLowerCase(),
        password: form.password
      });
      navigate("/dashboard", { replace: true });
    } catch (authError) {
      setError(authError.message || "Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSocialSignup(provider) {
    setError("");
    setIsSubmitting(true);
    try {
      if (provider === "Google") {
        await loginGoogle();
      } else if (provider === "GitHub") {
        await loginGitHub();
      } else {
        throw new Error("Unsupported identity provider.");
      }
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (err?.code === "auth/popup-closed-by-user" || err?.message?.includes("closed-by-user")) {
        return;
      }
      if (err?.code === "auth/popup-blocked" || err?.message?.includes("popup-blocked")) {
        setError("Sign-up popup was blocked by your browser. Please allow popups for this site.");
        return;
      }
      if (err?.code === "auth/unauthorized-domain" || err?.message?.includes("unauthorized-domain")) {
        setError("This domain is not authorized in Firebase Auth. Please verify Authorized Domains in Firebase Console.");
        return;
      }
      if (err?.code === "auth/network-request-failed" || err?.message?.includes("network-request-failed")) {
        setError("Network error during authentication. Please check your internet connection.");
        return;
      }
      setError(err.message || `Failed to sign up with ${provider}.`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={`auth-glass-panel panel-wide ${error ? "verdict-shake-wa" : ""}`}>
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
        <h2>Create Your Account</h2>
        <p>Join 50,000+ engineers mastering algorithms and landing tier-1 roles.</p>
      </div>

      {/* Social Login Grid */}
      <div className="auth-social-grid">
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => handleSocialSignup("Google")}
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
          onClick={() => handleSocialSignup("GitHub")}
          className="auth-social-btn"
          disabled={isSubmitting}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
          GitHub
        </motion.button>
      </div>

      {/* Divider */}
      <div className="auth-divider">
        <span>or sign up with email</span>
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
        {/* Name & Username Row */}
        <div className="auth-field-row two-col">
          {/* Full Name */}
          <div className="auth-field-group">
            <label className="auth-field-label">
              Full Name
            </label>
            <div
              className={`auth-input-container ${focusedField === "name" ? "focused" : ""} ${
                form.name ? "valid" : ""
              }`}
            >
              <span className="auth-input-icon">
                <UserRound size={18} />
              </span>
              <input
                type="text"
                name="name"
                className="auth-input-field"
                placeholder="Alex Morgan"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField(null)}
                autoComplete="name"
                required
              />
            </div>
          </div>

          {/* Username */}
          <div className="auth-field-group">
            <label className="auth-field-label">
              Username
            </label>
            <div
              className={`auth-input-container ${focusedField === "username" ? "focused" : ""} ${
                form.username.length >= 3 ? "valid" : ""
              }`}
            >
              <span className="auth-input-icon">
                <AtSign size={18} />
              </span>
              <input
                type="text"
                name="username"
                className="auth-input-field"
                placeholder="alex_dev"
                value={form.username}
                onChange={(e) => updateField("username", e.target.value.replace(/\s+/g, ""))}
                onFocus={() => setFocusedField("username")}
                onBlur={() => setFocusedField(null)}
                autoComplete="username"
                required
              />
              {form.username.length >= 3 && (
                <span style={{ position: "absolute", right: "12px", color: "#10b981", display: "flex" }}>
                  <CheckCircle2 size={16} />
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="auth-field-group">
          <label className="auth-field-label">
            Email Address
          </label>
          <div
            className={`auth-input-container ${focusedField === "email" ? "focused" : ""} ${
              isValidEmail ? "valid" : ""
            }`}
          >
            <span className="auth-input-icon">
              <Mail size={18} />
            </span>
            <input
              type="email"
              name="email"
              className="auth-input-field"
              placeholder="alex@company.com"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              autoComplete="email"
              required
            />
            {isValidEmail && (
              <span style={{ position: "absolute", right: "12px", color: "#10b981", display: "flex" }}>
                <CheckCircle2 size={16} />
              </span>
            )}
          </div>
        </div>

        {/* Password & Confirm Password Row */}
        <div className="auth-field-row two-col">
          {/* Password */}
          <div className="auth-field-group">
            <label className="auth-field-label">
              Password
            </label>
            <div
              className={`auth-input-container ${focusedField === "password" ? "focused" : ""} ${
                strengthScore >= 2 ? "valid" : ""
              }`}
            >
              <span className="auth-input-icon">
                <LockKeyhole size={18} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="auth-input-field"
                placeholder="Create password"
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                onKeyDown={handleKeyDown}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((prev) => !prev)}
                className="auth-field-action-btn"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="auth-field-group">
            <label className="auth-field-label">
              Confirm Password
            </label>
            <div
              className={`auth-input-container ${focusedField === "confirmPassword" ? "focused" : ""} ${
                passwordsMatch ? "valid" : ""
              }`}
            >
              <span className="auth-input-icon">
                <LockKeyhole size={18} />
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                className="auth-input-field"
                placeholder="Repeat password"
                value={form.confirmPassword}
                onChange={(e) => updateField("confirmPassword", e.target.value)}
                onFocus={() => setFocusedField("confirmPassword")}
                onBlur={() => setFocusedField(null)}
                onKeyDown={handleKeyDown}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="auth-field-action-btn"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>
        </div>

        {/* Caps Lock Indicator */}
        {capsLockActive && (
          <div className="caps-lock-warning">
            <AlertTriangle size={13} />
            <span>Caps Lock is ON</span>
          </div>
        )}

        {/* Password Strength Meter & Real-time Checklist */}
        {form.password.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="auth-strength-meter"
          >
            <div className="strength-bars">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={`strength-bar ${strengthScore > index ? `active ${strengthClasses[strengthScore]}` : ""}`}
                />
              ))}
            </div>

            <div className="strength-label-row">
              <span>Password strength:</span>
              <strong style={{ color: strengthScore >= 3 ? "#10b981" : strengthScore >= 2 ? "#3b82f6" : "#f59e0b" }}>
                {strengthLabels[strengthScore]}
              </strong>
            </div>

            {/* Checklist items */}
            <div className="auth-req-list">
              <div className={`auth-req-item ${requirements.hasLength ? "met" : ""}`}>
                <span className="auth-req-dot">
                  {requirements.hasLength ? <Check size={10} strokeWidth={3} /> : "•"}
                </span>
                <span>12+ characters</span>
              </div>
              <div className={`auth-req-item ${requirements.hasUpper ? "met" : ""}`}>
                <span className="auth-req-dot">
                  {requirements.hasUpper ? <Check size={10} strokeWidth={3} /> : "•"}
                </span>
                <span>Uppercase letter</span>
              </div>
              <div className={`auth-req-item ${requirements.hasNumber ? "met" : ""}`}>
                <span className="auth-req-dot">
                  {requirements.hasNumber ? <Check size={10} strokeWidth={3} /> : "•"}
                </span>
                <span>Number (0-9)</span>
              </div>
              <div className={`auth-req-item ${requirements.hasSpecial ? "met" : ""}`}>
                <span className="auth-req-dot">
                  {requirements.hasSpecial ? <Check size={10} strokeWidth={3} /> : "•"}
                </span>
                <span>Special character (!@#)</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Terms and Conditions Checkbox */}
        <div className="auth-options-row" style={{ marginTop: "4px" }}>
          <label className="auth-checkbox-label">
            <span
              className={`auth-checkbox-custom ${form.agreeTerms ? "checked" : ""}`}
              onClick={() => updateField("agreeTerms", !form.agreeTerms)}
            >
              {form.agreeTerms && <Check size={12} strokeWidth={3} />}
            </span>
            <span onClick={() => updateField("agreeTerms", !form.agreeTerms)} style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
              I agree to the <span style={{ color: "#cbd5e1", textDecoration: "underline" }}>Terms of Service</span> and <span style={{ color: "#cbd5e1", textDecoration: "underline" }}>Privacy Policy</span>
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
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight size={18} />
            </>
          )}
        </motion.button>
      </form>

      {/* Switch to Login */}
      <div className="auth-switch-footer">
        Already have an account?{" "}
        <Link to="/login" className="auth-link">
          <strong>Sign In</strong>
        </Link>
      </div>
    </div>
  );
}
