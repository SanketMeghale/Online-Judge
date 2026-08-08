import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, ArrowRight, CheckCircle2, XCircle } from "lucide-react";

export default function ActivityTimeline({ submissions = [] }) {
  const displayItems = submissions.length > 0
    ? submissions.slice(0, 4).map((sub) => {
        const isAC = sub.verdict === "AC" || sub.verdict === "Accepted";
        return {
          id: sub.id || sub.submissionId || Math.random(),
          title: (sub.problemTitle || sub.problem || sub.problemId || "Algorithm Challenge").replace(/-/g, " "),
          status: isAC ? "Solved" : sub.verdict || "Attempted",
          isAC,
          xp: isAC ? "+20 XP" : null,
          time: sub.language || "Python"
        };
      })
    : [
        { id: 1, title: "Two Sum", status: "Solved", isAC: true, xp: "+20 XP", time: "Just now" },
        { id: 2, title: "Binary Search", status: "Wrong Answer", isAC: false, xp: null, time: "2h ago" },
        { id: 3, title: "Daily Challenge", status: "Completed", isAC: true, xp: "+50 XP", time: "Yesterday" }
      ];

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

      <div className="activity-list">
        {displayItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="activity-item-row"
          >
            <div className="activity-item-left">
              {item.isAC ? (
                <CheckCircle2 size={16} style={{ color: "var(--dash-success)", flexShrink: 0 }} />
              ) : (
                <XCircle size={16} style={{ color: "var(--dash-error)", flexShrink: 0 }} />
              )}
              <span className="activity-item-name" style={{ textTransform: "capitalize" }}>
                {item.status} {item.title}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {item.xp ? <span className="activity-item-xp">{item.xp}</span> : null}
              <span className="activity-item-time">{item.time}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
