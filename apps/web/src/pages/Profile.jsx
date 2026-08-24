import { useState, useMemo, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Award,
  BadgeCheck,
  Brain,
  Calendar,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Code2,
  Compass,
  Edit3,
  ExternalLink,
  Flame,
  Globe,
  HelpCircle,
  Layers,
  List,
  Lock,
  Mail,
  MapPin,
  Medal,
  RefreshCw,
  Settings,
  Share2,
  Sparkles,
  Target,
  Terminal,
  Trophy,
  User,
  X,
  Zap
} from "lucide-react";
import { useAuth } from "../auth/AuthContext.jsx";
import { getUserDisplayName } from "../auth/displayName.js";
import { useAppData } from "../data/AppDataContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { api } from "../api/apiClient.js";
import SubmissionTable from "../components/tables/SubmissionTable.jsx";
import "../styles/profile.css";

export default function Profile() {
  const { user, isCheckingSession, updateUser } = useAuth();
  const { getProblemsForUser, getSubmissionsForUser, getUserById, leaderboard, syncBackendData } = useAppData();
  const { isLight } = useTheme();
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // overview | submissions | topics | activity
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  const [remoteStats, setRemoteStats] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    username: "",
    bio: "",
    avatarUrl: "",
    location: "",
    github: "",
    linkedin: "",
    website: ""
  });

  // Current User ID
  const currentUserId = user?.id || user?._id || "";
  const liveUser = { ...(currentUserId ? getUserById(currentUserId) : {}), ...(user || {}) };

  // Initialize edit form when user loads
  useEffect(() => {
    if (liveUser && Object.keys(liveUser).length > 0) {
      setEditForm({
        name: liveUser.displayName || liveUser.name || "",
        username: liveUser.username || "",
        bio: liveUser.bio || "",
        avatarUrl: liveUser.photoURL || liveUser.avatarUrl || "",
        location: liveUser.location || "",
        github: liveUser.github || "",
        linkedin: liveUser.linkedin || "",
        website: liveUser.website || ""
      });
    }
  }, [liveUser]);

  // Fetch remote stats on mount
  const fetchLiveDashboard = async () => {
    setIsSyncing(true);
    try {
      if (syncBackendData) await syncBackendData();
      const [dashRes, progRes] = await Promise.allSettled([
        api.getDashboard(),
        api.getProgress("30d")
      ]);
      if (dashRes.status === "fulfilled" && dashRes.value) {
        setRemoteStats(dashRes.value);
      }
    } catch (err) {
      console.warn("[Profile] Remote sync notice:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchLiveDashboard();
  }, [currentUserId]);

  // User details
  const name = getUserDisplayName(liveUser);
  const username = String(liveUser.username || "").trim();
  const email = String(liveUser.email || "").trim();
  const avatarUrl = liveUser.photoURL || liveUser.avatarUrl || "";
  const avatarLetter = String(name || username || "U").slice(0, 1).toUpperCase();
  const bio = liveUser.bio || "Passionate about algorithmic problem solving and high-performance software architecture.";
  const location = liveUser.location || "";
  const github = liveUser.github || "";
  const linkedin = liveUser.linkedin || "";
  const website = liveUser.website || "";
  const joinDate = liveUser.createdAt
    ? new Date(liveUser.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "Jan 2026";

  // 1. Problems & Submissions
  const problems = useMemo(() => {
    return Array.isArray(getProblemsForUser(currentUserId)) ? getProblemsForUser(currentUserId) : [];
  }, [getProblemsForUser, currentUserId]);

  const submissions = useMemo(() => {
    return Array.isArray(getSubmissionsForUser(currentUserId)) ? getSubmissionsForUser(currentUserId) : [];
  }, [getSubmissionsForUser, currentUserId]);

  const solvedProblems = useMemo(() => {
    return problems.filter((p) => p.status === "Solved");
  }, [problems]);

  const attemptedProblems = useMemo(() => {
    return problems.filter((p) => p.status === "Attempted");
  }, [problems]);

  const solvedCount = solvedProblems.length;
  const totalCount = problems.length || 1;

  // 2. Acceptance & Submissions Metrics
  const totalSubmissions = submissions.length;
  const acceptedSubmissions = submissions.filter((s) => {
    const v = s.verdict || s.status;
    return v === "AC" || v === "Accepted" || v === "OK";
  }).length;

  const accuracy = totalSubmissions > 0
    ? Math.round((acceptedSubmissions / totalSubmissions) * 100)
    : (typeof liveUser.accuracy === "number" ? liveUser.accuracy : 0);

  // 3. Real XP & Level System
  const computedPoints = solvedProblems.reduce((sum, p) => {
    const pts = typeof p.points === "number" && p.points > 0
      ? p.points
      : p.difficulty === "Easy" ? 50 : p.difficulty === "Hard" ? 200 : 100;
    return sum + pts;
  }, 0);

  const xp = Math.max(typeof liveUser.xp === "number" ? liveUser.xp : 0, computedPoints);
  const currentLevel = Math.max(1, Math.floor(xp / 1000) + 1);
  const currentLevelXp = xp % 1000;
  const levelProgressPct = Math.min(100, Math.round((currentLevelXp / 1000) * 100));

  // 4. Streak & Active Days Calculation
  const submissionDates = useMemo(() => {
    const set = new Set();
    submissions.forEach((s) => {
      const d = (s.submittedAt || s.createdAt || "").slice(0, 10);
      if (d) set.add(d);
    });
    if (Array.isArray(liveUser.activeDates)) {
      liveUser.activeDates.forEach((d) => set.add(d));
    }
    return Array.from(set);
  }, [submissions, liveUser.activeDates]);

  const activeDaysCount = submissionDates.length || (solvedCount > 0 ? 1 : 0);
  const streak = typeof liveUser.streak === "number" && liveUser.streak > 0
    ? liveUser.streak
    : activeDaysCount;

  // 5. Global Ranking Resolution
  const leaderboardList = Array.isArray(leaderboard) ? leaderboard : [];
  const rank = remoteStats?.rank ||
    leaderboardList.find((entry) => String(entry.id) === String(currentUserId))?.rank ||
    (liveUser.ranking && liveUser.ranking < 999 ? liveUser.ranking : 12);

  // 6. Difficulty Breakdown
  const difficultyCounts = useMemo(() => {
    const easy = { solved: 0, total: 0 };
    const medium = { solved: 0, total: 0 };
    const hard = { solved: 0, total: 0 };

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

  // 7. Topic Mastery Breakdown
  const topicProgress = useMemo(() => {
    const map = {};
    problems.forEach((p) => {
      const t = p.topic || "General";
      if (!map[t]) map[t] = { label: t, solved: 0, total: 0 };
      map[t].total += 1;
      if (p.status === "Solved") map[t].solved += 1;
    });

    return Object.values(map).sort((a, b) => {
      const pctA = a.total ? a.solved / a.total : 0;
      const pctB = b.total ? b.solved / b.total : 0;
      return pctB - pctA || b.total - a.total;
    });
  }, [problems]);

  // 8. Languages Distribution
  const languageStats = useMemo(() => {
    if (!submissions.length) {
      return [
        { name: "Python 3", count: 1, pct: 100, color: "#3b82f6" }
      ];
    }
    const counts = {};
    submissions.forEach((s) => {
      const lang = String(s.language || "python").toLowerCase();
      const cleanLang = lang.includes("py") ? "Python 3"
        : lang.includes("c++") || lang.includes("cpp") ? "C++ 20"
        : lang.includes("java") && !lang.includes("script") ? "Java"
        : lang.includes("js") || lang.includes("javascript") ? "JavaScript"
        : lang.includes("c") ? "C"
        : "Python 3";

      counts[cleanLang] = (counts[cleanLang] || 0) + 1;
    });

    const colors = {
      "Python 3": "#3b82f6",
      "C++ 20": "#8b5cf6",
      "Java": "#f97316",
      "JavaScript": "#eab308",
      "C": "#06b6d4"
    };

    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      pct: Math.round((count / totalSubmissions) * 100),
      color: colors[name] || "#6366f1"
    })).sort((a, b) => b.count - a.count);
  }, [submissions, totalSubmissions]);

  // 9. Activity Heatmap Blocks (Last 60 Days)
  const activityDays = useMemo(() => {
    const days = [];
    const today = new Date();
    const subMap = {};

    submissions.forEach((s) => {
      const d = (s.submittedAt || s.createdAt || "").slice(0, 10);
      if (d) subMap[d] = (subMap[d] || 0) + 1;
    });

    for (let i = 59; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const count = subMap[key] || 0;
      days.push({
        date: key,
        formatted: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        count,
        level: count >= 5 ? 4 : count >= 3 ? 3 : count >= 1 ? 2 : 0
      });
    }
    return days;
  }, [submissions]);

  // 10. Dynamic Badges
  const badges = useMemo(() => {
    const list = [];
    if (solvedCount >= 1) list.push({ label: "First Solution", icon: CheckCircle2, color: "#10b981" });
    if (solvedCount >= 5) list.push({ label: "Problem Solver", icon: Trophy, color: "#f59e0b" });
    if (solvedCount >= 10) list.push({ label: "Algorithm Prodigy", icon: Medal, color: "#6366f1" });
    if (streak >= 3) list.push({ label: `${streak}d Streak Master`, icon: Flame, color: "#ef4444" });
    if (accuracy >= 70 && totalSubmissions >= 5) list.push({ label: "High Precision", icon: Target, color: "#06b6d4" });
    list.push({ label: "Verified Developer", icon: BadgeCheck, color: "#0284c7" });
    return list;
  }, [solvedCount, streak, accuracy, totalSubmissions]);

  // Actions
  function handleShareProfile() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    setIsSaving(true);
    setEditError("");
    setEditSuccess("");

    try {
      const res = await api.updateProfile({
        displayName: editForm.name.trim(),
        name: editForm.name.trim(),
        username: editForm.username.trim(),
        bio: editForm.bio.trim(),
        avatarUrl: editForm.avatarUrl.trim(),
        photoURL: editForm.avatarUrl.trim(),
        location: editForm.location.trim(),
        github: editForm.github.trim(),
        githubProfile: editForm.github.trim(),
        linkedin: editForm.linkedin.trim(),
        linkedinProfile: editForm.linkedin.trim(),
        website: editForm.website.trim(),
        personalWebsite: editForm.website.trim()
      });

      if (res?.user) {
        updateUser(res.user);
        setEditSuccess("✓ Profile updated successfully!");
        setTimeout(() => {
          setIsEditModalOpen(false);
          setEditSuccess("");
        }, 900);
      } else {
        throw new Error(res?.error || "Failed to update profile.");
      }
    } catch (err) {
      setEditError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  // Loading State
  if (isCheckingSession) {
    return (
      <div className="profile-page-root" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div
            className="spinner"
            style={{
              margin: "0 auto 1.25rem",
              width: 38,
              height: 38,
              border: "3px solid rgba(99, 102, 241, 0.15)",
              borderTopColor: "#6366f1",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite"
            }}
          />
          <h2 style={{ color: isLight ? "#0f172a" : "#f8fafc", fontSize: "1.1rem", fontWeight: "600" }}>
            Loading coder profile...
          </h2>
        </div>
      </div>
    );
  }

  const profileStats = [
    { label: "Problems Solved", value: `${solvedCount}`, subtext: `${Math.round((solvedCount / totalCount) * 100)}% of catalog`, icon: Trophy, tone: "green" },
    { label: "Global Ranking", value: `#${rank}`, subtext: "Top 5% of arena", icon: Medal, tone: "purple" },
    { label: "Acceptance Rate", value: `${accuracy}%`, subtext: `${acceptedSubmissions}/${totalSubmissions} submissions`, icon: Target, tone: "blue" },
    { label: "Active Streak", value: `${streak} Days`, subtext: `${activeDaysCount} active days total`, icon: Flame, tone: "orange" }
  ];

  return (
    <div className="profile-page-root">
      {/* ==================================================================
          1. HERO HEADER WITH USER IDENTITY, BIO & LEVELING CAPSULE
          ================================================================== */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="prof-hero-card"
        style={{
          background: isLight ? "#ffffff" : "#0d111a",
          border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)"
        }}
      >
        <div className="prof-hero-mesh-glow" />

        {/* Radiant Avatar */}
        <div className="prof-avatar-wrap">
          <div className="prof-avatar-halo">
            <div className="prof-avatar-inner">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="prof-avatar-img" />
              ) : (
                <span>{avatarLetter}</span>
              )}
            </div>
          </div>
          <span className="prof-online-dot" title="Active Developer" />
        </div>

        {/* User Identity Details */}
        <div className="prof-identity-content">
          <div className="prof-identity-top">
            <h1 className="prof-user-name" style={{ color: isLight ? "#0f172a" : "#f8fafc" }}>
              {name}
            </h1>
            <span className="prof-tier-badge">
              <Sparkles size={12} /> Level {currentLevel} {xp >= 2000 ? "Grandmaster" : xp >= 1000 ? "Expert Coder" : "Competitive Coder"}
            </span>
            {liveUser?.preferences?.publicProfile === false && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "0.72rem",
                  color: isLight ? "#d97706" : "#f59e0b",
                  background: isLight ? "rgba(245, 158, 11, 0.12)" : "rgba(245, 158, 11, 0.15)",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  padding: "2px 8px",
                  borderRadius: "999px",
                  fontWeight: "600"
                }}
              >
                <Lock size={10} /> Private Profile
              </span>
            )}
            {isSyncing && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.7rem", color: "#6366f1" }}>
                <RefreshCw size={11} className="spin-fast" /> Syncing
              </span>
            )}
          </div>

          <div className="prof-meta-line">
            <span className="prof-handle-chip">@{username || "developer"}</span>
            <span>•</span>
            <span className="prof-email-text" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <Mail size={12} /> {email || "authenticated@judgo.dev"}
            </span>
            <span>•</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <Calendar size={12} /> Joined {joinDate}
            </span>
            {location && (
              <>
                <span>•</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <MapPin size={12} /> {location}
                </span>
              </>
            )}
          </div>

          {/* User Bio */}
          <p style={{
            fontSize: "0.82rem",
            color: isLight ? "#475569" : "#94a3b8",
            margin: "4px 0 6px",
            lineHeight: 1.4,
            maxWidth: "680px"
          }}>
            {bio}
          </p>

          {/* Social Links & Badges */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginTop: "2px" }}>
            {github && (
              <a
                href={github.startsWith("http") ? github : `https://github.com/${github}`}
                target="_blank"
                rel="noreferrer"
                className="prof-social-chip"
              >
                <Code2 size={12} /> GitHub
              </a>
            )}
            {linkedin && (
              <a
                href={linkedin.startsWith("http") ? linkedin : `https://linkedin.com/in/${linkedin}`}
                target="_blank"
                rel="noreferrer"
                className="prof-social-chip"
              >
                <ExternalLink size={12} /> LinkedIn
              </a>
            )}
            {website && (
              <a
                href={website.startsWith("http") ? website : `https://${website}`}
                target="_blank"
                rel="noreferrer"
                className="prof-social-chip"
              >
                <Globe size={12} /> Portfolio
              </a>
            )}
          </div>

          {/* Dynamic Badges */}
          <div className="prof-badges-strip">
            {badges.map((b) => {
              const Icon = b.icon;
              return (
                <span className="prof-badge-pill" key={b.label}>
                  <Icon size={13} style={{ color: b.color }} />
                  {b.label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Level Capsule & Actions */}
        <div className="prof-level-capsule" style={{
          background: isLight ? "rgba(248, 250, 252, 0.94)" : "rgba(8, 12, 20, 0.95)",
          border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)"
        }}>
          <div className="prof-level-head">
            <span className="prof-level-tag">LEVEL {currentLevel}</span>
            <span className="prof-xp-val" style={{ color: isLight ? "#0f172a" : "#f8fafc" }}>
              {xp.toLocaleString()} XP
            </span>
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
            {1000 - currentLevelXp} XP to Level {currentLevel + 1} ({levelProgressPct}%)
          </div>

          <div className="prof-level-actions">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="prof-secondary-action"
              style={{ background: isLight ? "#ffffff" : "#111827", color: isLight ? "#334155" : "#e2e8f0" }}
            >
              <Edit3 size={13} /> Edit Profile
            </button>
            <button
              type="button"
              onClick={handleShareProfile}
              className={`prof-secondary-action${copied ? " is-success" : ""}`}
              style={{ background: isLight ? "#ffffff" : "#111827", color: isLight ? "#334155" : "#e2e8f0" }}
            >
              <Share2 size={13} /> {copied ? "Copied Link!" : "Share"}
            </button>
          </div>
        </div>
      </motion.section>

      {/* ==================================================================
          2. CORE STATS RIBBON (4 Metric Cards)
          ================================================================== */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="prof-stats-ribbon"
      >
        {profileStats.map(({ label, value, subtext, icon: Icon, tone }) => (
          <article
            className="prof-stat-card"
            key={label}
            style={{
              background: isLight ? "#ffffff" : "#0d111a",
              border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)"
            }}
          >
            <div className={`prof-stat-icon-box ${tone}`}>
              <Icon size={20} />
            </div>
            <div className="prof-stat-info">
              <span className="prof-stat-label">{label}</span>
              <strong className="prof-stat-val" style={{ color: isLight ? "#0f172a" : "#f8fafc" }}>
                {value}
              </strong>
              <span style={{ fontSize: "0.68rem", color: "#64748b", marginTop: "1px" }}>
                {subtext}
              </span>
            </div>
          </article>
        ))}
      </motion.section>

      {/* ==================================================================
          3. INTERACTIVE NAVIGATION TABS
          ================================================================== */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        borderBottom: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)",
        paddingBottom: "4px"
      }}>
        {[
          { id: "overview", label: "Overview & Analytics", icon: Compass },
          { id: "submissions", label: `Submissions (${totalSubmissions})`, icon: List },
          { id: "topics", label: "Topic Mastery", icon: Layers },
          { id: "activity", label: "Activity Heatmap", icon: CalendarDays }
        ].map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: active ? (isLight ? "#eef2ff" : "rgba(99, 102, 241, 0.16)") : "transparent",
                border: active ? `1px solid ${isLight ? "#c7d2fe" : "rgba(99, 102, 241, 0.35)"}` : "1px solid transparent",
                color: active ? (isLight ? "#4338ca" : "#a5b4fc") : isLight ? "#64748b" : "#94a3b8",
                padding: "7px 14px",
                borderRadius: "8px",
                fontSize: "0.82rem",
                fontWeight: active ? "700" : "600",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ==================================================================
          4. TAB PANELS CONTENT
          ================================================================== */}
      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="prof-middle-grid"
          >
            {/* Left: Topic Strength Breakdown */}
            <article
              className="prof-glass-panel"
              style={{
                background: isLight ? "#ffffff" : "#0d111a",
                border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)"
              }}
            >
              <div className="prof-panel-head">
                <h3 className="prof-panel-title" style={{ color: isLight ? "#0f172a" : "#f8fafc" }}>
                  <Zap size={16} style={{ color: "#0284c7" }} />
                  <span>Algorithmic Topic Mastery</span>
                </h3>
                <span style={{ fontSize: "0.76rem", color: "#94a3b8" }}>
                  {topicProgress.filter((t) => t.solved > 0).length}/{topicProgress.length} Topics Solved
                </span>
              </div>

              <div className="prof-topic-list">
                {topicProgress.slice(0, 6).map((topic) => {
                  const width = topic.total ? Math.round((topic.solved / topic.total) * 100) : 0;
                  return (
                    <div
                      className="prof-topic-row"
                      key={topic.label}
                      onClick={() => navigate(`/problems?topic=${encodeURIComponent(topic.label)}`)}
                      style={{
                        cursor: "pointer",
                        background: isLight ? "#f8fafc" : "#080c14",
                        border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.06)"
                      }}
                      title={`Filter problems by ${topic.label}`}
                    >
                      <div className="prof-topic-meta">
                        <span className="prof-topic-name" style={{ color: isLight ? "#0f172a" : "#f8fafc" }}>
                          {topic.label}
                        </span>
                        <span className="prof-topic-stat">
                          <strong style={{ color: isLight ? "#4338ca" : "#818cf8" }}>{topic.solved}</strong> / {topic.total} ({width}%)
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

            {/* Right: Difficulty & Languages Distribution */}
            <article
              className="prof-glass-panel"
              style={{
                background: isLight ? "#ffffff" : "#0d111a",
                border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)"
              }}
            >
              <div className="prof-panel-head">
                <h3 className="prof-panel-title" style={{ color: isLight ? "#0f172a" : "#f8fafc" }}>
                  <Target size={16} style={{ color: "#059669" }} />
                  <span>Difficulty & Runtimes</span>
                </h3>
                <span style={{ fontSize: "0.76rem", color: "#94a3b8" }}>
                  {solvedCount}/{problems.length || 0} Total Solved
                </span>
              </div>

              {/* Difficulty summary cards */}
              <div className="prof-diff-summary">
                <div className="prof-diff-card easy" style={{ background: isLight ? "#f8fafc" : "#080c14", border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.06)", borderLeft: "3px solid #10b981" }}>
                  <span className="prof-diff-name">Easy</span>
                  <span className="prof-diff-count" style={{ color: isLight ? "#0f172a" : "#f8fafc" }}>
                    {difficultyCounts.easy.solved} <span>/{difficultyCounts.easy.total}</span>
                  </span>
                </div>
                <div className="prof-diff-card medium" style={{ background: isLight ? "#f8fafc" : "#080c14", border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.06)", borderLeft: "3px solid #f59e0b" }}>
                  <span className="prof-diff-name">Medium</span>
                  <span className="prof-diff-count" style={{ color: isLight ? "#0f172a" : "#f8fafc" }}>
                    {difficultyCounts.medium.solved} <span>/{difficultyCounts.medium.total}</span>
                  </span>
                </div>
                <div className="prof-diff-card hard" style={{ background: isLight ? "#f8fafc" : "#080c14", border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.06)", borderLeft: "3px solid #ef4444" }}>
                  <span className="prof-diff-name">Hard</span>
                  <span className="prof-diff-count" style={{ color: isLight ? "#0f172a" : "#f8fafc" }}>
                    {difficultyCounts.hard.solved} <span>/{difficultyCounts.hard.total}</span>
                  </span>
                </div>
              </div>

              {/* Languages Used Breakdown */}
              <div style={{ marginTop: "14px" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.04em", color: "#64748b" }}>
                  Languages Distribution
                </span>
                <div style={{ display: "flex", gap: "4px", height: "8px", borderRadius: "99px", overflow: "hidden", margin: "6px 0 10px" }}>
                  {languageStats.map((l) => (
                    <div
                      key={l.name}
                      style={{
                        width: `${Math.max(8, l.pct)}%`,
                        background: l.color,
                        height: "100%"
                      }}
                      title={`${l.name}: ${l.count} submissions (${l.pct}%)`}
                    />
                  ))}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {languageStats.map((l) => (
                    <span key={l.name} style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "0.72rem", color: isLight ? "#475569" : "#cbd5e1" }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: l.color }} />
                      <strong>{l.name}</strong> ({l.count})
                    </span>
                  ))}
                </div>
              </div>

              {/* Judgo Intelligence Banner */}
              <div className="prof-mentor-banner" style={{
                background: isLight ? "linear-gradient(135deg, #f5f3ff 0%, #eff6ff 100%)" : "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(14,165,233,0.08) 100%)",
                border: isLight ? "1px solid #c7d2fe" : "1px solid rgba(99, 102, 241, 0.25)"
              }}>
                <div className="prof-mentor-info">
                  <Brain size={22} style={{ color: "#7c3aed" }} />
                  <div className="prof-mentor-text">
                    <h4 style={{ color: isLight ? "#0f172a" : "#f8fafc" }}>Judgo Intelligence</h4>
                    <p style={{ color: isLight ? "#475569" : "#94a3b8" }}>Personalized weakness diagnostics &amp; mocks</p>
                  </div>
                </div>
                <Link to="/ai-coach" className="prof-mentor-btn">
                  <span>Open Intelligence</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </article>
          </motion.div>
        )}

        {activeTab === "submissions" && (
          <motion.section
            key="submissions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="prof-submissions-panel"
            style={{
              background: isLight ? "#ffffff" : "#0d111a",
              border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)"
            }}
          >
            <div className="prof-panel-head">
              <h3 className="prof-panel-title" style={{ color: isLight ? "#0f172a" : "#f8fafc" }}>
                <CheckCircle2 size={16} style={{ color: "#059669" }} />
                <span>All Submission Records ({totalSubmissions})</span>
              </h3>
              <Link
                to="/problems"
                style={{
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  color: "#4f46e5",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <span>Solve More Problems</span>
                <ChevronRight size={13} />
              </Link>
            </div>

            <SubmissionTable rows={submissions} />
          </motion.section>
        )}

        {activeTab === "topics" && (
          <motion.div
            key="topics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="prof-glass-panel"
            style={{
              background: isLight ? "#ffffff" : "#0d111a",
              border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)"
            }}
          >
            <div className="prof-panel-head">
              <h3 className="prof-panel-title" style={{ color: isLight ? "#0f172a" : "#f8fafc" }}>
                <Layers size={16} style={{ color: "#4f46e5" }} />
                <span>Complete Algorithmic Curricula Mastery</span>
              </h3>
              <span style={{ fontSize: "0.76rem", color: "#94a3b8" }}>
                Click any topic to explore practice problems
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
              {topicProgress.map((topic) => {
                const width = topic.total ? Math.round((topic.solved / topic.total) * 100) : 0;
                return (
                  <div
                    key={topic.label}
                    onClick={() => navigate(`/problems?topic=${encodeURIComponent(topic.label)}`)}
                    style={{
                      cursor: "pointer",
                      background: isLight ? "#f8fafc" : "#080c14",
                      border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.06)",
                      borderRadius: "10px",
                      padding: "12px 14px",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <strong style={{ fontSize: "0.86rem", color: isLight ? "#0f172a" : "#f8fafc" }}>
                        {topic.label}
                      </strong>
                      <span style={{ fontSize: "0.76rem", fontWeight: "700", color: isLight ? "#4f46e5" : "#818cf8" }}>
                        {topic.solved}/{topic.total} ({width}%)
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
          </motion.div>
        )}

        {activeTab === "activity" && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="prof-glass-panel"
            style={{
              background: isLight ? "#ffffff" : "#0d111a",
              border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)"
            }}
          >
            <div className="prof-panel-head">
              <h3 className="prof-panel-title" style={{ color: isLight ? "#0f172a" : "#f8fafc" }}>
                <CalendarDays size={16} style={{ color: "#f59e0b" }} />
                <span>60-Day Coding Activity Heatmap</span>
              </h3>
              <span style={{ fontSize: "0.76rem", color: "#94a3b8" }}>
                {totalSubmissions} submissions recorded across {activeDaysCount} active days
              </span>
            </div>

            {/* Heatmap Grid */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", padding: "10px 0" }}>
              {activityDays.map((d) => {
                const bg = d.level === 4 ? "#4f46e5"
                  : d.level === 3 ? "#6366f1"
                  : d.level === 2 ? "#818cf8"
                  : (isLight ? "#e2e8f0" : "rgba(255, 255, 255, 0.06)");
                return (
                  <div
                    key={d.date}
                    title={`${d.formatted}: ${d.count} submission${d.count === 1 ? "" : "s"}`}
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "4px",
                      background: bg,
                      transition: "transform 0.15s ease",
                      cursor: "pointer"
                    }}
                  />
                );
              })}
            </div>

            {/* Legend */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.72rem", color: "#64748b", marginTop: "10px" }}>
              <span>Less</span>
              <span style={{ width: 12, height: 12, borderRadius: 2, background: isLight ? "#e2e8f0" : "rgba(255,255,255,0.06)" }} />
              <span style={{ width: 12, height: 12, borderRadius: 2, background: "#818cf8" }} />
              <span style={{ width: 12, height: 12, borderRadius: 2, background: "#6366f1" }} />
              <span style={{ width: 12, height: 12, borderRadius: 2, background: "#4f46e5" }} />
              <span>More</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================================================================
          5. RECENT SUBMISSIONS SECTION (Always visible below tabs)
          ================================================================== */}
      {activeTab !== "submissions" && (
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="prof-submissions-panel"
          style={{
            background: isLight ? "#ffffff" : "#0d111a",
            border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)"
          }}
        >
          <div className="prof-panel-head">
            <h3 className="prof-panel-title" style={{ color: isLight ? "#0f172a" : "#f8fafc" }}>
              <CheckCircle2 size={16} style={{ color: "#059669" }} />
              <span>Recent Code Submissions</span>
            </h3>
            <Link
              to="/problems"
              style={{
                fontSize: "0.8rem",
                fontWeight: "600",
                color: "#4f46e5",
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

          <SubmissionTable rows={submissions.slice(0, 6)} />
        </motion.section>
      )}

      {/* ==================================================================
          6. INTERACTIVE EDIT PROFILE MODAL
          ================================================================== */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="prof-modal-backdrop" onClick={() => setIsEditModalOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="prof-modal-card"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: isLight ? "#ffffff" : "#0f172a",
                border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.1)"
              }}
            >
              <div className="prof-modal-header">
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: isLight ? "#0f172a" : "#f8fafc" }}>
                  Edit Public Profile
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
                >
                  <X size={18} />
                </button>
              </div>

              {editError && (
                <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", padding: "8px 12px", borderRadius: "8px", fontSize: "0.8rem", marginBottom: "12px" }}>
                  {editError}
                </div>
              )}

              {editSuccess && (
                <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", padding: "8px 12px", borderRadius: "8px", fontSize: "0.8rem", marginBottom: "12px" }}>
                  {editSuccess}
                </div>
              )}

              <form onSubmit={handleSaveProfile}>
                <div className="prof-form-group">
                  <label style={{ color: isLight ? "#334155" : "#cbd5e1" }}>Full Display Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Your Name"
                    required
                  />
                </div>

                <div className="prof-form-group">
                  <label style={{ color: isLight ? "#334155" : "#cbd5e1" }}>Username / Handle</label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    placeholder="username"
                    required
                  />
                </div>

                <div className="prof-form-group">
                  <label style={{ color: isLight ? "#334155" : "#cbd5e1" }}>Bio / Headline</label>
                  <textarea
                    rows={3}
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder="Tell other developers about your engineering passion..."
                  />
                </div>

                <div className="prof-form-group">
                  <label style={{ color: isLight ? "#334155" : "#cbd5e1" }}>Custom Avatar Image URL</label>
                  <input
                    type="url"
                    value={editForm.avatarUrl}
                    onChange={(e) => setEditForm({ ...editForm, avatarUrl: e.target.value })}
                    placeholder="https://example.com/avatar.png"
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div className="prof-form-group">
                    <label style={{ color: isLight ? "#334155" : "#cbd5e1" }}>Location</label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      placeholder="e.g. San Francisco, CA"
                    />
                  </div>

                  <div className="prof-form-group">
                    <label style={{ color: isLight ? "#334155" : "#cbd5e1" }}>GitHub Username / URL</label>
                    <input
                      type="text"
                      value={editForm.github}
                      onChange={(e) => setEditForm({ ...editForm, github: e.target.value })}
                      placeholder="e.g. Octocat"
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div className="prof-form-group">
                    <label style={{ color: isLight ? "#334155" : "#cbd5e1" }}>LinkedIn Username / URL</label>
                    <input
                      type="text"
                      value={editForm.linkedin}
                      onChange={(e) => setEditForm({ ...editForm, linkedin: e.target.value })}
                      placeholder="e.g. johndoe"
                    />
                  </div>

                  <div className="prof-form-group">
                    <label style={{ color: isLight ? "#334155" : "#cbd5e1" }}>Portfolio Website</label>
                    <input
                      type="url"
                      value={editForm.website}
                      onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                      placeholder="https://yourportfolio.dev"
                    />
                  </div>
                </div>

                <div className="prof-modal-actions">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="prof-btn-cancel"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="prof-btn-save"
                  >
                    {isSaving ? "Saving Changes..." : "Save Profile"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
