import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, Crown, Flame, Medal, Shield, Sparkles, Trophy, Users } from "lucide-react";
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

export default function LeaderboardPage() {
  const { user } = useAuth();
  const { leaderboard: fallbackLb } = useAppData();
  const { isLight } = useTheme();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUserId = user?.id || user?._id || "";

  useEffect(() => {
    let isMounted = true;
    api
      .getLeaderboard()
      .then((res) => {
        if (!isMounted) return;
        if (Array.isArray(res?.leaderboard) && res.leaderboard.length > 0) {
          setLeaderboard(res.leaderboard);
        } else {
          setLeaderboard(fallbackLb || []);
        }
      })
      .catch(() => {
        if (isMounted) setLeaderboard(fallbackLb || []);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [fallbackLb]);

  const myRankEntry = leaderboard.find((e) => String(e.userId || e.id) === String(currentUserId));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "40px" }}
    >
      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
            <Trophy size={16} style={{ color: "#fbbf24" }} />
            <span style={{ fontSize: "0.72rem", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#f59e0b" }}>
              Global Developer Rankings
            </span>
          </div>
          <h1 style={{ fontSize: "1.55rem", fontWeight: "800", color: isLight ? "#0f172a" : "#f8fafc", margin: 0, letterSpacing: "-0.02em" }}>
            Algorithm Champions
          </h1>
          <p style={{ fontSize: "0.86rem", color: isLight ? "#475569" : "#94a3b8", margin: "2px 0 0 0" }}>
            Real-time standings based on accepted submissions, problem difficulty, ratings, and active streaks.
          </p>
        </div>

        {/* Current User Standing Card */}
        {myRankEntry && (
          <div style={{
            background: isLight ? "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.05))" : "linear-gradient(135deg, rgba(99,102,241,0.14), rgba(168,85,247,0.08))",
            border: isLight ? "1px solid rgba(99,102,241,0.25)" : "1px solid rgba(99,102,241,0.3)",
            borderRadius: "10px", padding: "8px 16px",
            display: "flex", alignItems: "center", gap: "14px",
            boxShadow: isLight ? "0 1px 3px rgba(0,0,0,0.04)" : "none"
          }}>
            <div>
              <span style={{ fontSize: "0.68rem", color: isLight ? "#4f46e5" : "#818cf8", fontWeight: "700", textTransform: "uppercase" }}>YOUR GLOBAL RANK</span>
              <div style={{ fontSize: "1.25rem", fontWeight: "800", color: isLight ? "#0f172a" : "#f8fafc", lineHeight: 1.1 }}>
                #{myRankEntry.rank}
              </div>
            </div>
            <div style={{ width: "1px", height: "30px", background: isLight ? "#e2e8f0" : "rgba(255,255,255,0.08)" }} />
            <div>
              <span style={{ fontSize: "0.68rem", color: isLight ? "#64748b" : "#475569", fontWeight: "700", textTransform: "uppercase" }}>RATING</span>
              <div style={{ fontSize: "1.1rem", fontWeight: "800", color: isLight ? "#059669" : "#34d399", lineHeight: 1.1 }}>
                {myRankEntry.rating || 1200} pts
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── PODIUM CARDS (TOP 3) ────────────────────────────────────── */}
      {leaderboard.length >= 3 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
          {/* 2nd Place */}
          <PodiumCard entry={leaderboard[1]} pos={2} isLight={isLight} />
          {/* 1st Place */}
          <PodiumCard entry={leaderboard[0]} pos={1} isLight={isLight} />
          {/* 3rd Place */}
          <PodiumCard entry={leaderboard[2]} pos={3} isLight={isLight} />
        </div>
      )}

      {/* ── MAIN DATA TABLE ─────────────────────────────────────────── */}
      <div style={{
        background: isLight ? "#ffffff" : "#0d111a",
        border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.08)",
        boxShadow: isLight ? "0 1px 4px rgba(0,0,0,0.04)" : "none",
        borderRadius: "12px", overflow: "hidden"
      }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.86rem" }}>
            <thead>
              <tr style={{
                background: isLight ? "#f8fafc" : "#080c14",
                borderBottom: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.08)",
                color: isLight ? "#64748b" : "#64748b", fontSize: "0.74rem", textTransform: "uppercase", letterSpacing: "0.05em"
              }}>
                <th style={{ padding: "12px 16px", width: "70px" }}>Rank</th>
                <th style={{ padding: "12px 16px" }}>Developer</th>
                <th style={{ padding: "12px 16px", width: "130px" }}>Rating &amp; Tier</th>
                <th style={{ padding: "12px 16px", width: "130px" }}>XP Score</th>
                <th style={{ padding: "12px 16px", width: "130px" }}>Solved</th>
                <th style={{ padding: "12px 16px", width: "120px", textAlign: "right" }}>Streak</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: "40px", textAlign: "center", color: isLight ? "#64748b" : "#64748b" }}>
                    <Sparkles size={20} className="animate-spin" style={{ color: "#818cf8", marginBottom: "6px" }} />
                    <div>Loading rankings...</div>
                  </td>
                </tr>
              ) : (
                leaderboard.map((entry) => {
                  const isMe = currentUserId && String(entry.userId || entry.id) === String(currentUserId);
                  const badge = entry.badge || "Knight";
                  const bm = BADGE_META[badge] || BADGE_META.Knight;

                  return (
                    <tr
                      key={entry.userId || entry.id || entry.rank}
                      style={{
                        borderBottom: isLight ? "1px solid #f1f5f9" : "1px solid rgba(255,255,255,0.04)",
                        background: isMe ? (isLight ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.12)") : "transparent",
                        transition: "background 0.12s ease"
                      }}
                      onMouseEnter={(e) => {
                        if (!isMe) e.currentTarget.style.background = isLight ? "rgba(0,0,0,0.02)" : "rgba(99,102,241,0.04)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isMe) e.currentTarget.style.background = "transparent";
                      }}
                    >
                      {/* Rank */}
                      <td style={{ padding: "12px 16px", fontWeight: "800", color: entry.rank === 1 ? "#fbbf24" : entry.rank === 2 ? (isLight ? "#64748b" : "#cbd5e1") : entry.rank === 3 ? "#f97316" : (isLight ? "#64748b" : "#64748b") }}>
                        {entry.rank === 1 ? "🥇 #1" : entry.rank === 2 ? "🥈 #2" : entry.rank === 3 ? "🥉 #3" : `#${entry.rank}`}
                      </td>

                      {/* Developer Info */}
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{
                            width: "30px", height: "30px", borderRadius: "50%",
                            background: bm.bg, border: `1px solid ${bm.color}40`,
                            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem"
                          }}>
                            {bm.icon}
                          </div>
                          <div>
                            <strong style={{ fontSize: "0.88rem", color: isMe ? (isLight ? "#7c3aed" : "#c084fc") : (isLight ? "#0f172a" : "#f8fafc"), display: "flex", alignItems: "center", gap: "6px" }}>
                              {entry.username || entry.name || "Developer"}
                              {isMe && (
                                <span style={{ fontSize: "0.65rem", background: isLight ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.25)", color: isLight ? "#4f46e5" : "#a5b4fc", padding: "1px 6px", borderRadius: "4px", fontWeight: "700" }}>
                                  YOU
                                </span>
                              )}
                            </strong>
                            {entry.name && entry.name !== entry.username && (
                              <span style={{ fontSize: "0.74rem", color: isLight ? "#64748b" : "#64748b" }}>{entry.name}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Rating & Badge */}
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "0.86rem", fontWeight: "800", color: isLight ? "#059669" : "#34d399", fontFamily: "monospace" }}>
                            {entry.rating || 1200}
                          </span>
                          <span style={{ fontSize: "0.68rem", background: bm.bg, color: bm.color, padding: "1px 6px", borderRadius: "4px", fontWeight: "700" }}>
                            {badge}
                          </span>
                        </div>
                      </td>

                      {/* XP Score */}
                      <td style={{ padding: "12px 16px", color: isLight ? "#7c3aed" : "#a78bfa", fontWeight: "700", fontSize: "0.86rem" }}>
                        {(entry.xp || entry.score || 0).toLocaleString()} XP
                      </td>

                      {/* Problems Solved */}
                      <td style={{ padding: "12px 16px", color: isLight ? "#334155" : "#cbd5e1", fontSize: "0.84rem", fontWeight: "600" }}>
                        {entry.solvedCount ?? entry.solved ?? 0} problems
                      </td>

                      {/* Streak */}
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#f97316", fontSize: "0.82rem", fontWeight: "700" }}>
                          <Flame size={14} />
                          {entry.streak || 1}d
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

function PodiumCard({ entry, pos, isLight }) {
  if (!entry) return null;
  const badge = entry.badge || "Knight";
  const bm = BADGE_META[badge] || BADGE_META.Knight;

  const orderStyle = {
    1: {
      border: isLight ? "rgba(245,158,11,0.4)" : "rgba(251,191,36,0.35)",
      bg: isLight ? "linear-gradient(135deg, rgba(251,191,36,0.14), #ffffff)" : "linear-gradient(135deg, rgba(251,191,36,0.12), rgba(245,158,11,0.04))",
      title: isLight ? "#b45309" : "#fbbf24",
      medal: "🥇"
    },
    2: {
      border: isLight ? "#e2e8f0" : "rgba(203,213,225,0.25)",
      bg: isLight ? "linear-gradient(135deg, #f8fafc, #ffffff)" : "linear-gradient(135deg, rgba(203,213,225,0.08), transparent)",
      title: isLight ? "#475569" : "#cbd5e1",
      medal: "🥈"
    },
    3: {
      border: isLight ? "rgba(249,115,22,0.35)" : "rgba(249,115,22,0.25)",
      bg: isLight ? "linear-gradient(135deg, rgba(249,115,22,0.1), #ffffff)" : "linear-gradient(135deg, rgba(249,115,22,0.08), transparent)",
      title: isLight ? "#c2410c" : "#f97316",
      medal: "🥉"
    }
  }[pos];

  return (
    <div style={{
      background: orderStyle.bg, border: `1px solid ${orderStyle.border}`,
      borderRadius: "12px", padding: "16px",
      boxShadow: isLight ? "0 1px 3px rgba(0,0,0,0.04)" : "none",
      display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "8px"
    }}>
      <div style={{ fontSize: "1.4rem" }}>{orderStyle.medal}</div>
      <div>
        <strong style={{ fontSize: "0.95rem", color: isLight ? "#0f172a" : "#f8fafc", display: "block" }}>{entry.username || entry.name}</strong>
        <span style={{ fontSize: "0.7rem", background: bm.bg, color: bm.color, padding: "1px 6px", borderRadius: "4px", fontWeight: "700" }}>
          {badge}
        </span>
      </div>
      <div style={{ fontSize: "1.1rem", fontWeight: "800", color: isLight ? "#059669" : "#34d399", fontFamily: "monospace" }}>
        {entry.rating || 1200} pts
      </div>
      <div style={{ fontSize: "0.74rem", color: isLight ? "#64748b" : "#64748b" }}>
        {entry.solvedCount ?? entry.solved ?? 0} solved · {(entry.xp || entry.score || 0).toLocaleString()} XP
      </div>
    </div>
  );
}
