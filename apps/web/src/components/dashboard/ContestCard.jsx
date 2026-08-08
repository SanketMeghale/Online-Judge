import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Trophy } from "lucide-react";

export default function ContestCard() {
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 15,
    minutes: 30,
    seconds: 45
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="dash-card">
      <div>
        <div className="dash-card-header">
          <h3 className="dash-card-title">
            <Trophy size={16} style={{ color: "#fbbf24" }} />
            <span>Next Contest</span>
          </h3>
          <span style={{ fontSize: "0.72rem", color: "#fbbf24", background: "rgba(251, 191, 36, 0.1)", padding: "2px 8px", borderRadius: "4px", fontWeight: "600" }}>
            LIVE SOON
          </span>
        </div>

        <div className="contest-meta">
          <h4 className="contest-name">CodeSprint Challenge</h4>
          <span className="contest-sub">Biweekly algorithmic contest with rated leaderboard</span>
        </div>

        <div className="contest-countdown-grid">
          <div className="countdown-box">
            <span className="countdown-num">{String(timeLeft.days).padStart(2, "0")}</span>
            <span className="countdown-unit">DAYS</span>
          </div>
          <div className="countdown-box">
            <span className="countdown-num">{String(timeLeft.hours).padStart(2, "0")}</span>
            <span className="countdown-unit">HRS</span>
          </div>
          <div className="countdown-box">
            <span className="countdown-num">{String(timeLeft.minutes).padStart(2, "0")}</span>
            <span className="countdown-unit">MINS</span>
          </div>
          <div className="countdown-box">
            <span className="countdown-num">{String(timeLeft.seconds).padStart(2, "0")}</span>
            <span className="countdown-unit">SECS</span>
          </div>
        </div>
      </div>

      <Link
        to="/contests"
        style={{
          fontSize: "0.82rem",
          fontWeight: "600",
          color: "#fbbf24",
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          paddingTop: "10px",
          borderTop: "1px solid var(--dash-border-subtle)"
        }}
      >
        <span>View Contest</span>
        <ArrowRight size={13} />
      </Link>
    </div>
  );
}
