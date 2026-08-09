import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BarChart2, Inbox } from "lucide-react";

export default function SubmissionBreakdown({
  totalSubmissions = 0,
  acceptedCount = 0,
  waCount = 0,
  reCount = 0,
  tleCount = 0,
  ceCount = 0,
  loading = false
}) {
  const otherCount = reCount + tleCount + ceCount;
  const safeTotal = totalSubmissions > 0 ? totalSubmissions : Math.max(1, acceptedCount + waCount + otherCount);

  const acPct = totalSubmissions > 0 ? Math.min(100, Math.round((acceptedCount / safeTotal) * 100)) : 0;
  const waPct = totalSubmissions > 0 ? Math.min(100, Math.round((waCount / safeTotal) * 100)) : 0;
  const otherPct = totalSubmissions > 0 ? Math.min(100, Math.round((otherCount / safeTotal) * 100)) : 0;

  if (loading) {
    return (
      <div className="dash-card">
        <div className="dash-card-header">
          <h3 className="dash-card-title">
            <BarChart2 size={16} style={{ color: "#10b981" }} />
            <span>Submission Breakdown</span>
          </h3>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
          <div className="dash-skeleton-line" style={{ width: "60%", height: "24px" }} />
          <div className="dash-skeleton-line" style={{ width: "100%", height: "12px" }} />
          <div className="dash-skeleton-line" style={{ width: "100%", height: "12px" }} />
          <div className="dash-skeleton-line" style={{ width: "100%", height: "12px" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="dash-card">
      <div>
        <div className="dash-card-header">
          <h3 className="dash-card-title">
            <BarChart2 size={16} style={{ color: "#10b981" }} />
            <span>Submission Breakdown</span>
          </h3>
          <Link to="/submissions" className="dash-card-link">
            <span>View all</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {totalSubmissions === 0 ? (
          <div className="dash-empty-state-small">
            <Inbox size={24} style={{ color: "var(--dash-text-muted)", opacity: 0.6 }} />
            <span style={{ fontSize: "0.82rem", color: "var(--dash-text-muted)" }}>No submissions recorded yet</span>
            <Link to="/problems" className="dash-empty-cta-link">
              Solve your first problem →
            </Link>
          </div>
        ) : (
          <>
            <div className="breakdown-summary">
              <div>
                <span className="breakdown-total">{totalSubmissions}</span>
                <span className="breakdown-subtext"> total submissions</span>
              </div>
              <span style={{ fontSize: "0.78rem", color: "var(--dash-text-muted)" }}>
                {acceptedCount} passed ({acPct}%)
              </span>
            </div>

            <div className="breakdown-bars-container">
              {/* Accepted Bar */}
              <div className="breakdown-bar-item">
                <div className="breakdown-bar-meta">
                  <span className="label">
                    <span className="dot dot-green" />
                    Accepted
                  </span>
                  <span className="count">{acceptedCount} ({acPct}%)</span>
                </div>
                <div className="thin-progress-track">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${acPct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="thin-progress-fill fill-green"
                  />
                </div>
              </div>

              {/* Wrong Answer Bar */}
              <div className="breakdown-bar-item">
                <div className="breakdown-bar-meta">
                  <span className="label">
                    <span className="dot dot-red" />
                    Wrong Answer
                  </span>
                  <span className="count">{waCount} ({waPct}%)</span>
                </div>
                <div className="thin-progress-track">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${waPct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="thin-progress-fill fill-red"
                  />
                </div>
              </div>

              {/* RE / TLE / CE Bar */}
              <div className="breakdown-bar-item">
                <div className="breakdown-bar-meta">
                  <span className="label">
                    <span className="dot dot-amber" />
                    RE / TLE / CE
                  </span>
                  <span className="count">{otherCount} ({otherPct}%)</span>
                </div>
                <div className="thin-progress-track">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${otherPct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="thin-progress-fill fill-amber"
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <Link
        to="/submissions"
        style={{
          fontSize: "0.82rem",
          fontWeight: "500",
          color: "var(--dash-text-secondary)",
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          paddingTop: "10px",
          borderTop: "1px solid var(--dash-border-subtle)",
          marginTop: "auto"
        }}
      >
        <span>View full history</span>
        <ArrowRight size={13} />
      </Link>
    </div>
  );
}
