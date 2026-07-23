import { BarChart3, CheckCircle2, Crown, Flame, Sparkles, Target, Trophy, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { useAppData } from "../data/AppDataContext.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const { getProblemsForUser, getSubmissionsForUser, leaderboard, getUserById } = useAppData();
  const liveUser = getUserById(user?.id) ?? user;
  const problems = getProblemsForUser(user.id);
  const submissions = getSubmissionsForUser(user.id);
  const solvedThisWeek = submissions.filter((submission) => submission.verdict === "AC").length;
  const attempted = problems.filter((problem) => problem.status !== "Unsolved").length;
  const dailyGoalCount = Math.min(3, liveUser?.solved ?? 0);
  const topLeaders = leaderboard.slice(0, 5);
  const recommended = problems
    .filter((problem) => problem.status !== "Solved")
    .sort((left, right) => right.points - left.points)
    .slice(0, 3);
  const recent = submissions.slice(0, 3);

  return (
    <div className="judge-dashboard">
      <section className="hero-card">
        <div className="hero-text">
          <h1>
            Welcome back, <span>{liveUser?.name?.split(" ")[0] ?? "Coder"}</span>
          </h1>
          <p>
            Your local Online Judge workspace is fully interactive now. Pick a problem, run your code,
            and track every submission from the same dashboard.
          </p>
          <div className="hero-buttons">
            <Link className="neon-button blue" to="/problems">
              Start Solving
            </Link>
            <Link className="neon-button dark" to="/submissions">
              View Submissions
            </Link>
          </div>
        </div>

        <div className="trophy-scene">
          <div className="planet one" />
          <div className="planet two" />
          <div className="trophy-stand">OJ</div>
        </div>

        <div className="goal-card">
          <h3>Daily Goal</h3>
          <div className="goal-content">
            <div className="progress-ring">{Math.round((dailyGoalCount / 3) * 100)}%</div>
            <div>
              <strong>Solve 3 problems</strong>
              <span>{dailyGoalCount} / 3 solved</span>
              <div className="goal-line">
                <span style={{ width: `${(dailyGoalCount / 3) * 100}%` }} />
              </div>
              <small>{dailyGoalCount < 3 ? "One more push today." : "Daily goal complete."}</small>
            </div>
          </div>
        </div>
      </section>

      <section className="metric-grid">
        <Metric icon={<Target />} title="Solved" value={liveUser?.solved ?? 0} note={`${solvedThisWeek} AC submissions`} variant="green" />
        <Metric icon={<Zap />} title="Attempted" value={attempted} note={`${problems.length - attempted} remaining`} variant="purple" />
        <Metric icon={<Flame />} title="Streak" value={`${liveUser?.streak ?? 0} days`} note="Keep your momentum" variant="orange" />
        <Metric icon={<Crown />} title="Rank" value={`#${leaderboard.find((entry) => entry.id === user.id)?.rank ?? "-"}`} note={`${liveUser?.xp ?? 0} XP`} variant="blue" />
      </section>

      <section className="dashboard-columns">
        <div className="panel recommended-panel">
          <PanelTitle icon={<Sparkles />} title="Recommended for you" action="/problems" actionLabel="View all" />
          <div className="recommend-list">
            {recommended.map((item) => (
              <article className={`recommend-card ${item.difficulty.toLowerCase()}`} key={item.id}>
                <div>
                  <span className="level-pill">{item.difficulty}</span>
                  <h3>{item.title}</h3>
                  <p>{item.statement}</p>
                  <div className="problem-foot">
                    <span>{item.acceptance}% acceptance</span>
                    <span>{item.topic}</span>
                    <span>{item.points} pts</span>
                  </div>
                </div>
                <Link className="button button-secondary" to={`/problems/${item.id}`}>
                  Open
                </Link>
              </article>
            ))}
          </div>
        </div>

        <div className="middle-stack">
          <div className="panel contest-panel">
            <PanelTitle title="Practice Status" badge="LIVE" />
            <div className="contest-box">
              <h3>Current workspace</h3>
              <span>Core flows available</span>
              <div className="timer-row">
                <TimeBox value={String(problems.length).padStart(2, "0")} label="problems" />
                <TimeBox value={String(submissions.length).padStart(2, "0")} label="submits" />
                <TimeBox value={String(liveUser?.badges?.length ?? 0).padStart(2, "0")} label="badges" />
              </div>
              <Link className="neon-button blue full" to="/leaderboard">
                Open Leaderboard
              </Link>
            </div>
            <h4>Your Stats</h4>
            <div className="contest-stats">
              <span>Accuracy <strong>{liveUser?.accuracy ?? 0}%</strong></span>
              <span>XP <strong>{liveUser?.xp ?? 0}</strong></span>
              <span>Solved <strong>{liveUser?.solved ?? 0} / {problems.length}</strong></span>
            </div>
            <div className="green-line"><span style={{ width: `${((liveUser?.solved ?? 0) / problems.length) * 100}%` }} /></div>
            <Link className="standings-button" to="/submissions">
              <BarChart3 size={17} />
              Open Submission History
            </Link>
          </div>

          <div className="panel heatmap-panel">
            <h3>Recent Verdicts</h3>
            <span>Latest attempts</span>
            <div className="activity-grid compact-activity">
              {recent.map((submission) => (
                <div key={submission.id}>
                  <CheckCircle2 size={18} />
                  <span>{submission.problem}</span>
                  <strong>{submission.verdict}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="right-stack">
          <div className="panel leaderboard-panel">
            <PanelTitle icon={<Trophy />} title="Leaderboard" action="/leaderboard" actionLabel="View all" />
            <table className="dark-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>User</th>
                  <th>Score</th>
                  <th>Solved</th>
                  <th>Streak</th>
                </tr>
              </thead>
              <tbody>
                {topLeaders.map((entry) => (
                  <tr key={entry.id} className={entry.id === user.id ? "current-user" : ""}>
                    <td>#{entry.rank}</td>
                    <td><span className="face">{entry.name.slice(0, 1)}</span>{entry.name}</td>
                    <td>{entry.score}</td>
                    <td>{entry.solved}</td>
                    <td>{entry.streak}d</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="panel achievements-panel">
            <PanelTitle icon={<Sparkles />} title="Badges" action="/profile" actionLabel="Profile" />
            <div className="achievement-grid">
              {(liveUser?.badges ?? []).slice(0, 4).map((badge) => (
                <div className="achievement" key={badge}>
                  <div className="achievement-badge">{badge.slice(0, 2).toUpperCase()}</div>
                  <strong>{badge}</strong>
                  <span>Unlocked in your local profile</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ icon, title, value, note, variant }) {
  return (
    <article className={`metric-card ${variant}`}>
      <div className="metric-icon">{icon}</div>
      <div>
        <span>{title}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </article>
  );
}

function PanelTitle({ icon, title, action, actionLabel, badge }) {
  return (
    <div className="panel-title">
      <h2>{icon}{title}</h2>
      {badge ? <span className="live-badge">{badge}</span> : <Link to={action}>{actionLabel}</Link>}
    </div>
  );
}

function TimeBox({ value, label }) {
  return (
    <div className="time-box">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
