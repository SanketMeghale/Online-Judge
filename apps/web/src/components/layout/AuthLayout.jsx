import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  CheckCircle2,
  Code2,
  Cpu,
  Flame,
  LineChart,
  ShieldCheck,
  Sparkles,
  Trophy,
  Zap
} from "lucide-react";

export default function AuthLayout() {
  const location = useLocation();

  return (
    <div className="auth-root-wrapper">
      {/* Background Subtle Grid & Moving Aurora Blobs */}
      <div className="auth-bg-grid" />
      <div className="auth-aurora-blob blob-1" />
      <div className="auth-aurora-blob blob-2" />
      <div className="auth-aurora-blob blob-3" />

      {/* Floating Coding Symbols */}
      <motion.div
        animate={{ y: [0, -18, 0], x: [0, 8, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="floating-code-symbol"
        style={{ top: "12%", left: "6%", fontSize: "1.8rem" }}
      >
        &lt;/&gt;
      </motion.div>
      <motion.div
        animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="floating-code-symbol"
        style={{ bottom: "18%", left: "12%", fontSize: "2rem" }}
      >
        &#123; &#125;
      </motion.div>
      <motion.div
        animate={{ y: [0, -14, 0], x: [0, 12, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="floating-code-symbol"
        style={{ top: "20%", right: "8%", fontSize: "1.6rem" }}
      >
        [ ]
      </motion.div>
      <motion.div
        animate={{ y: [0, 16, 0], x: [0, -8, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="floating-code-symbol"
        style={{ bottom: "12%", right: "14%", fontSize: "1.7rem" }}
      >
        =&gt;
      </motion.div>

      {/* Main Split Container */}
      <div className="auth-split-container">
        {/* LEFT BRANDING HERO (45%) */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="auth-left-branding"
        >
          {/* Logo and Brand Name */}
          <Link className="auth-brand-badge" to="/">
            <motion.div
              whileHover={{ rotate: 8, scale: 1.06 }}
              className="auth-logo-box"
            >
              <img src="/logo.png" alt="Judgo Logo" />
            </motion.div>
            <span className="auth-brand-name">Judgo</span>
          </Link>

          {/* Headline and Subtitle */}
          <h1 className="auth-headline">
            Code. Compete. <span className="gradient-text">Conquer.</span>
          </h1>
          <p className="auth-subtitle">
            Master DSA, compete in live contests, and prepare for tier-1 engineering interviews with real-time AI guidance.
          </p>

          {/* Value Proposition Checkpoints */}
          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <span className="auth-check-icon"><Check size={14} strokeWidth={3} /></span>
              <span><strong>Secure Code Execution</strong> via isolated sandbox engine</span>
            </div>
            <div className="auth-feature-item">
              <span className="auth-check-icon"><Check size={14} strokeWidth={3} /></span>
              <span><strong>AI Coding Coach</strong> for deep algorithmic optimization</span>
            </div>
            <div className="auth-feature-item">
              <span className="auth-check-icon"><Check size={14} strokeWidth={3} /></span>
              <span><strong>Live Weekly Contests</strong> with verified global rating</span>
            </div>
            <div className="auth-feature-item">
              <span className="auth-check-icon"><Check size={14} strokeWidth={3} /></span>
              <span><strong>Company Interview Track</strong> for Google, Meta, Amazon</span>
            </div>
            <div className="auth-feature-item">
              <span className="auth-check-icon"><Check size={14} strokeWidth={3} /></span>
              <span><strong>Real-Time ELO Leaderboard</strong> & streak tracking</span>
            </div>
          </div>

          {/* Floating Metrics Showcase Stack */}
          <div className="auth-showcase-stack">
            {/* Accepted Card */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="auth-float-card card-ac"
            >
              <div className="float-icon-bubble green">
                <CheckCircle2 size={18} />
              </div>
              <div className="float-card-details">
                <h5>Accepted (AC)</h5>
                <p>100% Passed • Beats 99.4%</p>
              </div>
            </motion.div>

            {/* Runtime Card */}
            <motion.div
              animate={{ y: [0, 7, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="auth-float-card card-runtime"
            >
              <div className="float-icon-bubble blue">
                <Zap size={18} />
              </div>
              <div className="float-card-details">
                <h5>Measured execution</h5>
                <p>Runtime and peak memory from the sandbox</p>
              </div>
            </motion.div>

            {/* AI Review Card */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="auth-float-card card-ai"
            >
              <div className="float-icon-bubble purple">
                <Sparkles size={18} />
              </div>
              <div className="float-card-details">
                <h5>AI Code Review</h5>
                <p>Optimal Two-Pointer pattern</p>
              </div>
            </motion.div>

            {/* Contest Trophy Card */}
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              className="auth-float-card card-trophy"
            >
              <div className="float-icon-bubble amber">
                <Trophy size={18} />
              </div>
              <div className="float-card-details">
                <h5>Knight • 1,842</h5>
                <p>Global Rank: #1 (Top 0.1%)</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* RIGHT GLASSMORPHISM AUTH PANEL (55%) */}
        <div style={{ width: "100%", position: "relative" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
