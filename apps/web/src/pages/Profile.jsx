import {
  Activity,
  BadgeCheck,
  CalendarDays,
  ChartNoAxesCombined,
  Flame,
  Medal,
  Target,
  Trophy
} from "lucide-react";
import { useAuth } from "../auth/AuthContext.jsx";
import SubmissionTable from "../components/tables/SubmissionTable.jsx";
import { useAppData } from "../data/AppDataContext.jsx";

export default function Profile() {
  const { user } = useAuth();
  const { getProblemsForUser, getSubmissionsForUser, getUserById, leaderboard } = useAppData();
  const liveUser = getUserById(user.id) ?? user;
  const problems = getProblemsForUser(user.id);
  const submissions = getSubmissionsForUser(user.id);
  const solvedByTopic = problems.reduce((accumulator, problem) => {
    const current = accumulator[problem.topic] ?? { label: problem.topic, solved: 0, total: 0 };
    current.total += 1;
    if (problem.status === "Solved") {
      current.solved += 1;
    }
    accumulator[problem.topic] = current;
    return accumulator;
  }, {});
  const topicProgress = Object.values(solvedByTopic);
  const rank = leaderboard.find((entry) => entry.id === user.id)?.rank ?? "-";
  const profileStats = [
    { label: "Solved", value: liveUser.solved, icon: Trophy, tone: "green" },
    { label: "Ranking", value: `#${rank}`, icon: Medal, tone: "purple" },
    { label: "Accuracy", value: `${liveUser.accuracy}%`, icon: Target, tone: "blue" },
    { label: "Streak", value: `${liveUser.streak}d`, icon: Flame, tone: "orange" }
  ];

  return (
    <div className="profile-page">
      <section className="profile-hero">
        <div className="profile-avatar">{liveUser.name.slice(0, 1)}</div>
        <div className="profile-identity">
          <span className="section-kicker">Coder profile</span>
          <h1>{liveUser.name}</h1>
          <p>@{liveUser.username} · {liveUser.email}</p>
          <div className="profile-badges">
            {liveUser.badges.map((badge) => (
              <span key={badge}>
                <BadgeCheck size={14} />
                {badge}
              </span>
            ))}
          </div>
        </div>
        <div className="level-panel">
          <span>Level {Math.max(1, Math.ceil(liveUser.xp / 1000))}</span>
          <strong>{liveUser.xp.toLocaleString()} XP</strong>
          <div className="xp-track">
            <span style={{ width: `${Math.min(100, ((liveUser.xp % 3000) / 3000) * 100)}%` }} />
          </div>
          <small>{liveUser.xp % 3000} / 3,000 XP to next milestone</small>
        </div>
      </section>

      <section className="profile-stat-grid">
        {profileStats.map(({ label, value, icon: Icon, tone }) => (
          <article className={`profile-stat ${tone}`} key={label}>
            <span className="profile-stat-icon">
              <Icon size={20} />
            </span>
            <div>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          </article>
        ))}
      </section>

      <section className="profile-main-grid">
        <article className="profile-panel">
          <div className="section-heading compact">
            <span className="section-kicker">Progress</span>
            <h2>Topic strength</h2>
          </div>
          <div className="topic-list">
            {topicProgress.map((topic) => {
              const width = topic.total ? Math.round((topic.solved / topic.total) * 100) : 0;

              return (
                <div className="topic-row" key={topic.label}>
                  <div>
                    <strong>{topic.label}</strong>
                    <span>{topic.solved}/{topic.total} solved</span>
                  </div>
                  <div className="topic-track" aria-label={`${topic.label} progress ${width}%`}>
                    <span style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="profile-panel activity-panel">
          <div className="section-heading compact">
            <span className="section-kicker">Activity</span>
            <h2>Practice rhythm</h2>
          </div>
          <div className="activity-grid">
            <div>
              <Activity size={19} />
              <span>Current accuracy</span>
              <strong>{liveUser.accuracy}%</strong>
            </div>
            <div>
              <CalendarDays size={19} />
              <span>Active days</span>
              <strong>{liveUser.stats.activeDays}</strong>
            </div>
            <div>
              <ChartNoAxesCombined size={19} />
              <span>Total submissions</span>
              <strong>{liveUser.stats.totalSubmissions}</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="section-block">
        <div className="section-heading compact">
          <span className="section-kicker">Profile</span>
          <h2>Recent submissions</h2>
        </div>
        <SubmissionTable rows={submissions.slice(0, 8)} />
      </section>
    </div>
  );
}
