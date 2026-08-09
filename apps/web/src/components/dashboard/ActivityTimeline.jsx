import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, ArrowRight, CheckCircle2, Clock, Inbox, XCircle } from "lucide-react";

export default function ActivityTimeline({ submissions = [], loading = false }) {
  if (loading) {
    return (
      <div className="dash-card">
        <div className="dash-card-header">
          <h3 className="dash-card-title">
            <Activity size={16} style={{ color: "#3b82f6" }} />
            <span>Recent Activity</span>
          </h3>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "14px" }}>
          <div className="dash-skeleton-line" style={{ width: "100%", height: "24px" }} />
          <div className="dash-skeleton-line" style={{ width: "100%", height: "24px" }} />
          <div className="dash-skeleton-line" style={{ width: "100%", height: "24px" }} />
        </div>
      </div>
    );
  }

  const hasSubmissions = Array.isArray(submissions) && submissions.length > 0;
  const displayItems = hasSubmissions
    ? submissions.slice(0, 4).map((sub) => {
        const isAC = sub.verdict === "AC" || sub.verdict === "OK" || sub.verdict === "Accepted";
        const probTitle = sub.problemTitle || sub.problem || sub.problemId || "Problem Challenge";
        const probId = sub.problemId || sub.problem || "";

        let timeStr = "Recent";
        if (sub.submittedAt || sub.createdAt) {
          const dt = new Date(sub.submittedAt || sub.createdAt);
          const diffMin = Math.round((Date.now() - dt.getTime()) / 60000);
          if (diffMin < 2) timeStr = "Just now";
          else if (diffMin < 60) timeStr = `${diffMin}m ago`;
          else if (diffMin < 1440) timeStr = `${Math.floor(diffMin / 60)}h ago`;
          else timeStr = `${Math.floor(diffMin / 1440)}d ago`;
        }

        return {
          id: String(sub.id || sub.submissionId || Math.random()),
          probId,
          title: String(probTitle).replace(/-/g, " "),
          status: isAC ? "Accepted" : sub.verdict || "Attempted",
          isAC,
          xp: isAC ? "+20 XP" : null,
          lang: sub.language || "code",
          time: timeStr
        };
      })
    : [];

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <h3 className="dash-card-title">
          <Activity size={16} style={{ color: "#3b82f6" }} />
          <span>Recent Activity</span>
        </h3>
        <Link to="/submissions" className="dash-card-link">
          <span>View all</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {!hasSubmissions ? (
        <div className="dash-empty-state-small" style={{ padding: "16px 0" }}>
          <Inbox size={24} style={{ color: "var(--dash-text-muted)", opacity: 0.6 }} />
          <span style={{ fontSize: "0.82rem", color: "var(--dash-text-muted)" }}>No recent activity yet</span>
          <Link to="/problems" className="dash-empty-cta-link">
            Start Solving →
          </Link>
        </div>
      ) : (
        <div className="activity-list">
          {displayItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="activity-item-row"
            >
              <div className="activity-item-left">
                {item.isAC ? (
                  <CheckCircle2 size={16} style={{ color: "var(--dash-success)", flexShrink: 0 }} />
                ) : (
                  <XCircle size={16} style={{ color: "var(--dash-error)", flexShrink: 0 }} />
                )}
                <Link
                  to={item.probId ? `/problems/${item.probId}` : "/problems"}
                  className="activity-item-name"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <span style={{ fontWeight: "600", color: item.isAC ? "#34d399" : "#f87171", marginRight: "4px" }}>
                    {item.status}:
                  </span>
                  <span style={{ textTransform: "capitalize" }}>{item.title}</span>
                </Link>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {item.xp ? <span className="activity-item-xp">{item.xp}</span> : null}
                <span className="activity-item-time" style={{ textTransform: "uppercase", fontSize: "0.7rem" }}>
                  {item.lang}
                </span>
                <span className="activity-item-time">{item.time}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
