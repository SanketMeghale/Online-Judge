import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, Target } from "lucide-react";

export default function WeeklyGoal({ solvedCount = 0, targetGoal = 5 }) {
  const currentSolved = Math.min(solvedCount, targetGoal);
  const progressPct = Math.min(100, Math.round((currentSolved / targetGoal) * 100));
  const isGoalCompleted = currentSolved >= targetGoal;

  return (
    <div className="dash-card">
      <div>
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
            <span style={{ fontSize: "0.74rem", color: "var(--dash-text-muted)" }}>
              {targetGoal - currentSolved} left
            </span>
          )}
        </div>

        <div className="goal-content">
          <div className="goal-meta-row">
            <span className="goal-target-text">Solve {targetGoal} problems</span>
            <span className="goal-numbers">
              <strong>{currentSolved}</strong> / {targetGoal} ({progressPct}%)
            </span>
          </div>

          <div className="goal-progress-bar">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${progressPct}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="goal-progress-fill"
            />
          </div>
        </div>
      </div>

      <Link
        to="/problems"
        style={{
          fontSize: "0.82rem",
          fontWeight: "500",
          color: "#60a5fa",
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          paddingTop: "10px",
          borderTop: "1px solid var(--dash-border-subtle)"
        }}
      >
        <span>Continue Weekly Sprint</span>
        <ArrowRight size={13} />
      </Link>
    </div>
  );
}
