import { useState, useEffect } from "react";
import { Flame, LineChart, Target, Trophy, Award } from "lucide-react";
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
  const { getUserById, getSubmissionsForUser } = useAppData();
  const liveUser = getUserById(user?.id) ?? user;

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Compute live user stats from submissions & distinct solved problem IDs
  const distinctSolvedSet = new Set(
    submissions.filter((s) => s.verdict === "AC" || s.verdict === "OK" || s.verdict === "Accepted").map((s) => s.problemId || s.problem)
  );
  if (Array.isArray(liveUser?.solvedProblemIds)) {
    liveUser.solvedProblemIds.forEach((pid) => distinctSolvedSet.add(pid));
  }
  const solvedCount = distinctSolvedSet.size;

  const totalSubmissions = Math.max(submissions.length, liveUser?.stats?.totalSubmissions || 0);
  const acceptedCount = submissions.filter((s) => s.verdict === "AC" || s.verdict === "Accepted" || s.verdict === "OK").length || liveUser?.stats?.acceptedSubmissions || 0;
  const waCount = submissions.filter((s) => s.verdict === "WA" || s.verdict === "Wrong Answer").length || liveUser?.stats?.waCount || 0;
  const reCount = submissions.filter((s) => s.verdict === "RE" || s.verdict === "Runtime Error" || s.verdict === "CE").length || liveUser?.stats?.reCount || 0;
  const tleCount = submissions.filter((s) => s.verdict === "TLE" || s.verdict === "Time Limit Exceeded").length || liveUser?.stats?.tleCount || 0;

  const acceptanceRate = totalSubmissions > 0 ? ((acceptedCount / totalSubmissions) * 100).toFixed(1) : "0.0";
  const acceptanceRateNum = Number(acceptanceRate);

  return (
    <div className="premium-dashboard">
      {/* 1. Hero / Welcome Section */}
      <DashboardHero user={user} liveUser={liveUser} />

      {/* 2. Compact Statistics Cards Grid */}
      <AnimatedSection delay={0.1}>
        <div className="dash-stats-grid">
          <StatCard
            icon={LineChart}
            label="Global Rank"
            value={liveUser?.ranking ? `#${liveUser.ranking}` : "Top 8%"}
            trend="↑ 12 this week"
            trendDirection="up"
            accentColor="#3b82f6"
            delay={0.05}
          />

          <StatCard
            icon={Flame}
            label="Current Streak"
            numericValue={liveUser?.streak ?? 1}
            trend="Personal Best: 14d"
            trendDirection="neutral"
            accentColor="#f59e0b"
            delay={0.1}
          />

          <StatCard
            icon={Award}
            label="Acceptance Rate"
            value={`${acceptanceRate}%`}
            trend="+2.4% vs avg"
            trendDirection="up"
            accentColor="#10b981"
            delay={0.15}
          />

          <StatCard
            icon={Target}
            label="Problems Solved"
            numericValue={solvedCount}
            trend={`${totalSubmissions} Total Submissions`}
            trendDirection="neutral"
            accentColor="#7c3aed"
            delay={0.2}
          />
        </div>
      </AnimatedSection>

      {/* 3. Middle Section: Submission Breakdown, Next Contest, Weekly Goal */}
      <AnimatedSection delay={0.15}>
        <div className="dash-middle-section">
          <SubmissionBreakdown
            totalSubmissions={totalSubmissions}
            acceptedCount={acceptedCount}
            waCount={waCount}
            reCount={reCount}
            tleCount={tleCount}
          />

          <ContestCard />

          <WeeklyGoal solvedCount={solvedCount} targetGoal={5} />
        </div>
      </AnimatedSection>

      {/* 4. Lower Section: Continue Where You Left Off & Activity Timeline */}
      <AnimatedSection delay={0.2}>
        <div className="dash-lower-section">
          <ContinueCard
            problemId="two-sum"
            title="Two Sum"
            difficulty="Easy"
            topic="Arrays • Hash Table"
            timeAgo="Last attempted: 2 hours ago"
          />

          <ActivityTimeline submissions={submissions} />
        </div>
      </AnimatedSection>

      {/* 5. Extras Section: Recommended Problem & AI Coach Preview */}
      <AnimatedSection delay={0.25}>
        <div className="dash-extras-section">
          <RecommendedProblem
            problemId="binary-search"
            title="Binary Search"
            difficulty="Medium"
            topic="Algorithms • Divide & Conquer"
            reason="Based on your recent practice in Arrays"
          />

          <AICoachCard
            message="You've been practicing Array techniques. Want to try 3 targeted two-pointer challenges to sharpen your runtime efficiency?"
            actionUrl="/ai-coach"
            actionText="Start Practice"
          />
        </div>
      </AnimatedSection>
    </div>
  );
}
