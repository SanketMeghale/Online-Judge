import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Mail, LockKeyhole } from "lucide-react";
import { useAuth } from "../auth/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectTo = location.state?.from?.pathname && location.state.from.pathname !== "/" ? location.state.from.pathname : "/dashboard";

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(form);
      navigate(redirectTo, { replace: true });
    } catch (authError) {
      setError(authError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.96, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`auth-card ${error ? "verdict-shake-wa" : ""}`}
    >
      <span className="section-kicker">Welcome back</span>
      <h1>Log in to continue solving.</h1>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Email or Username
          <span className="input-shell">
            <Mail size={17} />
            <input
              autoComplete="username"
              name="email"
              onChange={updateField}
              placeholder="Enter your email or username"
              type="text"
              value={form.email}
              required
            />
          </span>
        </label>
        <label>
          Password
          <span className="input-shell">
            <LockKeyhole size={17} />
            <input
              autoComplete="current-password"
              name="password"
              onChange={updateField}
              placeholder="Enter password"
              type="password"
              value={form.password}
            />
          </span>
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button className="button button-primary button-large" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Signing in..." : "Login"}
          <ArrowRight size={18} />
        </button>
      </form>
      <p className="auth-switch">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </motion.section>
  );
}
