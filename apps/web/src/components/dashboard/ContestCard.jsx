import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Play, Trophy, UserCheck } from "lucide-react";
import { api } from "../../api/apiClient.js";

export default function ContestCard({
  contest: propContest = null,
  loading = false,
  onRegistered = null
}) {
  const navigate = useNavigate();
  const [contest, setContest] = useState(propContest);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(propContest?.isRegistered || false);

  useEffect(() => {
    if (propContest) {
      setContest(propContest);
      setIsRegistered(propContest.isRegistered || false);
    }
  }, [propContest]);

  // If no contest passed from parent, fetch live/upcoming contest
  useEffect(() => {
    if (!propContest) {
      let isMounted = true;
      api
        .getContests()
        .then((res) => {
          if (isMounted && res?.contests && res.contests.length > 0) {
            const activeOrUpcoming = res.contests.find(
              (c) => c.status === "LIVE" || c.status === "UPCOMING"
            ) || res.contests[0];
            setContest(activeOrUpcoming);
            setIsRegistered(activeOrUpcoming?.isRegistered || false);
          }
        })
        .catch(() => {});
      return () => {
        isMounted = false;
      };
    }
  }, [propContest]);

  // Live real-time countdown
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!contest) return;

    const targetTime = contest.status === "LIVE"
      ? new Date(contest.endTime || Date.now() + 3600000).getTime()
      : new Date(contest.startTime || Date.now() + 3600000).getTime();

    function update() {
      const diff = Math.max(0, targetTime - Date.now());
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [contest]);

  const handleRegister = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!contest || isRegistering || isRegistered) return;

    setIsRegistering(true);
    try {
      const res = await api.registerContest(contest.id);
      if (res?.success) {
        setIsRegistered(true);
        if (onRegistered) onRegistered(contest.id);
      }
    } catch (err) {
      console.warn("[ContestCard] Register error:", err);
    } finally {
      setIsRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="dash-card">
        <div className="dash-card-header">
          <h3 className="dash-card-title">
            <Trophy size={16} style={{ color: "#fbbf24" }} />
            <span>Next Contest</span>
          </h3>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
          <div className="dash-skeleton-line" style={{ width: "80%", height: "20px" }} />
          <div className="dash-skeleton-line" style={{ width: "100%", height: "40px" }} />
        </div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="dash-card">
        <div className="dash-card-header">
          <h3 className="dash-card-title">
            <Trophy size={16} style={{ color: "#fbbf24" }} />
            <span>Competitive Arena</span>
          </h3>
          <span style={{ fontSize: "0.72rem", color: "var(--dash-text-muted)", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: "4px" }}>
            SCHEDULE
          </span>
        </div>

        <div className="dash-empty-state-small" style={{ padding: "16px 0" }}>
          <Trophy size={26} style={{ color: "#fbbf24", opacity: 0.5 }} />
          <span style={{ fontSize: "0.82rem", color: "var(--dash-text-secondary)", fontWeight: "600" }}>
            No live contest right now
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--dash-text-muted)" }}>
            New rounds announced weekly
          </span>
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
            borderTop: "1px solid var(--dash-border-subtle)",
            marginTop: "auto"
          }}
        >
          <span>Browse All Contests</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    );
  }

  const isLive = contest.status === "LIVE";
  const contestUrl = isLive ? `/contests/${contest.id}/arena` : `/contests`;

  return (
    <div className="dash-card">
      <div>
        <div className="dash-card-header">
          <h3 className="dash-card-title">
            <Trophy size={16} style={{ color: "#fbbf24" }} />
            <span>{isLive ? "Live Contest" : "Next Contest"}</span>
          </h3>
          <span
            style={{
              fontSize: "0.72rem",
              color: isLive ? "#34d399" : "#fbbf24",
              background: isLive ? "rgba(16, 185, 129, 0.15)" : "rgba(251, 191, 36, 0.1)",
              border: `1px solid ${isLive ? "rgba(16, 185, 129, 0.3)" : "rgba(251, 191, 36, 0.25)"}`,
              padding: "2px 8px",
              borderRadius: "4px",
              fontWeight: "700",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            {isLive ? (
              <>
                <span className="dot dot-green" style={{ width: "6px", height: "6px" }} />
                LIVE NOW
              </>
            ) : (
              "UPCOMING"
            )}
          </span>
        </div>

        <div className="contest-meta">
          <h4 className="contest-name" style={{ fontSize: "0.92rem", fontWeight: "700", color: "#f8fafc", marginBottom: "3px" }}>
            {contest.title}
          </h4>
          <span className="contest-sub" style={{ fontSize: "0.76rem", color: "var(--dash-text-muted)", display: "block" }}>
            {contest.organizer} • {contest.contestType || "Rated"} • {contest.participantCount || 120}+ registered
          </span>
        </div>

        <div className="contest-countdown-grid" style={{ marginTop: "12px" }}>
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

        {/* Action Row */}
        <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
          {isLive ? (
            <Link
              to={`/contests/${contest.id}/arena`}
              className="dash-btn-primary"
              style={{
                width: "100%",
                padding: "8px 12px",
                fontSize: "0.82rem",
                background: "linear-gradient(135deg, #10b981, #059669)",
                borderColor: "#10b981"
              }}
            >
              <Play size={13} />
              <span>Enter Contest</span>
            </Link>
          ) : isRegistered ? (
            <div
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                padding: "7px 12px",
                borderRadius: "6px",
                background: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                color: "#34d399",
                fontSize: "0.8rem",
                fontWeight: "600"
              }}
            >
              <UserCheck size={14} />
              <span>Registered</span>
            </div>
          ) : (
            <button
              onClick={handleRegister}
              disabled={isRegistering}
              className="dash-btn-secondary"
              style={{
                width: "100%",
                padding: "7px 12px",
                fontSize: "0.8rem",
                borderColor: "rgba(251, 191, 36, 0.35)",
                color: "#fbbf24",
                cursor: isRegistering ? "wait" : "pointer"
              }}
            >
              {isRegistering ? "Registering..." : "Register for Contest"}
            </button>
          )}
        </div>
      </div>

      <Link
        to={contestUrl}
        style={{
          fontSize: "0.82rem",
          fontWeight: "600",
          color: "#fbbf24",
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          paddingTop: "10px",
          borderTop: "1px solid var(--dash-border-subtle)",
          marginTop: "auto"
        }}
      >
        <span>{isLive ? "Go to Arena" : "View Details"}</span>
        <ArrowRight size={13} />
      </Link>
    </div>
  );
}
