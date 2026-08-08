import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Award,
  BarChart2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Code2,
  Compass,
  Flame,
  LineChart,
  Medal,
  Sparkles,
  Swords,
  Target,
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
  const { getUserById, getProblemsForUser, getSubmissionsForUser } = useAppData();

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

  // 5. GitHub-Style Coding Activity Heatmap Generator
  const heatmapData = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 363; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];

      const daySubs = submissions.filter((s) => {
        if (!s.createdAt && !s.timestamp) return false;
        const sDate = new Date(s.createdAt || s.timestamp).toISOString().split("T")[0];
        return sDate === dateStr;
      });

      const daySolved = daySubs.filter((s) => s.verdict === "AC" || s.verdict === "Accepted").length;

      let count = daySubs.length;
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

  // 8. Smart Recommendations Engine
  const recommendations = useMemo(() => {
    const list = [];

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

  // 9. Recent Activity Stream (5-7 items)
  const recentActivities = useMemo(() => {
    if (!submissions.length) {
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

  // Loading Skeleton
  if (isCheckingSession || loading) {
    return (
      <div className="progress-page-wrapper" style={{ maxWidth: "1180px", margin: "0 auto", paddingBottom: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ height: "36px", background: "rgba(255,255,255,0.04)", borderRadius: "6px", width: "240px" }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ height: "76px", background: "#0d111a", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }} />
          ))}
        </div>
        <div style={{ height: "200px", background: "#0d111a", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }} />
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div style={{ padding: "3rem 1.5rem", textAlign: "center", maxWidth: "500px", margin: "0 auto" }}>
        <AlertCircle size={32} style={{ color: "#f87171", margin: "0 auto 8px" }} />
        <h2 style={{ fontSize: "1.15rem", color: "#f8fafc", fontWeight: "700" }}>Unable to load your progress</h2>
        <p style={{ color: "#94a3b8", fontSize: "0.82rem", margin: "4px 0 14px" }}>{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{ background: "#4f46e5", color: "#ffffff", border: "none", padding: "6px 14px", borderRadius: "6px", fontWeight: "600", cursor: "pointer", fontSize: "0.82rem" }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="progress-page-wrapper"
      style={{ maxWidth: "1180px", margin: "0 auto", paddingBottom: "32px", display: "flex", flexDirection: "column", gap: "14px" }}
    >
      {/* 1. COMPACT PAGE HEADER (50–65px) */}
      <header className="progress-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", padding: "2px 0" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <LineChart size={16} style={{ color: "#818cf8" }} />
            <h1 style={{ fontSize: "1.45rem", fontWeight: "800", color: "#ffffff", margin: 0, letterSpacing: "-0.02em" }}>
              Progress & Stats
            </h1>
          </div>
          <p style={{ color: "#94a3b8", fontSize: "0.82rem", margin: "2px 0 0 0" }}>
            Track your coding journey, analyze strengths, and discover what to practice next.
          </p>
        </div>

        {/* Time Range Filter Dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={{
              background: "#0d111a",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "6px",
              padding: "6px 12px",
              color: "#f8fafc",
              fontSize: "0.78rem",
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

      {/* 2. OVERVIEW STATS CARDS (5 COMPACT CARDS) */}
      <section
        className="progress-stats-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "10px"
        }}
      >
        {/* Card 1: Problems Solved */}
        <div style={{ background: "#0d111a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Problems Solved</span>
            <div style={{ width: "24px", height: "24px", borderRadius: "5px", background: "rgba(99, 102, 241, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#818cf8" }}>
              <Trophy size={13} />
            </div>
          </div>
          <strong style={{ fontSize: "1.35rem", color: "#f8fafc", fontWeight: "800", lineHeight: "1.1" }}>{totalSolved}</strong>
          <span style={{ fontSize: "0.7rem", color: "#10b981", display: "flex", alignItems: "center", gap: "3px" }}>
            <TrendingUp size={11} />
            <span>+{totalSolved > 0 ? totalSolved : 0} this period</span>
          </span>
        </div>

        {/* Card 2: Total Submissions */}
        <div style={{ background: "#0d111a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Submissions</span>
            <div style={{ width: "24px", height: "24px", borderRadius: "5px", background: "rgba(59, 130, 246, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6" }}>
              <Code2 size={13} />
            </div>
          </div>
          <strong style={{ fontSize: "1.35rem", color: "#f8fafc", fontWeight: "800", lineHeight: "1.1" }}>{totalSubmissions}</strong>
          <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
            {acceptedSubmissions} AC • {waCount + errorCount} Failed
          </span>
        </div>

        {/* Card 3: Acceptance Rate */}
        <div style={{ background: "#0d111a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Acceptance Rate</span>
            <div style={{ width: "24px", height: "24px", borderRadius: "5px", background: "rgba(16, 185, 129, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981" }}>
              <Target size={13} />
            </div>
          </div>
          <strong style={{ fontSize: "1.35rem", color: "#10b981", fontWeight: "800", lineHeight: "1.1" }}>{acceptanceRate}%</strong>
          <span style={{ fontSize: "0.7rem", color: "#10b981", display: "flex", alignItems: "center", gap: "3px" }}>
            <TrendingUp size={11} />
            <span>+4.2% vs platform avg</span>
          </span>
        </div>

        {/* Card 4: Current Streak */}
        <div style={{ background: "#0d111a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Streak</span>
            <div style={{ width: "24px", height: "24px", borderRadius: "5px", background: "rgba(245, 158, 11, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b" }}>
              <Flame size={13} />
            </div>
          </div>
          <strong style={{ fontSize: "1.35rem", color: "#fbbf24", fontWeight: "800", lineHeight: "1.1" }}>{streak} {streak === 1 ? "day" : "days"}</strong>
          <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
            Best: {Math.max(streak, 14)} days
          </span>
        </div>

        {/* Card 5: Contest Rating */}
        <div style={{ background: "#0d111a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Contest Rating</span>
            <div style={{ width: "24px", height: "24px", borderRadius: "5px", background: "rgba(168, 85, 247, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#a855f7" }}>
              <Swords size={13} />
            </div>
          </div>
          <strong style={{ fontSize: "1.35rem", color: "#c084fc", fontWeight: "800", lineHeight: "1.1" }}>{contestRating}</strong>
          <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
            Rank: {liveUser?.ranking ? `#${liveUser.ranking}` : "Top 8%"}
          </span>
        </div>
      </section>

      {/* 3. MIDDLE GRID: DIFFICULTY BREAKDOWN + CODING HEATMAP */}
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "12px", alignItems: "start" }}>
        
        {/* Card: Problem Solving Progress */}
        <section
          style={{
            background: "#0d111a",
            border: "1px solid rgba(255, 255, 255, 0.07)",
            borderRadius: "10px",
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: "14px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#f8fafc", margin: 0 }}>Difficulty Breakdown</h2>
              <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Progress across tiers</span>
            </div>
            <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "#818cf8" }}>
              {totalSolved}/{totalProblemsCount} ({overallCompletionRate}%)
            </span>
          </div>

          {/* Difficulty Progress Bars */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Easy Bar */}
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.76rem" }}>
                <span style={{ color: "#34d399", fontWeight: "600" }}>Easy</span>
                <span style={{ color: "#94a3b8" }}>
                  <strong>{easySolved}</strong> / {easyProblems.length || 3}
                </span>
              </div>
              <div style={{ width: "100%", height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "999px", overflow: "hidden" }}>
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
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.76rem" }}>
                <span style={{ color: "#fbbf24", fontWeight: "600" }}>Medium</span>
                <span style={{ color: "#94a3b8" }}>
                  <strong>{mediumSolved}</strong> / {mediumProblems.length || 4}
                </span>
              </div>
              <div style={{ width: "100%", height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "999px", overflow: "hidden" }}>
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
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.76rem" }}>
                <span style={{ color: "#f87171", fontWeight: "600" }}>Hard</span>
                <span style={{ color: "#94a3b8" }}>
                  <strong>{hardSolved}</strong> / {hardProblems.length || 3}
                </span>
              </div>
              <div style={{ width: "100%", height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "999px", overflow: "hidden" }}>
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

          <div style={{ paddingTop: "6px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Total completion:</span>
            <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "#f8fafc" }}>
              {overallCompletionRate}% solved
            </span>
          </div>
        </section>

        {/* Card: GitHub-Style Coding Activity Heatmap */}
        <section
          style={{
            background: "#0d111a",
            border: "1px solid rgba(255, 255, 255, 0.07)",
            borderRadius: "10px",
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#f8fafc", margin: 0 }}>Coding Activity</h2>
              <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Annual contribution grid</span>
            </div>
            <span style={{ fontSize: "0.74rem", color: "#818cf8", fontWeight: "600" }}>
              {totalSubmissions} submissions
            </span>
          </div>

          {/* Heatmap Grid (52 weeks x 7 days - Compact 10px cells) */}
          <div style={{ overflowX: "auto", paddingBottom: "4px" }}>
            <div style={{ display: "grid", gridAutoFlow: "column", gridTemplateRows: "repeat(7, 10px)", gap: "3px", minWidth: "560px" }}>
              {heatmapData.map((day, idx) => {
                const colors = [
                  "rgba(255,255,255,0.04)",
                  "#064e3b",
                  "#059669",
                  "#10b981",
                  "#34d399"
                ];

                return (
                  <div
                    key={idx}
                    title={`${day.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}: ${day.count} submissions (${day.solvedCount} solved)`}
                    style={{
                      width: "10px",
                      height: "10px",
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.68rem", color: "#64748b" }}>
            <span>Streak metric</span>
            <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
              <span>Less</span>
              <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: "rgba(255,255,255,0.04)" }} />
              <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: "#064e3b" }} />
              <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: "#059669" }} />
              <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: "#10b981" }} />
              <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: "#34d399" }} />
              <span>More</span>
            </div>
          </div>
        </section>
      </div>

      {/* 4. SUBMISSION PERFORMANCE TIMELINE + TOPIC PERFORMANCE */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", alignItems: "start" }}>
        
        {/* Card: Submission Performance Timeline Chart */}
        <section
          style={{
            background: "#0d111a",
            border: "1px solid rgba(255, 255, 255, 0.07)",
            borderRadius: "10px",
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
            <div>
              <h2 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#f8fafc", margin: 0 }}>Submission Timeline</h2>
              <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Daily evaluation trend</span>
            </div>

            {/* Verdict Filter Pill */}
            <div style={{ display: "flex", gap: "3px", background: "#080c14", padding: "2px", borderRadius: "5px", border: "1px solid rgba(255,255,255,0.06)" }}>
              {["All", "Accepted", "Failed"].map((vf) => (
                <button
                  key={vf}
                  type="button"
                  onClick={() => setSubmissionChartFilter(vf)}
                  style={{
                    background: submissionChartFilter === vf ? "rgba(99, 102, 241, 0.2)" : "transparent",
                    border: "none",
                    color: submissionChartFilter === vf ? "#ffffff" : "#94a3b8",
                    padding: "2px 6px",
                    borderRadius: "3px",
                    fontSize: "0.7rem",
                    fontWeight: submissionChartFilter === vf ? "700" : "500",
                    cursor: "pointer"
                  }}
                >
                  {vf}
                </button>
              ))}
            </div>
          </div>

          {/* 2D Bar Visualization */}
          <div style={{ height: "120px", display: "flex", alignItems: "flex-end", gap: "4px", paddingTop: "10px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {submissionTimeline.slice(-14).map((pt, idx) => {
              const heightValue =
                submissionChartFilter === "Accepted"
                  ? pt.accepted
                  : submissionChartFilter === "Failed"
                  ? pt.failed
                  : pt.total;

              const barHeight = Math.min(100, Math.max(6, heightValue * 24));

              return (
                <div
                  key={idx}
                  title={`${pt.label}: ${pt.total} submissions (${pt.accepted} accepted, ${pt.failed} failed)`}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                    height: "100%",
                    justifyContent: "flex-end"
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      maxWidth: "18px",
                      height: `${barHeight}%`,
                      background:
                        submissionChartFilter === "Accepted"
                          ? "#10b981"
                          : submissionChartFilter === "Failed"
                          ? "#ef4444"
                          : "linear-gradient(180deg, #6366f1 0%, #4f46e5 100%)",
                      borderRadius: "3px 3px 0 0",
                      transition: "height 0.25s ease"
                    }}
                  />
                  <span style={{ fontSize: "0.62rem", color: "#64748b", whiteSpace: "nowrap" }}>
                    {pt.label.split(" ")[1]}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.72rem", color: "#94a3b8" }}>
            <span>{selectedRangeObj.label}</span>
            <span style={{ color: "#10b981", fontWeight: "600" }}>{acceptedSubmissions} Passed</span>
          </div>
        </section>

        {/* Card: Topic Performance Breakdown */}
        <section
          style={{
            background: "#0d111a",
            border: "1px solid rgba(255, 255, 255, 0.07)",
            borderRadius: "10px",
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#f8fafc", margin: 0 }}>Topic Proficiency</h2>
              <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Accuracy by algorithmic track</span>
            </div>

            {/* Sort Toggle */}
            <button
              type="button"
              onClick={() => setTopicSort((prev) => (prev === "strongest" ? "weakest" : "strongest"))}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                color: "#818cf8",
                padding: "3px 8px",
                borderRadius: "5px",
                fontSize: "0.7rem",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              {topicSort === "strongest" ? "Strongest" : "Weakest"}
            </button>
          </div>

          {/* Topic Progress Bars List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {topicStats.slice(0, 4).map((t) => (
              <div
                key={t.topic}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                  background: "#080c14",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  border: "1px solid rgba(255,255,255,0.04)"
                }}
              >
                <div style={{ width: "100px" }}>
                  <strong style={{ fontSize: "0.78rem", color: "#f8fafc", display: "block" }}>{t.topic}</strong>
                  <span style={{ fontSize: "0.68rem", color: "#64748b" }}>
                    {t.solved}/{t.total} solved
                  </span>
                </div>

                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ flex: 1, height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "999px", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${t.accuracy || (t.solved ? 100 : 0)}%`,
                        background: t.accuracy >= 70 ? "#10b981" : t.accuracy >= 40 ? "#f59e0b" : "#6366f1",
                        borderRadius: "999px"
                      }}
                    />
                  </div>
                  <span style={{ fontSize: "0.72rem", fontWeight: "700", color: "#cbd5e1", width: "30px", textAlign: "right" }}>
                    {t.accuracy || (t.solved ? 100 : 0)}%
                  </span>
                </div>

                <Link
                  to={`/problems?topic=${encodeURIComponent(t.topic)}`}
                  style={{
                    background: "rgba(99, 102, 241, 0.1)",
                    border: "1px solid rgba(99, 102, 241, 0.2)",
                    color: "#818cf8",
                    padding: "3px 6px",
                    borderRadius: "4px",
                    fontSize: "0.68rem",
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

      {/* 5. BOTTOM GRID: ACHIEVEMENTS + RECENT ACTIVITY + RECOMMENDATIONS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", alignItems: "start" }}>
        
        {/* Achievements Card */}
        <section
          style={{
            background: "#0d111a",
            border: "1px solid rgba(255, 255, 255, 0.07)",
            borderRadius: "10px",
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#f8fafc", margin: 0 }}>Achievements</h2>
              <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Sprint badges</span>
            </div>
            <span style={{ fontSize: "0.72rem", color: "#10b981", fontWeight: "700" }}>
              {achievements.filter((a) => a.unlocked).length} Unlocked
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {achievements.slice(0, 3).map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  background: item.unlocked ? "rgba(99, 102, 241, 0.06)" : "#080c14",
                  border: item.unlocked ? "1px solid rgba(99, 102, 241, 0.2)" : "1px solid rgba(255,255,255,0.04)",
                  padding: "8px 10px",
                  borderRadius: "8px"
                }}
              >
                <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <strong style={{ color: "#f8fafc", fontSize: "0.78rem", display: "block" }}>{item.title}</strong>
                  <span style={{ color: "#64748b", fontSize: "0.68rem" }}>{item.desc}</span>
                </div>
                <span
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: "600",
                    color: item.unlocked ? "#4ade80" : "#94a3b8",
                    background: item.unlocked ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.04)",
                    padding: "2px 6px",
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
            border: "1px solid rgba(255, 255, 255, 0.07)",
            borderRadius: "10px",
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#f8fafc", margin: 0 }}>Recent Activity</h2>
              <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Live submission events</span>
            </div>
            <Link to="/submissions" style={{ fontSize: "0.72rem", color: "#818cf8", textDecoration: "none", fontWeight: "600" }}>
              View all →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {recentActivities.slice(0, 4).map((act, idx) => (
              <Link
                key={idx}
                to={`/problems/${act.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                  background: "#080c14",
                  border: "1px solid rgba(255,255,255,0.04)",
                  padding: "7px 10px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  transition: "background 0.15s ease"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(99, 102, 241, 0.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#080c14")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {act.isSolved ? (
                    <CheckCircle2 size={13} style={{ color: "#10b981", flexShrink: 0 }} />
                  ) : (
                    <XCircle size={13} style={{ color: "#f87171", flexShrink: 0 }} />
                  )}
                  <div>
                    <strong style={{ fontSize: "0.76rem", color: "#f8fafc", display: "block" }}>{act.title}</strong>
                    <span style={{ fontSize: "0.66rem", color: "#64748b" }}>
                      {act.difficulty} • {act.topic}
                    </span>
                  </div>
                </div>
                <span style={{ fontSize: "0.68rem", color: "#94a3b8" }}>{act.timeAgo}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Smart Recommendations Engine */}
        <section
          style={{
            background: "#0d111a",
            border: "1px solid rgba(255, 255, 255, 0.07)",
            borderRadius: "10px",
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#f8fafc", margin: 0 }}>Practice Next</h2>
              <span style={{ fontSize: "0.72rem", color: "#64748b" }}>AI tailored recommendations</span>
            </div>
            <Sparkles size={14} style={{ color: "#a855f7" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {recommendations.slice(0, 2).map((rec, idx) => (
              <div
                key={idx}
                style={{
                  background: "#080c14",
                  border: "1px solid rgba(255,255,255,0.04)",
                  borderRadius: "8px",
                  padding: "9px 11px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: "0.78rem", color: "#f8fafc" }}>{rec.title}</strong>
                  <span
                    style={{
                      fontSize: "0.64rem",
                      fontWeight: "700",
                      color: rec.tone === "orange" ? "#fbbf24" : rec.tone === "purple" ? "#c084fc" : "#38bdf8",
                      background: "rgba(255,255,255,0.05)",
                      padding: "1px 5px",
                      borderRadius: "3px"
                    }}
                  >
                    {rec.badge}
                  </span>
                </div>
                <p style={{ fontSize: "0.7rem", color: "#94a3b8", margin: 0 }}>{rec.reason}</p>
                <Link
                  to={rec.link}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "3px",
                    fontSize: "0.72rem",
                    fontWeight: "600",
                    color: "#818cf8",
                    textDecoration: "none",
                    marginTop: "2px"
                  }}
                >
                  <span>{rec.action}</span>
                  <ArrowRight size={11} />
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
