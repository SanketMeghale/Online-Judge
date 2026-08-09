import { Link } from "react-router-dom";
import { ArrowRight, Bookmark, CheckCircle2 } from "lucide-react";

export default function ContinueCard({
  problem = null,
  problemId = "two-sum",
  title = "Two Sum",
  difficulty = "Easy",
  topic = "Arrays • Hash Table",
  timeAgo = "Recently attempted",
  loading = false
}) {
  const probId = problem?.id || problemId;
  const probTitle = problem?.title || title;
  const probDiff = problem?.difficulty || difficulty;
  const probTopic = problem?.topic || topic;
  const probTime = problem?.timeAgo || timeAgo;

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
            <Bookmark size={16} style={{ color: "#818cf8" }} />
            <span>Continue where you left off</span>
          </h3>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "14px" }}>
          <div className="dash-skeleton-line" style={{ width: "75%", height: "20px" }} />
          <div className="dash-skeleton-line" style={{ width: "50%", height: "14px" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <h3 className="dash-card-title">
          <Bookmark size={16} style={{ color: "#818cf8" }} />
          <span>Continue where you left off</span>
        </h3>
        <span style={{ fontSize: "0.75rem", color: "var(--dash-text-muted)" }}>
          {probTime}
        </span>
      </div>

      <div className="continue-card-body">
        <div className="continue-left-info">
          <div className="continue-title-row">
            <span className={`diff-badge ${diffClass}`}>{probDiff}</span>
            <h4>{probTitle}</h4>
          </div>
          <span className="continue-topic">{probTopic}</span>
        </div>

        <Link
          to={`/problems/${probId}`}
          className="dash-btn-primary"
          style={{ padding: "8px 14px", fontSize: "0.82rem", whiteSpace: "nowrap" }}
        >
          <span>Resume</span>
          <ArrowRight size={13} className="arrow-icon" />
        </Link>
      </div>
    </div>
  );
}
