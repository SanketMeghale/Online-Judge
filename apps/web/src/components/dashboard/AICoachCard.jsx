import { Link } from "react-router-dom";
import { ArrowRight, Bot, Sparkles } from "lucide-react";

export default function AICoachCard({
  message = "You've been practicing Array techniques. Want to try 3 targeted two-pointer challenges to sharpen your runtime efficiency?",
  actionUrl = "/ai-coach",
  actionText = "Start Practice"
}) {
  return (
    <div className="ai-coach-card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div className="ai-coach-icon-box">
            <Bot size={16} />
          </div>
          <span className="ai-coach-title">Judgo Intelligence</span>
        </div>

        <span className="ai-coach-tag">
          <Sparkles size={11} />
          Personalized
        </span>
      </div>

      <p className="ai-coach-quote">
        "{message}"
      </p>

      <Link to={actionUrl} className="ai-coach-btn">
        <span>{actionText}</span>
        <ArrowRight size={13} />
      </Link>
    </div>
  );
}
