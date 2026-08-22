import { useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Target,
  Flame,
  Zap,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { getUserDisplayName } from "../../auth/displayName.js";
import { calculateStreak, getWeekStreakStatus } from "../../data/appData.js";

function HeroStreakCard({ liveUser, user, stats, weeklyGoal, dailyChallenge }) {
  const activeDates = useMemo(() => {
    return Array.isArray(liveUser?.activeDates) ? liveUser.activeDates : [];
  }, [liveUser?.activeDates]);

  const streakInfo = useMemo(() => {
    return calculateStreak(activeDates, new Date());
  }, [activeDates]);

  const currentStreak = typeof stats?.currentStreak === "number"
    ? stats.currentStreak
    : typeof liveUser?.streak === "number"
    ? liveUser.streak
    : streakInfo.currentStreak;

  const bestStreak = Math.max(
    stats?.bestStreak || 0,
    liveUser?.bestStreak || 0,
    streakInfo.bestStreak,
    currentStreak
  );

  const isActiveToday = streakInfo.isActiveToday;
  const weekDays = useMemo(() => {
    return getWeekStreakStatus(activeDates, new Date());
  }, [activeDates]);

  const solvedCount = stats?.solvedCount ?? liveUser?.solvedProblemIds?.length ?? 0;
  const rating = stats?.rating ?? 1200;
  const globalRank = stats?.globalRank ? `#${stats.globalRank}` : "#4";
  const isDailySolved = dailyChallenge?.solved || false;
  const dailyUrl = dailyChallenge?.id ? `/problems/${dailyChallenge.id}` : "/problems";

  return (
    <div className="dash-hero-right">
      <div className="dash-hero-overview-card">
        {/* Top Header Strip */}
        <div className="dash-hero-card-header">
          <div className="dash-card-title-group">
            <div className="dash-streak-icon-box">
              <Flame size={20} className="dash-flame-icon" />
            </div>
            <div>
              <div className="dash-card-eyebrow">CONSISTENCY & STREAK</div>
              <h3 className="dash-card-heading">
                {currentStreak} Day{currentStreak === 1 ? "" : "s"} Active Streak
              </h3>
            </div>
          </div>

          <div className={`dash-streak-pill ${isActiveToday ? "active" : "pending"}`}>
            <span className="dash-pill-dot" />
            <span>{isActiveToday ? "Secured Today" : currentStreak > 0 ? "Keep Alive" : "Start Today"}</span>
          </div>
        </div>

        {/* Motivational Status Text */}
        <div className="dash-streak-status-banner">
          <p className="dash-streak-hint">
            {isActiveToday ? (
              <>
                <Sparkles size={14} style={{ color: "#10b981", flexShrink: 0 }} />
                <span>Great work! You've solved a problem today and secured your streak.</span>
              </>
            ) : currentStreak > 0 ? (
              <>
                <Flame size={14} style={{ color: "#f59e0b", flexShrink: 0 }} />
                <span>Streak active from yesterday! Solve 1 problem today to keep it going.</span>
              </>
            ) : (
              <>
                <Target size={14} style={{ color: "#38bdf8", flexShrink: 0 }} />
                <span>Solve today's curated challenge to start your consecutive streak.</span>
              </>
            )}
          </p>
        </div>

        {/* 7-Day Weekly Streak Grid */}
        <div className="dash-hero-week-container">
          <div className="dash-week-header">
            <span className="dash-week-title">This Week's Activity</span>
            <span className="dash-week-pb">Best: {bestStreak}d</span>
          </div>
          <div className="dash-hero-week-grid">
            {weekDays.map((d, idx) => (
              <div
                key={idx}
                className={`dash-week-day-node ${d.isCompleted ? "completed" : ""} ${d.isToday ? "today" : ""} ${d.isPast && !d.isCompleted ? "missed" : ""}`}
                title={`${d.dayName} (${d.dateKey}): ${d.isCompleted ? "Active / Solved" : d.isToday ? "Today (Pending)" : "No submission"}`}
              >
                <span className="dash-day-name">{d.dayName[0]}</span>
                <div className="dash-day-indicator">
                  {d.isCompleted ? (
                    <CheckCircle2 size={13} className="dash-day-check" />
                  ) : (
                    <span className="dash-day-num">{d.dayNumber}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3-Column Arena Performance Snapshot */}
        <div className="dash-hero-metrics-grid">
          <div className="dash-hero-metric-cell">
            <span className="dash-metric-label">SOLVED</span>
            <span className="dash-metric-val">{solvedCount}</span>
            <span className="dash-metric-sub">Challenges</span>
          </div>
          <div className="dash-hero-metric-cell">
            <span className="dash-metric-label">RATING</span>
            <span className="dash-metric-val text-blue">{rating}</span>
            <span className="dash-metric-sub">{globalRank} Rank</span>
          </div>
          <div className="dash-hero-metric-cell">
            <span className="dash-metric-label">WEEKLY GOAL</span>
            <span className="dash-metric-val text-purple">
              {weeklyGoal?.solved ?? Math.min(solvedCount, 5)}/{weeklyGoal?.target ?? 5}
            </span>
            <span className="dash-metric-sub">
              {weeklyGoal?.isCompleted ? "✓ Done" : `${Math.max(0, (weeklyGoal?.target ?? 5) - (weeklyGoal?.solved ?? Math.min(solvedCount, 5)))} left`}
            </span>
          </div>
        </div>

        {/* Daily Challenge Quick Link Strip */}
        <Link to={dailyUrl} className="dash-hero-daily-strip">
          <div className="dash-daily-left">
            <div className="dash-daily-badge">
              <Zap size={13} />
            </div>
            <div className="dash-daily-info">
              <span className="dash-daily-tag">TODAY'S CHALLENGE</span>
              <span className="dash-daily-name">{dailyChallenge?.title || "Daily Coding Challenge"}</span>
            </div>
          </div>
          <div className="dash-daily-right">
            {isDailySolved ? (
              <span className="dash-daily-solved-pill">
                <CheckCircle2 size={12} />
                <span>Solved</span>
              </span>
            ) : (
              <span className="dash-daily-solve-pill">
                <span>Solve</span>
                <ChevronRight size={12} />
              </span>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
}

export default function DashboardHero({
  user,
  liveUser,
  stats = null,
  weeklyGoal = null,
  continueProblem = null,
  dailyChallenge = null
}) {
  const prefersReducedMotion = useReducedMotion();
  const navigate = useNavigate();

  // Local time greeting
  const currentHour = new Date().getHours();
  const timeGreeting = useMemo(() => {
    if (currentHour < 12) return "Good morning";
    if (currentHour < 18) return "Good afternoon";
    return "Good evening";
  }, [currentHour]);

  // Authentic user display name
  const displayName = useMemo(() => {
    const raw = getUserDisplayName(liveUser || user);
    return String(raw).trim().split(" ")[0] || "User";
  }, [liveUser, user]);

  // Dynamic continue problem URL
  const continueUrl = continueProblem?.id ? `/problems/${continueProblem.id}` : "/problems";
  const continueTitle = continueProblem?.title || "Continue Solving";

  // Dynamic daily challenge URL
  const dailyUrl = dailyChallenge?.id ? `/problems/${dailyChallenge.id}` : "/problems";
  const isDailySolved = dailyChallenge?.solved || false;

  // Keyboard shortcut listener: Cmd/Ctrl + Enter to trigger Daily Challenge
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        navigate(dailyUrl);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dailyUrl, navigate]);

  return (
    <motion.section
      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="dash-hero"
      aria-label="Welcome section"
    >
      {/* Background Subtle Gradient & Grid */}
      <div className="dash-hero-bg" aria-hidden="true">
        <div className="dash-hero-grid" />
        <div className="dash-hero-radial" />

        <span className="dash-hero-glyph glyph-tag">&lt;/&gt;</span>
        <span className="dash-hero-glyph glyph-bracket">&#123; &#125;</span>
        <span className="dash-hero-glyph glyph-arrow">=&gt;</span>
        <span className="dash-hero-glyph glyph-underscore">_</span>
      </div>

      {/* Main 2-Column Hero Content */}
      <div className="dash-hero-layout">
        {/* LEFT COLUMN: Personalized Welcome & Actions */}
        <div className="dash-hero-left">
          {/* Eyebrow */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="dash-hero-badge"
          >
            <span className="dash-badge-dot" aria-hidden="true" />
            <span>YOUR CODING ARENA</span>
          </motion.div>

          {/* Heading Greeting */}
          <motion.h1
            initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="dash-hero-title"
          >
            <span>{timeGreeting}, </span>
            <span className="dash-user-name">{displayName}.</span>
            <span className="dash-wave"> 👋</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.18 }}
            className="dash-hero-sub"
          >
            Ready to level up your algorithmic skills today?
            <br />
            Keep your streak alive and tackle today's curated challenges.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.25 }}
            className="dash-hero-actions"
          >
            <Link
              to={continueUrl}
              className="dash-btn-primary"
              aria-label={`Continue solving ${continueTitle}`}
            >
              <span>Continue: {continueProblem?.title ? continueProblem.title : "Solving"}</span>
              <ArrowRight size={15} className="arrow-icon" aria-hidden="true" />
            </Link>

            <Link
              to={dailyUrl}
              className="dash-btn-secondary"
              aria-label="View daily challenge"
              style={{
                borderColor: isDailySolved ? "rgba(16, 185, 129, 0.4)" : undefined,
                color: isDailySolved ? "#34d399" : undefined
              }}
            >
              {isDailySolved ? (
                <CheckCircle2 size={15} style={{ color: "#34d399" }} aria-hidden="true" />
              ) : (
                <Target size={15} style={{ color: "#60a5fa" }} aria-hidden="true" />
              )}
              <span>{isDailySolved ? "Daily Challenge (Solved)" : "Daily Challenge"}</span>
              <span className="dash-kbd" aria-hidden="true">⌘ Enter</span>
            </Link>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Static Coder Performance & Consistency Streak Card */}
        <HeroStreakCard
          liveUser={liveUser}
          user={user}
          stats={stats}
          weeklyGoal={weeklyGoal}
          dailyChallenge={dailyChallenge}
        />
      </div>
    </motion.section>
  );
}
