import { Link } from "react-router-dom";
import { ArrowRight, Bot, Sparkles } from "lucide-react";

export default function AICoachCard({
  message = "You've been practicing Array techniques. Want to try 3 targeted two-pointer challenges to sharpen your runtime efficiency?",
  actionUrl = "/interviewer",
  actionText = "Start Practice"
}) {
  return (
    <div className="ai-coach-card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "26px", height: "26px", borderRadius: "6px", background: "rgba(124, 58, 237, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#c084fc" }}>
            <Bot size={16} />
          </div>
          <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#f8fafc" }}>AI Coach Recommendation</span>
        </div>

        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.72rem", color: "#c084fc", background: "rgba(124, 58, 237, 0.15)", padding: "2px 8px", borderRadius: "999px", fontWeight: "600" }}>
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
