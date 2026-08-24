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
        <span className="rec-targeted-chip">
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
          <span className="rec-reason-text">
            {probReason}
          </span>
        </div>

        <Link
          to={`/problems/${probId}`}
          className="dash-btn-secondary rec-solve-btn"
          style={{
            padding: "8px 14px",
            fontSize: "0.82rem",
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
