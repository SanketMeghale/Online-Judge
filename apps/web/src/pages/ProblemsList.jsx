import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Clock,
  Filter,
  Hash,
  Layers,
  Search,
  SlidersHorizontal,
  Target,
  Timer,
  TrendingUp,
  X
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
          <span style={{ fontSize: "0.64rem", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: "#6366f1" }}>
            Practice Arena
          </span>
          <h1 style={{ fontSize: "1.15rem", fontWeight: "800", color: isLight ? "#0f172a" : "#f8fafc", margin: "1px 0 0", letterSpacing: "-0.015em" }}>
            Problems
          </h1>
        </div>
        <div className="problems-stat-chips">
          <StatChip label="Total"     value={totalCount}     color="#818cf8" isLight={isLight} />
          <StatChip label="Solved"    value={solvedCount}    color="#10b981" isLight={isLight} />
          <StatChip label="Attempted" value={attemptedCount} color="#f59e0b" isLight={isLight} />
          <StatChip label="Remaining" value={remainingCount} color={isLight ? "#64748b" : "#94a3b8"} isLight={isLight} />
          <div style={{
            display: "flex", alignItems: "center", gap: "5px",
            background: isLight ? "#ffffff" : "#0d111a",
            border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.07)",
            borderRadius: "6px", padding: "3px 8px"
          }}>
            <svg width="22" height="22" viewBox="0 0 28 28">
              <circle cx="14" cy="14" r="11" fill="none" stroke={isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.07)"} strokeWidth="2.5" />
              <circle cx="14" cy="14" r="11" fill="none" stroke="#6366f1" strokeWidth="2.5"
                strokeDasharray={`${2 * Math.PI * 11}`}
                strokeDashoffset={`${2 * Math.PI * 11 * (1 - solvedPct / 100)}`}
                strokeLinecap="round" transform="rotate(-90 14 14)"
                style={{ transition: "stroke-dashoffset 0.6s ease" }}
              />
            </svg>
            <span style={{ fontSize: "0.70rem", fontWeight: "700", color: isLight ? "#4f46e5" : "#a5b4fc" }}>{solvedPct}%</span>
          </div>
        </div>
      </div>

      {/* ── DIFFICULTY BREAKDOWN BAR ── */}
      <div className="diff-breakdown-bar" style={{
        background: isLight ? "#ffffff" : "#0d111a",
        border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.06)",
        boxShadow: isLight ? "0 1px 3px rgba(0,0,0,0.04)" : "none",
        padding: "6px 12px",
        gap: "14px"
      }}>
        <DiffBar label="Easy"   count={easyCount}   total={totalCount} color={isLight ? "#059669" : "#34d399"} bg="rgba(16,185,129,0.12)" isLight={isLight} />
        <div className="diff-divider" style={{ background: isLight ? "#e2e8f0" : "rgba(255,255,255,0.07)", height: "20px" }} />
        <DiffBar label="Medium" count={mediumCount} total={totalCount} color={isLight ? "#d97706" : "#fbbf24"} bg="rgba(245,158,11,0.12)" isLight={isLight} />
        <div className="diff-divider" style={{ background: isLight ? "#e2e8f0" : "rgba(255,255,255,0.07)", height: "20px" }} />
        <DiffBar label="Hard"   count={hardCount}   total={totalCount} color={isLight ? "#dc2626" : "#f87171"} bg="rgba(239,68,68,0.12)"  isLight={isLight} />
        <div className="diff-completion-right">
          <span style={{ fontSize: "0.68rem", color: "#64748b" }}>Overall</span>
          <div style={{ width: "60px", height: "3.5px", borderRadius: "99px", background: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.07)", overflow: "hidden" }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${solvedPct}%` }} transition={{ duration: 0.8, delay: 0.2 }}
              style={{ height: "100%", background: "linear-gradient(90deg,#6366f1,#818cf8)", borderRadius: "99px" }} />
          </div>
          <span style={{ fontSize: "0.68rem", fontWeight: "700", color: isLight ? "#4f46e5" : "#a5b4fc" }}>{solvedPct}%</span>
        </div>
      </div>

      {/* ── FILTER ROW ── */}
      <div
        className="problems-filter-row"
        style={{
          background: isLight ? "#ffffff" : "#0d111a",
          border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.08)",
          boxShadow: isLight ? "0 1px 4px rgba(0,0,0,0.04)" : "none",
          gap: "6px",
          padding: "6px 10px"
        }}
      >
        {/* Modern Search Box with Focus Glow */}
        <div
          className="problems-search-box"
          style={{
            background: isLight ? "#f8fafc" : "#080c14",
            border: isSearchFocused
              ? isLight ? "1px solid #6366f1" : "1px solid #818cf8"
              : isLight ? "1px solid #cbd5e1" : "1px solid rgba(255,255,255,0.12)",
            boxShadow: isSearchFocused
              ? isLight ? "0 0 0 2px rgba(99, 102, 241, 0.15)" : "0 0 0 2px rgba(99, 102, 241, 0.25)"
              : isLight ? "0 1px 2px rgba(0,0,0,0.03)" : "none",
            height: "30px",
            padding: "4px 10px"
          }}
        >
          <Search size={13} style={{ color: isSearchFocused ? "#6366f1" : "#64748b", flexShrink: 0, transition: "color 0.15s ease" }} />
          <input
            type="text"
            value={query}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search problems or topics..."
            style={{
              color: isLight ? "#0f172a" : "#f8fafc",
              fontSize: "0.75rem",
              fontWeight: "500"
            }}
          />
          {query && (
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
              <X size={12} />
            </button>
          )}
        </div>

        {/* Modern Segmented Difficulty Switcher */}
        <div
          className="diff-tabs"
          style={{
            background: isLight ? "#f1f5f9" : "rgba(255,255,255,0.04)",
            border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.07)",
            height: "30px",
            padding: "2px"
          }}
        >
          {["All", "Easy", "Medium", "Hard"].map((d) => {
            const active = difficulty === d;
            const col = d === "Easy"
              ? (isLight ? "#059669" : "#34d399")
              : d === "Medium"
              ? (isLight ? "#d97706" : "#fbbf24")
              : d === "Hard"
              ? (isLight ? "#dc2626" : "#f87171")
              : (isLight ? "#4f46e5" : "#a5b4fc");

            const activeBg = d === "All"
              ? (isLight ? "#ffffff" : "rgba(99, 102, 241, 0.2)")
              : (isLight ? (d === "Easy" ? "#ecfdf5" : d === "Medium" ? "#fffbeb" : "#fef2f2") : DIFF_META[d]?.bg || "rgba(99,102,241,0.16)");

            const activeBorder = d === "All"
              ? (isLight ? "#cbd5e1" : "rgba(99, 102, 241, 0.4)")
              : (isLight ? (d === "Easy" ? "#a7f3d0" : d === "Medium" ? "#fde68a" : "#fecaca") : DIFF_META[d]?.border || "rgba(99,102,241,0.35)");

            return (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                style={{
                  background: active ? activeBg : "transparent",
                  border: active ? `1px solid ${activeBorder}` : "1px solid transparent",
                  color: active ? col : isLight ? "#64748b" : "#94a3b8",
                  padding: "2px 7px",
                  borderRadius: "4px",
                  fontSize: "0.72rem",
                  fontWeight: active ? "700" : "500",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  lineHeight: 1,
                  boxShadow: active && isLight ? "0 1px 2px rgba(0,0,0,0.04)" : "none"
                }}
              >
                {d}
              </button>
            );
          })}
        </div>

        {/* Dropdown Filters with Refined Styling */}
        <select value={topic} onChange={(e) => setTopic(e.target.value)} style={getSelectStyle(isLight)} title="Filter by Topic">
          <option value="All">All Topics</option>
          {topics.filter((t) => t !== "All").map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={getSelectStyle(isLight)} title="Filter by Solved Status">
          <option value="All">All Status</option>
          <option value="Solved">✓ Solved</option>
          <option value="Attempted">○ Attempted</option>
          <option value="Unsolved">○ Unsolved</option>
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={getSelectStyle(isLight)} title="Sort Problems">
          <option value="default">Sort: Default</option>
          <option value="difficulty">Difficulty ↑</option>
          <option value="acceptance">Acceptance ↓</option>
          <option value="attempts">Most Attempted</option>
          <option value="points">Points ↓</option>
        </select>

        {/* Clear Filters Badge Button */}
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            title="Reset all active filters"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "3px",
              background: isLight ? "#fee2e2" : "rgba(239, 68, 68, 0.15)",
              border: isLight ? "1px solid #fca5a5" : "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "6px",
              padding: "3px 8px",
              height: "30px",
              color: isLight ? "#b91c1c" : "#fca5a5",
              fontSize: "0.72rem",
              fontWeight: "700",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            <X size={11} /> Clear
          </button>
        )}

        {/* Live Problem Count Badge */}
        <span
          className="problems-result-count"
          style={{
            background: isLight ? "#f1f5f9" : "rgba(255, 255, 255, 0.05)",
            border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.07)",
            padding: "4px 8px",
            borderRadius: "6px",
            color: isLight ? "#475569" : "#94a3b8",
            fontWeight: "600",
            fontSize: "0.70rem"
          }}
        >
          <strong style={{ color: isLight ? "#0f172a" : "#ffffff" }}>{filteredProblems.length}</strong> / {totalCount} problems
        </span>
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
                <col style={{ width: "38px" }} />
                <col />
                <col style={{ width: "90px" }} />
                <col style={{ width: "115px" }} />
                <col style={{ width: "85px" }} />
                <col style={{ width: "80px" }} />
                <col style={{ width: "90px" }} />
              </colgroup>
              <thead>
                <tr style={{
                  background: isLight ? "#f8fafc" : "#080c14",
                  borderBottom: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.07)",
                  color: isLight ? "#64748b" : "#475569", fontSize: "0.64rem",
                  textTransform: "uppercase", letterSpacing: "0.06em"
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
                        <td style={{ ...tdStyle, color: isLight ? "#94a3b8" : "#334155", fontFamily: "monospace", fontSize: "0.68rem" }}>
                          {isSolved
                            ? <CheckCircle2 size={13} style={{ color: "#10b981", display: "block", margin: "0 auto" }} />
                            : <span style={{ display: "block", textAlign: "center" }}>{String(index + 1).padStart(2, "0")}</span>
                          }
                        </td>
                        <td style={tdStyle}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                            <span style={{ color: isLight ? "#0f172a" : "#e2e8f0", fontSize: "0.78rem", fontWeight: "600", lineHeight: 1.25 }}>{problem.title}</span>
                            {problem.points && <span style={{ fontSize: "0.64rem", color: isLight ? "#64748b" : "#475569" }}>{problem.points} pts</span>}
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <span style={{
                            display: "inline-block", padding: "1.5px 7px", borderRadius: "4px",
                            fontSize: "0.64rem", fontWeight: "700",
                            background: dc.bg, color: dc.text, border: `1px solid ${dc.border}`
                          }}>
                            {problem.difficulty}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <span style={{
                            background: isLight ? "#f1f5f9" : "#080c14",
                            border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.06)",
                            padding: "1.5px 6px", borderRadius: "4px", fontSize: "0.66rem",
                            color: isLight ? "#475569" : "#64748b",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            display: "inline-block", maxWidth: "110px"
                          }}>
                            {problem.topic || "—"}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span style={{ fontSize: "0.72rem", fontWeight: "600", color: isLight ? "#334155" : "#94a3b8" }}>
                              {problem.acceptance != null ? `${problem.acceptance}%` : "—"}
                            </span>
                            {problem.acceptance != null && (
                              <div style={{ width: "42px", height: "2.5px", background: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.07)", borderRadius: "99px", overflow: "hidden" }}>
                                <div style={{
                                  width: `${Math.min(problem.acceptance, 100)}%`, height: "100%", borderRadius: "99px",
                                  background: problem.acceptance >= 60 ? "#10b981" : problem.acceptance >= 40 ? "#f59e0b" : "#ef4444"
                                }} />
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ ...tdStyle, fontSize: "0.72rem" }}>
                          {subCount > 0
                            ? <span style={{ color: isLight ? "#475569" : "#64748b" }}>{subCount}×</span>
                            : <span style={{ color: isLight ? "#cbd5e1" : "#2d3748" }}>—</span>
                          }
                        </td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>
                          {isSolved ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", color: "#10b981", fontSize: "0.68rem", fontWeight: "700" }}>
                              <CheckCircle2 size={11} /> Solved
                            </span>
                          ) : isAttempted ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", color: "#f59e0b", fontSize: "0.68rem", fontWeight: "600" }}>
                              <Timer size={11} /> Attempted
                            </span>
                          ) : (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", color: isLight ? "#94a3b8" : "#334155", fontSize: "0.68rem" }}>
                              <Circle size={10} /> —
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
                        ? <CheckCircle2 size={13} style={{ color: "#10b981" }} />
                        : <span style={{ fontSize: "0.68rem", fontFamily: "monospace" }}>{String(index + 1).padStart(2, "0")}</span>
                      }
                    </div>
                    <div className="pmc-title-col">
                      <span className="pmc-title" style={{ color: isLight ? "#0f172a" : "#e2e8f0", fontSize: "0.78rem" }}>{problem.title}</span>
                      {problem.points && <span className="pmc-points" style={{ color: isLight ? "#64748b" : "#475569", fontSize: "0.64rem" }}>{problem.points} pts</span>}
                    </div>
                    <div className="pmc-status-col">
                      {isSolved
                        ? <span style={{ color: "#10b981", fontSize: "0.66rem", fontWeight: "700" }}>✓ Solved</span>
                        : isAttempted
                        ? <span style={{ color: "#f59e0b", fontSize: "0.66rem", fontWeight: "600" }}>◷ Tried</span>
                        : null}
                    </div>
                  </div>
                  <div className="pmc-meta-row">
                    <span className="pmc-diff-badge" style={{ background: dc.bg, color: dc.text, border: `1px solid ${dc.border}`, fontSize: "0.64rem" }}>
                      {problem.difficulty}
                    </span>
                    {problem.topic && (
                      <span className="pmc-topic-badge" style={{
                        background: isLight ? "#f1f5f9" : "#0d111a",
                        border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.08)",
                        color: isLight ? "#475569" : "#64748b",
                        fontSize: "0.64rem"
                      }}>
                        {problem.topic}
                      </span>
                    )}
                    {problem.acceptance != null && (
                      <>
                        <span className="pmc-sep" style={{ color: isLight ? "#cbd5e1" : "#334155" }}>·</span>
                        <span className="pmc-acceptance" style={{ color: isLight ? "#475569" : "#94a3b8", fontSize: "0.64rem" }}>{problem.acceptance}% AC</span>
                      </>
                    )}
                    {subCount > 0 && (
                      <span className="pmc-tries" style={{ color: "#64748b", fontSize: "0.64rem" }}>{subCount} tries</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty state */}
        {!filteredProblems.length && (
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <div style={{ fontSize: "1.6rem", marginBottom: "8px" }}>🔍</div>
            <p style={{ fontSize: "0.84rem", fontWeight: "600", color: isLight ? "#0f172a" : "#e2e8f0", margin: "0 0 3px 0" }}>
              No problems match your filters
            </p>
            <span style={{ fontSize: "0.72rem", color: isLight ? "#64748b" : "#475569" }}>
              Try adjusting search, difficulty, or topic.
            </span>
            <br />
            <button onClick={clearFilters} style={{
              marginTop: "12px",
              background: isLight ? "rgba(99,102,241,0.1)" : "rgba(99,102,241,0.12)",
              border: isLight ? "1px solid rgba(99,102,241,0.25)" : "1px solid rgba(99,102,241,0.3)",
              borderRadius: "6px", padding: "5px 12px",
              color: isLight ? "#4f46e5" : "#818cf8", fontSize: "0.72rem", fontWeight: "600", cursor: "pointer"
            }}>
              Clear filters
            </button>
          </div>
        )}

        {filteredProblems.length > 0 && (
          <div className="problems-table-footer" style={{
            borderTop: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.05)",
            padding: "6px 12px"
          }}>
            <span style={{ fontSize: "0.66rem", color: isLight ? "#64748b" : "#334155" }}>
              Showing {filteredProblems.length} of {totalCount} problems
            </span>
            <span className="problems-footer-right" style={{ fontSize: "0.66rem", color: isLight ? "#64748b" : "#334155" }}>
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
      display: "flex", alignItems: "center", gap: "5px",
      background: isLight ? "#ffffff" : "#0d111a",
      border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.07)",
      boxShadow: isLight ? "0 1px 2px rgba(0,0,0,0.04)" : "none",
      borderRadius: "6px", padding: "3px 8px"
    }}>
      <span style={{ fontSize: "0.76rem", fontWeight: "800", color }}>{value}</span>
      <span style={{ fontSize: "0.62rem", color: isLight ? "#64748b" : "#94a3b8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.03em" }}>{label}</span>
    </div>
  );
}

