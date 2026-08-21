import React, { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext.jsx";
import { PublicOnlyRoute, RequireAuth } from "./auth/AuthRoutes.jsx";
import AdminRoute from "./auth/AdminRoute.jsx";
import AppLayout from "./components/layout/AppLayout.jsx";
import AuthLayout from "./components/layout/AuthLayout.jsx";
import AdminLayout from "./components/admin/AdminLayout.jsx";
import { AppDataProvider } from "./data/AppDataContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";

// Standard User Pages
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const LandingPage = lazy(() => import("./pages/LandingPage.jsx"));
const AICoachPage = lazy(() => import("./pages/AICoachPage.jsx"));
const ContestPage = lazy(() => import("./pages/ContestPage.jsx"));
const ContestArenaPage = lazy(() => import("./pages/ContestArenaPage.jsx"));
const ContestResultsPage = lazy(() => import("./pages/ContestResultsPage.jsx"));
const FeaturePage = lazy(() => import("./pages/FeaturePage.jsx"));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const ProblemDetails = lazy(() => import("./pages/ProblemDetails.jsx"));
const ProblemsList = lazy(() => import("./pages/ProblemsList.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const ProgressPage = lazy(() => import("./pages/ProgressPage.jsx"));
const Register = lazy(() => import("./pages/Register.jsx"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.jsx"));
const Settings = lazy(() => import("./pages/Settings.jsx"));
const SubmissionHistoryPage = lazy(() => import("./pages/SubmissionHistoryPage.jsx"));
const CompanyDetailPage = lazy(() => import("./pages/CompanyDetailPage.jsx"));

// Admin Panel Pages
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin.jsx"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.jsx"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers.jsx"));
const AdminProblems = lazy(() => import("./pages/admin/AdminProblems.jsx"));
const AdminTopics = lazy(() => import("./pages/admin/AdminTopics.jsx"));
const AdminTestCases = lazy(() => import("./pages/admin/AdminTestCases.jsx"));
const AdminSubmissions = lazy(() => import("./pages/admin/AdminSubmissions.jsx"));
const AdminContests = lazy(() => import("./pages/admin/AdminContests.jsx"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics.jsx"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports.jsx"));
const AdminAICoach = lazy(() => import("./pages/admin/AdminAICoach.jsx"));
const AdminCompanies = lazy(() => import("./pages/admin/AdminCompanies.jsx"));
const AdminAuditLogs = lazy(() => import("./pages/admin/AdminAuditLogs.jsx"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings.jsx"));

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
        <ThemeProvider>
          <BrowserRouter>
            <Suspense fallback={<div className="route-loading">Loading…</div>}>
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
            </Suspense>
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </AppDataProvider>
  </React.StrictMode>
);
