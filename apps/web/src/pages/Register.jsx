import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, AtSign, Mail, UserRound, LockKeyhole } from "lucide-react";
import { useAuth } from "../auth/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      await register(form);
      navigate("/", { replace: true });
    } catch (authError) {
      setError(authError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-card auth-card-wide">
      <span className="section-kicker">Join the arena</span>
      <h1>Create your coder profile.</h1>
      <form className="form-grid two-column-form" onSubmit={handleSubmit}>
        <label>
          Full name
          <span className="input-shell">
            <UserRound size={17} />
            <input
              autoComplete="name"
              name="name"
              onChange={updateField}
              placeholder="Nadia Rao"
              type="text"
              value={form.name}
            />
          </span>
        </label>
        <label>
          Username
          <span className="input-shell">
            <AtSign size={17} />
            <input
              autoComplete="username"
              name="username"
              onChange={updateField}
              placeholder="nadia.codes"
              type="text"
              value={form.username}
            />
          </span>
        </label>
        <label>
          Email
          <span className="input-shell">
            <Mail size={17} />
            <input
              autoComplete="email"
              name="email"
              onChange={updateField}
              placeholder="you@example.com"
              type="email"
              value={form.email}
            />
          </span>
        </label>
        <label>
          Password
          <span className="input-shell">
            <LockKeyhole size={17} />
            <input
              autoComplete="new-password"
              name="password"
              onChange={updateField}
              placeholder="Create password"
              type="password"
              value={form.password}
            />
          </span>
        </label>
        {error ? <p className="form-error form-span">{error}</p> : null}
        <button className="button button-primary button-large form-span" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Creating account..." : "Register"}
          <ArrowRight size={18} />
        </button>
      </form>
      <p className="auth-switch">
        Already registered? <Link to="/login">Log in</Link>
      </p>
    </section>
  );
}
