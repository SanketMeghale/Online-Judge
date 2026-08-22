import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Award,
  BarChart2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Code2,
  Compass,
  Flame,
  LineChart,
  Medal,
  RefreshCw,
  Sparkles,
  Swords,
  Target,
  TrendingUp,
  Trophy,
  XCircle,
  Zap
} from "lucide-react";
import { api } from "../api/apiClient.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { useAppData } from "../data/AppDataContext.jsx";
import { calculateStreak } from "../data/appData.js";
import { useTheme } from "../context/ThemeContext.jsx";
import DsaSkillTree from "../components/progress/DsaSkillTree.jsx";
import LeetCodeActivityCalendar from "../components/progress/LeetCodeActivityCalendar.jsx";

const TIME_RANGES = [
  { id: "7d", label: "Last 7 Days", days: 7 },
  { id: "30d", label: "Last 30 Days", days: 30 },
  { id: "90d", label: "Last 3 Months", days: 90 },
  { id: "180d", label: "Last 6 Months", days: 180 },
  { id: "365d", label: "This Year", days: 365 },
  { id: "all", label: "All Time", days: 99999 }
];

export default function ProgressPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getProblemsForUser, getSubmissionsForUser, getUserById } = useAppData();
  const { isLight } = useTheme();

  const [timeRange, setTimeRange] = useState("30d");
  const [timelineFilter, setTimelineFilter] = useState("All"); // All | Accepted | Failed
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentUserId = user?.id || user?._id || "";

  const loadProgressAnalytics = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.getProgress(timeRange);
      if (res && res.success) {
        setData(res);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn("[ProgressPage] API fetch fallback to local computation:", err);
    }

    // Client-side local fallback computation using AppDataContext
    try {
      const userSubmissions = getSubmissionsForUser(currentUserId) || [];
      const userProblems = getProblemsForUser(currentUserId) || [];

      const rangeDays = TIME_RANGES.find((r) => r.id === timeRange)?.days || 30;
      const now = Date.now();
      const cutoff = rangeDays < 90000 ? now - rangeDays * 24 * 3600 * 1000 : 0;

      const filteredSubmissions = userSubmissions.filter((s) => {
        const ts = new Date(s.submittedAt || s.createdAt || 0).getTime();
        return ts >= cutoff;
      });

      const solvedSet = new Set(
        filteredSubmissions.filter((s) => s.verdict === "AC" || s.verdict === "OK").map((s) => s.problemId || s.problem)
      );

      const totalSubmissions = filteredSubmissions.length;
      const acceptedCount = filteredSubmissions.filter((s) => s.verdict === "AC" || s.verdict === "OK").length;
      const waCount = filteredSubmissions.filter((s) => s.verdict === "WA").length;
      const reCount = filteredSubmissions.filter((s) => s.verdict === "RE").length;
      const ceCount = filteredSubmissions.filter((s) => s.verdict === "CE").length;
      const tleCount = filteredSubmissions.filter((s) => s.verdict === "TLE").length;

      const acceptanceRate = totalSubmissions > 0 ? Math.round((acceptedCount / totalSubmissions) * 100) : 0;

      // Difficulty breakdown
      const diffMap = {
        Easy: { solved: 0, total: 0 },
        Medium: { solved: 0, total: 0 },
        Hard: { solved: 0, total: 0 }
      };

      for (const p of userProblems) {
        const diff = p.difficulty || "Medium";
        if (!diffMap[diff]) diffMap[diff] = { solved: 0, total: 0 };
        diffMap[diff].total++;
        if (p.status === "Solved") diffMap[diff].solved++;
      }

      // Heatmap Activity Grid
      const displayDays = Math.min(rangeDays, 180);
      const activityGrid = [];
      const dateCountMap = new Map();

      for (const s of userSubmissions) {
        const d = new Date(s.submittedAt || s.createdAt || now);
        const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        dateCountMap.set(k, (dateCountMap.get(k) || 0) + 1);
      }

      for (let i = displayDays - 1; i >= 0; i--) {
        const dt = new Date(now - i * 24 * 3600 * 1000);
        const k = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
        const count = dateCountMap.get(k) || 0;
        let intensity = 0;
        if (count >= 5) intensity = 4;
        else if (count >= 3) intensity = 3;
        else if (count >= 2) intensity = 2;
        else if (count >= 1) intensity = 1;

        activityGrid.push({
          date: k,
          label: dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          count,
          intensity
        });
      }

      // Topics
      const topicMap = new Map();
      for (const p of userProblems) {
        const t = p.topic || "General";
        if (!topicMap.has(t)) topicMap.set(t, { topic: t, totalProblems: 0, solvedCount: 0, totalSubmissions: 0, acceptedSubmissions: 0 });
        const obj = topicMap.get(t);
        obj.totalProblems++;
        if (p.status === "Solved") obj.solvedCount++;
      }

      for (const s of userSubmissions) {
        const p = userProblems.find((item) => item.id === (s.problemId || s.problem));
        const t = p?.topic || "General";
        if (topicMap.has(t)) {
          const obj = topicMap.get(t);
          obj.totalSubmissions++;
          if (s.verdict === "AC" || s.verdict === "OK") obj.acceptedSubmissions++;
        }
      }

      const topicProficiency = Array.from(topicMap.values()).map((t) => {
        const accuracy = t.totalSubmissions > 0 ? Math.round((t.acceptedSubmissions / t.totalSubmissions) * 100) : 0;
        const completionRatio = t.totalProblems > 0 ? t.solvedCount / t.totalProblems : 0;
        return {
          ...t,
          accuracy,
          proficiency: Math.round(completionRatio * 60 + accuracy * 0.4)
        };
      });

      const liveUserData = getUserById(currentUserId);
      const solvedTotal = userProblems.filter((p) => p.status === "Solved").length;

      const streakStats = calculateStreak(
        (liveUserData?.activeDates || []).concat(
          userSubmissions.filter((s) => s.verdict === "AC" || s.verdict === "OK" || s.verdict === "Accepted")
        ),
        new Date()
      );

      setData({
        success: true,
        overview: {
          solvedCount: solvedSet.size,
          solvedDelta: "+3",
          totalSubmissions,
          acceptedCount,
          waCount,
          reCount,
          ceCount,
          tleCount,
          acceptanceRate,
          currentStreak: streakStats.currentStreak,
          bestStreak: Math.max(liveUserData?.bestStreak || 0, streakStats.bestStreak),
          activeDaysCount: activityGrid.filter((a) => a.count > 0).length,
          contestRating: liveUserData?.ranking ? Math.max(1200, 1500 - liveUserData.ranking * 8) : 1200
        },
        difficultyBreakdown: {
          Easy: { solved: diffMap.Easy.solved, total: diffMap.Easy.total || 4, percentage: diffMap.Easy.total ? Math.round((diffMap.Easy.solved / diffMap.Easy.total) * 100) : 0 },
          Medium: { solved: diffMap.Medium.solved, total: diffMap.Medium.total || 4, percentage: diffMap.Medium.total ? Math.round((diffMap.Medium.solved / diffMap.Medium.total) * 100) : 0 },
          Hard: { solved: diffMap.Hard.solved, total: diffMap.Hard.total || 2, percentage: diffMap.Hard.total ? Math.round((diffMap.Hard.solved / diffMap.Hard.total) * 100) : 0 }
        },
        activityGrid,
        topicProficiency
      });
      setLoading(false);
    } catch (fallbackErr) {
      console.error("[ProgressPage] Computation error:", fallbackErr);
      setError("Unable to load progress statistics. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgressAnalytics();
  }, [timeRange, currentUserId]);

  const overview = data?.overview || {};
  const diffs = data?.difficultyBreakdown || {};
  const activityGrid = data?.activityGrid || [];
  const topicProficiency = data?.topicProficiency || [];

  return (
    <motion.div
      className="progress-page responsive-page"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "40px" }}
    >
      {/* ── 1. HEADER & DATE RANGE FILTER ──────────────────────────────── */}
      <div className="responsive-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
            <Activity size={15} style={{ color: "#818cf8" }} />
            <span style={{ fontSize: "0.7rem", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6366f1" }}>
              Analytics Workspace
            </span>
          </div>
          <h1 style={{ fontSize: "1.55rem", fontWeight: "800", color: isLight ? "#0f172a" : "#f8fafc", margin: 0, letterSpacing: "-0.02em" }}>
            Progress &amp; Stats
          </h1>
          <p style={{ fontSize: "0.85rem", color: isLight ? "#475569" : "#94a3b8", margin: "2px 0 0 0" }}>
            Track your coding journey, analyze strengths, and discover what to practice next.
          </p>
        </div>

        {/* Range Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Calendar size={14} style={{ color: isLight ? "#64748b" : "#64748b" }} />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={{
              background: isLight ? "#ffffff" : "#0d111a",
              border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: isLight ? "0 1px 2px rgba(0,0,0,0.03)" : "none",
              borderRadius: "8px", padding: "6px 12px",
              color: isLight ? "#0f172a" : "#f8fafc", fontSize: "0.82rem", fontWeight: "600",
              cursor: "pointer", outline: "none"
            }}
          >
            {TIME_RANGES.map((r) => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ERROR STATE */}
      {error && (
        <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "10px", padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#f87171", fontSize: "0.86rem" }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
          <button onClick={loadProgressAnalytics} style={{ background: isLight ? "#ffffff" : "rgba(255,255,255,0.06)", border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255,255,255,0.1)", color: isLight ? "#0f172a" : "#fff", borderRadius: "6px", padding: "5px 12px", fontSize: "0.78rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}

      {/* ── 2. TOP STAT CARDS ────────────────────────────────────────── */}
      <div className="progress-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "12px" }}>
        {/* Card 1: Problems Solved */}
        <StatCard
          icon={<CheckCircle2 size={18} style={{ color: "#10b981" }} />}
          label="Problems Solved"
          value={loading ? "..." : overview.solvedCount ?? 0}
          subtext={overview.solvedDelta ? `${overview.solvedDelta} this period` : null}
          subcolor={isLight ? "#059669" : "#34d399"}
          bg={isLight ? "rgba(16, 185, 129, 0.12)" : "rgba(16, 185, 129, 0.12)"}
          isLight={isLight}
        />

        {/* Card 2: Submissions & Breakdown */}
        <StatCard
          icon={<Code2 size={18} style={{ color: "#6366f1" }} />}
          label="Submissions"
          value={loading ? "..." : overview.totalSubmissions ?? 0}
          subtext={`${overview.acceptedCount ?? 0} AC · ${overview.waCount ?? 0} WA`}
          subcolor={isLight ? "#4f46e5" : "#818cf8"}
          bg={isLight ? "rgba(99, 102, 241, 0.12)" : "rgba(99, 102, 241, 0.12)"}
          isLight={isLight}
        />

        {/* Card 3: Acceptance Rate */}
        <StatCard
          icon={<Target size={18} style={{ color: "#f59e0b" }} />}
          label="Acceptance Rate"
          value={loading ? "..." : `${overview.acceptanceRate ?? 0}%`}
          subtext="Accuracy across period"
          subcolor={isLight ? "#d97706" : "#fbbf24"}
          bg={isLight ? "rgba(245, 158, 11, 0.12)" : "rgba(245, 158, 11, 0.12)"}
          isLight={isLight}
        />

        {/* Card 4: Streak */}
        <StatCard
          icon={<Flame size={18} style={{ color: "#f97316" }} />}
          label="Coding Streak"
          value={loading ? "..." : `${overview.currentStreak ?? 0} days`}
          subtext={`Best: ${overview.bestStreak ?? 0} consecutive days`}
          subcolor={isLight ? "#c2410c" : "#f97316"}
          bg={isLight ? "rgba(249, 115, 22, 0.12)" : "rgba(249, 115, 22, 0.12)"}
          isLight={isLight}
        />

        {/* Card 5: Contest Rating */}
        <StatCard
          icon={<Trophy size={18} style={{ color: "#a855f7" }} />}
          label="Contest Rating"
          value={loading ? "..." : overview.contestRating ? `${overview.contestRating} pts` : "Not rated yet"}
          subtext="Global contest standing"
          subcolor={isLight ? "#7c3aed" : "#c084fc"}
          bg={isLight ? "rgba(168, 85, 247, 0.12)" : "rgba(168, 85, 247, 0.12)"}
          isLight={isLight}
        />
      </div>

      {/* ── 3. MAIN CONTENT 2 COLUMNS: DIFFICULTY & ACTIVITY GRID ────── */}
      <div className="progress-main-grid" style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "14px", alignItems: "start" }}>

        {/* LEFT COLUMN: DIFFICULTY BREAKDOWN */}
        <div style={{
          background: isLight ? "#ffffff" : "#0d111a",
          border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.08)",
          boxShadow: isLight ? "0 1px 3px rgba(0,0,0,0.04)" : "none",
          borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "14px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <BarChart2 size={15} style={{ color: "#6366f1" }} />
            <h3 style={{ fontSize: "0.9rem", fontWeight: "800", color: isLight ? "#0f172a" : "#f8fafc", margin: 0 }}>Difficulty Breakdown</h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <DiffRow label="Easy" solved={diffs.Easy?.solved || 0} total={diffs.Easy?.total || 4} pct={diffs.Easy?.percentage || 0} color={isLight ? "#059669" : "#34d399"} bg={isLight ? "rgba(16,185,129,0.12)" : "rgba(16,185,129,0.12)"} isLight={isLight} />
            <DiffRow label="Medium" solved={diffs.Medium?.solved || 0} total={diffs.Medium?.total || 4} pct={diffs.Medium?.percentage || 0} color={isLight ? "#d97706" : "#fbbf24"} bg={isLight ? "rgba(245,158,11,0.12)" : "rgba(245,158,11,0.12)"} isLight={isLight} />
            <DiffRow label="Hard" solved={diffs.Hard?.solved || 0} total={diffs.Hard?.total || 2} pct={diffs.Hard?.percentage || 0} color={isLight ? "#dc2626" : "#f87171"} bg={isLight ? "rgba(239,68,68,0.12)" : "rgba(239,68,68,0.12)"} isLight={isLight} />
          </div>

          <div style={{ borderTop: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.06)", paddingTop: "10px", fontSize: "0.75rem", color: isLight ? "#64748b" : "#64748b" }}>
            Solving harder problems increases your rating &amp; XP significantly faster.
          </div>
        </div>

        {/* RIGHT COLUMN: LEETCODE STYLE CODING ACTIVITY HEATMAP */}
        <LeetCodeActivityCalendar
          submissions={getSubmissionsForUser(currentUserId)}
          activityGrid={activityGrid}
          activeDaysCount={overview.activeDaysCount}
          currentStreak={overview.currentStreak}
          maxStreak={overview.bestStreak}
          timeRange={timeRange}
        />

      </div>

      {/* ── 4. DSA SKILL TREE SECTION ───────────────────────────── */}
      <DsaSkillTree topicProficiency={topicProficiency} />

    </motion.div>
  );
}

/* ── HELPERS ───────────────────────────────────────────────────────── */
function StatCard({ icon, label, value, subtext, subcolor, bg, isLight }) {
  return (
    <div style={{
      background: isLight ? "#ffffff" : "#0d111a",
      border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.08)",
      boxShadow: isLight ? "0 1px 3px rgba(0,0,0,0.04)" : "none",
      borderRadius: "10px", padding: "14px 16px",
      display: "flex", alignItems: "center", gap: "12px"
    }}>
      <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <span style={{ fontSize: "0.72rem", color: isLight ? "#64748b" : "#64748b", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
        <strong style={{ fontSize: "1.2rem", color: isLight ? "#0f172a" : "#f8fafc", display: "block", lineHeight: 1.1 }}>{value}</strong>
        {subtext && <span style={{ fontSize: "0.7rem", color: subcolor, fontWeight: "600" }}>{subtext}</span>}
      </div>
    </div>
  );
}

function DiffRow({ label, solved, total, pct, color, bg, isLight }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.8rem" }}>
        <span style={{ color, fontWeight: "700", padding: "1px 7px", borderRadius: "4px", background: bg, fontSize: "0.72rem" }}>
          {label}
        </span>
        <span style={{ color: isLight ? "#334155" : "#cbd5e1", fontWeight: "600" }}>
          {solved} / {total} <small style={{ color: isLight ? "#64748b" : "#64748b" }}>({pct}%)</small>
        </span>
      </div>
      <div style={{ width: "100%", height: "4px", background: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)", borderRadius: "99px", overflow: "hidden" }}>
        <div style={{ width: `${Math.min(100, pct)}%`, height: "100%", background: color, borderRadius: "99px" }} />
      </div>
    </div>
  );
}
