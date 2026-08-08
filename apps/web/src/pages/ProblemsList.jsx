import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowUpDown,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Circle,
  CircleDashed,
  Filter,
  Layers,
  Search,
  Sparkles,
  Target,
  Timer,
  Trophy
} from "lucide-react";
import { useAuth } from "../auth/AuthContext.jsx";
import { useAppData } from "../data/AppDataContext.jsx";

const difficultyOrder = {
  Easy: 1,
  Medium: 2,
  Hard: 3
};

const allTopicsList = [
  "All Topics",
  "Arrays",
  "Strings",
  "Dynamic Programming",
  "Bit Manipulation",
  "Math",
  "Concurrency",
  "System Design",
  "Graphs"
];

export default function ProblemsList() {
  const { user } = useAuth();
  const { getProblemsForUser, getSubmissionsForUser } = useAppData();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [topic, setTopic] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("default");

  const problems = getProblemsForUser(user?.id);
  const userSubmissions = getSubmissionsForUser(user?.id) || [];

  // Problem metrics
  const totalProblemsCount = problems.length;
  const solvedCount = problems.filter((p) => p.status === "Solved").length;
  const attemptedCount = problems.filter((p) => p.status === "Attempted").length;
  const remainingCount = Math.max(0, totalProblemsCount - solvedCount);

  const topics = useMemo(() => {
    const raw = Array.from(new Set(problems.map((p) => p.topic).filter(Boolean)));
    return ["All", ...raw];
  }, [problems]);

  // Comprehensive multi-criteria filtering
  const filteredProblems = useMemo(() => {
    return problems
      .filter((problem) => {
        const titleMatch = (problem.title || "").toLowerCase().includes(query.toLowerCase());
        const descMatch = (problem.statement || "").toLowerCase().includes(query.toLowerCase());
        const topicMatch = (problem.topic || "").toLowerCase().includes(query.toLowerCase());
        const matchesQuery = !query || titleMatch || descMatch || topicMatch;

        const matchesDifficulty = difficulty === "All" || problem.difficulty === difficulty;
        const matchesTopic = topic === "All" || problem.topic === topic;
        const matchesStatus =
          statusFilter === "All" ||
          (statusFilter === "Solved" && problem.status === "Solved") ||
          (statusFilter === "Attempted" && problem.status === "Attempted") ||
          (statusFilter === "Unsolved" && (!problem.status || problem.status === "Unsolved"));

        return matchesQuery && matchesDifficulty && matchesTopic && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "difficulty") {
          return (difficultyOrder[a.difficulty] || 2) - (difficultyOrder[b.difficulty] || 2);
        }
        if (sortBy === "acceptance") {
          return (b.acceptance || 0) - (a.acceptance || 0);
        }
        if (sortBy === "attempts") {
          return (b.submissions || 0) - (a.submissions || 0);
        }
        if (sortBy === "recent") {
          return (b.points || 0) - (a.points || 0);
        }
        return 0; // default order
      });
  }, [problems, query, difficulty, topic, statusFilter, sortBy]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="problems-page-wrapper"
      style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "1240px", margin: "0 auto", paddingBottom: "60px" }}
    >
      {/* 1. Header & Problem Statistics Cards */}
      <section className="problems-header-card" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <span className="section-kicker" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#818cf8", fontWeight: "700" }}>
              Curated Problem Set
            </span>
            <h1 style={{ fontSize: "1.9rem", fontWeight: "800", color: "#ffffff", margin: "6px 0 4px 0", letterSpacing: "-0.02em" }}>
              Practice Problems
            </h1>
            <p style={{ color: "#94a3b8", fontSize: "0.92rem", margin: 0 }}>
              Sharpen your problem-solving skills with curated coding challenges.
            </p>
          </div>
        </div>

        {/* 4 Small Statistics Cards */}
        <div
          className="problems-stats-row"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
            marginTop: "6px"
          }}
        >
          {/* Card 1: Total Problems */}
          <div style={{ background: "#0d111a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(99, 102, 241, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#818cf8" }}>
              <Layers size={18} />
            </div>
            <div>
              <span style={{ fontSize: "0.74rem", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Total Problems</span>
              <strong style={{ fontSize: "1.25rem", color: "#f8fafc", display: "block", lineHeight: "1.2" }}>{totalProblemsCount}</strong>
            </div>
          </div>

          {/* Card 2: Solved */}
          <div style={{ background: "#0d111a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981" }}>
              <CheckCircle2 size={18} />
            </div>
            <div>
              <span style={{ fontSize: "0.74rem", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Solved</span>
              <strong style={{ fontSize: "1.25rem", color: "#10b981", display: "block", lineHeight: "1.2" }}>{solvedCount}</strong>
            </div>
          </div>

          {/* Card 3: Attempted */}
          <div style={{ background: "#0d111a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(245, 158, 11, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b" }}>
              <Timer size={18} />
            </div>
            <div>
              <span style={{ fontSize: "0.74rem", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Attempted</span>
              <strong style={{ fontSize: "1.25rem", color: "#fbbf24", display: "block", lineHeight: "1.2" }}>{attemptedCount}</strong>
            </div>
          </div>

          {/* Card 4: Remaining */}
          <div style={{ background: "#0d111a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(148, 163, 184, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
              <Target size={18} />
            </div>
            <div>
              <span style={{ fontSize: "0.74rem", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Remaining</span>
              <strong style={{ fontSize: "1.25rem", color: "#cbd5e1", display: "block", lineHeight: "1.2" }}>{remainingCount}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Search & Multi-Filter Controls Bar */}
      <section
        className="problem-filters-container"
        style={{
          background: "#0d111a",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "12px",
          padding: "12px 16px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px"
        }}
      >
        {/* Search Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "#080c14",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "8px",
            padding: "8px 14px",
            minWidth: "280px",
            flex: "1 1 280px"
          }}
        >
          <Search size={16} style={{ color: "#64748b" }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search problems by name, statement, or topic..."
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#f8fafc",
              fontSize: "0.86rem",
              width: "100%"
            }}
          />
        </div>

        {/* Difficulty Filter Tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#080c14", padding: "3px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          {["All", "Easy", "Medium", "Hard"].map((diff) => {
            const isSelected = difficulty === diff;
            return (
              <button
                key={diff}
                type="button"
                onClick={() => setDifficulty(diff)}
                style={{
                  background: isSelected ? "rgba(99, 102, 241, 0.18)" : "transparent",
                  border: isSelected ? "1px solid rgba(99, 102, 241, 0.4)" : "1px solid transparent",
                  color: isSelected ? "#ffffff" : "#94a3b8",
                  padding: "5px 12px",
                  borderRadius: "6px",
                  fontSize: "0.8rem",
                  fontWeight: isSelected ? "600" : "500",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                {diff}
              </button>
            );
          })}
        </div>

        {/* Topic, Status & Sort Dropdowns */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {/* Topic Selector */}
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            style={{
              background: "#080c14",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              padding: "7px 12px",
              color: "#cbd5e1",
              fontSize: "0.82rem",
              cursor: "pointer"
            }}
          >
            <option value="All">All Topics</option>
            {topics.filter((t) => t !== "All").map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Status Selector */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              background: "#080c14",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              padding: "7px 12px",
              color: "#cbd5e1",
              fontSize: "0.82rem",
              cursor: "pointer"
            }}
          >
            <option value="All">All Status</option>
            <option value="Solved">✓ Solved</option>
            <option value="Attempted">○ Attempted</option>
            <option value="Unsolved">○ Unsolved</option>
          </select>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              background: "#080c14",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              padding: "7px 12px",
              color: "#cbd5e1",
              fontSize: "0.82rem",
              cursor: "pointer"
            }}
          >
            <option value="default">Sort: Default</option>
            <option value="difficulty">Sort: Difficulty</option>
            <option value="acceptance">Sort: Acceptance</option>
            <option value="attempts">Sort: Most Attempted</option>
            <option value="recent">Sort: Points</option>
          </select>
        </div>
      </section>

      {/* 3. Modern Problem Table */}
      <section
        className="problem-table-container"
        style={{
          background: "#0d111a",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "14px",
          overflow: "hidden"
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
            <thead>
              <tr style={{ background: "#080c14", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "#64748b", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                <th style={{ padding: "14px 16px", width: "48px" }}>#</th>
                <th style={{ padding: "14px 16px" }}>Problem</th>
                <th style={{ padding: "14px 16px", width: "110px" }}>Difficulty</th>
                <th style={{ padding: "14px 16px", width: "140px" }}>Topic</th>
                <th style={{ padding: "14px 16px", width: "110px" }}>Acceptance</th>
                <th style={{ padding: "14px 16px", width: "120px" }}>Attempts</th>
                <th style={{ padding: "14px 16px", width: "120px", textAlign: "right" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredProblems.map((problem, index) => {
                const subCount = userSubmissions.filter(
                  (s) =>
                    (s.problemId || s.problem || "").toLowerCase() === (problem.id || "").toLowerCase() ||
                    (s.problem || "").toLowerCase() === (problem.title || "").toLowerCase()
                ).length;

                const isSolved = problem.status === "Solved";
                const isAttempted = problem.status === "Attempted";

                const diffColor =
                  problem.difficulty === "Easy"
                    ? { bg: "rgba(16, 185, 129, 0.12)", text: "#34d399", border: "rgba(16, 185, 129, 0.25)" }
                    : problem.difficulty === "Medium"
                    ? { bg: "rgba(245, 158, 11, 0.12)", text: "#fbbf24", border: "rgba(245, 158, 11, 0.25)" }
                    : { bg: "rgba(239, 68, 68, 0.12)", text: "#f87171", border: "rgba(239, 68, 68, 0.25)" };

                return (
                  <tr
                    key={problem.id}
                    onClick={() => navigate(`/problems/${problem.id}`)}
                    style={{
                      borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                      cursor: "pointer",
                      transition: "background 0.12s ease"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(99, 102, 241, 0.05)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* Column 1: Index Number */}
                    <td style={{ padding: "16px", color: "#64748b", fontFamily: "monospace", fontSize: "0.82rem" }}>
                      {String(index + 1).padStart(2, "0")}
                    </td>

                    {/* Column 2: Problem Title & Muted Description Snippet */}
                    <td style={{ padding: "16px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <strong style={{ color: "#f8fafc", fontSize: "0.94rem", fontWeight: "600" }}>
                          {problem.title}
                        </strong>
                        <span
                          style={{
                            color: "#64748b",
                            fontSize: "0.78rem",
                            lineHeight: "1.4",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "460px"
                          }}
                        >
                          {problem.statement}
                        </span>
                      </div>
                    </td>

                    {/* Column 3: Difficulty Badge */}
                    <td style={{ padding: "16px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 10px",
                          borderRadius: "999px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          background: diffColor.bg,
                          color: diffColor.text,
                          border: `1px solid ${diffColor.border}`
                        }}
                      >
                        {problem.difficulty}
                      </span>
                    </td>

                    {/* Column 4: Topic Tag */}
                    <td style={{ padding: "16px" }}>
                      <span
                        style={{
                          background: "#080c14",
                          border: "1px solid rgba(255,255,255,0.06)",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          fontSize: "0.78rem",
                          color: "#94a3b8"
                        }}
                      >
                        {problem.topic}
                      </span>
                    </td>

                    {/* Column 5: Acceptance Rate */}
                    <td style={{ padding: "16px", color: "#cbd5e1", fontSize: "0.85rem", fontWeight: "500" }}>
                      {problem.acceptance}%
                    </td>

                    {/* Column 6: User Attempts */}
                    <td style={{ padding: "16px", color: "#64748b", fontSize: "0.82rem" }}>
                      {subCount} attempt{subCount === 1 ? "" : "s"}
                    </td>

                    {/* Column 7: Problem Status */}
                    <td style={{ padding: "16px", textAlign: "right" }}>
                      {isSolved ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "#10b981", fontSize: "0.8rem", fontWeight: "600" }}>
                          <CheckCircle2 size={15} />
                          <span>Solved</span>
                        </span>
                      ) : isAttempted ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "#fbbf24", fontSize: "0.8rem", fontWeight: "600" }}>
                          <Timer size={15} />
                          <span>Attempted</span>
                        </span>
                      ) : (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "#64748b", fontSize: "0.8rem" }}>
                          <Circle size={13} />
                          <span>Unsolved</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {!filteredProblems.length && (
          <div style={{ padding: "4rem 2rem", textAlign: "center", color: "#94a3b8" }}>
            <p style={{ fontSize: "1rem", fontWeight: "600", color: "#f8fafc", margin: "0 0 4px 0" }}>
              No problems matched your current filters.
            </p>
            <span style={{ fontSize: "0.82rem", color: "#64748b" }}>
              Try adjusting your search query, difficulty, or topic filters.
            </span>
          </div>
        )}
      </section>
    </motion.div>
  );
}
