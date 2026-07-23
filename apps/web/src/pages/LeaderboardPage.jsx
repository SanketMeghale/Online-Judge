import { Trophy } from "lucide-react";
import { useAuth } from "../auth/AuthContext.jsx";
import { useAppData } from "../data/AppDataContext.jsx";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const { leaderboard } = useAppData();

  return (
    <div className="page-stack leaderboard-page">
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
              {leaderboard.map((entry) => (
                <tr key={entry.id} className={entry.id === user.id ? "highlight-row" : ""}>
                  <td>#{entry.rank}</td>
                  <td className="leader-cell">
                    <span className="face">{entry.name.slice(0, 1)}</span>
                    {entry.name}
                    {entry.id === user.id ? <span className="you-pill"><Trophy size={14} />You</span> : null}
                  </td>
                  <td>{entry.score}</td>
                  <td>{entry.solved}</td>
                  <td>{entry.streak} days</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
