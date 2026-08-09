import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CheckCircle2, Target } from "lucide-react";
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

  // Blinking cursor state
  const [cursorVisible, setCursorVisible] = useState(true);
  useEffect(() => {
    if (prefersReducedMotion) return;
    const interval = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 530);
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

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
    <motion.section
      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="dash-hero"
      aria-label="Welcome section"
    >
      {/* Background Subtle Gradient & Grid */}
      <div className="dash-hero-bg" aria-hidden="true">
        <div className="dash-hero-grid" />
        <div className="dash-hero-radial" />

        <span className="dash-hero-glyph glyph-tag">&lt;/&gt;</span>
        <span className="dash-hero-glyph glyph-bracket">&#123; &#125;</span>
        <span className="dash-hero-glyph glyph-arrow">=&gt;</span>
        <span className="dash-hero-glyph glyph-underscore">_</span>
      </div>

      {/* Main 2-Column Hero Content */}
      <div className="dash-hero-layout">
        {/* LEFT COLUMN: Personalized Welcome & Actions */}
        <div className="dash-hero-left">
          {/* Eyebrow */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="dash-hero-badge"
          >
            <span className="dash-badge-dot" aria-hidden="true" />
            <span>YOUR CODING ARENA</span>
          </motion.div>

          {/* Heading Greeting */}
          <motion.h1
            initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="dash-hero-title"
          >
            <span>{timeGreeting}, </span>
            <span className="dash-user-name">{displayName}.</span>
            <span className="dash-wave"> 👋</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.18 }}
            className="dash-hero-sub"
          >
            Ready to level up your algorithmic skills today?
            <br />
            Keep your streak alive and tackle today's curated challenges.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.25 }}
            className="dash-hero-actions"
          >
            <Link
              to={continueUrl}
              className="dash-btn-primary"
              aria-label={`Continue solving ${continueTitle}`}
            >
              <span>Continue: {continueProblem?.title ? continueProblem.title : "Solving"}</span>
              <ArrowRight size={15} className="arrow-icon" aria-hidden="true" />
            </Link>

            <Link
              to={dailyUrl}
              className="dash-btn-secondary"
              aria-label="View daily challenge"
              style={{
                borderColor: isDailySolved ? "rgba(16, 185, 129, 0.4)" : undefined,
                color: isDailySolved ? "#34d399" : undefined
              }}
            >
              {isDailySolved ? (
                <CheckCircle2 size={15} style={{ color: "#34d399" }} aria-hidden="true" />
              ) : (
                <Target size={15} style={{ color: "#60a5fa" }} aria-hidden="true" />
              )}
              <span>{isDailySolved ? "Daily Challenge (Solved)" : "Daily Challenge"}</span>
              <span className="dash-kbd" aria-hidden="true">⌘ Enter</span>
            </Link>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Futuristic Glassmorphism Code Terminal Visual */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
          animate={
            prefersReducedMotion
              ? { opacity: 1, scale: 1 }
              : { opacity: 1, scale: 1, y: [0, -4, 0] }
          }
          transition={
            prefersReducedMotion
              ? { duration: 0.4, delay: 0.2 }
              : { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }
          }
          className="dash-hero-right"
          aria-hidden="true"
        >
          <div className="dash-editor-glow" />
          <div className="dash-code-window">
            {/* Terminal Header */}
            <div className="dash-code-header">
              <div className="dash-code-dots">
                <span className="dash-dot dot-close" />
                <span className="dash-dot dot-minimize" />
                <span className="dash-dot dot-maximize" />
              </div>
              <span className="dash-code-filename">judgo_engine.cpp</span>
              <span className="dash-code-tag">C++20</span>
            </div>

            {/* Code Body */}
            <div className="dash-code-body">
              <div className="code-line">
                <span className="code-ln">1</span>
                <span className="syn-kw">template</span> &lt;<span className="syn-kw">typename</span> <span className="syn-type">T</span>&gt;
              </div>
              <div className="code-line">
                <span className="code-ln">2</span>
                <span className="syn-kw">class</span> <span className="syn-fn">JudgoArena</span> &#123;
              </div>
              <div className="code-line indent">
                <span className="code-ln">3</span>
                <span className="syn-kw">public</span>:
              </div>
              <div className="code-line indent-2">
                <span className="code-ln">4</span>
                <span className="syn-kw">auto</span> <span className="syn-fn">evaluate</span>(<span className="syn-type">T</span>&amp; sol) &#123;
              </div>
              <div className="code-line indent-2">
                <span className="code-ln">5</span>
                &nbsp;&nbsp;<span className="syn-kw">return</span> sol.<span className="syn-fn">solve</span>();
              </div>
              <div className="code-line indent">
                <span className="code-ln">6</span>
                &#125;
              </div>
              <div className="code-line">
                <span className="code-ln">7</span>
                &#125;;
                {cursorVisible && <span className="syn-cursor">|</span>}
              </div>
            </div>

            {/* Terminal Footer */}
            <div className="dash-code-footer">
              <div className="dash-code-status">
                <span className="status-ping-dot" />
                <span>JUDGE ONLINE</span>
              </div>
              <span className="dash-latency-badge">&lt; 15ms</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
