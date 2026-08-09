import { Link } from "react-router-dom";
import { ArrowRight, Compass, Sparkles } from "lucide-react";

export default function RecommendedProblem({
  problem = null,
  problemId = "binary-search",
  title = "Binary Search",
  difficulty = "Medium",
  topic = "Algorithms • Search",
  reason = "Based on your recent practice",
  loading = false
}) {
  const probId = problem?.id || problemId;
  const probTitle = problem?.title || title;
  const probDiff = problem?.difficulty || difficulty;
  const probTopic = problem?.topic || topic;
  const probReason = problem?.reason || reason;

  const diffClass =
    probDiff.toLowerCase() === "easy"
      ? "diff-easy"
      : probDiff.toLowerCase() === "medium"
      ? "diff-medium"
      : "diff-hard";

  if (loading) {
    return (
      <div className="dash-card">
        <div className="dash-card-header">
          <h3 className="dash-card-title">
            <Compass size={16} style={{ color: "#38bdf8" }} />
            <span>Recommended for you</span>
          </h3>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "14px" }}>
          <div className="dash-skeleton-line" style={{ width: "70%", height: "20px" }} />
          <div className="dash-skeleton-line" style={{ width: "45%", height: "14px" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <h3 className="dash-card-title">
          <Compass size={16} style={{ color: "#38bdf8" }} />
          <span>Recommended for you</span>
        </h3>
        <span
          style={{
            fontSize: "0.72rem",
            color: "#38bdf8",
            background: "rgba(56, 189, 248, 0.1)",
            padding: "2px 8px",
            borderRadius: "4px",
            fontWeight: "700"
          }}
        >
          Targeted
        </span>
      </div>

      <div className="continue-card-body">
        <div className="continue-left-info">
          <div className="continue-title-row">
            <span className={`diff-badge ${diffClass}`}>{probDiff}</span>
            <h4>{probTitle}</h4>
          </div>
          <span className="continue-topic">{probTopic}</span>
          <span style={{ fontSize: "0.74rem", color: "var(--dash-text-muted)", marginTop: "2px" }}>
            {probReason}
          </span>
        </div>

        <Link
          to={`/problems/${probId}`}
          className="dash-btn-secondary"
          style={{
            padding: "8px 14px",
            fontSize: "0.82rem",
            borderColor: "rgba(56, 189, 248, 0.35)",
            color: "#38bdf8",
            whiteSpace: "nowrap"
          }}
        >
          <span>Solve</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
