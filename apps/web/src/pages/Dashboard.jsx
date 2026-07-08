import {
  BarChart3,
  Bookmark,
  Bot,
  Crown,
  Flame,
  Sparkles,
  Target,
  Trophy,
  Zap
} from "lucide-react";

const recommended = [
  {
    level: "Medium",
    title: "Prevent Cache Stampede",
    text: "Design a function that batches repeated key lookups and prevents duplicate expensive fetches while preserving response order.",
    rate: "78%",
    topic: "System Design",
    solved: "1.2K solved"
  },
  {
    level: "Easy",
    title: "Valid Palindrome",
    text: "Check if a given string is a palindrome.",
    rate: "92%",
    topic: "Two Pointers",
    solved: "4.5K solved"
  },
  {
    level: "Hard",
    title: "Max Profit in Job Scheduling",
    text: "Find the maximum profit you can get by scheduling jobs without overlapping.",
    rate: "65%",
    topic: "Dynamic Programming",
    solved: "1.8K solved"
  }
];

const leaders = [
  ["🥇", "Aarav Singh", 1340, 142, "19 days"],
  ["🥈", "Mira Chen", 1280, 135, "13 days"],
  ["🥉", "Raj Patel", 1150, 120, "11 days"],
  ["4", "You (Nadia)", 980, 98, "7 days"],
  ["5", "Dev Sharma", 850, 86, "6 days"]
];

const achievements = [
  ["7", "7 Day Streak", ""],
  ["🧩", "Problem Solver", "100 Solves"],
  ["🏆", "Contest Master", "Top 50"],
  ["🦉", "Night Owl", "10 PM Club"]
];

export default function Dashboard() {
  return (
    <div className="judge-dashboard">
      <section className="hero-card">
        <div className="hero-text">
          <h1>
            Good evening, <span>Nadia!</span> 👋
          </h1>
          <p>Keep solving, keep improving. You're one step closer to mastery today!</p>
          <div className="hero-buttons">
            <button className="neon-button blue">
              <span>&lt;/&gt;</span>
              Start Solving
            </button>
            <button className="neon-button dark">
              <Bot size={19} />
              Try AI Interview
            </button>
          </div>
        </div>

        <div className="trophy-scene">
          <div className="planet one" />
          <div className="planet two" />
          <div className="confetti confetti-a">◆ ✦ ◼ ✦ ◆</div>
          <div className="confetti confetti-b">✦ ◼ ◆ ✦</div>
          <div className="trophy-stand">🏆</div>
        </div>

        <div className="goal-card">
          <h3>Daily Goal</h3>
          <div className="goal-content">
            <div className="progress-ring">72%</div>
            <div>
              <strong>Solve 3 problems</strong>
              <span>2 / 3 solved</span>
              <div className="goal-line">
                <span />
              </div>
              <small>Keep going! 💪</small>
            </div>
          </div>
        </div>
      </section>

      <section className="metric-grid">
        <Metric icon={<Target />} title="Solved" value="121" note="+12 this week" variant="green" />
        <Metric icon={<Zap />} title="Daily Goal" value="2 / 3" note="1 problem left" variant="purple" />
        <Metric icon={<Flame />} title="Streak" value="7 days" note="Best 23 days" variant="orange" />
        <Metric icon={<Crown />} title="Rank" value="#87" note="+23 this week" variant="blue" />
      </section>

      <section className="dashboard-columns">
        <div className="panel recommended-panel">
          <PanelTitle icon={<Sparkles />} title="Recommended for you" action="View all →" />
          <div className="recommend-list">
            {recommended.map((item) => (
              <article className={`recommend-card ${item.level.toLowerCase()}`} key={item.title}>
                <div>
                  <span className="level-pill">{item.level}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <div className="problem-foot">
                    <span>👍 {item.rate}</span>
                    <span>{item.topic}</span>
                    <span>🔥 {item.solved}</span>
                  </div>
                </div>
                <Bookmark size={23} />
              </article>
            ))}
          </div>
        </div>

        <div className="middle-stack">
          <div className="panel contest-panel">
            <PanelTitle title="Live Contest" badge="LIVE" />
            <div className="contest-box">
              <h3>🏆 May Challenge 2024</h3>
              <span>Ends in</span>
              <div className="timer-row">
                <TimeBox value="01" label="hr" />
                <TimeBox value="32" label="min" />
                <TimeBox value="45" label="sec" />
              </div>
              <button className="neon-button blue full">➤ Go to Contest</button>
            </div>
            <h4>Your Stats</h4>
            <div className="contest-stats">
              <span>Rank <strong>#42</strong></span>
              <span>Score <strong>750</strong></span>
              <span>Solved <strong>3 / 8</strong></span>
            </div>
            <div className="green-line"><span /></div>
            <button className="standings-button">
              <BarChart3 size={17} />
              View Standings
            </button>
          </div>

          <div className="panel heatmap-panel">
            <h3>Activity Heatmap</h3>
            <span>Solved Problems</span>
            <div className="heatmap">
              {Array.from({ length: 35 }).map((_, index) => (
                <i key={index} className={index % 5 === 0 || index > 24 ? "active" : index % 3 === 0 ? "mid" : ""} />
              ))}
            </div>
          </div>
        </div>

        <div className="right-stack">
          <div className="panel leaderboard-panel">
            <PanelTitle icon={<Sparkles />} title="Live Leaderboard" action="View all →" />
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
                {leaders.map(([rank, name, score, solved, streak], index) => (
                  <tr key={name} className={name.includes("Nadia") ? "current-user" : ""}>
                    <td>{rank}</td>
                    <td><span className="face">{index === 1 ? "👩🏻‍💻" : "👨🏽‍💻"}</span>{name}</td>
                    <td>{score}</td>
                    <td>{solved}</td>
                    <td>{streak}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="panel achievements-panel">
            <PanelTitle icon={<Sparkles />} title="Achievements" action="View all →" />
            <div className="achievement-grid">
              {achievements.map(([icon, title, sub]) => (
                <div className="achievement" key={title}>
                  <div className="achievement-badge">{icon}</div>
                  <strong>{title}</strong>
                  <span>{sub}</span>
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

function PanelTitle({ icon, title, action, badge }) {
  return (
    <div className="panel-title">
      <h2>{icon}{title}</h2>
      {badge ? <span className="live-badge">{badge}</span> : <button>{action}</button>}
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
