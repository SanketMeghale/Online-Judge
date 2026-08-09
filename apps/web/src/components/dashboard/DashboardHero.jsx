import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CheckCircle2, Sparkles, Target } from "lucide-react";

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

  // Authentic user display name (updates dynamically from profile/settings)
  const displayName = useMemo(() => {
    const raw = liveUser?.name || liveUser?.username || user?.name || user?.username || "Coder";
    return String(raw).trim().split(" ")[0] || "Coder";
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

          {/* Two Action Buttons */}
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

        {/* RIGHT COLUMN: Futuristic Mini Terminal Visual */}
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
          <div className="dash-hero-visual-card">
            {/* Terminal Window Header */}
            <div className="dash-terminal-header">
              <div className="dash-terminal-dots">
                <span className="dot dot-red" />
                <span className="dot dot-yellow" />
                <span className="dot dot-green" />
              </div>
              <span className="dash-terminal-title">judgo_engine.cpp</span>
              <span className="dash-terminal-lang">C++20</span>
            </div>

            {/* Terminal Code Snippet */}
            <div className="dash-terminal-code">
              <div className="code-line">
                <span className="ln">1</span>
                <span className="keyword">template</span>&lt;<span className="keyword">typename</span> T&gt;
              </div>
              <div className="code-line">
                <span className="ln">2</span>
                <span className="keyword">class</span> <span className="entity">JudgoArena</span> &#123;
              </div>
              <div className="code-line indent-1">
                <span className="ln">3</span>
                <span className="keyword">public</span>:
              </div>
              <div className="code-line indent-2">
                <span className="ln">4</span>
                <span className="keyword">auto</span> <span className="func">evaluate</span>(T&amp; sol) &#123;
              </div>
              <div className="code-line indent-3">
                <span className="ln">5</span>
                <span className="keyword">return</span> sol.<span className="func">solve</span>();
              </div>
              <div className="code-line indent-2">
                <span className="ln">6</span>
                &#125;
              </div>
              <div className="code-line">
                <span className="ln">7</span>
                &#125;;
              </div>
            </div>

            {/* Terminal Live Status Footer */}
            <div className="dash-terminal-footer">
              <div className="dash-status-indicator">
                <span className="dash-status-dot" />
                <span className="dash-status-text">JUDGE ONLINE</span>
              </div>
              <div className="dash-speed-badge">
                <span className="dash-speed-label">LATENCY</span>
                <span className="dash-speed-value">&lt; 15ms</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
