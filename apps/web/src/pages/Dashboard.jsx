import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bookmark,
  Bot,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Code2,
  Clock,
  Flame,
  LineChart,
  Target,
  Trophy,
  UserCheck,
  XCircle
} from "lucide-react";
import { useAuth } from "../auth/AuthContext.jsx";
import { useAppData } from "../data/AppDataContext.jsx";
import { api } from "../api/apiClient.js";

export default function Dashboard() {
  const { user } = useAuth();
  const { getUserById, getSubmissionsForUser } = useAppData();
  const liveUser = getUserById(user?.id) ?? user;

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 15,
    minutes: 30,
    seconds: 45
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadUserData() {
      try {
        const data = await api.getSubmissions();
        if (isMounted && data?.submissions) {
          setSubmissions(data.submissions);
          setLoading(false);
          return;
        }
      } catch (e) {}

      if (isMounted) {
        setSubmissions(getSubmissionsForUser(user?.id) || []);
        setLoading(false);
      }
    }
    loadUserData();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Compute live user stats from submissions
  const totalSubmissions = Math.max(submissions.length, liveUser?.stats?.totalSubmissions || 0);
  const acceptedCount = submissions.filter((s) => s.verdict === "AC" || s.verdict === "Accepted").length || liveUser?.stats?.acceptedSubmissions || 0;
  const waCount = submissions.filter((s) => s.verdict === "WA" || s.verdict === "Wrong Answer").length || liveUser?.stats?.waCount || 0;
  const reCount = submissions.filter((s) => s.verdict === "RE" || s.verdict === "Runtime Error" || s.verdict === "CE").length || liveUser?.stats?.reCount || 0;
  const tleCount = submissions.filter((s) => s.verdict === "TLE" || s.verdict === "Time Limit Exceeded").length || liveUser?.stats?.tleCount || 0;
  const solvedCount = liveUser?.solvedProblemIds?.length || liveUser?.solved || (acceptedCount > 0 ? 1 : 0);

  const acceptanceRate = totalSubmissions > 0 ? ((acceptedCount / totalSubmissions) * 100).toFixed(1) : "0.0";
  const joinDateStr = liveUser?.createdAt ? new Date(liveUser.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Jan 2026";

  return (
    <div className="judgo-dashboard">
      {/* 1. Hero Challenge Banner */}
      <section className="hero-challenge-banner">
        <div className="hero-content">
          <h1>
            Welcome back, <span className="highlight-text">{liveUser?.name || liveUser?.username || "Coder"}!</span>
          </h1>
          <p style={{ color: "#a8b3d6", marginTop: "4px", fontSize: "0.95rem" }}>
            Member since {joinDateStr} • {liveUser?.email}
          </p>

          <div className="hero-stats-row" style={{ marginTop: "20px" }}>
            <div className="hero-stat-card rating">
              <div className="stat-icon-box green">
                <LineChart size={18} />
              </div>
              <div className="stat-text">
                <span className="stat-val">{liveUser?.ranking ? `#${liveUser.ranking}` : "Top 8%"}</span>
                <span className="stat-lbl">Global Rank</span>
              </div>
            </div>

            <div className="hero-stat-card streak">
              <div className="stat-icon-box orange">
                <Flame size={18} />
              </div>
              <div className="stat-text">
                <span className="stat-val">{liveUser?.streak ?? 1} Day</span>
                <span className="stat-lbl">Streak</span>
              </div>
            </div>

            <div className="hero-stat-card rank">
              <div className="stat-icon-box purple">
                <Trophy size={18} />
              </div>
              <div className="stat-text">
                <span className="stat-val">{acceptanceRate}%</span>
                <span className="stat-lbl">Acceptance Rate</span>
              </div>
            </div>
          </div>

          <div className="hero-actions">
            <Link className="hero-btn primary" to="/problems/two-sum">
              <span>Continue Solving</span>
              <ArrowRight size={16} />
            </Link>
            <Link className="hero-btn secondary" to="/problems">
              <Target size={16} className="target-icon" />
              <span>Daily Challenge</span>
            </Link>
          </div>
        </div>

        {/* Hero Background Floating Code Deco */}
        <div className="hero-deco-symbols">
          <span className="deco-sym sym-1">&lt;/&gt;</span>
          <span className="deco-sym sym-2">&#123; &#125;</span>
          <span className="deco-sym sym-3">( )</span>
          <svg className="wave-bg-svg" viewBox="0 0 500 150" preserveAspectRatio="none">
            <path d="M0,80 Q150,20 300,90 T500,60" fill="none" stroke="rgba(120, 80, 255, 0.25)" strokeWidth="2" />
            <path d="M0,110 Q120,40 280,120 T500,90" fill="none" stroke="rgba(0, 195, 255, 0.15)" strokeWidth="1.5" />
          </svg>
        </div>
      </section>

      {/* 2. Middle Row 3 Cards Grid */}
      <section className="dash-middle-grid">
        {/* Card 1: Problems Solved */}
        <div className="dash-card solved-card">
          <div className="card-head">
            <CheckCircle2 size={18} className="card-icon green" />
            <h3>Submission Breakdown</h3>
          </div>
          <div className="solved-stat-row">
            <div className="main-stat">
              <span className="num-val">{solvedCount}</span>
              <span className="num-lbl">Problems Solved</span>
            </div>
            <span className="stat-increase">{totalSubmissions} Total Submissions</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", margin: "16px 0" }}>
            <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "8px", padding: "8px", textAlign: "center" }}>
              <span style={{ color: "#10b981", fontWeight: "bold", fontSize: "1.1rem", display: "block" }}>{acceptedCount}</span>
              <span style={{ color: "#8b949e", fontSize: "0.75rem" }}>Accepted</span>
            </div>
            <div style={{ background: "rgba(255, 77, 79, 0.1)", border: "1px solid rgba(255, 77, 79, 0.2)", borderRadius: "8px", padding: "8px", textAlign: "center" }}>
              <span style={{ color: "#ff4d4f", fontWeight: "bold", fontSize: "1.1rem", display: "block" }}>{waCount}</span>
              <span style={{ color: "#8b949e", fontSize: "0.75rem" }}>Wrong Answer</span>
            </div>
            <div style={{ background: "rgba(255, 169, 64, 0.1)", border: "1px solid rgba(255, 169, 64, 0.2)", borderRadius: "8px", padding: "8px", textAlign: "center" }}>
              <span style={{ color: "#ffa940", fontWeight: "bold", fontSize: "1.1rem", display: "block" }}>{reCount + tleCount}</span>
              <span style={{ color: "#8b949e", fontSize: "0.75rem" }}>RE / TLE</span>
            </div>
          </div>

          <Link className="card-action-btn green" to="/problems">
            <span>Practice Now</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Card 2: Next Contest */}
        <div className="dash-card contest-card">
          <div className="card-head">
            <Calendar size={18} className="card-icon orange" />
            <h3>Next Contest</h3>
          </div>
          <h4 className="contest-title">CodeSprint Challenge</h4>

          <div className="countdown-timer-row">
            <div className="time-unit">
              <strong>{String(timeLeft.days).padStart(2, "0")}</strong>
              <span>DAYS</span>
            </div>
            <div className="time-unit">
              <strong>{String(timeLeft.hours).padStart(2, "0")}</strong>
              <span>HRS</span>
            </div>
            <div className="time-unit">
              <strong>{String(timeLeft.minutes).padStart(2, "0")}</strong>
              <span>MINS</span>
            </div>
            <div className="time-unit">
              <strong>{String(timeLeft.seconds).padStart(2, "0")}</strong>
              <span>SECS</span>
            </div>
          </div>

          <Link className="card-action-btn orange" to="/contests">
            <span>View Contest</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Card 3: Weekly Goal */}
        <div className="dash-card goal-card">
          <div className="card-head">
            <Target size={18} className="card-icon blue" />
            <h3>Weekly Goal</h3>
          </div>
          <span className="goal-sub">Solve 5 problems</span>

          <div className="goal-progress-row">
            <span className="goal-num"><strong>{Math.min(solvedCount, 5)}</strong> / 5</span>
            <span className="goal-pct">{Math.min(Math.round((solvedCount / 5) * 100), 100)}%</span>
          </div>

          <div className="goal-bar-track">
            <span className="goal-bar-fill" style={{ width: `${Math.min(Math.round((solvedCount / 5) * 100), 100)}%` }} />
          </div>

          <Link className="card-action-btn blue" to="/submissions">
            <span>View Progress</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* 3. Lower Row 2 Columns */}
      <section className="dash-lower-grid">
        {/* Column 1: Continue Solving */}
        <div className="dash-card continue-card">
          <div className="card-head">
            <Bookmark size={18} className="card-icon" />
            <h3>Continue Solving</h3>
          </div>

          <div className="continue-inner-box">
            <div className="code-box-icon">
              <Code2 size={20} />
            </div>

            <div className="continue-details">
              <div className="problem-title-row">
                <span className="diff-pill easy">Easy</span>
                <h4>Two Sum</h4>
              </div>
              <span className="topic-tags">Arrays • Hash Table</span>

              <div className="tc-progress-line">
                <div className="line-track">
                  <span className="line-fill" style={{ width: "100%" }} />
                </div>
                <span className="tc-text">5 / 5 test cases passed</span>
              </div>
            </div>

            <Link className="resume-btn" to="/problems/two-sum">
              <span>Resume</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Column 2: Today's Activity */}
        <div className="dash-card activity-card">
          <div className="card-head-between">
            <div className="card-head">
              <Activity size={18} className="card-icon blue" />
              <h3>Recent Submissions</h3>
            </div>
            <Link className="view-all-link" to="/submissions">View All</Link>
          </div>

          <div className="activity-timeline">
            {submissions.slice(0, 4).map((sub) => {
              const isAC = sub.verdict === "AC" || sub.verdict === "Accepted";
              return (
                <div className="activity-item" key={sub.id || sub.submissionId || Math.random()}>
                  {isAC ? <CheckCircle2 size={16} className="act-icon green" /> : <XCircle size={16} className="act-icon red" />}
                  <div className="act-info">
                    <span className={`act-status ${isAC ? "green" : "red"}`}>{sub.verdict || "Submitted"}</span>
                    <span className="act-prob">{sub.problem || sub.problemId}</span>
                  </div>
                  <span className="act-time">{sub.language}</span>
                </div>
              );
            })}

            {submissions.length === 0 && (
              <div style={{ color: "#8b949e", fontSize: "0.88rem", padding: "10px 0" }}>
                No submissions recorded yet. Start solving problems!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. Bottom Category Shortcuts Row (4 Columns) */}
      <section className="dash-shortcuts-grid">
        <Link className="shortcut-card practice" to="/problems">
          <div className="shortcut-icon-box blue">
            <Code2 size={20} />
          </div>
          <div className="shortcut-text">
            <h4>Practice</h4>
            <span>Solve problems</span>
          </div>
          <ChevronRight size={18} className="shortcut-arrow" />
        </Link>

        <Link className="shortcut-card contest" to="/contests">
          <div className="shortcut-icon-box purple">
            <Trophy size={20} />
          </div>
          <div className="shortcut-text">
            <h4>Contest</h4>
            <span>Compete & Win</span>
          </div>
          <ChevronRight size={18} className="shortcut-arrow" />
        </Link>

        <Link className="shortcut-card coach" to="/interviewer">
          <div className="shortcut-icon-box teal">
            <Bot size={20} />
          </div>
          <div className="shortcut-text">
            <h4>AI Coach</h4>
            <span>Get smarter</span>
          </div>
          <ChevronRight size={18} className="shortcut-arrow" />
        </Link>

        <Link className="shortcut-card leaderboard" to="/leaderboard">
          <div className="shortcut-icon-box amber">
            <BarChart3 size={20} />
          </div>
          <div className="shortcut-text">
            <h4>Leaderboard</h4>
            <span>See top performers</span>
          </div>
          <ChevronRight size={18} className="shortcut-arrow" />
        </Link>
      </section>
    </div>
  );
}
