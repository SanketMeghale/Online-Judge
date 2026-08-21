import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Crown,
  Medal,
  Shield,
  Trophy,
  TrendingUp,
  Users
} from "lucide-react";
import { api } from "../api/apiClient.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function ContestResultsPage() {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isLight } = useTheme();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api
      .getContestResults(contestId)
      .then((res) => {
        if (!isMounted) return;
        if (!res || !res.contest) {
          setError("Contest results not available.");
        } else {
          setData(res);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Failed to load contest results.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [contestId]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh", color: isLight ? "#64748b" : "#94a3b8" }}>
        Loading contest results...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ maxWidth: "600px", margin: "40px auto", textAlign: "center", padding: "30px", background: isLight ? "#ffffff" : "#0d111a", borderRadius: "12px", border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.08)", boxShadow: isLight ? "0 1px 3px rgba(0,0,0,0.04)" : "none" }}>
        <h2 style={{ color: isLight ? "#0f172a" : "#f8fafc", fontSize: "1.1rem" }}>{error || "Results Unavailable"}</h2>
        <button onClick={() => navigate("/contests")} style={{ marginTop: "16px", background: "#6366f1", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer" }}>
          Back to Contests
        </button>
      </div>
    );
  }

  const { contest, myResult, leaderboard = [] } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "40px" }}
    >
      {/* Top Header Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button onClick={() => navigate("/contests")} style={{ background: isLight ? "#f1f5f9" : "rgba(255,255,255,0.04)", border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", color: isLight ? "#475569" : "#94a3b8", padding: "5px 10px", fontSize: "0.78rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
            <ArrowLeft size={14} /> Contests
          </button>
          <div>
            <span style={{ fontSize: "0.68rem", color: isLight ? "#4f46e5" : "#818cf8", fontWeight: "700", textTransform: "uppercase" }}>Final Results</span>
            <h1 style={{ fontSize: "1.4rem", fontWeight: "800", color: isLight ? "#0f172a" : "#f8fafc", margin: 0 }}>{contest.title}</h1>
          </div>
        </div>
      </div>

      {/* Your Result Card (If User Participated) */}
      {myResult && (
        <div style={{ background: isLight ? "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.05) 100%)" : "linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.08) 100%)", border: isLight ? "1px solid rgba(99, 102, 241, 0.25)" : "1px solid rgba(99, 102, 241, 0.3)", borderRadius: "12px", padding: "18px 22px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px", boxShadow: isLight ? "0 1px 3px rgba(0,0,0,0.04)" : "none" }}>
          <div>
            <span style={{ fontSize: "0.72rem", color: isLight ? "#64748b" : "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Your Rank</span>
            <strong style={{ fontSize: "1.4rem", color: isLight ? "#0f172a" : "#f8fafc", display: "block" }}>#{myResult.rank} <small style={{ fontSize: "0.78rem", color: isLight ? "#64748b" : "#64748b" }}>/ {myResult.totalParticipants}</small></strong>
          </div>
          <div>
            <span style={{ fontSize: "0.72rem", color: isLight ? "#64748b" : "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Score</span>
            <strong style={{ fontSize: "1.4rem", color: isLight ? "#059669" : "#34d399", display: "block" }}>{myResult.score} pts</strong>
          </div>
          <div>
            <span style={{ fontSize: "0.72rem", color: isLight ? "#64748b" : "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Solved</span>
            <strong style={{ fontSize: "1.4rem", color: isLight ? "#4f46e5" : "#818cf8", display: "block" }}>{myResult.solvedCount} problems</strong>
          </div>
          <div>
            <span style={{ fontSize: "0.72rem", color: isLight ? "#64748b" : "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Rating Change</span>
            <strong style={{ fontSize: "1.4rem", color: isLight ? "#059669" : "#34d399", display: "block" }}>{myResult.ratingChange}</strong>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div style={{ background: isLight ? "#ffffff" : "#0d111a", border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.08)", boxShadow: isLight ? "0 1px 3px rgba(0,0,0,0.04)" : "none", borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "8px" }}>
          <Trophy size={16} style={{ color: "#fbbf24" }} />
          <h3 style={{ fontSize: "0.95rem", fontWeight: "700", color: isLight ? "#0f172a" : "#f8fafc", margin: 0 }}>Final Standings</h3>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem", textAlign: "left" }}>
          <thead>
            <tr style={{ background: isLight ? "#f8fafc" : "#080c14", borderBottom: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.06)", color: isLight ? "#64748b" : "#64748b", fontSize: "0.72rem", textTransform: "uppercase" }}>
              <th style={{ padding: "10px 16px", width: "60px" }}>Rank</th>
              <th style={{ padding: "10px 16px" }}>Competitor</th>
              <th style={{ padding: "10px 16px" }}>Solved</th>
              <th style={{ padding: "10px 16px", textAlign: "right" }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((row, idx) => {
              const isMe = user && String(row.userId) === String(user.id || user._id);
              return (
                <tr key={row.userId || idx} style={{ borderBottom: isLight ? "1px solid #f1f5f9" : "1px solid rgba(255,255,255,0.04)", background: isMe ? (isLight ? "rgba(99, 102, 241, 0.08)" : "rgba(99, 102, 241, 0.12)") : "transparent" }}>
                  <td style={{ padding: "12px 16px", fontWeight: "700", color: row.rank === 1 ? "#fbbf24" : row.rank === 2 ? (isLight ? "#64748b" : "#cbd5e1") : row.rank === 3 ? "#f97316" : (isLight ? "#64748b" : "#64748b") }}>
                    #{row.rank}
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: "600", color: isMe ? (isLight ? "#7c3aed" : "#c084fc") : (isLight ? "#0f172a" : "#f8fafc") }}>
                    {row.username || row.name} {isMe && "(you)"}
                  </td>
                  <td style={{ padding: "12px 16px", color: isLight ? "#059669" : "#34d399", fontWeight: "600" }}>
                    {row.solvedCount}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: "800", color: isLight ? "#0f172a" : "#f8fafc" }}>
                    {row.score} pts
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
