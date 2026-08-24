import React, { Suspense } from "react";
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
import { lazyWithRetry } from "./utils/lazyWithRetry.js";

// Standard User Pages with Auto-Retry
const Dashboard = lazyWithRetry(() => import("./pages/Dashboard.jsx"));
const LandingPage = lazyWithRetry(() => import("./pages/LandingPage.jsx"));
const AICoachPage = lazyWithRetry(() => import("./pages/AICoachPage.jsx"));
const ContestPage = lazyWithRetry(() => import("./pages/ContestPage.jsx"));
const ContestArenaPage = lazyWithRetry(() => import("./pages/ContestArenaPage.jsx"));
const ContestResultsPage = lazyWithRetry(() => import("./pages/ContestResultsPage.jsx"));
const FeaturePage = lazyWithRetry(() => import("./pages/FeaturePage.jsx"));
const LeaderboardPage = lazyWithRetry(() => import("./pages/LeaderboardPage.jsx"));
const Login = lazyWithRetry(() => import("./pages/Login.jsx"));
const ProblemDetails = lazyWithRetry(() => import("./pages/ProblemDetails.jsx"));
const ProblemsList = lazyWithRetry(() => import("./pages/ProblemsList.jsx"));
const Profile = lazyWithRetry(() => import("./pages/Profile.jsx"));
const ProgressPage = lazyWithRetry(() => import("./pages/ProgressPage.jsx"));
const Register = lazyWithRetry(() => import("./pages/Register.jsx"));
const ForgotPassword = lazyWithRetry(() => import("./pages/ForgotPassword.jsx"));
const Settings = lazyWithRetry(() => import("./pages/Settings.jsx"));
const SubmissionHistoryPage = lazyWithRetry(() => import("./pages/SubmissionHistoryPage.jsx"));
const CompanyDetailPage = lazyWithRetry(() => import("./pages/CompanyDetailPage.jsx"));

// Admin Panel Pages with Auto-Retry
const AdminLogin = lazyWithRetry(() => import("./pages/admin/AdminLogin.jsx"));
const AdminDashboard = lazyWithRetry(() => import("./pages/admin/AdminDashboard.jsx"));
const AdminUsers = lazyWithRetry(() => import("./pages/admin/AdminUsers.jsx"));
const AdminProblems = lazyWithRetry(() => import("./pages/admin/AdminProblems.jsx"));
const AdminTopics = lazyWithRetry(() => import("./pages/admin/AdminTopics.jsx"));
const AdminTestCases = lazyWithRetry(() => import("./pages/admin/AdminTestCases.jsx"));
const AdminSubmissions = lazyWithRetry(() => import("./pages/admin/AdminSubmissions.jsx"));
const AdminContests = lazyWithRetry(() => import("./pages/admin/AdminContests.jsx"));
const AdminAnalytics = lazyWithRetry(() => import("./pages/admin/AdminAnalytics.jsx"));
const AdminReports = lazyWithRetry(() => import("./pages/admin/AdminReports.jsx"));
const AdminAICoach = lazyWithRetry(() => import("./pages/admin/AdminAICoach.jsx"));
const AdminCompanies = lazyWithRetry(() => import("./pages/admin/AdminCompanies.jsx"));
const AdminAuditLogs = lazyWithRetry(() => import("./pages/admin/AdminAuditLogs.jsx"));
const AdminSettings = lazyWithRetry(() => import("./pages/admin/AdminSettings.jsx"));

import "./styles/main.css";

import { ErrorBoundary } from "./components/common/ErrorBoundary.jsx";

// Vite Preload Error Handler for version deployments
window.addEventListener("vite:preloadError", (event) => {
  console.warn("[Vite Preload Error] New version detected, reloading...", event);
  try {
    const reloaded = sessionStorage.getItem("vite-preload-reloaded");
    if (!reloaded) {
      sessionStorage.setItem("vite-preload-reloaded", "true");
      window.location.reload();
    }
  } catch {
    window.location.reload();
  }
});

// Global error handlers for diagnostics
window.onerror = (...args) => {
  console.error("[GLOBAL ERROR]", args);
};

window.onunhandledrejection = (event) => {
  console.error("[UNHANDLED PROMISE]", event.reason);
};

function RootPage() {
  const { isAuthenticated, isCheckingSession } = useAuth();
  if (isCheckingSession) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-app, #050a18)",
          color: "var(--text-primary, #f8fafc)",
          fontFamily: "var(--font-family, sans-serif)"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              border: "3px solid rgba(124, 58, 237, 0.2)",
              borderTopColor: "#7c3aed",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite"
            }}
          />
          <span style={{ fontSize: "0.9rem", color: "var(--text-muted, #94a3b8)", fontWeight: 500 }}>
            Loading Judgo…
          </span>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) return <LandingPage />;
  return (
    <AppLayout>
      <Dashboard />
    </AppLayout>
  );
}

function RouteLoadingFallback() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "12px",
        color: "var(--text-muted, #94a3b8)",
        fontSize: "0.85rem",
        fontWeight: "500"
      }}
    >
      <div
        style={{
          width: "28px",
          height: "28px",
          border: "2.5px solid rgba(99, 102, 241, 0.18)",
          borderTopColor: "#6366f1",
          borderRadius: "50%",
          animation: "spinSmooth 0.75s linear infinite"
        }}
      />
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppDataProvider>
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            <ErrorBoundary>
              <Suspense fallback={<RouteLoadingFallback />}>
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
          </ErrorBoundary>
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </AppDataProvider>
  </React.StrictMode>
);
