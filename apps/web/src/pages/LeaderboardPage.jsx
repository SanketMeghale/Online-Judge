import { motion } from "framer-motion";
import { Award, Flame, Medal, Sparkles, Trophy } from "lucide-react";
import { useAuth } from "../auth/AuthContext.jsx";
import { useAppData } from "../data/AppDataContext.jsx";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const { leaderboard } = useAppData();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="page-stack"
    >
      <section className="section-block">
        <div className="section-heading">
          <span className="section-kicker">Global rankings</span>
          <h1>Algorithm Champions</h1>
          <p>Real-time developer rankings based on accepted submissions, problem difficulty, and consistency streaks.</p>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Developer</th>
                <th>XP Score</th>
                <th>Problems Solved</th>
                <th>Daily Streak</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, idx) => {
                const isPodium1 = entry.rank === 1;
                const isPodium2 = entry.rank === 2;
                const isPodium3 = entry.rank === 3;
                const initialLetter = String(entry.name || "U").slice(0, 1).toUpperCase();

                return (
                  <motion.tr
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.04 }}
                    className={`${entry.id === user?.id ? "highlight-row" : ""} ${isPodium1 ? "podium-gold" : isPodium2 ? "podium-silver" : isPodium3 ? "podium-bronze" : ""}`}
                  >
                    <td>
                      {isPodium1 ? "🥇 #1" : isPodium2 ? "🥈 #2" : isPodium3 ? "🥉 #3" : `#${entry.rank}`}
                    </td>
                    <td className="leader-cell">
                      <span className="face">{initialLetter}</span>
                      {entry.name || "Developer"}
                      {entry.id === user?.id ? <span className="you-pill"><Trophy size={14} />You</span> : null}
                    </td>
                    <td><strong style={{ color: "#a78bfa" }}>{entry.score} XP</strong></td>
                    <td>{entry.solved}</td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#ff6b35" }}>
                        <Flame size={14} />
                        {entry.streak} days
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </motion.div>
  );
}
