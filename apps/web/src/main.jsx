import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext.jsx";
import { PublicOnlyRoute, RequireAuth } from "./auth/AuthRoutes.jsx";
import AppLayout from "./components/layout/AppLayout.jsx";
import AuthLayout from "./components/layout/AuthLayout.jsx";
import { AppDataProvider } from "./data/AppDataContext.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import AICoachPage from "./pages/AICoachPage.jsx";
import ContestPage from "./pages/ContestPage.jsx";
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
                <Route path="/collaboration" element={<FeaturePage title="Collaboration" />} />
                <Route path="/interviewer" element={<AICoachPage />} />
                <Route path="/ai-coach" element={<AICoachPage />} />
                <Route path="/stats" element={<ProgressPage />} />
                <Route path="/progress" element={<ProgressPage />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/bookmarks" element={<FeaturePage title="Bookmarks" />} />
                <Route path="/discuss" element={<FeaturePage title="Discuss" />} />
                <Route path="/admin" element={<AdminDashboard />} />
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
