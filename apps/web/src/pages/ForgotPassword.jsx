import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Mail,
  RotateCcw,
  Sparkles
} from "lucide-react";
import { JudgoLogo } from "../components/layout/JudgoLogo.jsx";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  function validateEmail(val) {
    return String(val)
      .toLowerCase()
      .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call to send recovery link
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSuccess(true);
      setResendTimer(45);

      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.message || "Failed to send reset link. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-glass-panel">
      {/* Mobile Branding Header */}
      <div className="auth-mobile-header">
        <Link to="/" style={{ textDecoration: "none", display: "inline-flex" }}>
          <JudgoLogo size={32} wordmarkHeight={20} showDivider={true} animated={true} />
        </Link>
      </div>

      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="forgot-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="auth-card-header">
              <h2>Reset Password</h2>
              <p>Enter your registered email and we'll send you an instant reset link.</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="auth-alert-banner error"
              >
                <span>{error}</span>
              </motion.div>
            )}

            <form className="auth-form-stack" onSubmit={handleSubmit}>
              <div className="auth-field-group">
                <label className="auth-field-label">
                  Email Address
                </label>
                <div className={`auth-input-container ${focusedField ? "focused" : ""} ${error ? "error" : email && validateEmail(email) ? "valid" : ""}`}>
                  <span className="auth-input-icon">
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    className="auth-input-field"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    onFocus={() => setFocusedField(true)}
                    onBlur={() => setFocusedField(false)}
                    autoComplete="email"
                    autoFocus
                  />
                  {email && validateEmail(email) && (
                    <span style={{ position: "absolute", right: "14px", color: "#10b981", display: "flex" }}>
                      <CheckCircle2 size={16} />
                    </span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="auth-btn-spinner" />
                    <span>Sending Link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-switch-footer">
              <Link to="/login" className="auth-link" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <ArrowLeft size={15} />
                Back to Sign In
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="forgot-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="auth-recovery-success"
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="auth-mail-icon-bubble"
            >
              <Mail size={32} />
            </motion.div>

            <div>
              <h2 style={{ fontSize: "1.45rem", fontWeight: "800", color: "#fff", margin: "0 0 6px 0" }}>
                Check your inbox
              </h2>
              <p style={{ fontSize: "0.9rem", color: "#94a3b8", lineHeight: 1.5, margin: 0, maxWidth: "340px" }}>
                We've sent a password reset link to <strong style={{ color: "#00c3ff" }}>{email}</strong>. Please check your spam folder if it doesn't arrive within 2 minutes.
              </p>
            </div>

            <div style={{ width: "100%", marginTop: "8px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={resendTimer > 0 || isSubmitting}
                className="auth-social-btn"
                style={{ width: "100%", justifyContent: "center", padding: "12px" }}
              >
                <RotateCcw size={16} />
                {resendTimer > 0 ? `Resend Link in ${resendTimer}s` : "Resend Link"}
              </button>

              <Link
                to="/login"
                className="auth-submit-btn"
                style={{ textDecoration: "none", textAlign: "center" }}
              >
                Back to Sign In
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
