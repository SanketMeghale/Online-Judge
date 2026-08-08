import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Target } from "lucide-react";

export default function DashboardHero({ user, liveUser }) {
  const prefersReducedMotion = useReducedMotion();

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

  // Blinking cursor state
  const [cursorVisible, setCursorVisible] = useState(true);
  useEffect(() => {
    if (prefersReducedMotion) return;
    const interval = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 550);
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

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

        {/* Very subtle floating developer symbols around the right visual */}
        <span className="dash-hero-glyph glyph-tag">&lt;/&gt;</span>
        <span className="dash-hero-glyph glyph-bracket">&#123; &#125;</span>
        <span className="dash-hero-glyph glyph-arrow">=&gt;</span>
        <span className="dash-hero-glyph glyph-underscore">_</span>
      </div>

      {/* Main 2-Column Hero Content */}
      <div className="dash-hero-layout">
        {/* LEFT COLUMN: Personalized Welcome & Actions (65–68%) */}
        <div className="dash-hero-left">
          {/* Eyebrow */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="dash-hero-badge"
          >
            <span className="dash-badge-dot" aria-hidden="true" />
            <span>YOUR CODING JOURNEY CONTINUES</span>
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

          {/* Short 2-Line Subtitle */}
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.18 }}
            className="dash-hero-sub"
          >
            Ready to level up your coding skills today?
            <br />
            Keep your streak alive and tackle today's curated problems.
          </motion.p>

          {/* Exactly Two Action Buttons (44–46px) */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.25 }}
            className="dash-hero-actions"
          >
            <Link
              to="/problems/two-sum"
              className="dash-btn-primary"
              aria-label="Continue solving current challenge"
            >
              <span>Continue Solving</span>
              <ArrowRight size={15} className="arrow-icon" aria-hidden="true" />
            </Link>

            <Link
              to="/problems"
              className="dash-btn-secondary"
              aria-label="View daily challenge"
            >
              <Target size={15} style={{ color: "#60a5fa" }} aria-hidden="true" />
              <span>Daily Challenge</span>
              <span className="dash-kbd" aria-hidden="true">⌘ Enter</span>
            </Link>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Compact Floating Futuristic Coding Workspace Visual (32–35%) */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
          animate={
            prefersReducedMotion
              ? { opacity: 1, scale: 1 }
              : {
                  opacity: 1,
                  scale: 1,
                  y: [0, -4, 0]
                }
          }
          transition={
            prefersReducedMotion
              ? { duration: 0.4, delay: 0.2 }
              : {
                  opacity: { duration: 0.4, delay: 0.2 },
                  scale: { duration: 0.4, delay: 0.2 },
                  y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                }
          }
          className="dash-hero-right"
          aria-hidden="true"
        >
          {/* Subtle Glow Behind Window */}
          <div className="dash-editor-glow" />

          {/* Floating Code Editor Window */}
          <div className="dash-code-window">
            {/* Window Title Bar */}
            <div className="dash-code-header">
              <div className="dash-code-dots">
                <span className="dash-dot dot-close" />
                <span className="dash-dot dot-minimize" />
                <span className="dash-dot dot-maximize" />
              </div>
              <span className="dash-code-filename">solution.py</span>
            </div>

            {/* Code Body with Subtle Syntax Highlighting */}
            <div className="dash-code-body">
              <div className="code-line">
                <span className="syn-kw">def</span> <span className="syn-fn">solve</span>
                <span className="syn-op">(</span>nums<span className="syn-op">,</span> target
                <span className="syn-op">):</span>
              </div>
              <div className="code-line indent">
                seen <span className="syn-op">=</span> <span className="syn-fn">&#123;&#125;</span>
              </div>
              <div className="code-line indent">
                <span className="syn-kw">for</span> i<span className="syn-op">,</span> n{" "}
                <span className="syn-kw">in</span> <span className="syn-fn">enumerate</span>
                <span className="syn-op">(</span>nums<span className="syn-op">):</span>
              </div>
              <div className="code-line indent-2">
                <span className="syn-kw">return</span> <span className="syn-num">[</span>
                seen<span className="syn-op">[</span>diff<span className="syn-op">]</span>
                <span className="syn-op">,</span> i<span className="syn-num">]</span>
                <span
                  className="syn-cursor"
                  style={{ opacity: cursorVisible ? 1 : 0 }}
                >
                  |
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
