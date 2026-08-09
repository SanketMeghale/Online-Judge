import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
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
  delay = 0,
  loading = false,
  to = null,
  onClick = null
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    }
  };

  const isClickable = Boolean(to || onClick);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={isClickable ? { y: -3, transition: { duration: 0.2 } } : { y: -1 }}
      onClick={isClickable ? handleClick : undefined}
      className={`dash-stat-card ${isClickable ? "dash-card-interactive" : ""}`}
      style={{
        cursor: isClickable ? "pointer" : "default"
      }}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleClick();
              }
            }
          : undefined
      }
    >
      <div className="dash-stat-head">
        <span className="dash-stat-label">{label}</span>
        <div
          className="dash-stat-icon-wrapper"
          style={{
            color: accentColor,
            background: `${accentColor}18`
          }}
        >
          {Icon ? <Icon size={17} /> : null}
        </div>
      </div>

      <div className="dash-stat-body">
        {loading ? (
          <div className="dash-skeleton-stat" />
        ) : (
          <div className="dash-stat-value">
            {numericValue !== undefined ? (
              <AnimatedCounter to={numericValue} />
            ) : (
              value
            )}
          </div>
        )}

        {loading ? (
          <div className="dash-skeleton-trend" />
        ) : trend ? (
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
