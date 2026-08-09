import { useState, useEffect, useCallback } from "react";
import { Award, Flame, LineChart, RefreshCw, Target, Trophy } from "lucide-react";
import { useAuth } from "../auth/AuthContext.jsx";
import { useAppData } from "../data/AppDataContext.jsx";
import { api } from "../api/apiClient.js";

// Modular Dashboard Components
import DashboardHero from "../components/dashboard/DashboardHero.jsx";
import StatCard from "../components/dashboard/StatCard.jsx";
import SubmissionBreakdown from "../components/dashboard/SubmissionBreakdown.jsx";
import ContestCard from "../components/dashboard/ContestCard.jsx";
import WeeklyGoal from "../components/dashboard/WeeklyGoal.jsx";
import ContinueCard from "../components/dashboard/ContinueCard.jsx";
import ActivityTimeline from "../components/dashboard/ActivityTimeline.jsx";
import RecommendedProblem from "../components/dashboard/RecommendedProblem.jsx";
import AICoachCard from "../components/dashboard/AICoachCard.jsx";
import AnimatedSection from "../components/dashboard/AnimatedSection.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const { getUserById, getProblemsForUser, getSubmissionsForUser, syncBackendData } = useAppData();
  const liveUser = getUserById(user?.id) ?? user;

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.getDashboard();
      if (res?.success && res.stats) {
        setDashboardData(res);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn("[Dashboard] API getDashboard notice, using fallback:", err);
    }

    // Fallback: Compute from local app data
    try {
      const localProblems = getProblemsForUser(user?.id) || [];
      const localSubs = getSubmissionsForUser(user?.id) || [];

      const solvedSet = new Set(
        localSubs
          .filter((s) => s.verdict === "AC" || s.verdict === "OK" || s.verdict === "Accepted")
          .map((s) => s.problemId || s.problem)
      );
      if (Array.isArray(liveUser?.solvedProblemIds)) {
        liveUser.solvedProblemIds.forEach((pid) => solvedSet.add(pid));
      }

      const solvedCount = solvedSet.size;
      const totalSubs = Math.max(localSubs.length, liveUser?.stats?.totalSubmissions || 0);
      const acceptedCount = localSubs.filter((s) => s.verdict === "AC" || s.verdict === "OK" || s.verdict === "Accepted").length;
      const waCount = localSubs.filter((s) => s.verdict === "WA" || s.verdict === "Wrong Answer").length;
      const reCount = localSubs.filter((s) => s.verdict === "RE" || s.verdict === "Runtime Error").length;
      const tleCount = localSubs.filter((s) => s.verdict === "TLE" || s.verdict === "Time Limit Exceeded").length;
      const ceCount = localSubs.filter((s) => s.verdict === "CE" || s.verdict === "Compilation Error").length;

      const rate = totalSubs > 0 ? ((acceptedCount / totalSubs) * 100).toFixed(1) : "0.0";
      const rating = 1200 + solvedCount * 15;

      const unsolved = localProblems.find((p) => !solvedSet.has(p.id)) || localProblems[0];

      setDashboardData({
        stats: {
          globalRank: 4,
          rating,
          currentStreak: liveUser?.streak || (solvedCount > 0 ? 1 : 0),
          bestStreak: Math.max(liveUser?.streak || 1, 1),
          acceptanceRate: `${rate}%`,
          acceptanceRateNum: Number(rate),
          solvedCount,
          totalProblems: localProblems.length,
          totalSubmissions: totalSubs,
          acceptedCount,
          waCount,
          reCount,
          tleCount,
          ceCount
        },
        weeklyGoal: {
          target: 5,
          solved: Math.min(solvedCount, 5),
          remaining: Math.max(0, 5 - solvedCount),
          progressPct: Math.min(100, Math.round((solvedCount / 5) * 100)),
          isCompleted: solvedCount >= 5
        },
        nextContest: null,
        continueProblem: unsolved
          ? {
              id: unsolved.id,
              title: unsolved.title,
              difficulty: unsolved.difficulty || "Easy",
              topic: unsolved.topic || "Algorithms",
              timeAgo: "Recommended next"
            }
          : null,
        recommendedProblem: {
          id: "binary-search",
          title: "Binary Search",
          difficulty: "Medium",
          topic: "Algorithms • Search",
          reason: "Targeted challenge to sharpen lookup performance"
        },
        dailyChallenge: {
          id: "two-sum",
          title: "Two Sum",
          difficulty: "Easy",
          topic: "Arrays • Hash Table",
          solved: solvedSet.has("two-sum")
        },
        recentSubmissions: localSubs.slice(0, 6)
      });
    } catch (fallbackErr) {
      setError("Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [user?.id, liveUser, getProblemsForUser, getSubmissionsForUser]);

  useEffect(() => {
    fetchDashboardData();
    if (syncBackendData) {
      syncBackendData();
    }
  }, [fetchDashboardData, syncBackendData]);

  const stats = dashboardData?.stats;
  const weeklyGoal = dashboardData?.weeklyGoal;
  const nextContest = dashboardData?.nextContest;
  const continueProblem = dashboardData?.continueProblem;
  const recommendedProblem = dashboardData?.recommendedProblem;
  const dailyChallenge = dashboardData?.dailyChallenge;
  const recentSubmissions = dashboardData?.recentSubmissions || [];

  if (error && !dashboardData) {
    return (
      <div className="premium-dashboard" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "400px", gap: "16px" }}>
        <div style={{ fontSize: "1rem", color: "#f87171", fontWeight: "600" }}>{error}</div>
        <button
          onClick={fetchDashboardData}
          className="dash-btn-primary"
          style={{ padding: "8px 18px", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <RefreshCw size={14} />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  return (
    <div className="premium-dashboard">
      {/* 1. Hero / Welcome Section */}
      <DashboardHero
        user={user}
        liveUser={liveUser}
        continueProblem={continueProblem}
        dailyChallenge={dailyChallenge}
      />

      {/* 2. Compact Statistics Cards Grid */}
      <AnimatedSection delay={0.1}>
        <div className="dash-stats-grid">
          <StatCard
            icon={LineChart}
            label="Global Rank"
            value={stats?.globalRank ? `#${stats.globalRank}` : "#4"}
            trend={`Rating: ${stats?.rating || 1200}`}
            trendDirection="up"
            accentColor="#3b82f6"
            delay={0.05}
            loading={loading}
            to="/leaderboard"
          />

          <StatCard
            icon={Flame}
            label="Current Streak"
            numericValue={stats?.currentStreak ?? (loading ? undefined : 0)}
            trend={`Personal Best: ${stats?.bestStreak || stats?.currentStreak || 1}d`}
            trendDirection="neutral"
            accentColor="#f59e0b"
            delay={0.1}
            loading={loading}
            to="/progress"
          />

          <StatCard
            icon={Award}
            label="Acceptance Rate"
            value={stats?.acceptanceRate || "0.0%"}
            trend={`${stats?.acceptedCount || 0} / ${stats?.totalSubmissions || 0} passed`}
            trendDirection="up"
            accentColor="#10b981"
            delay={0.15}
            loading={loading}
            to="/progress"
          />

          <StatCard
            icon={Target}
            label="Problems Solved"
            numericValue={stats?.solvedCount ?? (loading ? undefined : 0)}
            trend={`${stats?.totalProblems ? `${stats.solvedCount || 0} of ${stats.totalProblems}` : "Total Solved"}`}
            trendDirection="neutral"
            accentColor="#7c3aed"
            delay={0.2}
            loading={loading}
            to="/problems"
          />
        </div>
      </AnimatedSection>

      {/* 3. Middle Section: Submission Breakdown, Next Contest, Weekly Goal */}
      <AnimatedSection delay={0.15}>
        <div className="dash-middle-section">
          <SubmissionBreakdown
            totalSubmissions={stats?.totalSubmissions || 0}
            acceptedCount={stats?.acceptedCount || 0}
            waCount={stats?.waCount || 0}
            reCount={stats?.reCount || 0}
            tleCount={stats?.tleCount || 0}
            ceCount={stats?.ceCount || 0}
            loading={loading}
          />

          <ContestCard
            contest={nextContest}
            loading={loading}
            onRegistered={() => fetchDashboardData()}
          />

          <WeeklyGoal
            solvedCount={weeklyGoal?.solved || 0}
            targetGoal={weeklyGoal?.target || 5}
            loading={loading}
          />
        </div>
      </AnimatedSection>

      {/* 4. Lower Section: Continue Where You Left Off & Activity Timeline */}
      <AnimatedSection delay={0.2}>
        <div className="dash-lower-section">
          <ContinueCard
            problem={continueProblem}
            loading={loading}
          />

          <ActivityTimeline
            submissions={recentSubmissions}
            loading={loading}
          />
        </div>
      </AnimatedSection>

      {/* 5. Extras Section: Recommended Problem & AI Coach Preview */}
      <AnimatedSection delay={0.25}>
        <div className="dash-extras-section">
          <RecommendedProblem
            problem={recommendedProblem}
            loading={loading}
          />

          <AICoachCard
            message={`You've solved ${stats?.solvedCount || 0} challenges. Ready to sharpen your data structure patterns and algorithmic speed?`}
            actionUrl="/ai-coach"
            actionText="Start AI Session"
          />
        </div>
      </AnimatedSection>
    </div>
  );
}
