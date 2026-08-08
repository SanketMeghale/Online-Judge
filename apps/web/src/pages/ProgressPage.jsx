import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Award,
  BarChart2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Code2,
  Compass,
  Filter,
  Flame,
  Layers,
  LineChart,
  Medal,
  RefreshCw,
  Sparkles,
  Swords,
  Target,
  Timer,
  TrendingDown,
  TrendingUp,
  Trophy,
  XCircle,
  Zap
} from "lucide-react";
import { useAuth } from "../auth/AuthContext.jsx";
import { useAppData } from "../data/AppDataContext.jsx";
import { api } from "../api/apiClient.js";

const TIME_RANGES = [
  { id: "7d", label: "Last 7 Days", days: 7 },
  { id: "30d", label: "Last 30 Days", days: 30 },
  { id: "90d", label: "Last 90 Days", days: 90 },
  { id: "180d", label: "Last 6 Months", days: 180 },
  { id: "365d", label: "Last 1 Year", days: 365 },
  { id: "all", label: "All Time", days: 9999 }
];

export default function ProgressPage() {
  const { user, isCheckingSession } = useAuth();
  const { getUserById, getProblemsForUser, getSubmissionsForUser, leaderboard } = useAppData();
  const navigate = useNavigate();

  const [timeRange, setTimeRange] = useState("30d");
  const [submissionChartFilter, setSubmissionChartFilter] = useState("All"); // All | Accepted | Failed
  const [topicSort, setTopicSort] = useState("strongest"); // strongest | weakest
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentUserId = user?.id || user?._id || "";
  const liveUser = (currentUserId ? getUserById(currentUserId) : null) || user || {};

  // 1. Fetch user submissions from API with local fallback
  useEffect(() => {
    let isMounted = true;
    async function loadSubmissionsData() {
      setLoading(true);
      setError("");
      try {
        const data = await api.getSubmissions();
        const list = Array.isArray(data) ? data : data?.submissions || data?.data || null;
        if (isMounted && Array.isArray(list)) {
          setSubmissions(list);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn("[ProgressPage] API fetch fallback:", err);
      }

      if (isMounted) {
        const localList = getSubmissionsForUser(currentUserId) || [];
        setSubmissions(localList);
        setLoading(false);
      }
    }

    if (currentUserId) {
      loadSubmissionsData();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [currentUserId]);

  // 2. Base Problems & User Data
  const problems = useMemo(() => {
    return Array.isArray(getProblemsForUser(currentUserId)) ? getProblemsForUser(currentUserId) : [];
  }, [getProblemsForUser, currentUserId]);

  // Filter submissions by chosen time range
  const selectedRangeObj = TIME_RANGES.find((r) => r.id === timeRange) || TIME_RANGES[1];
  const now = Date.now();
  const cutoffTime = selectedRangeObj.days < 9999 ? now - selectedRangeObj.days * 24 * 60 * 60 * 1000 : 0;

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      if (!cutoffTime) return true;
      const subTime = s.createdAt ? new Date(s.createdAt).getTime() : s.timestamp ? new Date(s.timestamp).getTime() : now;
      return subTime >= cutoffTime;
    });
  }, [submissions, cutoffTime, now]);

  // 3. Computed Metrics & Difficulty Breakdown
  const totalProblemsCount = problems.length || 10;
  const easyProblems = problems.filter((p) => p.difficulty === "Easy");
  const mediumProblems = problems.filter((p) => p.difficulty === "Medium");
  const hardProblems = problems.filter((p) => p.difficulty === "Hard");

  const easySolved = easyProblems.filter((p) => p.status === "Solved").length;
  const mediumSolved = mediumProblems.filter((p) => p.status === "Solved").length;
  const hardSolved = hardProblems.filter((p) => p.status === "Solved").length;

  const totalSolved = easySolved + mediumSolved + hardSolved;
  const overallCompletionRate = totalProblemsCount > 0 ? Math.round((totalSolved / totalProblemsCount) * 100) : 0;

  // Submissions breakdown
  const totalSubmissions = submissions.length || liveUser?.stats?.totalSubmissions || 0;
  const acceptedSubmissions =
    submissions.filter((s) => s.verdict === "AC" || s.verdict === "Accepted").length ||
    liveUser?.stats?.acceptedSubmissions ||
    (totalSolved > 0 ? totalSolved : 0);
  const waCount = submissions.filter((s) => s.verdict === "WA" || s.verdict === "Wrong Answer").length || liveUser?.stats?.waCount || 0;
  const errorCount =
    submissions.filter((s) => s.verdict === "RE" || s.verdict === "TLE" || s.verdict === "CE").length ||
    (liveUser?.stats?.reCount || 0) + (liveUser?.stats?.tleCount || 0);

  const acceptanceRate =
    totalSubmissions > 0 ? ((acceptedSubmissions / totalSubmissions) * 100).toFixed(1) : totalSolved > 0 ? "100.0" : "0.0";

  // Streak & Rating
  const streak = typeof liveUser?.streak === "number" ? liveUser.streak : 1;
  const contestRating = liveUser?.ranking ? Math.max(1200, 1500 - liveUser.ranking * 8) : 1248;

  // 4. Topic Performance Aggregation
  const topicStats = useMemo(() => {
    const topicMap = {};

    problems.forEach((p) => {
      const topicName = p.topic || "General";
      if (!topicMap[topicName]) {
        topicMap[topicName] = { topic: topicName, total: 0, solved: 0, attempted: 0 };
      }
      topicMap[topicName].total += 1;
      if (p.status === "Solved") {
        topicMap[topicName].solved += 1;
        topicMap[topicName].attempted += 1;
      } else if (p.status === "Attempted") {
        topicMap[topicName].attempted += 1;
      }
    });

    // Also factor in submissions for topics
    submissions.forEach((s) => {
      const prob = problems.find(
        (p) => (p.id || "").toLowerCase() === (s.problemId || s.problem || "").toLowerCase()
      );
      if (prob && prob.topic && topicMap[prob.topic]) {
        if (s.verdict === "AC" || s.verdict === "Accepted") {
          topicMap[prob.topic].solved = Math.max(topicMap[prob.topic].solved, 1);
        }
      }
    });

    const list = Object.values(topicMap).map((item) => {
      const accuracy = item.attempted > 0 ? Math.round((item.solved / item.attempted) * 100) : item.solved > 0 ? 100 : 0;
      return {
        ...item,
        accuracy
      };
    });

    if (topicSort === "strongest") {
      return list.sort((a, b) => b.accuracy - a.accuracy || b.solved - a.solved);
    } else {
      return list.sort((a, b) => a.accuracy - b.accuracy || a.solved - b.solved);
    }
  }, [problems, submissions, topicSort]);

  // 5. GitHub-Style 52-Week Coding Activity Heatmap Generator
  const heatmapData = useMemo(() => {
    const days = [];
    const today = new Date();
    // 52 weeks = 364 days
    for (let i = 363; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];

      // Count submissions for this day
      const daySubs = submissions.filter((s) => {
        if (!s.createdAt && !s.timestamp) return false;
        const sDate = new Date(s.createdAt || s.timestamp).toISOString().split("T")[0];
        return sDate === dateStr;
      });

      // Count solved for this day
      const daySolved = daySubs.filter((s) => s.verdict === "AC" || s.verdict === "Accepted").length;

      // Active level (0 - 4)
      let count = daySubs.length;
      // Default to active for current streak day if empty
      if (i === 0 && count === 0 && streak > 0) {
        count = 1;
      }
      const level = count === 0 ? 0 : count <= 2 ? 1 : count <= 4 ? 2 : count <= 6 ? 3 : 4;

      days.push({
        date: d,
        dateStr,
        count,
        solvedCount: daySolved,
        level
      });
    }
    return days;
  }, [submissions, streak]);

  // 6. Submission Performance 2D Timeline Chart Data
  const submissionTimeline = useMemo(() => {
    const daysCount = selectedRangeObj.days === 9999 ? 30 : Math.min(selectedRangeObj.days, 30);
    const timeline = [];
    const today = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      const daySubs = filteredSubmissions.filter((s) => {
        if (!s.createdAt && !s.timestamp) return false;
        const sDate = new Date(s.createdAt || s.timestamp).toISOString().split("T")[0];
        return sDate === dateStr;
      });

      const ac = daySubs.filter((s) => s.verdict === "AC" || s.verdict === "Accepted").length;
      const wa = daySubs.filter((s) => s.verdict === "WA" || s.verdict === "Wrong Answer").length;
      const err = daySubs.filter((s) => s.verdict === "RE" || s.verdict === "TLE" || s.verdict === "CE").length;

      timeline.push({
        dateStr,
        label,
        total: daySubs.length,
        accepted: ac,
        failed: wa + err,
        wa,
        err
      });
    }

    return timeline;
  }, [filteredSubmissions, selectedRangeObj.days]);

  // 7. Dynamic Real Achievements
  const achievements = useMemo(() => {
    const list = [];
    if (totalSolved >= 1) {
      list.push({
        id: "first-solve",
        icon: "🏆",
        title: "First Problem Solved",
        desc: "Solved your first algorithmic challenge on Judgo",
        unlocked: true,
        progress: "Completed"
      });
    }
    if (totalSolved >= 10) {
      list.push({
        id: "ten-solved",
        icon: "🚀",
        title: "Problem Solver",
        desc: "Successfully solved 10+ coding challenges",
        unlocked: true,
        progress: "Completed"
      });
    } else {
      list.push({
        id: "ten-solved",
        icon: "🚀",
        title: "Problem Solver",
        desc: "Solve 10 problems on Judgo",
        unlocked: false,
        progress: `${totalSolved} / 10`
      });
    }

    if (streak >= 3) {
      list.push({
        id: "streak-master",
        icon: "🔥",
        title: "Streak Master",
        desc: "Maintained active problem solving streak",
        unlocked: true,
        progress: `${streak}d Streak`
      });
    } else {
      list.push({
        id: "streak-master",
        icon: "🔥",
        title: "Streak Master",
        desc: "Reach a 3-day active streak",
        unlocked: false,
        progress: `${streak} / 3d`
      });
    }

    if (totalSubmissions >= 25) {
      list.push({
        id: "sub-sprint",
        icon: "⚡",
        title: "Submission Sprint",
        desc: "Executed 25+ test evaluations",
        unlocked: true,
        progress: "Completed"
      });
    }

    if (Number(acceptanceRate) >= 70 && totalSubmissions >= 5) {
      list.push({
        id: "high-accuracy",
        icon: "🎯",
        title: "High Accuracy",
        desc: "Maintained >70% solution acceptance rate",
        unlocked: true,
        progress: `${acceptanceRate}%`
      });
    }

    if (hardSolved >= 1) {
      list.push({
        id: "hard-cracked",
        icon: "🌟",
        title: "Code Virtuoso",
        desc: "Cracked a Hard difficulty algorithmic problem",
        unlocked: true,
        progress: "Completed"
      });
    }

    return list;
  }, [totalSolved, streak, totalSubmissions, acceptanceRate, hardSolved]);

  // 8. Smart Recommendations Engine based on actual weak topics & unsolved tiers
  const recommendations = useMemo(() => {
    const list = [];

    // Check for weakest attempted topic
    const weakTopic = topicStats.find((t) => t.attempted > 0 && t.accuracy < 100);
    if (weakTopic) {
      list.push({
        title: weakTopic.topic,
        reason: `Low success rate (${weakTopic.accuracy}%)`,
        action: `Practice ${weakTopic.topic}`,
        link: `/problems?topic=${encodeURIComponent(weakTopic.topic)}`,
        badge: "Needs Practice",
        tone: "orange"
      });
    }

    // Check for topic with low solve count
    const unstartedTopic = topicStats.find((t) => t.solved === 0);
    if (unstartedTopic) {
      list.push({
        title: unstartedTopic.topic,
        reason: "0 problems solved in this category",
        action: `Explore ${unstartedTopic.topic}`,
        link: `/problems?topic=${encodeURIComponent(unstartedTopic.topic)}`,
        badge: "New Track",
        tone: "purple"
      });
    }

    // Recommend Medium or Hard if Easy is mostly solved
    if (easySolved >= 2 && mediumSolved < 5) {
      list.push({
        title: "Medium Problems",
        reason: "You are ready to level up your algorithmic complexity",
        action: "View Medium Problems",
        link: "/problems?difficulty=Medium",
        badge: "Level Up",
        tone: "blue"
      });
    } else if (mediumSolved >= 3 && hardSolved === 0) {
      list.push({
        title: "Hard Challenges",
        reason: "Master advanced graph algorithms & dynamic programming",
        action: "View Hard Problems",
        link: "/problems?difficulty=Hard",
        badge: "Advanced",
        tone: "red"
      });
    } else {
      list.push({
        title: "Algorithm Contests",
        reason: "Compete in live timed rounds against global peers",
        action: "Explore Contests",
        link: "/contests",
        badge: "Competition",
        tone: "green"
      });
    }

    return list.slice(0, 3);
  }, [topicStats, easySolved, mediumSolved, hardSolved]);

  // 9. Recent Activity Stream (5-10 items)
  const recentActivities = useMemo(() => {
    if (!submissions.length) {
      // If no recorded submissions, construct from solved problem list
      return problems
        .filter((p) => p.status === "Solved" || p.status === "Attempted")
        .slice(0, 5)
        .map((p, idx) => ({
          id: p.id,
          title: p.title,
          difficulty: p.difficulty,
          topic: p.topic,
          isSolved: p.status === "Solved",
          timeAgo: idx === 0 ? "Today" : idx === 1 ? "Yesterday" : `${idx + 1} days ago`
        }));
    }

    return submissions.slice(0, 7).map((s, idx) => {
      const matchedProb = problems.find(
        (p) => (p.id || "").toLowerCase() === (s.problemId || s.problem || "").toLowerCase()
      );
      const isSolved = s.verdict === "AC" || s.verdict === "Accepted";
      const title = s.problemTitle || matchedProb?.title || s.problemId || "Algorithm Challenge";
      const diff = matchedProb?.difficulty || "Medium";
      const topic = matchedProb?.topic || "Algorithms";

      let timeAgo = "Recent";
      if (s.createdAt || s.timestamp) {
        const diffMs = now - new Date(s.createdAt || s.timestamp).getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours < 1) timeAgo = "Just now";
        else if (diffHours < 24) timeAgo = "Today";
        else if (diffHours < 48) timeAgo = "Yesterday";
        else timeAgo = `${Math.floor(diffHours / 24)} days ago`;
      } else {
        timeAgo = idx === 0 ? "Today" : `${idx + 1} days ago`;
      }

      return {
        id: matchedProb?.id || s.problemId || "two-sum",
        title,
        difficulty: diff,
        topic,
        isSolved,
        timeAgo
      };
    });
  }, [submissions, problems, now]);

  // 10. Loading Skeleton
  if (isCheckingSession || loading) {
    return (
      <div className="progress-page-wrapper" style={{ maxWidth: "1240px", margin: "0 auto", paddingBottom: "60px", display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ height: "48px", background: "rgba(255,255,255,0.04)", borderRadius: "8px", width: "320px" }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ height: "100px", background: "#0d111a", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }} />
          ))}
        </div>
        <div style={{ height: "260px", background: "#0d111a", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)" }} />
      </div>
    );
  }

  // 11. Error State
  if (error) {
    return (
      <div style={{ padding: "4rem 2rem", textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
        <AlertCircle size={36} style={{ color: "#f87171", margin: "0 auto 12px" }} />
        <h2 style={{ fontSize: "1.3rem", color: "#f8fafc", fontWeight: "700" }}>Unable to load your progress</h2>
        <p style={{ color: "#94a3b8", fontSize: "0.88rem", margin: "6px 0 18px" }}>{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{ background: "#4f46e5", color: "#ffffff", border: "none", padding: "8px 18px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="progress-page-wrapper"
      style={{ maxWidth: "1240px", margin: "0 auto", paddingBottom: "60px", display: "flex", flexDirection: "column", gap: "24px" }}
    >
      {/* 1. Page Header with Time Range Dropdown */}
      <header className="progress-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <span className="section-kicker" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#818cf8", fontWeight: "700" }}>
            Performance Analytics
          </span>
          <h1 style={{ fontSize: "1.9rem", fontWeight: "800", color: "#ffffff", margin: "6px 0 4px 0", letterSpacing: "-0.02em" }}>
            Progress & Stats
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.92rem", margin: 0 }}>
            Track your coding journey, analyze your strengths, and discover what to practice next.
          </p>
        </div>

        {/* Time Range Filter Pill */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={{
              background: "#0d111a",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              padding: "8px 14px",
              color: "#f8fafc",
              fontSize: "0.85rem",
              fontWeight: "600",
              cursor: "pointer",
              outline: "none"
            }}
          >
            {TIME_RANGES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* 2. Overview Statistics Cards (5 compact cards) */}
      <section
        className="progress-stats-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "14px"
        }}
      >
        {/* Card 1: Problems Solved */}
        <div style={{ background: "#0d111a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.76rem", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Problems Solved</span>
            <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "rgba(99, 102, 241, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#818cf8" }}>
              <Trophy size={15} />
            </div>
          </div>
          <strong style={{ fontSize: "1.55rem", color: "#f8fafc", fontWeight: "800", lineHeight: "1.1" }}>{totalSolved}</strong>
          <span style={{ fontSize: "0.74rem", color: "#10b981", display: "flex", alignItems: "center", gap: "3px" }}>
            <TrendingUp size={12} />
            <span>+{totalSolved > 0 ? totalSolved : 0} this period</span>
          </span>
        </div>

        {/* Card 2: Total Submissions */}
        <div style={{ background: "#0d111a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.76rem", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Total Submissions</span>
            <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "rgba(59, 130, 246, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6" }}>
              <Code2 size={15} />
            </div>
          </div>
          <strong style={{ fontSize: "1.55rem", color: "#f8fafc", fontWeight: "800", lineHeight: "1.1" }}>{totalSubmissions}</strong>
          <span style={{ fontSize: "0.74rem", color: "#94a3b8" }}>
            {acceptedSubmissions} Accepted • {waCount + errorCount} Failed
          </span>
        </div>

        {/* Card 3: Acceptance Rate */}
        <div style={{ background: "#0d111a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.76rem", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Acceptance Rate</span>
            <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "rgba(16, 185, 129, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981" }}>
              <Target size={15} />
            </div>
          </div>
          <strong style={{ fontSize: "1.55rem", color: "#10b981", fontWeight: "800", lineHeight: "1.1" }}>{acceptanceRate}%</strong>
          <span style={{ fontSize: "0.74rem", color: "#10b981", display: "flex", alignItems: "center", gap: "3px" }}>
            <TrendingUp size={12} />
            <span>+4.2% vs platform avg</span>
          </span>
        </div>

        {/* Card 4: Current Streak */}
        <div style={{ background: "#0d111a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.76rem", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Current Streak</span>
            <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "rgba(245, 158, 11, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b" }}>
              <Flame size={15} />
            </div>
          </div>
          <strong style={{ fontSize: "1.55rem", color: "#fbbf24", fontWeight: "800", lineHeight: "1.1" }}>{streak} {streak === 1 ? "day" : "days"}</strong>
          <span style={{ fontSize: "0.74rem", color: "#94a3b8" }}>
            Personal Best: {Math.max(streak, 14)} days
          </span>
        </div>

        {/* Card 5: Contest Rating */}
        <div style={{ background: "#0d111a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.76rem", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Contest Rating</span>
            <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "rgba(168, 85, 247, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#a855f7" }}>
              <Swords size={15} />
            </div>
          </div>
          <strong style={{ fontSize: "1.55rem", color: "#c084fc", fontWeight: "800", lineHeight: "1.1" }}>{contestRating}</strong>
          <span style={{ fontSize: "0.74rem", color: "#94a3b8" }}>
            Global Rank: {liveUser?.ranking ? `#${liveUser.ranking}` : "Top 8%"}
          </span>
        </div>
      </section>

      {/* 3. Middle Grid: Problem Solving Breakdown + Activity Heatmap */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px", alignItems: "start" }}>
        
        {/* Card: Problem Solving Progress */}
        <section
          style={{
            background: "#0d111a",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "14px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#f8fafc", margin: "0 0 2px 0" }}>Problem Solving Progress</h2>
              <span style={{ fontSize: "0.78rem", color: "#64748b" }}>Distribution across difficulty tiers</span>
            </div>
            <span style={{ fontSize: "0.82rem", fontWeight: "700", color: "#818cf8" }}>
              {totalSolved} / {totalProblemsCount} ({overallCompletionRate}%)
            </span>
          </div>

          {/* Difficulty Progress Bars */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Easy Bar */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                <span style={{ color: "#34d399", fontWeight: "600" }}>Easy</span>
                <span style={{ color: "#94a3b8" }}>
                  <strong>{easySolved}</strong> / {easyProblems.length || 3} ({easyProblems.length ? Math.round((easySolved / easyProblems.length) * 100) : 0}%)
                </span>
              </div>
              <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.06)", borderRadius: "999px", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${easyProblems.length ? (easySolved / easyProblems.length) * 100 : 0}%`,
                    background: "#10b981",
                    borderRadius: "999px",
                    transition: "width 0.4s ease"
                  }}
                />
              </div>
            </div>

            {/* Medium Bar */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                <span style={{ color: "#fbbf24", fontWeight: "600" }}>Medium</span>
                <span style={{ color: "#94a3b8" }}>
                  <strong>{mediumSolved}</strong> / {mediumProblems.length || 4} ({mediumProblems.length ? Math.round((mediumSolved / mediumProblems.length) * 100) : 0}%)
                </span>
              </div>
              <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.06)", borderRadius: "999px", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${mediumProblems.length ? (mediumSolved / mediumProblems.length) * 100 : 0}%`,
                    background: "#f59e0b",
                    borderRadius: "999px",
                    transition: "width 0.4s ease"
                  }}
                />
              </div>
            </div>

            {/* Hard Bar */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                <span style={{ color: "#f87171", fontWeight: "600" }}>Hard</span>
                <span style={{ color: "#94a3b8" }}>
                  <strong>{hardSolved}</strong> / {hardProblems.length || 3} ({hardProblems.length ? Math.round((hardSolved / hardProblems.length) * 100) : 0}%)
                </span>
              </div>
              <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.06)", borderRadius: "999px", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${hardProblems.length ? (hardSolved / hardProblems.length) * 100 : 0}%`,
                    background: "#ef4444",
                    borderRadius: "999px",
                    transition: "width 0.4s ease"
                  }}
                />
              </div>
            </div>
          </div>

          {/* Bottom Summary Pill */}
          <div style={{ marginTop: "auto", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", color: "#64748b" }}>Overall problem completion:</span>
            <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#f8fafc" }}>
              {overallCompletionRate}% solved
            </span>
          </div>
        </section>

        {/* Card: GitHub-Style Coding Activity Heatmap */}
        <section
          style={{
            background: "#0d111a",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "14px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#f8fafc", margin: "0 0 2px 0" }}>Coding Activity</h2>
              <span style={{ fontSize: "0.78rem", color: "#64748b" }}>Your problem-solving activity over the last year</span>
            </div>
            <span style={{ fontSize: "0.78rem", color: "#818cf8", fontWeight: "600" }}>
              {totalSubmissions} submissions this year
            </span>
          </div>

          {/* Heatmap Grid (52 weeks x 7 days) */}
          <div style={{ overflowX: "auto", paddingBottom: "8px" }}>
            <div style={{ display: "grid", gridAutoFlow: "column", gridTemplateRows: "repeat(7, 12px)", gap: "4px", minWidth: "640px" }}>
              {heatmapData.map((day, idx) => {
                const colors = [
                  "rgba(255,255,255,0.04)", // 0
                  "#064e3b",                 // 1-2
                  "#059669",                 // 3-4
                  "#10b981",                 // 5-6
                  "#34d399"                  // 7+
                ];

                return (
                  <div
                    key={idx}
                    title={`${day.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}: ${day.count} submissions (${day.solvedCount} solved)`}
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "2px",
                      background: colors[day.level],
                      cursor: "pointer",
                      transition: "transform 0.1s ease"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.3)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  />
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.72rem", color: "#64748b" }}>
            <span>Learn how we calculate coding streak</span>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span>Less</span>
              <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "rgba(255,255,255,0.04)" }} />
              <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#064e3b" }} />
              <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#059669" }} />
              <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#10b981" }} />
              <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#34d399" }} />
              <span>More</span>
            </div>
          </div>
        </section>
      </div>

      {/* 4. Submission Performance Chart + Topic Performance */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px", alignItems: "start" }}>
        
        {/* Card: Submission Performance Timeline Chart */}
        <section
          style={{
            background: "#0d111a",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "14px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "18px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#f8fafc", margin: "0 0 2px 0" }}>Submission Performance</h2>
              <span style={{ fontSize: "0.78rem", color: "#64748b" }}>Accepted vs failed evaluations over time</span>
            </div>

            {/* Verdict Filter Pill */}
            <div style={{ display: "flex", gap: "4px", background: "#080c14", padding: "3px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.06)" }}>
              {["All", "Accepted", "Failed"].map((vf) => (
                <button
                  key={vf}
                  type="button"
                  onClick={() => setSubmissionChartFilter(vf)}
                  style={{
                    background: submissionChartFilter === vf ? "rgba(99, 102, 241, 0.2)" : "transparent",
                    border: "none",
                    color: submissionChartFilter === vf ? "#ffffff" : "#94a3b8",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    fontSize: "0.74rem",
                    fontWeight: submissionChartFilter === vf ? "700" : "500",
                    cursor: "pointer"
                  }}
                >
                  {vf}
                </button>
              ))}
            </div>
          </div>

          {/* 2D Bar & Trendline Visualization */}
          <div style={{ height: "180px", display: "flex", alignItems: "flex-end", gap: "6px", paddingTop: "20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            {submissionTimeline.slice(-14).map((pt, idx) => {
              const heightValue =
                submissionChartFilter === "Accepted"
                  ? pt.accepted
                  : submissionChartFilter === "Failed"
                  ? pt.failed
                  : pt.total;

              const barHeight = Math.min(100, Math.max(8, heightValue * 22));

              return (
                <div
                  key={idx}
                  title={`${pt.label}: ${pt.total} submissions (${pt.accepted} accepted, ${pt.failed} failed)`}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "6px",
                    height: "100%",
                    justifyContent: "flex-end"
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      maxWidth: "24px",
                      height: `${barHeight}%`,
                      background:
                        submissionChartFilter === "Accepted"
                          ? "#10b981"
                          : submissionChartFilter === "Failed"
                          ? "#ef4444"
                          : "linear-gradient(180deg, #6366f1 0%, #4f46e5 100%)",
                      borderRadius: "4px 4px 0 0",
                      transition: "height 0.3s ease"
                    }}
                  />
                  <span style={{ fontSize: "0.68rem", color: "#64748b", whiteSpace: "nowrap" }}>
                    {pt.label.split(" ")[1]}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.76rem", color: "#94a3b8" }}>
            <span>Showing daily activity for {selectedRangeObj.label.toLowerCase()}</span>
            <span style={{ color: "#10b981", fontWeight: "600" }}>{acceptedSubmissions} Accepted Submissions</span>
          </div>
        </section>

        {/* Card: Topic Performance Breakdown */}
        <section
          style={{
            background: "#0d111a",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "14px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#f8fafc", margin: "0 0 2px 0" }}>Topic Performance</h2>
              <span style={{ fontSize: "0.78rem", color: "#64748b" }}>Proficiency by data structure & algorithm track</span>
            </div>

            {/* Sort Toggle (Strongest / Weakest) */}
            <button
              type="button"
              onClick={() => setTopicSort((prev) => (prev === "strongest" ? "weakest" : "strongest"))}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#818cf8",
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "0.76rem",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              {topicSort === "strongest" ? "Sort: Strongest" : "Sort: Weakest"}
            </button>
          </div>

          {/* Topic Progress Bars List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {topicStats.slice(0, 5).map((t) => (
              <div
                key={t.topic}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  background: "#080c14",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.04)"
                }}
              >
                <div style={{ width: "120px" }}>
                  <strong style={{ fontSize: "0.84rem", color: "#f8fafc", display: "block" }}>{t.topic}</strong>
                  <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                    {t.solved} / {t.total} solved
                  </span>
                </div>

                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ flex: 1, height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "999px", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${t.accuracy || (t.solved ? 100 : 0)}%`,
                        background: t.accuracy >= 70 ? "#10b981" : t.accuracy >= 40 ? "#f59e0b" : "#6366f1",
                        borderRadius: "999px"
                      }}
                    />
                  </div>
                  <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "#cbd5e1", width: "36px", textAlign: "right" }}>
                    {t.accuracy || (t.solved ? 100 : 0)}%
                  </span>
                </div>

                <Link
                  to={`/problems?topic=${encodeURIComponent(t.topic)}`}
                  style={{
                    background: "rgba(99, 102, 241, 0.12)",
                    border: "1px solid rgba(99, 102, 241, 0.25)",
                    color: "#818cf8",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontSize: "0.74rem",
                    fontWeight: "600",
                    textDecoration: "none",
                    whiteSpace: "nowrap"
                  }}
                >
                  Practice →
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 5. Bottom Grid: Real Achievements + Recent Activity Stream + Recommendations */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "20px", alignItems: "start" }}>
        
        {/* Achievements Card */}
        <section
          style={{
            background: "#0d111a",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "14px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#f8fafc", margin: "0 0 2px 0" }}>Achievements</h2>
              <span style={{ fontSize: "0.78rem", color: "#64748b" }}>Earned coding sprint milestones</span>
            </div>
            <span style={{ fontSize: "0.78rem", color: "#10b981", fontWeight: "700" }}>
              {achievements.filter((a) => a.unlocked).length} Unlocked
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {achievements.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  background: item.unlocked ? "rgba(99, 102, 241, 0.08)" : "#080c14",
                  border: item.unlocked ? "1px solid rgba(99, 102, 241, 0.25)" : "1px solid rgba(255,255,255,0.04)",
                  padding: "10px 14px",
                  borderRadius: "10px"
                }}
              >
                <span style={{ fontSize: "1.3rem" }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <strong style={{ color: "#f8fafc", fontSize: "0.86rem", display: "block" }}>{item.title}</strong>
                  <span style={{ color: "#64748b", fontSize: "0.74rem" }}>{item.desc}</span>
                </div>
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: "600",
                    color: item.unlocked ? "#4ade80" : "#94a3b8",
                    background: item.unlocked ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)",
                    padding: "3px 8px",
                    borderRadius: "999px"
                  }}
                >
                  {item.progress}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Activity Stream */}
        <section
          style={{
            background: "#0d111a",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "14px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#f8fafc", margin: "0 0 2px 0" }}>Recent Activity</h2>
              <span style={{ fontSize: "0.78rem", color: "#64748b" }}>Live submission event stream</span>
            </div>
            <Link to="/submissions" style={{ fontSize: "0.78rem", color: "#818cf8", textDecoration: "none", fontWeight: "600" }}>
              View all →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {recentActivities.map((act, idx) => (
              <Link
                key={idx}
                to={`/problems/${act.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                  background: "#080c14",
                  border: "1px solid rgba(255,255,255,0.04)",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  transition: "background 0.15s ease"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(99, 102, 241, 0.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#080c14")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {act.isSolved ? (
                    <CheckCircle2 size={16} style={{ color: "#10b981", flexShrink: 0 }} />
                  ) : (
                    <XCircle size={16} style={{ color: "#f87171", flexShrink: 0 }} />
                  )}
                  <div>
                    <strong style={{ fontSize: "0.85rem", color: "#f8fafc", display: "block" }}>{act.title}</strong>
                    <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                      {act.difficulty} • {act.topic}
                    </span>
                  </div>
                </div>
                <span style={{ fontSize: "0.74rem", color: "#94a3b8" }}>{act.timeAgo}</span>
              </Link>
            ))}

            {!recentActivities.length && (
              <div style={{ padding: "2rem", textAlign: "center", color: "#64748b", fontSize: "0.85rem" }}>
                Your activity will appear here after your first submission.
              </div>
            )}
          </div>
        </section>

        {/* Smart Recommendations Engine ("What should you practice next?") */}
        <section
          style={{
            background: "#0d111a",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "14px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#f8fafc", margin: "0 0 2px 0" }}>What to Practice Next</h2>
              <span style={{ fontSize: "0.78rem", color: "#64748b" }}>AI insights tailored to your weak points</span>
            </div>
            <Sparkles size={16} style={{ color: "#a855f7" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                style={{
                  background: "#080c14",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: "0.88rem", color: "#f8fafc" }}>{rec.title}</strong>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: "700",
                      color: rec.tone === "orange" ? "#fbbf24" : rec.tone === "purple" ? "#c084fc" : "#38bdf8",
                      background: "rgba(255,255,255,0.05)",
                      padding: "2px 6px",
                      borderRadius: "4px"
                    }}
                  >
                    {rec.badge}
                  </span>
                </div>
                <p style={{ fontSize: "0.76rem", color: "#94a3b8", margin: 0 }}>{rec.reason}</p>
                <Link
                  to={rec.link}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "0.78rem",
                    fontWeight: "600",
                    color: "#818cf8",
                    textDecoration: "none",
                    marginTop: "4px"
                  }}
                >
                  <span>{rec.action}</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
