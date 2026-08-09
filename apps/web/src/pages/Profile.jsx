import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  Award,
  BadgeCheck,
  Brain,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Flame,
  Medal,
  Settings,
  Share2,
  Sparkles,
  Target,
  Trophy,
  Zap
} from "lucide-react";
import { useAuth } from "../auth/AuthContext.jsx";
import { getUserDisplayName } from "../auth/displayName.js";
import SubmissionTable from "../components/tables/SubmissionTable.jsx";
import { useAppData } from "../data/AppDataContext.jsx";
import "../styles/profile.css";

export default function Profile() {
  const { user, isCheckingSession } = useAuth();
  const { getProblemsForUser, getSubmissionsForUser, getUserById, leaderboard } = useAppData();
  const [copied, setCopied] = useState(false);

  // 1. Loading State while session is checking
  if (isCheckingSession) {
    return (
      <div className="profile-page-root" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div
            className="spinner"
            style={{
              margin: "0 auto 1.25rem",
              width: 36,
              height: 36,
              border: "3px solid rgba(255,255,255,0.1)",
              borderTopColor: "#7850ff",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite"
            }}
          />
          <h2 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: "600" }}>Loading coder profile...</h2>
        </div>
      </div>
    );
  }

  // 2. Safe User Resolution with fallbacks
  const currentUserId = user?.id || user?._id || "";
  const foundInDb = currentUserId ? getUserById(currentUserId) : null;
  const liveUser = foundInDb || user || {};

  const name = getUserDisplayName(liveUser);
  const username = String(liveUser.username || "").trim();
  const email = String(liveUser.email || "").trim();
  const avatarUrl = liveUser.photoURL || liveUser.avatarUrl || "";
  const avatarLetter = String(name || username || "U").slice(0, 1).toUpperCase();

  const xp = typeof liveUser.xp === "number" ? liveUser.xp : 0;
  const streak = typeof liveUser.streak === "number" ? liveUser.streak : (liveUser.solved > 0 ? 1 : 0);
  const accuracy = typeof liveUser.accuracy === "number" ? liveUser.accuracy : 0;
  const solvedCount =
    typeof liveUser.solved === "number"
      ? liveUser.solved
      : Array.isArray(liveUser.solvedProblemIds)
      ? liveUser.solvedProblemIds.length
      : 0;

  const stats = liveUser.stats || {
    activeDays: Array.isArray(liveUser.activeDates) ? liveUser.activeDates.length : (streak > 0 ? streak : (solvedCount > 0 ? 1 : 0)),
    totalSubmissions: 0,
    acceptedSubmissions: 0
  };

  const badges = Array.isArray(liveUser.badges) && liveUser.badges.length > 0
    ? liveUser.badges
    : ["Algorithm Prodigy", "Verified Coder", `${streak > 0 ? `${streak}d Streak` : "Active Challenger"}`];

  // 3. Problem and Submission Stats
  const problems = Array.isArray(getProblemsForUser(currentUserId)) ? getProblemsForUser(currentUserId) : [];
  const submissions = Array.isArray(getSubmissionsForUser(currentUserId)) ? getSubmissionsForUser(currentUserId) : [];

  // Breakdown by Difficulty
  const difficultyCounts = useMemo(() => {
    let easy = { solved: 0, total: 0 };
    let medium = { solved: 0, total: 0 };
    let hard = { solved: 0, total: 0 };

    problems.forEach((p) => {
      const diff = (p.difficulty || "Medium").toLowerCase();
      if (diff === "easy") {
        easy.total += 1;
        if (p.status === "Solved") easy.solved += 1;
      } else if (diff === "hard") {
        hard.total += 1;
        if (p.status === "Solved") hard.solved += 1;
      } else {
        medium.total += 1;
        if (p.status === "Solved") medium.solved += 1;
      }
    });

    return { easy, medium, hard };
  }, [problems]);

  // Breakdown by Topic
  const topicProgress = useMemo(() => {
    const map = problems.reduce((acc, problem) => {
      if (!problem?.topic) return acc;
      const current = acc[problem.topic] ?? { label: problem.topic, solved: 0, total: 0 };
      current.total += 1;
      if (problem.status === "Solved") {
        current.solved += 1;
      }
      acc[problem.topic] = current;
      return acc;
    }, {});
    return Object.values(map);
  }, [problems]);

  const leaderboardList = Array.isArray(leaderboard) ? leaderboard : [];
  const rank = leaderboardList.find((entry) => String(entry.id) === String(currentUserId))?.rank ?? "14";

  // Level & XP math
  const currentLevel = Math.max(1, Math.floor(xp / 1000) + 1);
  const currentLevelXp = xp % 1000;
  const levelProgressPct = Math.min(100, Math.round((currentLevelXp / 1000) * 100));

  function handleShareProfile() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const profileStats = [
    { label: "Problems Solved", value: solvedCount, icon: Trophy, tone: "green" },
    { label: "Global Ranking", value: `#${rank}`, icon: Medal, tone: "purple" },
    { label: "Acceptance Rate", value: `${accuracy}%`, icon: Target, tone: "blue" },
    { label: "Active Streak", value: `${streak} Days`, icon: Flame, tone: "orange" }
  ];

  return (
    <div className="profile-page-root">
      {/* ==================================================================
          1. COMPACT HERO SECTION
          ================================================================== */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="prof-hero-card"
      >
        <div className="prof-hero-mesh-glow" />

        {/* Radiant Avatar */}
        <div className="prof-avatar-wrap">
          <div className="prof-avatar-halo">
            <div className="prof-avatar-inner">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="prof-avatar-img" />
              ) : (
                avatarLetter
              )}
            </div>
          </div>
          <span className="prof-online-dot" title="Active Coder" />
        </div>

        {/* User Identity */}
        <div className="prof-identity-content">
          <div className="prof-identity-top">
            <h1 className="prof-user-name">{name}</h1>
            <span className="prof-tier-badge">
              <Sparkles size={12} /> Level {currentLevel} Grandmaster
            </span>
          </div>

          <div className="prof-meta-line">
            <span className="prof-handle-chip">@{username}</span>
            <span>•</span>
            <span className="prof-email-text">{email || "Authenticated Developer"}</span>
          </div>

          <div className="prof-badges-strip">
            {badges.map((b) => (
              <span className="prof-badge-pill" key={b}>
                <BadgeCheck size={13} style={{ color: "#38bdf8" }} />
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* Level & Milestone Capsule */}
        <div className="prof-level-capsule">
          <div className="prof-level-head">
            <span className="prof-level-tag">Level {currentLevel}</span>
            <span className="prof-xp-val">{xp.toLocaleString()} XP</span>
          </div>
          <div className="prof-xp-bar-track">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${levelProgressPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="prof-xp-bar-fill"
            />
          </div>
          <div className="prof-xp-subtext">
            {1000 - currentLevelXp} XP to Level {currentLevel + 1}
          </div>

          <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
            <Link
              to="/settings"
              style={{
                flex: 1,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#e2e8f0",
                fontSize: "0.74rem",
                fontWeight: "600",
                padding: "5px 10px",
                borderRadius: "6px",
                textDecoration: "none"
              }}
            >
              <Settings size={13} /> Settings
            </Link>
            <button
              onClick={handleShareProfile}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
                background: copied ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: copied ? "#34d399" : "#e2e8f0",
                fontSize: "0.74rem",
                fontWeight: "600",
                padding: "5px 10px",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              <Share2 size={13} /> {copied ? "Copied!" : "Share"}
            </button>
          </div>
        </div>
      </motion.section>

      {/* ==================================================================
          2. CORE STATS RIBBON (4 Compact Cards)
          ================================================================== */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="prof-stats-ribbon"
      >
        {profileStats.map(({ label, value, icon: Icon, tone }) => (
          <article className="prof-stat-card" key={label}>
            <div className={`prof-stat-icon-box ${tone}`}>
              <Icon size={20} />
            </div>
            <div className="prof-stat-info">
              <span className="prof-stat-label">{label}</span>
              <strong className="prof-stat-val">{value}</strong>
            </div>
          </article>
        ))}
      </motion.section>

      {/* ==================================================================
          3. MIDDLE GRID: TOPIC RADAR & DIFFICULTY DISTRIBUTION
          ================================================================== */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="prof-middle-grid"
      >
        {/* Left: Topic Strength Breakdown */}
        <article className="prof-glass-panel">
          <div className="prof-panel-head">
            <h3 className="prof-panel-title">
              <Zap size={16} style={{ color: "#38bdf8" }} />
              <span>Algorithmic Topic Mastery</span>
            </h3>
            <span style={{ fontSize: "0.76rem", color: "#94a3b8" }}>
              {topicProgress.filter((t) => t.solved > 0).length}/{topicProgress.length} Mastered
            </span>
          </div>

          <div className="prof-topic-list">
            {topicProgress.slice(0, 6).map((topic) => {
              const width = topic.total ? Math.round((topic.solved / topic.total) * 100) : 0;
              return (
                <div className="prof-topic-row" key={topic.label}>
                  <div className="prof-topic-meta">
                    <span className="prof-topic-name">{topic.label}</span>
                    <span className="prof-topic-stat">
                      <strong>{topic.solved}</strong> / {topic.total} ({width}%)
                    </span>
                  </div>
                  <div className="prof-topic-track">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${width}%` }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                      className="prof-topic-fill"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        {/* Right: Difficulty Breakdown & Practice Rhythm */}
        <article className="prof-glass-panel">
          <div className="prof-panel-head">
            <h3 className="prof-panel-title">
              <Target size={16} style={{ color: "#10b981" }} />
              <span>Difficulty Distribution</span>
            </h3>
            <span style={{ fontSize: "0.76rem", color: "#94a3b8" }}>
              {solvedCount}/{problems.length || 0} Total
            </span>
          </div>

          {/* Difficulty summary cards */}
          <div className="prof-diff-summary">
            <div className="prof-diff-card easy">
              <span className="prof-diff-name">Easy</span>
              <span className="prof-diff-count">
                {difficultyCounts.easy.solved} <span>/{difficultyCounts.easy.total}</span>
              </span>
            </div>
            <div className="prof-diff-card medium">
              <span className="prof-diff-name">Medium</span>
              <span className="prof-diff-count">
                {difficultyCounts.medium.solved} <span>/{difficultyCounts.medium.total}</span>
              </span>
            </div>
            <div className="prof-diff-card hard">
              <span className="prof-diff-name">Hard</span>
              <span className="prof-diff-count">
                {difficultyCounts.hard.solved} <span>/{difficultyCounts.hard.total}</span>
              </span>
            </div>
          </div>

          {/* Activity Rhythm metrics */}
          <div className="prof-activity-grid">
            <div className="prof-act-stat-box">
              <div className="prof-act-icon">
                <CalendarDays size={18} />
              </div>
              <div className="prof-act-details">
                <span className="prof-act-label">Active Days</span>
                <strong className="prof-act-val">{stats.activeDays ?? 1} Days</strong>
              </div>
            </div>

            <div className="prof-act-stat-box">
              <div className="prof-act-icon" style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}>
                <Activity size={18} />
              </div>
              <div className="prof-act-details">
                <span className="prof-act-label">Submissions</span>
                <strong className="prof-act-val">{submissions.length} Total</strong>
              </div>
            </div>
          </div>

          {/* Quick AI Mentor Launch Banner */}
          <div className="prof-mentor-banner">
            <div className="prof-mentor-info">
              <Brain size={22} style={{ color: "#a78bfa" }} />
              <div className="prof-mentor-text">
                <h4>Judgo Intelligence</h4>
                <p>Personalized weakness diagnostics &amp; mocks</p>
              </div>
            </div>
            <Link to="/ai-coach" className="prof-mentor-btn">
              <span>Open Intelligence</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </article>
      </motion.section>

      {/* ==================================================================
          4. RECENT SUBMISSIONS PANEL
          ================================================================== */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="prof-submissions-panel"
      >
        <div className="prof-panel-head">
          <h3 className="prof-panel-title">
            <CheckCircle2 size={16} style={{ color: "#10b981" }} />
            <span>Recent Code Submissions</span>
          </h3>
          <Link
            to="/problems"
            style={{
              fontSize: "0.8rem",
              fontWeight: "600",
              color: "#38bdf8",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <span>Explore Problem Archive</span>
            <ChevronRight size={13} />
          </Link>
        </div>

        <SubmissionTable rows={submissions.slice(0, 8)} />
      </motion.section>
    </div>
  );
}