function DiffBar({ label, count, total, color, bg, isLight }) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span style={{ fontSize: "0.64rem", fontWeight: "700", padding: "1.5px 6px", borderRadius: "4px", background: bg, color, letterSpacing: "0.03em" }}>
        {label}
      </span>
      <span style={{ fontSize: "0.76rem", fontWeight: "800", color: isLight ? "#0f172a" : "#f8fafc" }}>{count}</span>
      <div style={{ width: "48px", height: "3.5px", background: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.07)", borderRadius: "99px", overflow: "hidden" }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, delay: 0.1 }}
          style={{ height: "100%", background: color, borderRadius: "99px" }} />
      </div>
      <span style={{ fontSize: "0.66rem", color: "#64748b" }}>{pct}%</span>
    </div>
  );
}

const thStyle = { padding: "6px 10px", fontWeight: "600", textAlign: "left" };
const tdStyle = { padding: "7px 10px", verticalAlign: "middle" };

function getSelectStyle(isLight) {
  return {
    background: isLight ? "#f8fafc" : "#080c14",
    border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255,255,255,0.12)",
    borderRadius: "6px",
    padding: "4px 8px",
    height: "30px",
    color: isLight ? "#0f172a" : "#f1f5f9",
    fontSize: "0.72rem",
    fontWeight: "600",
    cursor: "pointer",
    outline: "none",
    boxShadow: isLight ? "0 1px 2px rgba(0,0,0,0.03)" : "none",
    transition: "border-color 0.15s ease, box-shadow 0.15s ease"
  };
}
