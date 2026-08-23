import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpDown,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock,
  Filter,
  Flag,
  Flame,
  Hash,
  Layers,
  LayoutGrid,
  Leaf,
  List,
  Search,
  SlidersHorizontal,
  Target,
  Timer,
  TrendingUp,
  X,
  Zap
} from "lucide-react";
import { useAuth } from "../auth/AuthContext.jsx";
import { useAppData } from "../data/AppDataContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };

const DIFF_META = {
  Easy:   { bg: "rgba(16,185,129,0.12)", text: "#10b981", border: "rgba(16,185,129,0.25)" },
  Medium: { bg: "rgba(245,158,11,0.12)", text: "#f59e0b", border: "rgba(245,158,11,0.25)" },
  Hard:   { bg: "rgba(239,68,68,0.12)",  text: "#ef4444", border: "rgba(239,68,68,0.25)" }
};

export default function ProblemsList() {
  const { user } = useAuth();
  const { getProblemsForUser, getSubmissionsForUser, syncBackendData } = useAppData();
  const { isLight } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialTopic = searchParams.get("topic") || "All";

  const [query,           setQuery]           = useState("");
  const [difficulty,      setDifficulty]      = useState("All");
  const [topic,           setTopic]           = useState(initialTopic);
  const [statusFilter,    setStatusFilter]    = useState("All");
  const [sortBy,          setSortBy]          = useState("default");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (syncBackendData) syncBackendData();
  }, [user?.id]);

  useEffect(() => {
    const t = searchParams.get("topic");
    if (t) setTopic(t);
  }, [searchParams]);

  const problems        = getProblemsForUser(user?.id);
  const userSubmissions = getSubmissionsForUser(user?.id) || [];

  const totalCount     = problems.length;
  const solvedCount    = problems.filter(p => p.status === "Solved").length;
  const attemptedCount = problems.filter(p => p.status === "Attempted").length;
  const remainingCount = Math.max(0, totalCount - solvedCount);
  const solvedPct      = totalCount ? Math.round((solvedCount / totalCount) * 100) : 0;

  const easyCount   = problems.filter(p => p.difficulty === "Easy").length;
  const mediumCount = problems.filter(p => p.difficulty === "Medium").length;
  const hardCount   = problems.filter(p => p.difficulty === "Hard").length;

  const topics = useMemo(() => {
    const raw = Array.from(new Set(problems.map(p => p.topic).filter(Boolean)));
    return ["All", ...raw];
  }, [problems]);

  const filteredProblems = useMemo(() => {
    return problems
      .filter(p => {
        const q = query.toLowerCase();
        const matchesQuery = !query ||
          (p.title || "").toLowerCase().includes(q) ||
          (p.topic || "").toLowerCase().includes(q);
        const matchesDifficulty = difficulty === "All" || p.difficulty === difficulty;
        const matchesTopic      = topic === "All" || p.topic === topic;
        const matchesStatus =
          statusFilter === "All" ||
          (statusFilter === "Solved"    && p.status === "Solved")    ||
          (statusFilter === "Attempted" && p.status === "Attempted") ||
          (statusFilter === "Unsolved"  && (!p.status || p.status === "Unsolved"));
        return matchesQuery && matchesDifficulty && matchesTopic && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "difficulty") return (difficultyOrder[a.difficulty] || 2) - (difficultyOrder[b.difficulty] || 2);
        if (sortBy === "acceptance") return (b.acceptance || 0) - (a.acceptance || 0);
        if (sortBy === "attempts")   return (b.submissions || 0) - (a.submissions || 0);
        if (sortBy === "points")     return (b.points || 0) - (a.points || 0);
        return 0;
      });
  }, [problems, query, difficulty, topic, statusFilter, sortBy]);

  const hasFilters = query || difficulty !== "All" || topic !== "All" || statusFilter !== "All";

  function clearFilters() {
    setQuery(""); setDifficulty("All"); setTopic("All"); setStatusFilter("All"); setSortBy("default");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="problems-list-page"
    >
      {/* ── HEADER ── */}
      <div className="problems-header-row">
        <div>
          <span style={{ fontSize: "0.7rem", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6366f1" }}>
            Practice Arena
          </span>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: isLight ? "#0f172a" : "#f8fafc", margin: "2px 0 0", letterSpacing: "-0.02em" }}>
            Problems
          </h1>
        </div>
        <div className="problems-stat-chips">
          <StatChip label="Total"     value={totalCount}     color="#818cf8" isLight={isLight} />
          <StatChip label="Solved"    value={solvedCount}    color="#10b981" isLight={isLight} />
          <StatChip label="Attempted" value={attemptedCount} color="#f59e0b" isLight={isLight} />
          <StatChip label="Remaining" value={remainingCount} color={isLight ? "#64748b" : "#94a3b8"} isLight={isLight} />
          <div style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: isLight ? "#ffffff" : "#0d111a",
            border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.07)",
            borderRadius: "8px", padding: "5px 10px"
          }}>
            <svg width="28" height="28" viewBox="0 0 28 28">
              <circle cx="14" cy="14" r="11" fill="none" stroke={isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.07)"} strokeWidth="2.5" />
              <circle cx="14" cy="14" r="11" fill="none" stroke="#6366f1" strokeWidth="2.5"
                strokeDasharray={`${2 * Math.PI * 11}`}
                strokeDashoffset={`${2 * Math.PI * 11 * (1 - solvedPct / 100)}`}
                strokeLinecap="round" transform="rotate(-90 14 14)"
                style={{ transition: "stroke-dashoffset 0.6s ease" }}
              />
            </svg>
            <span style={{ fontSize: "0.78rem", fontWeight: "700", color: isLight ? "#4f46e5" : "#a5b4fc" }}>{solvedPct}%</span>
          </div>
        </div>
      </div>

      {/* ── DIFFICULTY BREAKDOWN BAR ── */}
      <div className="diff-breakdown-bar" style={{
        background: isLight ? "#ffffff" : "#0d111a",
        border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.06)",
        boxShadow: isLight ? "0 1px 3px rgba(0,0,0,0.04)" : "none",
      }}>
        <DiffBar label="Easy"   count={easyCount}   total={totalCount} color={isLight ? "#059669" : "#34d399"} bg="rgba(16,185,129,0.12)" isLight={isLight} />
        <div className="diff-divider" style={{ background: isLight ? "#e2e8f0" : "rgba(255,255,255,0.07)" }} />
        <DiffBar label="Medium" count={mediumCount} total={totalCount} color={isLight ? "#d97706" : "#fbbf24"} bg="rgba(245,158,11,0.12)" isLight={isLight} />
        <div className="diff-divider" style={{ background: isLight ? "#e2e8f0" : "rgba(255,255,255,0.07)" }} />
        <DiffBar label="Hard"   count={hardCount}   total={totalCount} color={isLight ? "#dc2626" : "#f87171"} bg="rgba(239,68,68,0.12)"  isLight={isLight} />
        <div className="diff-completion-right">
          <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Overall</span>
          <div style={{ width: "80px", height: "5px", borderRadius: "99px", background: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.07)", overflow: "hidden" }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${solvedPct}%` }} transition={{ duration: 0.8, delay: 0.2 }}
              style={{ height: "100%", background: "linear-gradient(90deg,#6366f1,#818cf8)", borderRadius: "99px" }} />
          </div>
          <span style={{ fontSize: "0.75rem", fontWeight: "700", color: isLight ? "#4f46e5" : "#a5b4fc" }}>{solvedPct}%</span>
        </div>
      </div>

      {/* ── ULTRA-MODERN COMPACT FILTER BAR ── */}
      <div
        className="problems-filter-row"
        style={{
          position: "relative",
          background: isLight ? "#ffffff" : "#0d111a",
          border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.08)",
          borderRadius: "9999px",
          padding: "6px 10px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexWrap: "wrap",
          boxShadow: isLight
            ? "0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)"
            : "0 4px 24px -2px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.04)",
          overflow: "hidden"
        }}
      >
        {/* Top-Left Ambient Accent Glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "24px",
            width: "120px",
            height: "2px",
            background: "linear-gradient(90deg, #6366f1, #a855f7, transparent)",
            opacity: 0.85,
            pointerEvents: "none"
          }}
        />

        {/* Bottom-Right Ambient Accent Glow */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: "36px",
            width: "140px",
            height: "2px",
            background: "linear-gradient(90deg, transparent, #a855f7, #6366f1)",
            opacity: 0.85,
            pointerEvents: "none"
          }}
        />

        {/* 1. Pill Search Input with ⌘K Shortcut */}
        <div
          className="problems-search-box"
          style={{
            borderRadius: "9999px",
            background: isLight ? "#f8fafc" : "#080c14",
            border: isSearchFocused
              ? isLight ? "1px solid #6366f1" : "1px solid #818cf8"
              : isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.08)",
            boxShadow: isSearchFocused
              ? isLight ? "0 0 0 3px rgba(99, 102, 241, 0.15)" : "0 0 0 3px rgba(99, 102, 241, 0.25)"
              : isLight ? "0 1px 2px rgba(0,0,0,0.02)" : "none",
            height: "36px",
            padding: "0 12px",
            flex: "1 1 200px",
            minWidth: "160px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <Search size={14} style={{ color: isSearchFocused ? "#6366f1" : "#94a3b8", flexShrink: 0, transition: "color 0.15s ease" }} />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search problems or topics..."
            style={{
              color: isLight ? "#0f172a" : "#f8fafc",
              fontSize: "0.82rem",
              fontWeight: "500"
            }}
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              title="Clear search"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                padding: "2px",
                borderRadius: "4px"
              }}
            >
              <X size={13} />
            </button>
          ) : (
            <kbd
              style={{
                fontSize: "0.68rem",
                padding: "2px 6px",
                borderRadius: "5px",
                background: isLight ? "#e2e8f0" : "rgba(255,255,255,0.08)",
                color: "#94a3b8",
                fontWeight: "600",
                letterSpacing: "0.02em",
                fontFamily: "inherit"
              }}
            >
              ⌘K
            </kbd>
          )}
        </div>

        {/* 2. Modern Segmented Difficulty Switcher (Pill with Distinct Icons) */}
        <div
          className="diff-tabs"
          style={{
            background: isLight ? "#f8fafc" : "rgba(255,255,255,0.03)",
            border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.06)",
            borderRadius: "9999px",
            padding: "3px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            gap: "3px"
          }}
        >
          {/* All Tab */}
          <button
            type="button"
            onClick={() => setDifficulty("All")}
            style={{
              background: difficulty === "All"
                ? isLight ? "#0f172a" : "#111827"
                : "transparent",
              border: difficulty === "All"
                ? isLight ? "1px solid #0f172a" : "1px solid rgba(99, 102, 241, 0.45)"
                : "1px solid transparent",
              color: difficulty === "All" ? "#ffffff" : isLight ? "#475569" : "#cbd5e1",
              boxShadow: difficulty === "All" ? "0 2px 10px rgba(99, 102, 241, 0.35)" : "none",
              borderRadius: "9999px",
              padding: "4px 12px",
              fontSize: "0.78rem",
              fontWeight: "700",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              transition: "all 0.15s ease",
              lineHeight: 1
            }}
          >
            <LayoutGrid size={13} style={{ color: difficulty === "All" ? "#a5b4fc" : "#94a3b8" }} />
            <span>All</span>
          </button>

          {/* Easy Tab */}
          <button
            type="button"
            onClick={() => setDifficulty("Easy")}
            style={{
              background: difficulty === "Easy"
                ? isLight ? "#ecfdf5" : "rgba(16, 185, 129, 0.16)"
                : "transparent",
              border: difficulty === "Easy"
                ? isLight ? "1px solid #a7f3d0" : "1px solid rgba(52, 211, 153, 0.35)"
                : "1px solid transparent",
              color: difficulty === "Easy" ? (isLight ? "#059669" : "#34d399") : isLight ? "#475569" : "#cbd5e1",
              boxShadow: difficulty === "Easy" && isLight ? "0 1px 3px rgba(16, 185, 129, 0.15)" : "none",
              borderRadius: "9999px",
              padding: "4px 12px",
              fontSize: "0.78rem",
              fontWeight: "700",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              transition: "all 0.15s ease",
              lineHeight: 1
            }}
          >
            <Leaf size={13} style={{ color: isLight ? "#059669" : "#34d399" }} />
            <span>Easy</span>
          </button>

          {/* Medium Tab */}
          <button
            type="button"
            onClick={() => setDifficulty("Medium")}
            style={{
              background: difficulty === "Medium"
                ? isLight ? "#fffbeb" : "rgba(245, 158, 11, 0.16)"
                : "transparent",
              border: difficulty === "Medium"
                ? isLight ? "1px solid #fde68a" : "1px solid rgba(251, 191, 36, 0.35)"
                : "1px solid transparent",
              color: difficulty === "Medium" ? (isLight ? "#d97706" : "#fbbf24") : isLight ? "#475569" : "#cbd5e1",
              boxShadow: difficulty === "Medium" && isLight ? "0 1px 3px rgba(245, 158, 11, 0.15)" : "none",
              borderRadius: "9999px",
              padding: "4px 12px",
              fontSize: "0.78rem",
              fontWeight: "700",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              transition: "all 0.15s ease",
              lineHeight: 1
            }}
          >
            <Zap size={13} style={{ color: isLight ? "#d97706" : "#fbbf24", fill: isLight ? "#d97706" : "#fbbf24" }} />
            <span>Medium</span>
          </button>

          {/* Hard Tab */}
          <button
            type="button"
            onClick={() => setDifficulty("Hard")}
            style={{
              background: difficulty === "Hard"
                ? isLight ? "#fef2f2" : "rgba(239, 68, 68, 0.16)"
                : "transparent",
              border: difficulty === "Hard"
                ? isLight ? "1px solid #fecaca" : "1px solid rgba(248, 113, 113, 0.35)"
                : "1px solid transparent",
              color: difficulty === "Hard" ? (isLight ? "#dc2626" : "#f87171") : isLight ? "#475569" : "#cbd5e1",
              boxShadow: difficulty === "Hard" && isLight ? "0 1px 3px rgba(239, 68, 68, 0.15)" : "none",
              borderRadius: "9999px",
              padding: "4px 12px",
              fontSize: "0.78rem",
              fontWeight: "700",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              transition: "all 0.15s ease",
              lineHeight: 1
            }}
          >
            <Flame size={13} style={{ color: isLight ? "#dc2626" : "#f87171", fill: isLight ? "#dc2626" : "#f87171" }} />
            <span>Hard</span>
          </button>
        </div>

        {/* 3. All Topics Dropdown Pill */}
        <div
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            borderRadius: "9999px",
            background: isLight ? "#ffffff" : "#080c14",
            border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255, 255, 255, 0.1)",
            height: "36px",
            boxShadow: isLight ? "0 1px 2px rgba(0,0,0,0.03)" : "none"
          }}
        >
          <Layers size={13} style={{ position: "absolute", left: "12px", pointerEvents: "none", color: isLight ? "#334155" : "#94a3b8" }} />
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            style={{
              padding: "0 28px 0 32px",
              height: "100%",
              borderRadius: "9999px",
              border: "none",
              background: "transparent",
              outline: "none",
              cursor: "pointer",
              fontSize: "0.8rem",
              fontWeight: "600",
              color: isLight ? "#0f172a" : "#f1f5f9",
              appearance: "none"
            }}
            title="Filter by Topic"
          >
            <option value="All">All Topics</option>
            {topics.filter((t) => t !== "All").map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <ChevronDown size={12} style={{ position: "absolute", right: "10px", pointerEvents: "none", color: isLight ? "#334155" : "#94a3b8" }} />
        </div>

        {/* 4. All Status Dropdown Pill */}
        <div
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            borderRadius: "9999px",
            background: isLight ? "#ffffff" : "#080c14",
            border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255, 255, 255, 0.1)",
            height: "36px",
            boxShadow: isLight ? "0 1px 2px rgba(0,0,0,0.03)" : "none"
          }}
        >
          <Flag size={13} style={{ position: "absolute", left: "12px", pointerEvents: "none", color: isLight ? "#334155" : "#94a3b8" }} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "0 28px 0 32px",
              height: "100%",
              borderRadius: "9999px",
              border: "none",
              background: "transparent",
              outline: "none",
              cursor: "pointer",
              fontSize: "0.8rem",
              fontWeight: "600",
              color: isLight ? "#0f172a" : "#f1f5f9",
              appearance: "none"
            }}
            title="Filter by Solved Status"
          >
            <option value="All">All Status</option>
            <option value="Solved">✓ Solved</option>
            <option value="Attempted">○ Attempted</option>
            <option value="Unsolved">○ Unsolved</option>
          </select>
          <ChevronDown size={12} style={{ position: "absolute", right: "10px", pointerEvents: "none", color: isLight ? "#334155" : "#94a3b8" }} />
        </div>

        {/* 5. Sort Dropdown Pill */}
        <div
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            borderRadius: "9999px",
            background: isLight ? "#ffffff" : "#080c14",
            border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255, 255, 255, 0.1)",
            height: "36px",
            boxShadow: isLight ? "0 1px 2px rgba(0,0,0,0.03)" : "none"
          }}
        >
          <ArrowUpDown size={13} style={{ position: "absolute", left: "12px", pointerEvents: "none", color: isLight ? "#334155" : "#94a3b8" }} />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: "0 28px 0 32px",
              height: "100%",
              borderRadius: "9999px",
              border: "none",
              background: "transparent",
              outline: "none",
              cursor: "pointer",
              fontSize: "0.8rem",
              fontWeight: "600",
              color: isLight ? "#0f172a" : "#f1f5f9",
              appearance: "none"
            }}
            title="Sort Problems"
          >
            <option value="default">Sort: Default</option>
            <option value="difficulty">Difficulty ↑</option>
            <option value="acceptance">Acceptance ↓</option>
            <option value="attempts">Most Attempted</option>
            <option value="points">Points ↓</option>
          </select>
          <ChevronDown size={12} style={{ position: "absolute", right: "10px", pointerEvents: "none", color: isLight ? "#334155" : "#94a3b8" }} />
        </div>

        {/* Clear Filters Badge Button */}
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            title="Reset all active filters"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              background: isLight ? "#fee2e2" : "rgba(239, 68, 68, 0.15)",
              border: isLight ? "1px solid #fca5a5" : "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "9999px",
              padding: "0 12px",
              height: "36px",
              color: isLight ? "#b91c1c" : "#fca5a5",
              fontSize: "0.78rem",
              fontWeight: "700",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            <X size={12} /> Clear
          </button>
        )}

        {/* 6. Problem Counter Pill Badge */}
        <div
          className="problems-result-count"
          style={{
            background: isLight ? "#eef2ff" : "rgba(99, 102, 241, 0.12)",
            border: isLight ? "1px solid #c7d2fe" : "1px solid rgba(99, 102, 241, 0.25)",
            borderRadius: "9999px",
            height: "36px",
            padding: "0 14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginLeft: "auto"
          }}
        >
          <List size={15} style={{ color: "#6366f1", flexShrink: 0 }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.1 }}>
            <span style={{ fontSize: "0.8rem", fontWeight: "800", color: isLight ? "#4f46e5" : "#a5b4fc" }}>
              {filteredProblems.length} / {totalCount}
            </span>
            <span style={{ fontSize: "0.62rem", color: isLight ? "#64748b" : "#94a3b8", fontWeight: "600" }}>
              problems
            </span>
          </div>
        </div>
      </div>

      {/* ── PROBLEMS TABLE / CARDS ── */}
      <div className="problems-table-card" style={{
        background: isLight ? "#ffffff" : "#0d111a",
        border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.07)",
        boxShadow: isLight ? "0 1px 4px rgba(0,0,0,0.04)" : "none",
      }}>

        {/* Desktop Table */}
        <div className="problems-desktop-table">
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: "44px" }} />
                <col />
                <col style={{ width: "100px" }} />
                <col style={{ width: "130px" }} />
                <col style={{ width: "90px" }} />
                <col style={{ width: "90px" }} />
                <col style={{ width: "100px" }} />
              </colgroup>
              <thead>
                <tr style={{
                  background: isLight ? "#f8fafc" : "#080c14",
                  borderBottom: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.07)",
                  color: isLight ? "#64748b" : "#475569", fontSize: "0.7rem",
                  textTransform: "uppercase", letterSpacing: "0.07em"
                }}>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Problem</th>
                  <th style={thStyle}>Difficulty</th>
                  <th style={thStyle}>Topic</th>
                  <th style={thStyle}>Acceptance</th>
                  <th style={thStyle}>Your Tries</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredProblems.map((problem, index) => {
                    const subCount = userSubmissions.filter(s =>
                      (s.problemId || s.problem || "").toLowerCase() === (problem.id || "").toLowerCase() ||
                      (s.problem || "").toLowerCase() === (problem.title || "").toLowerCase()
                    ).length;
                    const isSolved    = problem.status === "Solved";
                    const isAttempted = problem.status === "Attempted";
                    const dc = DIFF_META[problem.difficulty] || DIFF_META.Medium;

                    return (
                      <motion.tr key={problem.id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ duration: 0.15, delay: index * 0.012 }}
                        onClick={() => navigate(`/problems/${problem.id}`)}
                        style={{
                          borderBottom: isLight ? "1px solid #f1f5f9" : "1px solid rgba(255,255,255,0.04)",
                          cursor: "pointer", transition: "background 0.1s ease"
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = isLight ? "rgba(0,0,0,0.02)" : (isSolved ? "rgba(16,185,129,0.04)" : "rgba(99,102,241,0.05)"); }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                      >
                        <td style={{ ...tdStyle, color: isLight ? "#94a3b8" : "#334155", fontFamily: "monospace", fontSize: "0.75rem" }}>
                          {isSolved
                            ? <CheckCircle2 size={14} style={{ color: "#10b981", display: "block", margin: "0 auto" }} />
                            : <span style={{ display: "block", textAlign: "center" }}>{String(index + 1).padStart(2, "0")}</span>
                          }
                        </td>
                        <td style={tdStyle}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                            <span style={{ color: isLight ? "#0f172a" : "#e2e8f0", fontSize: "0.875rem", fontWeight: "600", lineHeight: 1.3 }}>{problem.title}</span>
                            {problem.points && <span style={{ fontSize: "0.72rem", color: isLight ? "#64748b" : "#475569" }}>{problem.points} pts</span>}
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <span style={{
                            display: "inline-block", padding: "2px 9px", borderRadius: "999px",
                            fontSize: "0.72rem", fontWeight: "700",
                            background: dc.bg, color: dc.text, border: `1px solid ${dc.border}`
                          }}>
                            {problem.difficulty}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <span style={{
                            background: isLight ? "#f1f5f9" : "#080c14",
                            border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.06)",
                            padding: "2px 7px", borderRadius: "5px", fontSize: "0.73rem",
                            color: isLight ? "#475569" : "#64748b",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            display: "inline-block", maxWidth: "120px"
                          }}>
                            {problem.topic || "—"}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                            <span style={{ fontSize: "0.8rem", fontWeight: "600", color: isLight ? "#334155" : "#94a3b8" }}>
                              {problem.acceptance != null ? `${problem.acceptance}%` : "—"}
                            </span>
                            {problem.acceptance != null && (
                              <div style={{ width: "54px", height: "3px", background: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.07)", borderRadius: "99px", overflow: "hidden" }}>
                                <div style={{
                                  width: `${Math.min(problem.acceptance, 100)}%`, height: "100%", borderRadius: "99px",
                                  background: problem.acceptance >= 60 ? "#10b981" : problem.acceptance >= 40 ? "#f59e0b" : "#ef4444"
                                }} />
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ ...tdStyle, fontSize: "0.8rem" }}>
                          {subCount > 0
                            ? <span style={{ color: isLight ? "#475569" : "#64748b" }}>{subCount}×</span>
                            : <span style={{ color: isLight ? "#cbd5e1" : "#2d3748" }}>—</span>
                          }
                        </td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>
                          {isSolved ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#10b981", fontSize: "0.75rem", fontWeight: "700" }}>
                              <CheckCircle2 size={13} /> Solved
                            </span>
                          ) : isAttempted ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#f59e0b", fontSize: "0.75rem", fontWeight: "600" }}>
                              <Timer size={13} /> Attempted
                            </span>
                          ) : (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: isLight ? "#94a3b8" : "#334155", fontSize: "0.75rem" }}>
                              <Circle size={12} /> —
                            </span>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="problems-mobile-cards">
          <AnimatePresence>
            {filteredProblems.map((problem, index) => {
              const subCount = userSubmissions.filter(s =>
                (s.problemId || s.problem || "").toLowerCase() === (problem.id || "").toLowerCase() ||
                (s.problem || "").toLowerCase() === (problem.title || "").toLowerCase()
              ).length;
              const isSolved    = problem.status === "Solved";
              const isAttempted = problem.status === "Attempted";
              const dc = DIFF_META[problem.difficulty] || DIFF_META.Medium;

              return (
                <motion.div key={problem.id} className="problem-mobile-card"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ duration: 0.15, delay: index * 0.012 }}
                  onClick={() => navigate(`/problems/${problem.id}`)}
                  style={{
                    borderBottom: isLight ? "1px solid #f1f5f9" : "1px solid rgba(255,255,255,0.04)",
                    background: isSolved ? (isLight ? "rgba(16,185,129,0.03)" : "rgba(16,185,129,0.02)") : "transparent"
                  }}
                >
                  <div className="pmc-top-row">
                    <div className="pmc-index-col" style={{ color: isLight ? "#94a3b8" : "#334155" }}>
                      {isSolved
                        ? <CheckCircle2 size={15} style={{ color: "#10b981" }} />
                        : <span style={{ fontSize: "0.72rem", fontFamily: "monospace" }}>{String(index + 1).padStart(2, "0")}</span>
                      }
                    </div>
                    <div className="pmc-title-col">
                      <span className="pmc-title" style={{ color: isLight ? "#0f172a" : "#e2e8f0" }}>{problem.title}</span>
                      {problem.points && <span className="pmc-points" style={{ color: isLight ? "#64748b" : "#475569" }}>{problem.points} pts</span>}
                    </div>
                    <div className="pmc-status-col">
                      {isSolved
                        ? <span style={{ color: "#10b981", fontSize: "0.7rem", fontWeight: "700" }}>✓ Solved</span>
                        : isAttempted
                        ? <span style={{ color: "#f59e0b", fontSize: "0.7rem", fontWeight: "600" }}>◷ Tried</span>
                        : null}
                    </div>
                  </div>
                  <div className="pmc-meta-row">
                    <span className="pmc-diff-badge" style={{ background: dc.bg, color: dc.text, border: `1px solid ${dc.border}` }}>
                      {problem.difficulty}
                    </span>
                    {problem.topic && (
                      <span className="pmc-topic-badge" style={{
                        background: isLight ? "#f1f5f9" : "#0d111a",
                        border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.08)",
                        color: isLight ? "#475569" : "#64748b"
                      }}>
                        {problem.topic}
                      </span>
                    )}
                    {problem.acceptance != null && (
                      <>
                        <span className="pmc-sep" style={{ color: isLight ? "#cbd5e1" : "#334155" }}>·</span>
                        <span className="pmc-acceptance" style={{ color: isLight ? "#475569" : "#94a3b8" }}>{problem.acceptance}% AC</span>
                      </>
                    )}
                    {subCount > 0 && (
                      <span className="pmc-tries" style={{ color: "#64748b" }}>{subCount} tries</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty state */}
        {!filteredProblems.length && (
          <div style={{ padding: "56px 24px", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "10px" }}>🔍</div>
            <p style={{ fontSize: "0.94rem", fontWeight: "600", color: isLight ? "#0f172a" : "#e2e8f0", margin: "0 0 4px 0" }}>
              No problems match your filters
            </p>
            <span style={{ fontSize: "0.8rem", color: isLight ? "#64748b" : "#475569" }}>
              Try adjusting search, difficulty, or topic.
            </span>
            <br />
            <button onClick={clearFilters} style={{
              marginTop: "14px",
              background: isLight ? "rgba(99,102,241,0.1)" : "rgba(99,102,241,0.12)",
              border: isLight ? "1px solid rgba(99,102,241,0.25)" : "1px solid rgba(99,102,241,0.3)",
              borderRadius: "7px", padding: "6px 16px",
              color: isLight ? "#4f46e5" : "#818cf8", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer"
            }}>
              Clear filters
            </button>
          </div>
        )}

        {filteredProblems.length > 0 && (
          <div className="problems-table-footer" style={{
            borderTop: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.05)",
          }}>
            <span style={{ fontSize: "0.73rem", color: isLight ? "#64748b" : "#334155" }}>
              Showing {filteredProblems.length} of {totalCount} problems
            </span>
            <span className="problems-footer-right" style={{ fontSize: "0.73rem", color: isLight ? "#64748b" : "#334155" }}>
              {solvedCount} solved · {attemptedCount} attempted · {remainingCount} remaining
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── helpers ───────────────────────────────────────────────────────────── */

function StatChip({ label, value, color, isLight }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "6px",
      background: isLight ? "#ffffff" : "#0d111a",
      border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.07)",
      boxShadow: isLight ? "0 1px 2px rgba(0,0,0,0.04)" : "none",
      borderRadius: "8px", padding: "5px 10px"
    }}>
      <span style={{ fontSize: "0.88rem", fontWeight: "800", color }}>{value}</span>
      <span style={{ fontSize: "0.7rem", color: isLight ? "#64748b" : "#94a3b8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
    </div>
  );
}

function DiffBar({ label, count, total, color, bg, isLight }) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <span style={{ fontSize: "0.72rem", fontWeight: "700", padding: "2px 8px", borderRadius: "4px", background: bg, color, letterSpacing: "0.04em" }}>
        {label}
      </span>
      <span style={{ fontSize: "0.88rem", fontWeight: "800", color: isLight ? "#0f172a" : "#f8fafc" }}>{count}</span>
      <div style={{ width: "60px", height: "4px", background: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.07)", borderRadius: "99px", overflow: "hidden" }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, delay: 0.1 }}
          style={{ height: "100%", background: color, borderRadius: "99px" }} />
      </div>
      <span style={{ fontSize: "0.72rem", color: "#64748b" }}>{pct}%</span>
    </div>
  );
}

const thStyle = { padding: "9px 12px", fontWeight: "600", textAlign: "left" };
const tdStyle = { padding: "10px 12px", verticalAlign: "middle" };

function getSelectStyle(isLight) {
  return {
    background: isLight ? "#f8fafc" : "#080c14",
    border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255,255,255,0.12)",
    borderRadius: "8px",
    padding: "6px 12px",
    height: "34px",
    color: isLight ? "#0f172a" : "#f1f5f9",
    fontSize: "0.8rem",
    fontWeight: "600",
    cursor: "pointer",
    outline: "none",
    boxShadow: isLight ? "0 1px 2px rgba(0,0,0,0.03)" : "none",
    transition: "border-color 0.15s ease, box-shadow 0.15s ease"
  };
}
