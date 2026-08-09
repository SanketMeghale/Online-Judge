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
  const { user, isCheckingSession } = useAuth();
  const { getProblemsForUser, getSubmissionsForUser, getUserById, leaderboard } = useAppData();

  // 1. Loading State while session is checking or restoring
  if (isCheckingSession) {
    return (
      <div className="profile-page" style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <div
          className="spinner"
          style={{
            margin: "0 auto 1.25rem",
            width: 36,
            height: 36,
            border: "3px solid #222",
            borderTopColor: "#7850ff",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite"
          }}
        />
        <h2 style={{ color: "#fff", fontSize: "1.2rem", fontWeight: "600" }}>Loading profile...</h2>
      </div>
    );
  }

  // 2. Safe User Resolution with fallbacks
  const currentUserId = user?.id || user?._id || "";
  const foundInDb = currentUserId ? getUserById(currentUserId) : null;
  const liveUser = foundInDb || user || {};

  const name = String(liveUser.name || liveUser.username || "User").trim();
  const username = String(liveUser.username || "user").trim();
  const email = String(liveUser.email || "").trim();
  const avatarLetter = String(name || username || "U").slice(0, 1).toUpperCase();

  const xp = typeof liveUser.xp === "number" ? liveUser.xp : 0;
  const streak = typeof liveUser.streak === "number" ? liveUser.streak : (liveUser.solved > 0 ? 1 : 0);
  const accuracy = typeof liveUser.accuracy === "number" ? liveUser.accuracy : 0;
  const solvedCount =
    typeof liveUser.solved === "number"
      ? liveUser.solved
      : Array.isArray(liveUser.solvedProblemIds)
      ? liveUser.solvedProblemIds.length
      : 0;

  const stats = liveUser.stats || {
    activeDays: Array.isArray(liveUser.activeDates) ? liveUser.activeDates.length : (streak > 0 ? streak : (solvedCount > 0 ? 1 : 0)),
    totalSubmissions: 0,
    acceptedSubmissions: 0
  };

  const badges = Array.isArray(liveUser.badges) && liveUser.badges.length > 0 ? liveUser.badges : ["New Challenger"];

  // 3. Problem and Submission Stats
  const problems = Array.isArray(getProblemsForUser(currentUserId)) ? getProblemsForUser(currentUserId) : [];
  const submissions = Array.isArray(getSubmissionsForUser(currentUserId)) ? getSubmissionsForUser(currentUserId) : [];

  const solvedByTopic = problems.reduce((accumulator, problem) => {
    if (!problem?.topic) return accumulator;
    const current = accumulator[problem.topic] ?? { label: problem.topic, solved: 0, total: 0 };
    current.total += 1;
    if (problem.status === "Solved") {
      current.solved += 1;
    }
    accumulator[problem.topic] = current;
    return accumulator;
  }, {});

  const topicProgress = Object.values(solvedByTopic);
  const leaderboardList = Array.isArray(leaderboard) ? leaderboard : [];
  const rank = leaderboardList.find((entry) => String(entry.id) === String(currentUserId))?.rank ?? "-";

  const profileStats = [
    { label: "Solved", value: solvedCount, icon: Trophy, tone: "green" },
    { label: "Ranking", value: `#${rank}`, icon: Medal, tone: "purple" },
    { label: "Accuracy", value: `${accuracy}%`, icon: Target, tone: "blue" },
    { label: "Streak", value: `${streak}d`, icon: Flame, tone: "orange" }
  ];

  return (
    <div className="profile-page">
      <section className="profile-hero">
        <div className="profile-avatar">{avatarLetter}</div>
        <div className="profile-identity">
          <span className="section-kicker">Coder profile</span>
          <h1>{name}</h1>
          <p>@{username} · {email || "Registered Coder"}</p>
          <div className="profile-badges">
            {badges.map((badge) => (
              <span key={badge}>
                <BadgeCheck size={14} />
                {badge}
              </span>
            ))}
          </div>
        </div>
        <div className="level-panel">
          <span>Level {Math.max(1, Math.ceil(xp / 1000))}</span>
          <strong>{xp.toLocaleString()} XP</strong>
          <div className="xp-track">
            <span style={{ width: `${Math.min(100, ((xp % 3000) / 3000) * 100)}%` }} />
          </div>
          <small>{xp % 3000} / 3,000 XP to next milestone</small>
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
              <strong>{accuracy}%</strong>
            </div>
            <div>
              <CalendarDays size={19} />
              <span>Active days</span>
              <strong>{stats.activeDays ?? 1}</strong>
            </div>
            <div>
              <ChartNoAxesCombined size={19} />
              <span>Total submissions</span>
              <strong>{stats.totalSubmissions ?? 0}</strong>
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
