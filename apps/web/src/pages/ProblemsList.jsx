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

const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };

const DIFF_META = {
  Easy:   { bg: "rgba(16,185,129,0.1)",  text: "#34d399", border: "rgba(16,185,129,0.22)" },
  Medium: { bg: "rgba(245,158,11,0.1)",  text: "#fbbf24", border: "rgba(245,158,11,0.22)" },
  Hard:   { bg: "rgba(239,68,68,0.1)",   text: "#f87171", border: "rgba(239,68,68,0.22)" }
};

export default function ProblemsList() {
  const { user } = useAuth();
  const { getProblemsForUser, getSubmissionsForUser, syncBackendData } = useAppData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialTopic = searchParams.get("topic") || "All";

  const [query,        setQuery]        = useState("");
  const [difficulty,   setDifficulty]   = useState("All");
  const [topic,        setTopic]        = useState(initialTopic);
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy,       setSortBy]       = useState("default");

  useEffect(() => {
    if (syncBackendData) {
      syncBackendData();
    }
  }, [user?.id]);

  useEffect(() => {
    const t = searchParams.get("topic");
    if (t) setTopic(t);
  }, [searchParams]);

  const problems        = getProblemsForUser(user?.id);
  const userSubmissions = getSubmissionsForUser(user?.id) || [];

  const totalCount    = problems.length;
  const solvedCount   = problems.filter(p => p.status === "Solved").length;
  const attemptedCount= problems.filter(p => p.status === "Attempted").length;
  const remainingCount= Math.max(0, totalCount - solvedCount);
  const solvedPct     = totalCount ? Math.round((solvedCount / totalCount) * 100) : 0;

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
          (p.title  || "").toLowerCase().includes(q) ||
          (p.topic  || "").toLowerCase().includes(q);
        const matchesDifficulty = difficulty === "All" || p.difficulty === difficulty;
        const matchesTopic      = topic      === "All" || p.topic      === topic;
        const matchesStatus =
          statusFilter === "All"       ||
          (statusFilter === "Solved"   && p.status === "Solved")   ||
          (statusFilter === "Attempted"&& p.status === "Attempted")||
          (statusFilter === "Unsolved" && (!p.status || p.status === "Unsolved"));
        return matchesQuery && matchesDifficulty && matchesTopic && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "difficulty") return (difficultyOrder[a.difficulty]||2) - (difficultyOrder[b.difficulty]||2);
        if (sortBy === "acceptance") return (b.acceptance||0) - (a.acceptance||0);
        if (sortBy === "attempts")   return (b.submissions||0) - (a.submissions||0);
        if (sortBy === "points")     return (b.points||0) - (a.points||0);
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
      style={{ display: "flex", flexDirection: "column", gap: "14px", maxWidth: "1280px", margin: "0 auto", paddingBottom: "40px" }}
    >

      {/* ── COMPACT HEADER ─────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
            <span style={{ fontSize: "0.7rem", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6366f1" }}>
              Practice Arena
            </span>
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#f8fafc", margin: 0, letterSpacing: "-0.02em" }}>
            Problems
          </h1>
        </div>

        {/* Inline stat chips */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <StatChip label="Total"     value={totalCount}     color="#818cf8" />
          <StatChip label="Solved"    value={solvedCount}    color="#34d399" />
          <StatChip label="Attempted" value={attemptedCount} color="#fbbf24" />
          <StatChip label="Remaining" value={remainingCount} color="#64748b" />

          {/* Slim progress ring */}
          <div title={`${solvedPct}% solved`} style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: "#0d111a", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "8px", padding: "5px 10px"
          }}>
            <svg width="28" height="28" viewBox="0 0 28 28">
              <circle cx="14" cy="14" r="11" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="2.5" />
              <circle cx="14" cy="14" r="11" fill="none" stroke="#6366f1" strokeWidth="2.5"
                strokeDasharray={`${2*Math.PI*11}`}
                strokeDashoffset={`${2*Math.PI*11 * (1 - solvedPct/100)}`}
                strokeLinecap="round"
                transform="rotate(-90 14 14)"
                style={{ transition: "stroke-dashoffset 0.6s ease" }}
              />
            </svg>
            <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "#a5b4fc" }}>{solvedPct}%</span>
          </div>
        </div>
      </div>

      {/* ── DIFFICULTY BREAKDOWN BAR ────────────────────────────────────── */}
      <div style={{
        background: "#0d111a", border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "10px", padding: "10px 16px",
        display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap"
      }}>
        <DiffBar label="Easy"   count={easyCount}   total={totalCount} color="#34d399" bg="rgba(16,185,129,0.12)" />
        <div style={{ width: "1px", height: "28px", background: "rgba(255,255,255,0.07)" }} />
        <DiffBar label="Medium" count={mediumCount} total={totalCount} color="#fbbf24" bg="rgba(245,158,11,0.12)" />
        <div style={{ width: "1px", height: "28px", background: "rgba(255,255,255,0.07)" }} />
        <DiffBar label="Hard"   count={hardCount}   total={totalCount} color="#f87171" bg="rgba(239,68,68,0.12)" />
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Overall completion</span>
          <div style={{ width: "120px", height: "5px", borderRadius: "99px", background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${solvedPct}%` }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              style={{ height: "100%", background: "linear-gradient(90deg, #6366f1, #818cf8)", borderRadius: "99px" }}
            />
          </div>
          <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#a5b4fc" }}>{solvedPct}%</span>
        </div>
      </div>

      {/* ── FILTER ROW ──────────────────────────────────────────────────── */}
      <div style={{
        background: "#0d111a", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "10px", padding: "8px 12px",
        display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap"
      }}>
        {/* Search */}
        <div style={{
          display: "flex", alignItems: "center", gap: "7px",
          background: "#080c14", border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: "7px", padding: "6px 11px",
          flex: "1 1 220px", minWidth: "180px"
        }}>
          <Search size={14} style={{ color: "#64748b", flexShrink: 0 }} />
          <input
            type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search problems..."
            style={{ background: "transparent", border: "none", outline: "none", color: "#f8fafc", fontSize: "0.83rem", width: "100%" }}
          />
          {query && (
            <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", display: "flex", padding: 0 }}>
              <X size={13} />
            </button>
          )}
        </div>

        {/* Difficulty tabs */}
        <div style={{ display: "flex", gap: "2px", background: "#080c14", padding: "3px", borderRadius: "7px", border: "1px solid rgba(255,255,255,0.07)" }}>
          {["All", "Easy", "Medium", "Hard"].map(d => {
            const active = difficulty === d;
            const col = d === "Easy" ? "#34d399" : d === "Medium" ? "#fbbf24" : d === "Hard" ? "#f87171" : "#818cf8";
            return (
              <button key={d} onClick={() => setDifficulty(d)} style={{
                background: active ? (d === "All" ? "rgba(99,102,241,0.16)" : `${DIFF_META[d]?.bg || "rgba(99,102,241,0.16)"}`) : "transparent",
                border: active ? `1px solid ${d === "All" ? "rgba(99,102,241,0.35)" : DIFF_META[d]?.border || "rgba(99,102,241,0.35)"}` : "1px solid transparent",
                color: active ? (d === "All" ? "#a5b4fc" : col) : "#64748b",
                padding: "4px 10px", borderRadius: "5px",
                fontSize: "0.78rem", fontWeight: active ? "700" : "500",
                cursor: "pointer", transition: "all 0.12s ease", lineHeight: 1
              }}>
                {d}
              </button>
            );
          })}
        </div>

        {/* Topic */}
        <select value={topic} onChange={e => setTopic(e.target.value)} style={selectStyle}>
          <option value="All">All Topics</option>
          {topics.filter(t => t !== "All").map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        {/* Status */}
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}>
          <option value="All">All Status</option>
          <option value="Solved">✓ Solved</option>
          <option value="Attempted">○ Attempted</option>
          <option value="Unsolved">○ Unsolved</option>
        </select>

        {/* Sort */}
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={selectStyle}>
          <option value="default">Sort: Default</option>
          <option value="difficulty">Difficulty ↑</option>
          <option value="acceptance">Acceptance ↓</option>
          <option value="attempts">Most Attempted</option>
          <option value="points">Points ↓</option>
        </select>

        {/* Clear filters */}
        {hasFilters && (
          <button onClick={clearFilters} style={{
            display: "flex", alignItems: "center", gap: "4px",
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: "7px", padding: "5px 10px",
            color: "#f87171", fontSize: "0.78rem", fontWeight: "600", cursor: "pointer"
          }}>
            <X size={12} /> Clear
          </button>
        )}

        {/* Result count */}
        <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "#64748b", whiteSpace: "nowrap" }}>
          {filteredProblems.length} / {totalCount} problems
        </span>
      </div>

      {/* ── PROBLEMS TABLE ──────────────────────────────────────────────── */}
      <div style={{
        background: "#0d111a", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "12px", overflow: "hidden"
      }}>
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
                background: "#080c14",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                color: "#475569", fontSize: "0.7rem",
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
                    (s.problem   || "").toLowerCase() === (problem.title || "").toLowerCase()
                  ).length;

                  const isSolved   = problem.status === "Solved";
                  const isAttempted= problem.status === "Attempted";
                  const dc = DIFF_META[problem.difficulty] || DIFF_META.Medium;

                  return (
                    <motion.tr
                      key={problem.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.15, delay: index * 0.012 }}
                      onClick={() => navigate(`/problems/${problem.id}`)}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        cursor: "pointer",
                        transition: "background 0.1s ease"
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = isSolved
                          ? "rgba(16,185,129,0.04)"
                          : "rgba(99,102,241,0.05)";
                      }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                    >
                      {/* # */}
                      <td style={{ ...tdStyle, color: "#334155", fontFamily: "monospace", fontSize: "0.75rem" }}>
                        {isSolved
                          ? <CheckCircle2 size={14} style={{ color: "#10b981", display: "block", margin: "0 auto" }} />
                          : <span style={{ display: "block", textAlign: "center" }}>{String(index + 1).padStart(2, "0")}</span>
                        }
                      </td>

                      {/* Title */}
                      <td style={tdStyle}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                          <span style={{ color: "#e2e8f0", fontSize: "0.875rem", fontWeight: "600", lineHeight: 1.3 }}>
                            {problem.title}
                          </span>
                          {problem.points && (
                            <span style={{ fontSize: "0.72rem", color: "#475569" }}>
                              {problem.points} pts
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Difficulty badge */}
                      <td style={tdStyle}>
                        <span style={{
                          display: "inline-block", padding: "2px 9px",
                          borderRadius: "999px", fontSize: "0.72rem", fontWeight: "700",
                          background: dc.bg, color: dc.text, border: `1px solid ${dc.border}`,
                          letterSpacing: "0.02em"
                        }}>
                          {problem.difficulty}
                        </span>
                      </td>

                      {/* Topic */}
                      <td style={tdStyle}>
                        <span style={{
                          background: "#080c14", border: "1px solid rgba(255,255,255,0.06)",
                          padding: "2px 7px", borderRadius: "5px",
                          fontSize: "0.73rem", color: "#64748b",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          display: "inline-block", maxWidth: "120px"
                        }}>
                          {problem.topic || "—"}
                        </span>
                      </td>

                      {/* Acceptance */}
                      <td style={{ ...tdStyle }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                          <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "#94a3b8" }}>
                            {problem.acceptance != null ? `${problem.acceptance}%` : "—"}
                          </span>
                          {problem.acceptance != null && (
                            <div style={{ width: "54px", height: "3px", background: "rgba(255,255,255,0.07)", borderRadius: "99px", overflow: "hidden" }}>
                              <div style={{
                                width: `${Math.min(problem.acceptance, 100)}%`,
                                height: "100%",
                                background: problem.acceptance >= 60 ? "#34d399" : problem.acceptance >= 40 ? "#fbbf24" : "#f87171",
                                borderRadius: "99px"
                              }} />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Tries */}
                      <td style={{ ...tdStyle, color: "#475569", fontSize: "0.8rem" }}>
                        {subCount > 0
                          ? <span style={{ color: "#64748b" }}>{subCount}×</span>
                          : <span style={{ color: "#2d3748" }}>—</span>
                        }
                      </td>

                      {/* Status */}
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
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#334155", fontSize: "0.75rem" }}>
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

        {/* Empty state */}
        {!filteredProblems.length && (
          <div style={{ padding: "56px 24px", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "10px" }}>🔍</div>
            <p style={{ fontSize: "0.94rem", fontWeight: "600", color: "#e2e8f0", margin: "0 0 4px 0" }}>
              No problems match your filters
            </p>
            <span style={{ fontSize: "0.8rem", color: "#475569" }}>
              Try adjusting search, difficulty, or topic.
            </span>
            <br />
            <button onClick={clearFilters} style={{
              marginTop: "14px",
              background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: "7px", padding: "6px 16px",
              color: "#818cf8", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer"
            }}>
              Clear filters
            </button>
          </div>
        )}

        {/* Table footer */}
        {filteredProblems.length > 0 && (
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.05)",
            padding: "8px 16px",
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <span style={{ fontSize: "0.73rem", color: "#334155" }}>
              Showing {filteredProblems.length} of {totalCount} problems
            </span>
            <span style={{ fontSize: "0.73rem", color: "#334155" }}>
              {solvedCount} solved · {attemptedCount} attempted · {remainingCount} remaining
            </span>
          </div>
        )}
      </div>

    </motion.div>
  );
}

/* ── small helpers ───────────────────────────────────────────────────── */

function StatChip({ label, value, color }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "6px",
      background: "#0d111a", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "8px", padding: "5px 10px"
    }}>
      <span style={{ fontSize: "0.88rem", fontWeight: "800", color }}>{value}</span>
      <span style={{ fontSize: "0.7rem", color: "#475569", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
    </div>
  );
}

function DiffBar({ label, count, total, color, bg }) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <span style={{
        fontSize: "0.72rem", fontWeight: "700", padding: "2px 8px",
        borderRadius: "4px", background: bg, color, letterSpacing: "0.04em"
      }}>
        {label}
      </span>
      <span style={{ fontSize: "0.88rem", fontWeight: "800", color }}>{count}</span>
      <div style={{ width: "60px", height: "4px", background: "rgba(255,255,255,0.07)", borderRadius: "99px", overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          style={{ height: "100%", background: color, borderRadius: "99px" }}
        />
      </div>
      <span style={{ fontSize: "0.72rem", color: "#475569" }}>{pct}%</span>
    </div>
  );
}

const thStyle = {
  padding: "9px 12px",
  fontWeight: "600",
  textAlign: "left"
};

const tdStyle = {
  padding: "10px 12px",
  verticalAlign: "middle"
};

const selectStyle = {
  background: "#080c14",
  border: "1px solid rgba(255,255,255,0.09)",
  borderRadius: "7px",
  padding: "5px 10px",
  color: "#94a3b8",
  fontSize: "0.8rem",
  cursor: "pointer",
  outline: "none"
};
