import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, Sparkles, Target } from "lucide-react";

export default function WeeklyGoal({
  solvedCount = 0,
  targetGoal = 5,
  loading = false
}) {
  const currentSolved = Math.min(solvedCount, targetGoal);
  const progressPct = targetGoal > 0 ? Math.min(100, Math.round((solvedCount / targetGoal) * 100)) : 0;
  const isGoalCompleted = solvedCount >= targetGoal;
  const remainingCount = Math.max(0, targetGoal - solvedCount);

  if (loading) {
    return (
      <div className="dash-card">
        <div className="dash-card-header">
          <h3 className="dash-card-title">
            <Target size={16} style={{ color: "#3b82f6" }} />
            <span>Weekly Goal</span>
          </h3>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
          <div className="dash-skeleton-line" style={{ width: "70%", height: "20px" }} />
          <div className="dash-skeleton-line" style={{ width: "100%", height: "10px" }} />
          <div className="dash-skeleton-line" style={{ width: "40%", height: "16px" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="dash-card">
      <div>
        <div className="dash-card-header">
          <h3 className="dash-card-title">
            <Target size={16} style={{ color: "#3b82f6" }} />
            <span>Weekly Goal</span>
          </h3>
          {isGoalCompleted ? (
            <span className="goal-celebration" style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "rgba(16,185,129,0.15)", color: "#34d399", padding: "2px 8px", borderRadius: "4px", fontSize: "0.72rem", fontWeight: "700" }}>
              <Check size={12} />
              Goal Reached!
            </span>
          ) : (
            <span style={{ fontSize: "0.74rem", color: "var(--dash-text-muted)" }}>
              {remainingCount} left
            </span>
          )}
        </div>

        <div className="goal-content">
          <div className="goal-meta-row">
            <span className="goal-target-text">Solve {targetGoal} problems this week</span>
            <span className="goal-numbers">
              <strong>{solvedCount}</strong> / {targetGoal} ({progressPct}%)
            </span>
          </div>

          <div className="goal-progress-bar">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, progressPct)}%` }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="goal-progress-fill"
              style={{
                background: isGoalCompleted
                  ? "linear-gradient(90deg, #10b981, #34d399)"
                  : "linear-gradient(90deg, #3b82f6, #60a5fa)"
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--dash-text-muted)" }}>
              {isGoalCompleted ? "🎉 Amazing sprint progress!" : `${remainingCount} more to hit your weekly target`}
            </span>
            {isGoalCompleted && (
              <span style={{ fontSize: "0.72rem", color: "#fbbf24", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                <Sparkles size={11} /> +100 XP Bonus
              </span>
            )}
          </div>
        </div>
      </div>

      <Link
        to="/problems"
        style={{
          fontSize: "0.82rem",
          fontWeight: "600",
          color: isGoalCompleted ? "#34d399" : "#60a5fa",
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          paddingTop: "10px",
          borderTop: "1px solid var(--dash-border-subtle)",
          marginTop: "auto"
        }}
      >
        <span>{isGoalCompleted ? "Keep Practicing" : "Continue Weekly Sprint"}</span>
        <ArrowRight size={13} />
      </Link>
    </div>
  );
}
