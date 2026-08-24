import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Crown,
  Medal,
  Play,
  Plus,
  Radio,
  Search,
  Shield,
  Swords,
  Timer,
  Trophy,
  Users,
  X,
  Zap,
  Star,
  ChevronRight,
  Sparkles,
  Info
} from "lucide-react";
import { api } from "../api/apiClient.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { useAppData } from "../data/AppDataContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const BADGE_META = {
  Grandmaster: { color: "#ef4444", bg: "rgba(239,68,68,0.12)", icon: "👑" },
  Master:      { color: "#f97316", bg: "rgba(249,115,22,0.12)", icon: "🔥" },
  Expert:      { color: "#a855f7", bg: "rgba(168,85,247,0.12)", icon: "⚡" },
  Knight:      { color: "#3b82f6", bg: "rgba(59,130,246,0.12)", icon: "🛡️" },
  Newbie:      { color: "#64748b", bg: "rgba(100,116,139,0.1)",  icon: "🌱" }
};

const TYPE_META = {
  Weekly:   { color: "#818cf8", bg: "rgba(99,102,241,0.12)",  border: "rgba(99,102,241,0.25)" },
  Biweekly: { color: "#a78bfa", bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.25)" },
  Monthly:  { color: "#34d399", bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.25)" },
  Hiring:   { color: "#fbbf24", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.25)" },
  Special:  { color: "#f87171", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.25)" }
};

