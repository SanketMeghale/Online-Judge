import { Trophy, Medal, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../auth/AuthContext.jsx";
import { useAppData } from "../data/AppDataContext.jsx";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const { leaderboard } = useAppData();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="page-stack leaderboard-page"
    >
      <section className="page-header">
        <div>
          <span className="section-kicker">Leaderboard</span>
          <h1>Top coders</h1>
          <p>XP and solved counts update automatically as you submit accepted solutions.</p>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading compact">
          <span className="section-kicker">Rankings</span>
          <h2>Current standings</h2>
        </div>
        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>User</th>
                <th>XP</th>
                <th>Solved</th>
                <th>Streak</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, idx) => {
                const isPodium1 = entry.rank === 1;
                const isPodium2 = entry.rank === 2;
                const isPodium3 = entry.rank === 3;

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
                      <span className="face">{entry.name.slice(0, 1)}</span>
                      {entry.name}
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
