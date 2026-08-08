import { Link } from "react-router-dom";
import { ArrowRight, Compass, Sparkles } from "lucide-react";

export default function RecommendedProblem({
  problemId = "binary-search",
  title = "Binary Search",
  difficulty = "Medium",
  topic = "Algorithms • Search",
  reason = "Based on your recent practice"
}) {
  const diffClass = difficulty.toLowerCase() === "easy" ? "diff-easy" : difficulty.toLowerCase() === "medium" ? "diff-medium" : "diff-hard";

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <h3 className="dash-card-title">
          <Compass size={16} style={{ color: "#38bdf8" }} />
          <span>Recommended for you</span>
        </h3>
        <span style={{ fontSize: "0.75rem", color: "#38bdf8", background: "rgba(56, 189, 248, 0.1)", padding: "2px 8px", borderRadius: "4px", fontWeight: "600" }}>
          Targeted
        </span>
      </div>

      <div className="continue-card-body">
        <div className="continue-left-info">
          <div className="continue-title-row">
            <span className={`diff-badge ${diffClass}`}>{difficulty}</span>
            <h4>{title}</h4>
          </div>
          <span className="continue-topic">{topic}</span>
          <span style={{ fontSize: "0.75rem", color: "var(--dash-text-muted)", marginTop: "2px" }}>
            {reason}
          </span>
        </div>

        <Link
          to={`/problems/${problemId}`}
          className="dash-btn-secondary"
          style={{ padding: "8px 14px", fontSize: "0.82rem", borderColor: "rgba(56, 189, 248, 0.3)", color: "#38bdf8" }}
        >
          <span>Solve</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