export default function ContestPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { getUserById } = useAppData();
  const { isLight } = useTheme();

  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [registeringId, setRegisteringId] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContest, setSelectedContest] = useState(null);
  const [isFocused, setIsFocused] = useState(false);

  const [leaderboard, setLeaderboard] = useState([]);
  const [liveSeconds, setLiveSeconds] = useState(3600);

  const currentUserId = user?.id || user?._id || "";
  const liveUser = (currentUserId ? getUserById(currentUserId) : null) || user || {};

  // Fetch contests & leaderboard from API
  const fetchContestData = async (isInitial = false) => {
    if (isInitial && contests.length === 0) setLoading(true);
    try {
      const res = await api.getContests();
      if (res && Array.isArray(res.contests)) {
        setContests(res.contests);
        
        // Find top live contest for top banner countdown
        const live = res.contests.find((c) => c.status === "LIVE");
        if (live && live.endTime) {
          const endTs = new Date(live.endTime).getTime();
          const rem = Math.max(0, Math.floor((endTs - Date.now()) / 1000));
          setLiveSeconds(rem || 3600);
        }
      }
    } catch (e) {
      console.warn("[ContestPage] Failed to fetch contests:", e.message);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await api.getLeaderboard();
      if (res?.leaderboard) setLeaderboard(res.leaderboard);
    } catch (e) {
      console.error("[ContestPage] Failed to fetch leaderboard:", e);
    }
  };

  useEffect(() => {
    fetchContestData(true);
    fetchLeaderboard();

    // Poll contests every 30 seconds for automatic status updates (UPCOMING -> LIVE -> ENDED)
    const pollTimer = setInterval(() => {
      fetchContestData(false);
    }, 30000);

    return () => clearInterval(pollTimer);
  }, []);

  // 1-Second countdown ticker for live contest banner
  useEffect(() => {
    if (liveSeconds <= 0) return;
    const ticker = setInterval(() => {
      setLiveSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(ticker);
          fetchContestData(false); // Refresh when live contest reaches 0
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(ticker);
  }, [liveSeconds]);

  function formatTime(s) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  // Handle contest registration with persistence
  async function handleRegister(contestId) {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setRegisteringId(contestId);
    try {
      const res = await api.registerContest(contestId);
      if (res.success) {
        setContests((prev) =>
          prev.map((c) => {
            if (c.id === contestId) {
              return {
                ...c,
                isRegistered: true,
                participantCount: res.alreadyRegistered ? c.participantCount : c.participantCount + 1
              };
            }
            return c;
          })
        );
        if (selectedContest?.id === contestId) {
          setSelectedContest((prev) => (prev ? { ...prev, isRegistered: true } : null));
        }
      }
    } catch (e) {
      console.error("[ContestPage] Registration error:", e);
    } finally {
      setRegisteringId(null);
    }
  }

  // User rank in global leaderboard
  const myLbEntry = useMemo(
    () => leaderboard.find((e) => String(e.userId) === String(currentUserId)),
    [leaderboard, currentUserId]
  );

  const contestRating = myLbEntry?.rating ??
    (liveUser?.ranking ? Math.max(1200, 1500 - liveUser.ranking * 8) : 1200);
  const myBadge = myLbEntry?.badge ?? "Knight";
  const badgeMeta = BADGE_META[myBadge] || BADGE_META.Knight;

  // Filtered contests logic
  const filteredContests = useMemo(() => {
    return contests.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchQ =
        !searchQuery ||
        c.title.toLowerCase().includes(q) ||
        (c.organizer || "").toLowerCase().includes(q) ||
        c.contestType.toLowerCase().includes(q);

      if (!matchQ) return false;

      if (activeTab === "live") return c.status === "LIVE";
      if (activeTab === "upcoming") return c.status === "UPCOMING";
      if (activeTab === "hiring") return c.contestType === "Hiring" || c.category === "Company";
      if (activeTab === "past") return c.status === "ENDED";
      return true;
    });
  }, [activeTab, contests, searchQuery]);

  const liveContest = contests.find((c) => c.status === "LIVE");
  const liveCount = contests.filter((c) => c.status === "LIVE").length;
  const upcomingCount = contests.filter((c) => c.status === "UPCOMING").length;

  const topUsers = leaderboard.slice(0, 10);

  return (
    <motion.div
      className="contest-page responsive-page"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      style={{ width: "100%", maxWidth: "100%", display: "flex", flexDirection: "column", gap: "14px", paddingBottom: "32px" }}
    >
      {/* ── HEADER & RATING WIDGET ────────────────────────────────────── */}
      <div className="responsive-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap", flex: "1 1 auto" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "2px" }}>
              <Swords size={15} style={{ color: "#a855f7" }} />
              <span style={{ fontSize: "0.7rem", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#a855f7" }}>
                Contest Arena
              </span>
            </div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: isLight ? "#0f172a" : "#f8fafc", margin: 0, letterSpacing: "-0.02em" }}>
              Contests &amp; Challenges
            </h1>
          </div>

          {/* Search Box */}
          <div className="contest-search-box" style={{
            display: "flex",
            alignItems: "center",
            gap: "9px",
            background: isFocused
              ? (isLight ? "#ffffff" : "#0c1322")
              : (isLight ? "#f8fafc" : "rgba(255,255,255,0.02)"),
            border: isFocused
              ? "1px solid #6366f1"
              : (isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.08)"),
            boxShadow: isFocused
              ? (isLight ? "0 0 0 3px rgba(99, 102, 241, 0.12)" : "0 0 0 3px rgba(99, 102, 241, 0.2)")
              : "none",
            borderRadius: "10px",
            padding: "6px 14px",
            flex: "1 1 280px",
            maxWidth: "420px",
            marginTop: "6px",
            transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
          }}>
            <Search size={14} style={{ color: isFocused ? "#6366f1" : (isLight ? "#64748b" : "#475569"), transition: "color 0.2s ease" }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Search contests..."
              style={{ background: "transparent", border: "none", outline: "none", color: isLight ? "#0f172a" : "#f8fafc", fontSize: "0.82rem", width: "100%" }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: isLight ? "#64748b" : "#475569", padding: 0, display: "flex" }}>
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Rating Card Widget */}
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          background: isLight ? "#ffffff" : "#0d111a",
          border: isLight ? `1px solid ${badgeMeta.color}50` : `1px solid ${badgeMeta.color}30`,
          borderRadius: "10px", padding: "8px 14px",
          boxShadow: isLight ? "0 1px 3px rgba(0,0,0,0.05)" : `0 0 20px ${badgeMeta.color}15`
        }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "8px",
            background: badgeMeta.bg, border: `1px solid ${badgeMeta.color}40`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem"
          }}>
            {badgeMeta.icon}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "0.67rem", color: isLight ? "#64748b" : "#475569", fontWeight: "700", textTransform: "uppercase" }}>RATING</span>
              <span style={{ fontSize: "0.65rem", background: badgeMeta.bg, color: badgeMeta.color, padding: "1px 6px", borderRadius: "4px", fontWeight: "700" }}>
                {myBadge}
              </span>
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: "800", color: isLight ? "#0f172a" : "#f8fafc", lineHeight: 1.1 }}>
              {contestRating}
              {myLbEntry && (
                <small style={{ fontSize: "0.7rem", color: isLight ? "#059669" : "#34d399", fontWeight: "600", marginLeft: "5px" }}>
                  #{myLbEntry.rank}
                </small>
              )}
            </div>
          </div>
          <div style={{ width: "1px", height: "28px", background: isLight ? "#e2e8f0" : "rgba(255,255,255,0.07)" }} />
          <div style={{ fontSize: "0.72rem", color: isLight ? "#64748b" : "#475569", lineHeight: 1.5 }}>
            <div><span style={{ color: "#ef4444", fontWeight: "700" }}>●</span> {liveCount} Live</div>
            <div><span style={{ color: "#fbbf24", fontWeight: "700" }}>●</span> {upcomingCount} Upcoming</div>
          </div>
        </div>
      </div>

      {/* ── LIVE CONTEST BANNER ─────────────────────────────────────── */}
      {liveContest && (
        <motion.div
          className="contest-live-banner"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            position: "relative", overflow: "hidden",
            background: isLight ? "linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(124,58,237,0.06) 60%, rgba(239,68,68,0.04) 100%)" : "linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(124,58,237,0.1) 60%, rgba(239,68,68,0.05) 100%)",
            border: "1px solid rgba(239,68,68,0.35)",
            borderRadius: "11px", padding: "12px 16px",
            boxShadow: isLight ? "0 1px 3px rgba(0,0,0,0.04)" : "none",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "5px",
              background: "#ef4444", color: "#fff",
              fontSize: "0.7rem", fontWeight: "800",
              padding: "2px 9px", borderRadius: "999px",
              boxShadow: "0 0 12px rgba(239,68,68,0.5)"
            }}>
              <Radio size={11} /> LIVE NOW
            </span>
            <strong style={{ fontSize: "0.9rem", color: isLight ? "#0f172a" : "#f8fafc" }}>{liveContest.title}</strong>
            <span style={{ fontSize: "0.75rem", color: isLight ? "#475569" : "#94a3b8" }}>
              Ends in:{" "}
              <span style={{ fontFamily: "ui-monospace,monospace", color: isLight ? "#d97706" : "#fbbf24", fontWeight: "800", fontSize: "0.85rem" }}>
                {formatTime(liveSeconds)}
              </span>
            </span>
            <span style={{ fontSize: "0.73rem", color: isLight ? "#64748b" : "#475569" }}>
              · {liveContest.participantCount.toLocaleString()} competing
            </span>
          </div>

          <div style={{ display: "flex", gap: "7px" }}>
            <button onClick={() => setSelectedContest(liveContest)} style={getGhostBtn(isLight)}>
              Problems &amp; Rules
            </button>
            <Link
              to={`/contests/${liveContest.id}/arena`}
              style={{ ...gradBtn, background: "linear-gradient(135deg,#ef4444,#dc2626)", boxShadow: "0 4px 12px rgba(239,68,68,0.3)" }}
            >
              <Zap size={12} /> {liveContest.isRegistered ? "Enter Arena" : "Join Arena"}
            </Link>
          </div>
        </motion.div>
      )}

      {/* ── TABS TOOLBAR ────────────────────────────────────────── */}
      <div className="contest-toolbar" style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
        <div className="contest-tabs-scroll" style={{
          display: "flex", gap: "2px",
          background: isLight ? "#ffffff" : "#080c14",
          border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.07)",
          boxShadow: isLight ? "0 1px 2px rgba(0,0,0,0.04)" : "none",
          borderRadius: "8px", padding: "3px"
        }}>
          {[
            { id: "all", label: "All Contests" },
            { id: "live", label: `🔴 Live (${liveCount})` },
            { id: "upcoming", label: `Upcoming (${upcomingCount})` },
            { id: "hiring", label: "💼 Hiring" },
            { id: "past", label: "Past Archive" }
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: active ? (isLight ? "rgba(99,102,241,0.16)" : "rgba(99,102,241,0.18)") : "transparent",
                  border: active ? (isLight ? "1px solid rgba(99,102,241,0.3)" : "1px solid rgba(99,102,241,0.35)") : "1px solid transparent",
                  color: active ? (isLight ? "#4338ca" : "#a5b4fc") : (isLight ? "#64748b" : "#64748b"),
                  padding: "4px 12px", borderRadius: "6px",
                  fontSize: "0.78rem", fontWeight: active ? "700" : "500",
                  cursor: "pointer", transition: "all 0.12s ease"
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MAIN CONTENT GRID: CARDS + SIDEBAR LEADERBOARD ───────────── */}
      <div className="contest-main-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 300px", gap: "16px", alignItems: "start", width: "100%" }}>

        {/* LEFT: CONTEST CARDS LIST */}
        <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: isLight ? "#64748b" : "#64748b" }}>
              <Sparkles size={24} className="animate-spin" style={{ color: "#818cf8", marginBottom: "8px" }} />
              <div style={{ fontSize: "0.84rem" }}>Loading contests...</div>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredContests.map((c, i) => {
                const isLive = c.status === "LIVE";
                const isUpcoming = c.status === "UPCOMING";
                const isEnded = c.status === "ENDED";
                const tm = TYPE_META[c.contestType] || TYPE_META.Weekly;

                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.18, delay: i * 0.03 }}
                    style={{
                      background: isLight ? "#ffffff" : "#0d111a",
                      border: isLive ? "1px solid rgba(239,68,68,0.4)" : (isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.07)"),
                      boxShadow: isLight ? "0 1px 3px rgba(0,0,0,0.04)" : "none",
                      borderRadius: "11px", padding: "13px 16px",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      flexWrap: "wrap", gap: "10px",
                      transition: "border-color 0.15s, box-shadow 0.15s"
                    }}
                  >
                    {/* Info Section */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px", flex: 1, minWidth: "220px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "0.67rem", fontWeight: "800", padding: "1px 7px", borderRadius: "4px", background: tm.bg, color: tm.color, border: `1px solid ${tm.border}` }}>
                          {c.contestType.toUpperCase()}
                        </span>
                        {isLive && (
                          <span style={{ fontSize: "0.67rem", fontWeight: "800", color: "#ef4444", display: "flex", alignItems: "center", gap: "3px" }}>
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
                            LIVE
                          </span>
                        )}
                        <span style={{ fontSize: "0.72rem", color: isLight ? "#94a3b8" : "#334155" }}>by</span>
                        <span style={{ fontSize: "0.72rem", color: isLight ? "#475569" : "#94a3b8", fontWeight: "600" }}>{c.organizer}</span>
                      </div>

                      <h3
                        onClick={() => setSelectedContest(c)}
                        style={{ fontSize: "0.94rem", fontWeight: "700", color: isLight ? "#0f172a" : "#e2e8f0", margin: 0, cursor: "pointer", lineHeight: 1.3 }}
                      >
                        {c.title}
                      </h3>

                      <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.72rem", color: isLight ? "#64748b" : "#475569", flexWrap: "wrap" }}>
                        {isUpcoming && <span><Clock size={11} style={{ display: "inline", marginRight: "3px" }} /> Starts: {new Date(c.startTime).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>}
                        {isEnded && <span><Calendar size={11} style={{ display: "inline", marginRight: "3px" }} /> Ended</span>}
                        <span><Timer size={11} style={{ display: "inline", marginRight: "3px" }} /> {c.duration}</span>
                        <span><Users size={11} style={{ display: "inline", marginRight: "3px" }} /> {c.participantCount.toLocaleString()}</span>
                        {c.prize && (
                          <span style={{ color: isLight ? "#b45309" : "#b45309", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                            <Trophy size={11} style={{ color: "#fbbf24" }} /> {c.prize}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                      <button onClick={() => setSelectedContest(c)} style={getGhostBtn(isLight)}>
                        Details
                      </button>

                      {isUpcoming && (
                        <button
                          onClick={() => handleRegister(c.id)}
                          disabled={registeringId === c.id}
                          style={{
                            background: c.isRegistered ? "rgba(52,211,153,0.1)" : "linear-gradient(135deg,#7c3aed,#4f46e5)",
                            color: c.isRegistered ? (isLight ? "#059669" : "#34d399") : "#fff",
                            border: c.isRegistered ? "1px solid rgba(52,211,153,0.3)" : "none",
                            borderRadius: "7px", padding: "6px 13px",
                            fontSize: "0.75rem", fontWeight: "700", cursor: "pointer",
                            display: "flex", alignItems: "center", gap: "4px"
                          }}
                        >
                          {c.isRegistered ? <><CheckCircle2 size={12} /> Registered ✓</> : <><Plus size={12} /> {registeringId === c.id ? "Registering..." : "Register"}</>}
                        </button>
                      )}

                      {isLive && (
                        <Link
                          to={`/contests/${c.id}/arena`}
                          style={{ ...gradBtn, background: "linear-gradient(135deg,#ef4444,#dc2626)", boxShadow: "0 4px 12px rgba(239,68,68,0.3)" }}
                        >
                          <Zap size={12} /> {c.isRegistered ? "Enter Arena" : "Join Arena"}
                        </Link>
                      )}

                      {isEnded && (
                        <Link
                          to={`/contests/${c.id}/results`}
                          style={{ background: isLight ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.1)", border: isLight ? "1px solid rgba(99,102,241,0.2)" : "1px solid rgba(99,102,241,0.25)", color: isLight ? "#4f46e5" : "#818cf8", borderRadius: "7px", padding: "6px 12px", fontSize: "0.75rem", fontWeight: "600", textDecoration: "none" }}
                        >
                          View Results
                        </Link>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}

          {!loading && !filteredContests.length && (
            <div style={{ textAlign: "center", padding: "48px 24px", background: isLight ? "#ffffff" : "#0d111a", border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.06)", borderRadius: "11px" }}>
              <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🏆</div>
              <p style={{ fontWeight: "600", color: isLight ? "#0f172a" : "#e2e8f0", margin: "0 0 4px" }}>No contests found</p>
              <span style={{ fontSize: "0.8rem", color: isLight ? "#64748b" : "#475569" }}>Try another search query or category filter.</span>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR: LEADERBOARD & BADGES */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Top Rated Card */}
          <div style={{ background: isLight ? "#ffffff" : "#0d111a", border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.07)", boxShadow: isLight ? "0 1px 3px rgba(0,0,0,0.04)" : "none", borderRadius: "12px", overflow: "hidden" }}>
            <div style={{
              background: isLight ? "linear-gradient(135deg,rgba(99,102,241,0.08),rgba(168,85,247,0.05))" : "linear-gradient(135deg,rgba(99,102,241,0.12),rgba(168,85,247,0.08))",
              borderBottom: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.07)", padding: "11px 14px",
              display: "flex", alignItems: "center", justifyContent: "space-between"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Trophy size={14} style={{ color: "#fbbf24" }} />
                <span style={{ fontSize: "0.82rem", fontWeight: "800", color: isLight ? "#0f172a" : "#f8fafc" }}>Top Rated</span>
              </div>
              <Link to="/leaderboard" style={{ fontSize: "0.7rem", color: isLight ? "#4f46e5" : "#818cf8", textDecoration: "none", fontWeight: "600", display: "flex", alignItems: "center", gap: "2px" }}>
                View all →
              </Link>
            </div>

            <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: "4px" }}>
              {topUsers.map((item, idx) => {
                const isMe = isAuthenticated && String(item.userId) === String(currentUserId);
                const bm = BADGE_META[item.badge] || BADGE_META.Knight;

                return (
                  <div
                    key={item.userId || idx}
                    style={{
                      display: "flex", alignItems: "center", gap: "8px",
                      padding: "6px 8px", borderRadius: "7px",
                      background: isMe ? (isLight ? "rgba(99,102,241,0.1)" : "rgba(99,102,241,0.15)") : (isLight ? "#f8fafc" : "#080c14"),
                      border: isMe ? (isLight ? "1px solid rgba(99,102,241,0.25)" : "1px solid rgba(99,102,241,0.3)") : (isLight ? "1px solid #f1f5f9" : "1px solid rgba(255,255,255,0.04)")
                    }}
                  >
                    <span style={{ fontSize: "0.7rem", fontWeight: "700", color: item.rank === 1 ? "#fbbf24" : item.rank === 2 ? (isLight ? "#64748b" : "#cbd5e1") : item.rank === 3 ? "#f97316" : (isLight ? "#64748b" : "#64748b"), width: "16px" }}>
                      #{item.rank}
                    </span>
                    <span style={{ fontSize: "0.85rem" }}>{bm.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: "block", fontSize: "0.78rem", color: isMe ? (isLight ? "#7c3aed" : "#c084fc") : (isLight ? "#0f172a" : "#f8fafc"), overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.username || item.name}
                      </strong>
                    </div>
                    <span style={{ fontSize: "0.76rem", fontWeight: "700", color: isLight ? "#059669" : "#34d399", fontFamily: "monospace" }}>
                      {item.rating}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Badges & Rank Tiers Card */}
          <div style={{ background: isLight ? "#ffffff" : "#0d111a", border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.07)", boxShadow: isLight ? "0 1px 3px rgba(0,0,0,0.04)" : "none", borderRadius: "12px", padding: "12px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
              <Medal size={14} style={{ color: "#a855f7" }} />
              <span style={{ fontSize: "0.82rem", fontWeight: "700", color: isLight ? "#0f172a" : "#f8fafc" }}>Badges &amp; Rank Tiers</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              {Object.entries(BADGE_META).map(([name, meta]) => (
                <div key={name} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "5px 8px", borderRadius: "6px",
                  background: myBadge === name ? meta.bg : "transparent",
                  border: myBadge === name ? `1px solid ${meta.color}30` : "1px solid transparent"
                }}>
                  <span style={{ fontSize: "0.74rem", display: "flex", alignItems: "center", gap: "5px" }}>
                    <span>{meta.icon}</span>
                    <span style={{ color: meta.color, fontWeight: "700" }}>{name}</span>
                  </span>
                  <span style={{ fontSize: "0.67rem", color: isLight ? "#64748b" : "#64748b" }}>
                    {name === "Grandmaster" ? "≥ 2400" : name === "Master" ? "≥ 2000" : name === "Expert" ? "≥ 1600" : name === "Knight" ? "≥ 1200" : "< 1200"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ── CONTEST DETAILS MODAL ────────────────────────────────────── */}
      <AnimatePresence>
        {selectedContest && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) setSelectedContest(null); }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              style={{ background: isLight ? "#ffffff" : "#0d111a", border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", width: "100%", maxWidth: "520px", overflow: "hidden", boxShadow: isLight ? "0 20px 40px rgba(0,0,0,0.15)" : "0 24px 60px rgba(0,0,0,0.7)" }}
            >
              <div style={{ background: isLight ? "linear-gradient(135deg,rgba(99,102,241,0.08),rgba(168,85,247,0.05))" : "linear-gradient(135deg,rgba(99,102,241,0.12),rgba(168,85,247,0.08))", borderBottom: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.08)", padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span style={{ fontSize: "0.67rem", background: (TYPE_META[selectedContest.contestType] || TYPE_META.Weekly).bg, color: (TYPE_META[selectedContest.contestType] || TYPE_META.Weekly).color, padding: "1px 7px", borderRadius: "4px", fontWeight: "800" }}>
                    {selectedContest.contestType.toUpperCase()}
                  </span>
                  <h2 style={{ fontSize: "1.1rem", fontWeight: "800", color: isLight ? "#0f172a" : "#f8fafc", margin: "5px 0 0" }}>{selectedContest.title}</h2>
                  <p style={{ fontSize: "0.75rem", color: isLight ? "#64748b" : "#475569", margin: "2px 0 0" }}>by {selectedContest.organizer}</p>
                </div>
                <button onClick={() => setSelectedContest(null)} style={{ background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.05)", border: "none", color: isLight ? "#64748b" : "#64748b", cursor: "pointer", padding: "4px", display: "flex", borderRadius: "6px" }}>
                  <X size={16} />
                </button>
              </div>

              <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {[
                    { icon: "🏆", label: "Prize", val: selectedContest.prize },
                    { icon: "⏱️", label: "Duration", val: selectedContest.duration },
                    { icon: "👥", label: "Participants", val: selectedContest.participantCount?.toLocaleString() },
                    { icon: "📜", label: "Rules", val: selectedContest.rules }
                  ].map((item) => (
                    <div key={item.label} style={{ background: isLight ? "#f8fafc" : "#080c14", border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.05)", borderRadius: "7px", padding: "8px 10px" }}>
                      <div style={{ fontSize: "0.67rem", color: isLight ? "#64748b" : "#475569", fontWeight: "600", textTransform: "uppercase" }}>{item.icon} {item.label}</div>
                      <div style={{ fontSize: "0.78rem", color: isLight ? "#334155" : "#cbd5e1", fontWeight: "500", marginTop: "2px" }}>{item.val}</div>
                    </div>
                  ))}
                </div>

                {selectedContest.problems?.length > 0 && (
                  <div>
                    <div style={{ fontSize: "0.75rem", fontWeight: "700", color: isLight ? "#64748b" : "#64748b", textTransform: "uppercase", marginBottom: "7px" }}>
                      Problem Set — {selectedContest.problems.length} problems
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                      {selectedContest.problems.map((p) => (
                        <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: isLight ? "#f8fafc" : "#080c14", border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.04)", padding: "7px 10px", borderRadius: "7px" }}>
                          <span style={{ fontSize: "0.8rem", color: isLight ? "#0f172a" : "#e2e8f0", fontWeight: "500" }}>{p.name}</span>
                          <span style={{ fontSize: "0.7rem", color: isLight ? "#4f46e5" : "#818cf8", fontWeight: "700" }}>{p.points} pts</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                  <button onClick={() => setSelectedContest(null)} style={getGhostBtn(isLight)}>Close</button>

                  {selectedContest.status === "UPCOMING" && (
                    <button
                      onClick={() => handleRegister(selectedContest.id)}
                      style={{ ...gradBtn, padding: "7px 18px" }}
                    >
                      {selectedContest.isRegistered ? "Registered ✓" : "Register Now"}
                    </button>
                  )}

                  {selectedContest.status === "LIVE" && (
                    <Link
                      to={`/contests/${selectedContest.id}/arena`}
                      onClick={() => setSelectedContest(null)}
                      style={{ ...gradBtn, background: "linear-gradient(135deg, #ef4444, #dc2626)", padding: "7px 18px" }}
                    >
                      <Zap size={13} /> {selectedContest.isRegistered ? "Enter Arena" : "Join Arena"}
                    </Link>
                  )}

                  {selectedContest.status === "ENDED" && (
                    <Link
                      to={`/contests/${selectedContest.id}/results`}
                      onClick={() => setSelectedContest(null)}
                      style={{ ...gradBtn, padding: "7px 18px" }}
                    >
                      View Results
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function getGhostBtn(isLight) {
  return {
    background: isLight ? "#f1f5f9" : "rgba(255,255,255,0.04)",
    border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255,255,255,0.09)",
    borderRadius: "7px",
    color: isLight ? "#475569" : "#94a3b8",
    padding: "6px 11px",
    fontSize: "0.75rem",
    fontWeight: "600",
    cursor: "pointer"
  };
}

const gradBtn = {
  background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
  color: "#fff", border: "none", borderRadius: "7px",
  padding: "6px 13px", fontSize: "0.75rem", fontWeight: "700",
  textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "5px",
  cursor: "pointer"
};
