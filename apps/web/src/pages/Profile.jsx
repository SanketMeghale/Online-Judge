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
import { submissions } from "../data/mockData.js";

const topicProgress = [
  { label: "Graphs", solved: 42, total: 58 },
  { label: "Arrays", solved: 36, total: 44 },
  { label: "Trees", solved: 24, total: 39 },
  { label: "Dynamic Programming", solved: 19, total: 34 }
];

export default function Profile() {
  const { user } = useAuth();
  const profileStats = [
    { label: "Solved", value: user.solved, icon: Trophy, tone: "green" },
    { label: "Ranking", value: `#${user.ranking}`, icon: Medal, tone: "purple" },
    { label: "Accuracy", value: "68%", icon: Target, tone: "blue" },
    { label: "Streak", value: `${user.streak}d`, icon: Flame, tone: "orange" }
  ];

  return (
    <div className="profile-page">
      <section className="profile-hero">
        <div className="profile-avatar">{user.name.slice(0, 1)}</div>
        <div className="profile-identity">
          <span className="section-kicker">Coder profile</span>
          <h1>{user.name}</h1>
          <p>@{user.username} · {user.email}</p>
          <div className="profile-badges">
            {user.badges.map((badge) => (
              <span key={badge}>
                <BadgeCheck size={14} />
                {badge}
              </span>
            ))}
          </div>
        </div>
        <div className="level-panel">
          <span>Level 12</span>
          <strong>{user.xp.toLocaleString()} XP</strong>
          <div className="xp-track">
            <span />
          </div>
          <small>2,150 / 3,000 XP to next badge</small>
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
              const width = Math.round((topic.solved / topic.total) * 100);

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
              <strong>68%</strong>
            </div>
            <div>
              <CalendarDays size={19} />
              <span>Active days</span>
              <strong>41</strong>
            </div>
            <div>
              <ChartNoAxesCombined size={19} />
              <span>Best topic</span>
              <strong>Graphs</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="section-block">
        <div className="section-heading compact">
          <span className="section-kicker">Profile</span>
          <h2>Recent submissions</h2>
        </div>
        <SubmissionTable rows={submissions} />
      </section>
    </div>
  );
}
