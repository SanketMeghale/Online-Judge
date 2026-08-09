import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext.jsx";
import { PublicOnlyRoute, RequireAuth } from "./auth/AuthRoutes.jsx";
import AdminRoute from "./auth/AdminRoute.jsx";
import AppLayout from "./components/layout/AppLayout.jsx";
import AuthLayout from "./components/layout/AuthLayout.jsx";
import AdminLayout from "./components/admin/AdminLayout.jsx";
import { AppDataProvider } from "./data/AppDataContext.jsx";

// Standard User Pages
import Dashboard from "./pages/Dashboard.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import AICoachPage from "./pages/AICoachPage.jsx";
import ContestPage from "./pages/ContestPage.jsx";
import ContestArenaPage from "./pages/ContestArenaPage.jsx";
import ContestResultsPage from "./pages/ContestResultsPage.jsx";
import FeaturePage from "./pages/FeaturePage.jsx";
import LeaderboardPage from "./pages/LeaderboardPage.jsx";
import Login from "./pages/Login.jsx";
import ProblemDetails from "./pages/ProblemDetails.jsx";
import ProblemsList from "./pages/ProblemsList.jsx";
import Profile from "./pages/Profile.jsx";
import ProgressPage from "./pages/ProgressPage.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Settings from "./pages/Settings.jsx";
import SubmissionHistoryPage from "./pages/SubmissionHistoryPage.jsx";
import CompanyDetailPage from "./pages/CompanyDetailPage.jsx";

// Admin Panel Pages
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminProblems from "./pages/admin/AdminProblems.jsx";
import AdminTopics from "./pages/admin/AdminTopics.jsx";
import AdminTestCases from "./pages/admin/AdminTestCases.jsx";
import AdminSubmissions from "./pages/admin/AdminSubmissions.jsx";
import AdminContests from "./pages/admin/AdminContests.jsx";
import AdminAnalytics from "./pages/admin/AdminAnalytics.jsx";
import AdminReports from "./pages/admin/AdminReports.jsx";
import AdminAICoach from "./pages/admin/AdminAICoach.jsx";
import AdminCompanies from "./pages/admin/AdminCompanies.jsx";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs.jsx";
import AdminSettings from "./pages/admin/AdminSettings.jsx";

import "./styles/main.css";

// Global error handlers for diagnostics
window.onerror = (...args) => {
  console.error("[GLOBAL ERROR]", args);
};

window.onunhandledrejection = (event) => {
  console.error("[UNHANDLED PROMISE]", event.reason);
};

function RootPage() {
  const { isAuthenticated, isCheckingSession } = useAuth();
  if (isCheckingSession) return null;
  if (!isAuthenticated) return <LandingPage />;
  return (
    <AppLayout>
      <Dashboard />
    </AppLayout>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppDataProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Root Route: Landing Page for Unauthenticated Users, Dashboard for Authenticated */}
            <Route path="/" element={<RootPage />} />

            {/* Authenticated Dashboard & Coding Workspace Routes */}
            <Route element={<RequireAuth />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/problems" element={<ProblemsList />} />
                <Route path="/practice" element={<ProblemsList />} />
                <Route path="/problems/:problemId" element={<ProblemDetails />} />
                <Route path="/submissions" element={<SubmissionHistoryPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/contests" element={<ContestPage />} />
                <Route path="/contest" element={<ContestPage />} />
                <Route path="/contests/:contestId/arena" element={<ContestArenaPage />} />
                <Route path="/contests/:contestId/arena/:problemId" element={<ContestArenaPage />} />
                <Route path="/contests/:contestId/results" element={<ContestResultsPage />} />
                <Route path="/contests/:contestId/leaderboard" element={<ContestResultsPage />} />
                <Route path="/collaboration" element={<FeaturePage title="Collaboration" />} />
                <Route path="/interviewer" element={<AICoachPage />} />
                <Route path="/ai-coach" element={<AICoachPage />} />
                <Route path="/companies" element={<AICoachPage />} />
                <Route path="/companies/:companyId" element={<CompanyDetailPage />} />
                <Route path="/stats" element={<ProgressPage />} />
                <Route path="/progress" element={<ProgressPage />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/bookmarks" element={<FeaturePage title="Bookmarks" />} />
                <Route path="/discuss" element={<FeaturePage title="Discuss" />} />
              </Route>
            </Route>

            {/* Admin Authentication Route */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Admin Control Center Routes */}
            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/problems" element={<AdminProblems />} />
                <Route path="/admin/topics" element={<AdminTopics />} />
                <Route path="/admin/test-cases" element={<AdminTestCases />} />
                <Route path="/admin/submissions" element={<AdminSubmissions />} />
                <Route path="/admin/contests" element={<AdminContests />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/admin/reports" element={<AdminReports />} />
                <Route path="/admin/ai-coach" element={<AdminAICoach />} />
                <Route path="/admin/companies" element={<AdminCompanies />} />
                <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
              </Route>
            </Route>

            {/* Public-Only Auth Routes */}
            <Route element={<PublicOnlyRoute />}>
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
              </Route>
            </Route>

            {/* Fallback Catch-All Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </AppDataProvider>
  </React.StrictMode>
);
