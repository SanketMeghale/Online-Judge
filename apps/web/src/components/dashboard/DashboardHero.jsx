import { useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Target
} from "lucide-react";
import { getUserDisplayName } from "../../auth/displayName.js";

export default function DashboardHero({
  user,
  liveUser,
  continueProblem = null,
  dailyChallenge = null
}) {
  const prefersReducedMotion = useReducedMotion();
  const navigate = useNavigate();

  // Local time greeting
  const currentHour = new Date().getHours();
  const timeGreeting = useMemo(() => {
    if (currentHour < 12) return "Good morning";
    if (currentHour < 18) return "Good afternoon";
    return "Good evening";
  }, [currentHour]);

  // Authentic user display name
  const displayName = useMemo(() => {
    const raw = getUserDisplayName(liveUser || user);
    return String(raw).trim().split(" ")[0] || "User";
  }, [liveUser, user]);

  // Dynamic continue problem URL
  const continueUrl = continueProblem?.id ? `/problems/${continueProblem.id}` : "/problems";
  const continueTitle = continueProblem?.title || "Continue Solving";

  // Dynamic daily challenge URL
  const dailyUrl = dailyChallenge?.id ? `/problems/${dailyChallenge.id}` : "/problems";
  const isDailySolved = dailyChallenge?.solved || false;

  // Keyboard shortcut listener: Cmd/Ctrl + Enter to trigger Daily Challenge
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        navigate(dailyUrl);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dailyUrl, navigate]);

  return (
    <section className="dash-hero" aria-label="Welcome section">
      <div className="dash-hero-bg" aria-hidden="true">
        <div className="dash-hero-grid" />
        <div className="dash-hero-radial" />
      </div>

      <div className="dash-hero-layout">
        <div className="dash-hero-left">
          <div className="dash-hero-badge">
            <span className="dash-badge-dot" aria-hidden="true" />
            <span>YOUR CODING ARENA</span>
          </div>

          <h1 className="dash-hero-title">
            <span>{timeGreeting}, </span>
            <span className="dash-user-name">{displayName}.</span>
            <span className="dash-wave"> 👋</span>
          </h1>

          <p className="dash-hero-sub">
            Pick up where you left off or solve today's challenge.
          </p>
        </div>

        <div className="dash-hero-actions">
          <Link
            to={continueUrl}
            className="dash-btn-primary"
            aria-label={`Continue solving ${continueTitle}`}
          >
            <span>{continueProblem?.title ? "Continue problem" : "Start solving"}</span>
            <ArrowRight size={15} className="arrow-icon" aria-hidden="true" />
          </Link>

          <Link
            to={dailyUrl}
            className="dash-btn-secondary"
            aria-label="View daily challenge"
          >
            {isDailySolved ? (
              <CheckCircle2 size={15} className="dash-action-success" aria-hidden="true" />
            ) : (
              <Target size={15} aria-hidden="true" />
            )}
            <span>{isDailySolved ? "Daily solved" : "Daily challenge"}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
