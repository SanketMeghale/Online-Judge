import { motion } from "framer-motion";
import { TrendingUp, ArrowUpRight } from "lucide-react";
import { AnimatedCounter } from "../motion/MotionSystem.jsx";

export default function StatCard({
  icon: Icon,
  label,
  value,
  numericValue,
  trend,
  trendLabel = "",
  trendDirection = "up",
  accentColor = "#7c3aed",
  delay = 0
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2 }}
      className="dash-stat-card"
    >
      <div className="dash-stat-head">
        <span className="dash-stat-label">{label}</span>
        <div className="dash-stat-icon-wrapper" style={{ color: accentColor }}>
          {Icon ? <Icon size={17} /> : null}
        </div>
      </div>

      <div className="dash-stat-body">
        <div className="dash-stat-value">
          {numericValue !== undefined ? (
            <AnimatedCounter to={numericValue} />
          ) : (
            value
          )}
        </div>

        {trend ? (
          <div className={`dash-stat-trend ${trendDirection === "up" ? "trend-up" : "trend-neutral"}`}>
            {trendDirection === "up" ? <ArrowUpRight size={12} /> : null}
            <span>{trend}</span>
          </div>
        ) : trendLabel ? (
          <span style={{ fontSize: "0.75rem", color: "var(--dash-text-muted)" }}>{trendLabel}</span>
        ) : null}
      </div>
    </motion.div>
  );
}
