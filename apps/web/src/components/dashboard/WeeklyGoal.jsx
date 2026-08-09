import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, Sparkles, Target } from "lucide-react";

export default function WeeklyGoal({
  solvedCount = 0,
  targetGoal = 5,
  loading = false
}) {
  const currentSolved = Math.max(0, solvedCount);
  const progressPct = targetGoal > 0 ? Math.min(100, Math.round((currentSolved / targetGoal) * 100)) : 0;
  const isGoalCompleted = currentSolved >= targetGoal;
  const remainingCount = Math.max(0, targetGoal - currentSolved);

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
    <div className="dash-card weekly-goal-card">
      <div className="goal-card-body">
        {/* Header */}
        <div className="dash-card-header">
          <h3 className="dash-card-title">
            <Target size={16} style={{ color: "#3b82f6" }} />
            <span>Weekly Goal</span>
          </h3>
          {isGoalCompleted ? (
            <span className="goal-celebration">
              <Check size={12} />
              Goal Reached!
            </span>
          ) : (
            <span className="goal-remaining-pill">
              {remainingCount} left
            </span>
          )}
        </div>

        {/* Main Stats Block */}
        <div className="goal-content">
          <div className="goal-headline-row">
            <span className="goal-target-title">Solve {targetGoal} problems this week</span>
            <div className="goal-progress-badge">
              <strong>{currentSolved}</strong> / {targetGoal}
              <span className="goal-pct-tag">({progressPct}%)</span>
            </div>
          </div>

          {/* Progress Bar */}
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

          {/* Subtext info */}
          <div className="goal-footer-info">
            <span className="goal-subtext">
              {isGoalCompleted
                ? "🎉 Target achieved! Great momentum."
                : `${remainingCount} more to hit your weekly target`}
            </span>
            {isGoalCompleted && (
              <span className="goal-xp-badge">
                <Sparkles size={11} /> +100 XP
              </span>
            )}
          </div>
        </div>
      </div>

      <Link
        to="/problems"
        className="goal-action-link"
        style={{
          color: isGoalCompleted ? "#34d399" : "#60a5fa"
        }}
      >
        <span>{isGoalCompleted ? "Keep Practicing" : "Continue Weekly Sprint"}</span>
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}
