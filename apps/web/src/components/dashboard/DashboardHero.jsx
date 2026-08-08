import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Target } from "lucide-react";

export default function DashboardHero({ user, liveUser }) {
  const currentHour = new Date().getHours();
  const timeGreeting = useMemo(() => {
    if (currentHour < 12) return "Good morning";
    if (currentHour < 18) return "Good afternoon";
    return "Good evening";
  }, [currentHour]);

  const displayName = liveUser?.name?.split(" ")[0] || liveUser?.username || user?.name || "Coder";

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="dash-hero"
    >
      {/* Background Visual: Subtle Grid, Soft Glow & Slow Floating Glyphs */}
      <div className="dash-hero-bg">
        <div className="dash-hero-grid" />
        <div className="dash-hero-radial" />
        <motion.span
          animate={{ y: [0, -8, 0], rotate: [0, 4, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="dash-hero-glyph glyph-1"
        >
          &lt;/&gt;
        </motion.span>
        <motion.span
          animate={{ y: [0, 10, 0], rotate: [0, -4, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="dash-hero-glyph glyph-2"
        >
          &#123; &#125;
        </motion.span>
        <motion.span
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="dash-hero-glyph glyph-3"
        >
          [ ]
        </motion.span>
      </div>

      <div className="dash-hero-content">
        {/* Status Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="dash-hero-badge"
        >
          <span className="dash-badge-dot" />
          <span>Your coding journey continues</span>
        </motion.div>

        {/* Headline Greeting */}
        <div className="dash-hero-greeting">
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="dash-greeting-time">{timeGreeting}, </span>
            <span className="dash-user-name">{displayName}.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="dash-hero-sub"
          >
            Ready to level up your algorithmic skills today? Keep your streak alive and tackle today's curated problems.
          </motion.p>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.3 }}
          className="dash-hero-actions"
        >
          <Link to="/problems/two-sum" className="dash-btn-primary">
            <span>Continue Solving</span>
            <ArrowRight size={15} className="arrow-icon" />
          </Link>

          <Link to="/problems" className="dash-btn-secondary">
            <Target size={15} style={{ color: "#60a5fa" }} />
            <span>Daily Challenge</span>
            <span className="dash-kbd">⌘ Enter</span>
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
}
