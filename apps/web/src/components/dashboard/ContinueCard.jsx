import { Link } from "react-router-dom";
import { ArrowRight, Bookmark, Code2 } from "lucide-react";

export default function ContinueCard({
  problemId = "two-sum",
  title = "Two Sum",
  difficulty = "Easy",
  topic = "Arrays • Hash Table",
  timeAgo = "2 hours ago"
}) {
  const diffClass = difficulty.toLowerCase() === "easy" ? "diff-easy" : difficulty.toLowerCase() === "medium" ? "diff-medium" : "diff-hard";

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <h3 className="dash-card-title">
          <Bookmark size={16} style={{ color: "#818cf8" }} />
          <span>Continue where you left off</span>
        </h3>
        <span style={{ fontSize: "0.75rem", color: "var(--dash-text-muted)" }}>
          {timeAgo}
        </span>
      </div>

      <div className="continue-card-body">
        <div className="continue-left-info">
          <div className="continue-title-row">
            <span className={`diff-badge ${diffClass}`}>{difficulty}</span>
            <h4>{title}</h4>
          </div>
          <span className="continue-topic">{topic}</span>
        </div>

        <Link to={`/problems/${problemId}`} className="dash-btn-primary" style={{ padding: "8px 14px", fontSize: "0.82rem" }}>
          <span>Resume</span>
          <ArrowRight size={13} className="arrow-icon" />
        </Link>
      </div>
    </div>
  );
}
