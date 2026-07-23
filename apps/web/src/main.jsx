import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext.jsx";
import { PublicOnlyRoute, RequireAuth } from "./auth/AuthRoutes.jsx";
import AppLayout from "./components/layout/AppLayout.jsx";
import AuthLayout from "./components/layout/AuthLayout.jsx";
import { AppDataProvider } from "./data/AppDataContext.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import FeaturePage from "./pages/FeaturePage.jsx";
import LeaderboardPage from "./pages/LeaderboardPage.jsx";
import Login from "./pages/Login.jsx";
import ProblemDetails from "./pages/ProblemDetails.jsx";
import ProblemsList from "./pages/ProblemsList.jsx";
import Profile from "./pages/Profile.jsx";
import Register from "./pages/Register.jsx";
import SubmissionHistoryPage from "./pages/SubmissionHistoryPage.jsx";
import "./styles/main.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppDataProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<RequireAuth />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/problems" element={<ProblemsList />} />
                <Route path="/problems/:problemId" element={<ProblemDetails />} />
                <Route path="/submissions" element={<SubmissionHistoryPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/contests" element={<FeaturePage title="Contests" />} />
                <Route path="/collaboration" element={<FeaturePage title="Collaboration" />} />
                <Route path="/interviewer" element={<FeaturePage title="AI Interviewer" />} />
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>
            </Route>
            <Route element={<PublicOnlyRoute />}>
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </AppDataProvider>
  </React.StrictMode>
);
