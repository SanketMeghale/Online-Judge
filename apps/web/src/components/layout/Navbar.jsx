import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Check,
  ChevronDown,
  Code2,
  Flame,
  History,
  Laptop,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Shield,
  Sun,
  User as UserIcon
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext.jsx";
import { getUserDisplayName } from "../../auth/displayName.js";
import { useAppData } from "../../data/AppDataContext.jsx";
import { calculateStreak } from "../../data/appData.js";
import { useTheme } from "../../context/ThemeContext.jsx";
import CommandPalette from "../dashboard/CommandPalette.jsx";
import { JudgoLogo } from "./JudgoLogo.jsx";

export default function Navbar({ onToggleSidebar = () => {} }) {
  const { isAuthenticated, logout, user } = useAuth();
  const { getUserById } = useAppData();
  const { theme, resolvedTheme, isLight, toggleTheme, setTheme, preferences } = useTheme();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const currentUserId = user?.id || user?._id || "";
  const liveUser = (currentUserId ? getUserById(currentUserId) : null) || user || {};

  const fullName = getUserDisplayName(liveUser);
  const username = String(liveUser?.username || "").trim();
  const email = String(liveUser?.email || user?.email || "").trim();
  const avatarLetter = String(fullName || username || email || "U").slice(0, 1).toUpperCase();
  const streakCount = calculateStreak(
    [...(Array.isArray(liveUser?.activeDates) ? liveUser.activeDates : []), liveUser?.lastActiveDate].filter(Boolean),
    new Date()
  ).currentStreak;

  // Scroll listener for smooth glass transition
  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Global shortcut for ⌘ K / Ctrl K
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  async function handleLogout() {
    setDropdownOpen(false);
    await logout();
    navigate("/", { replace: true });
  }

  return (
    <>
      <header
        className={`navbar navbar-modern ${isScrolled ? "navbar-scrolled" : ""}`}
        style={{
          background: isLight
            ? (isScrolled ? "rgba(255, 255, 255, 0.96)" : "rgba(255, 255, 255, 0.90)")
            : (isScrolled ? "rgba(8, 12, 20, 0.95)" : "rgba(8, 12, 20, 0.85)"),
          backdropFilter: "blur(12px)",
          borderBottom: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.07)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "64px",
          minHeight: "64px",
          padding: "0 20px",
          position: "sticky",
          top: 0,
          zIndex: 100,
          width: "100%",
          boxSizing: "border-box",
          transition: "background 0.2s ease, border-color 0.2s ease"
        }}
      >
        {/* Left: Hamburger (Mobile) & Brand Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={onToggleSidebar}
            className="mobile-hamburger-btn"
            aria-label="Toggle navigation menu"
            style={{
              background: "transparent",
              border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "7px",
              width: "32px",
              height: "32px",
              display: "none",
              alignItems: "center",
              justifyContent: "center",
              color: isLight ? "#475569" : "#94a3b8",
              cursor: "pointer"
            }}
          >
            <Menu size={18} />
          </button>

          {/* Logo & Wordmark (Single-click -> Dashboard/Home, Double-click -> Admin Login) */}
          <Link
            to={isAuthenticated ? "/dashboard" : "/"}
            onDoubleClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate("/admin/login");
            }}
            title="Judgo Coding Platform"
            style={{ textDecoration: "none", cursor: "pointer", display: "inline-flex" }}
          >
            <JudgoLogo size={28} wordmarkHeight={18} showDivider={true} animated={true} />
          </Link>
        </div>

        {/* Center: Search Command Bar */}
        <div
          className="search-command-btn"
          onClick={() => setPaletteOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: isLight ? "#f1f5f9" : "#0d111a",
            border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "8px",
            padding: "0 12px",
            height: "38px",
            width: "320px",
            maxWidth: "100%",
            color: isLight ? "#64748b" : "#64748b",
            fontSize: "0.82rem",
            cursor: "pointer",
            transition: "all 0.15s ease",
            boxSizing: "border-box"
          }}
        >
          <Search size={14} style={{ color: isLight ? "#64748b" : "#64748b", flexShrink: 0 }} />
          <span style={{ flex: 1, color: isLight ? "#475569" : "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            Search problems, tags, topics...
          </span>
          <kbd
            style={{
              background: isLight ? "#ffffff" : "rgba(255, 255, 255, 0.06)",
              border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "4px",
              padding: "1px 5px",
              fontSize: "0.68rem",
              color: isLight ? "#475569" : "#94a3b8",
              boxShadow: isLight ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
              flexShrink: 0
            }}
          >
            ⌘ K
          </kbd>
        </div>

        {/* Right: Streak + Notifications + Profile Area */}
        <div className="topbar-right" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {isAuthenticated ? (
            <>
              {/* 1. Streak Badge */}
              <Link
                to="/progress"
                className="streak-badge-pill"
                title={streakCount > 0 ? `${streakCount} Day Streak active! Click to view progress.` : "Solve a problem today to start your streak!"}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  background: streakCount > 0 ? "rgba(245, 158, 11, 0.1)" : "rgba(100, 116, 139, 0.1)",
                  border: streakCount > 0 ? "1px solid rgba(245, 158, 11, 0.25)" : "1px solid rgba(100, 116, 139, 0.25)",
                  padding: "0 10px",
                  height: "32px",
                  borderRadius: "999px",
                  fontSize: "0.78rem",
                  color: streakCount > 0 ? "#fbbf24" : "#94a3b8",
                  fontWeight: "600",
                  textDecoration: "none",
                  transition: "transform 0.15s ease, border-color 0.15s ease",
                  boxSizing: "border-box"
                }}
              >
                <Flame size={14} style={{ color: streakCount > 0 ? "#f59e0b" : "#64748b" }} />
                <span>{streakCount} {streakCount === 1 ? "Day" : "Days"}</span>
              </Link>

              {/* 2. Quick Theme Toggle Button (Sun/Moon) */}
              <motion.button
                className="nav-theme-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={toggleTheme}
                title={`Current theme: ${theme} (${resolvedTheme}). Click to switch to ${isLight ? "Dark" : "Light"} mode.`}
                aria-label="Toggle light or dark theme"
                style={{
                  background: isLight ? "rgba(0, 0, 0, 0.04)" : "rgba(255, 255, 255, 0.04)",
                  border: isLight ? "1px solid rgba(0, 0, 0, 0.08)" : "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "7px",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: isLight ? "#f59e0b" : "#818cf8",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  flexShrink: 0
                }}
              >
                {isLight ? <Sun size={15} /> : <Moon size={15} />}
              </motion.button>

              {/* 3. Notifications Bell */}
              <div className="nav-notification-wrap" style={{ position: "relative" }}>
                {(() => {
                  const notifPrefs = preferences || user?.preferences || {};
                  const allNotifications = [
                    {
                      id: "sub-1",
                      type: "submissionResults",
                      title: "✓ Solution Accepted",
                      desc: "Valid Parentheses passed all test cases.",
                      color: "#10b981"
                    },
                    {
                      id: "contest-1",
                      type: "contestReminders",
                      title: "🏆 Weekly Contest",
                      desc: "Algorithm Sprint 42 starts in 2 days.",
                      color: "#f59e0b"
                    },
                    {
                      id: "achieve-1",
                      type: "achievementAlerts",
                      title: "⭐ 7-Day Streak Milestone",
                      desc: "You unlocked the Consistent Coder badge!",
                      color: "#818cf8"
                    },
                    {
                      id: "coach-1",
                      type: "aiCoachNotifications",
                      title: "⚡ Judgo Intelligence Tip",
                      desc: "Try solving 2 DP problems to boost graph mastery.",
                      color: "#06b6d4"
                    }
                  ];
                  const activeNotifications = allNotifications.filter(
                    (n) => notifPrefs[n.type] !== false
                  );

                  return (
                    <>
                      <button
                        className="nav-notification-button"
                        type="button"
                        onClick={() => {
                          setNotifOpen((prev) => !prev);
                          setDropdownOpen(false);
                        }}
                        style={{
                          background: isLight ? "rgba(0, 0, 0, 0.04)" : "rgba(255, 255, 255, 0.04)",
                          border: isLight ? "1px solid rgba(0, 0, 0, 0.08)" : "1px solid rgba(255, 255, 255, 0.08)",
                          borderRadius: "7px",
                          width: "32px",
                          height: "32px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: isLight ? "#475569" : "#94a3b8",
                          cursor: "pointer",
                          position: "relative",
                          flexShrink: 0
                        }}
                      >
                        <Bell size={15} />
                        {activeNotifications.length > 0 && (
                          <span
                            style={{
                              position: "absolute",
                              top: "6px",
                              right: "6px",
                              width: "5px",
                              height: "5px",
                              borderRadius: "50%",
                              background: "#3b82f6"
                            }}
                          />
                        )}
                      </button>

                      <AnimatePresence>
                        {notifOpen && (
                          <motion.div
                            className="nav-notification-menu"
                            initial={{ opacity: 0, scale: 0.95, y: -6 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -6 }}
                            transition={{ duration: 0.15 }}
                            style={{
                              position: "absolute",
                              top: "calc(100% + 8px)",
                              right: 0,
                              width: "300px",
                              background: isLight ? "#ffffff" : "#0d111a",
                              border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.1)",
                              borderRadius: "12px",
                              boxShadow: isLight ? "0 10px 30px rgba(0, 0, 0, 0.1)" : "0 14px 35px rgba(0, 0, 0, 0.55)",
                              padding: "14px",
                              zIndex: 200
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                              <strong style={{ fontSize: "0.85rem", color: isLight ? "#0f172a" : "#f8fafc" }}>Notifications</strong>
                              <Link
                                to="/settings?tab=notifications"
                                onClick={() => setNotifOpen(false)}
                                style={{ fontSize: "0.72rem", color: "var(--accent-primary, #6366f1)", textDecoration: "none", fontWeight: "600" }}
                              >
                                Manage
                              </Link>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.78rem" }}>
                              {activeNotifications.length > 0 ? (
                                activeNotifications.map((item) => (
                                  <div
                                    key={item.id}
                                    style={{
                                      padding: "8px 10px",
                                      background: isLight ? "#f8fafc" : "rgba(255,255,255,0.03)",
                                      border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.06)",
                                      borderRadius: "8px"
                                    }}
                                  >
                                    <span style={{ color: item.color, fontWeight: "600" }}>{item.title}</span>
                                    <p style={{ margin: "2px 0 0 0", color: isLight ? "#475569" : "#94a3b8", lineHeight: "1.4" }}>
                                      {item.desc}
                                    </p>
                                  </div>
                                ))
                              ) : (
                                <div style={{ padding: "16px 8px", textAlign: "center", color: isLight ? "#64748b" : "#94a3b8" }}>
                                  <p style={{ margin: 0, fontSize: "0.8rem" }}>All notifications muted by preferences.</p>
                                  <Link
                                    to="/settings?tab=notifications"
                                    onClick={() => setNotifOpen(false)}
                                    style={{ fontSize: "0.76rem", color: "var(--accent-primary, #6366f1)", marginTop: "4px", display: "inline-block" }}
                                  >
                                    Adjust notification preferences →
                                  </Link>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  );
                })()}
              </div>

              {/* 3. Top-Right Profile Pill: [Avatar] [User Name] [Chevron ▾] */}
              <div className="nav-profile-wrap" style={{ position: "relative" }}>
                <motion.button
                  className="nav-profile-button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setDropdownOpen((prev) => !prev);
                    setNotifOpen(false);
                  }}
                  type="button"
                  style={{
                    cursor: "pointer",
                    background: dropdownOpen
                      ? "rgba(99, 102, 241, 0.12)"
                      : isLight ? "rgba(0, 0, 0, 0.04)" : "rgba(255, 255, 255, 0.04)",
                    border: dropdownOpen
                      ? "1px solid rgba(99, 102, 241, 0.35)"
                      : isLight ? "1px solid rgba(0, 0, 0, 0.08)" : "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "999px",
                    padding: "2px 8px 2px 2px",
                    height: "34px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.15s ease",
                    boxSizing: "border-box"
                  }}
                >
                  {/* Clean Circular Avatar */}
                  <span
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                      color: "#ffffff",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.80rem",
                      boxShadow: "0 2px 6px rgba(79, 70, 229, 0.3)"
                    }}
                  >
                    {avatarLetter}
                  </span>

                  {/* User Full Name */}
                  <strong className="nav-profile-name" style={{ color: isLight ? "#0f172a" : "#f8fafc", fontSize: "0.82rem", fontWeight: "600" }}>
                    {fullName}
                  </strong>

                  {/* Chevron Indicator */}
                  <ChevronDown
                    size={13}
                    style={{
                      color: isLight ? "#64748b" : "#94a3b8",
                      transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.15s ease"
                    }}
                  />
                </motion.button>

                {/* Polished Profile Dropdown Menu */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      className="nav-profile-menu"
                      initial={{ opacity: 0, scale: 0.95, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -6 }}
                      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        position: "absolute",
                        top: "calc(100% + 6px)",
                        right: 0,
                        width: "230px",
                        background: isLight ? "#ffffff" : "#0d111a",
                        border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "12px",
                        boxShadow: isLight ? "0 10px 30px rgba(0, 0, 0, 0.1)" : "0 16px 40px rgba(0, 0, 0, 0.6)",
                        padding: "8px",
                        zIndex: 200,
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px"
                      }}
                    >
                      {/* Dropdown Header Card */}
                      <div
                        style={{
                          padding: "8px 10px 10px",
                          borderBottom: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.06)",
                          marginBottom: "4px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}
                      >
                        <span
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                            color: "#ffffff",
                            fontWeight: "700",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.90rem"
                          }}
                        >
                          {avatarLetter}
                        </span>
                        <div style={{ overflow: "hidden" }}>
                          <strong style={{ color: isLight ? "#0f172a" : "#f8fafc", fontSize: "0.84rem", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {fullName}
                          </strong>
                          <p style={{ margin: 0, fontSize: "0.72rem", color: isLight ? "#64748b" : "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {username ? `@${username}` : (email || "Logged in")}
                          </p>
                        </div>
                      </div>

                      {/* Dropdown Menu Items */}
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "7px 10px",
                          color: isLight ? "#334155" : "#cbd5e1",
                          textDecoration: "none",
                          fontSize: "0.82rem",
                          borderRadius: "6px",
                          transition: "background 0.12s ease"
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.05)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <UserIcon size={15} style={{ color: "#818cf8" }} />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        to="/submissions"
                        onClick={() => setDropdownOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "7px 10px",
                          color: isLight ? "#334155" : "#cbd5e1",
                          textDecoration: "none",
                          fontSize: "0.82rem",
                          borderRadius: "6px",
                          transition: "background 0.12s ease"
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.05)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <History size={15} style={{ color: "#38bdf8" }} />
                        <span>Submissions</span>
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setDropdownOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "7px 10px",
                          color: isLight ? "#334155" : "#cbd5e1",
                          textDecoration: "none",
                          fontSize: "0.82rem",
                          borderRadius: "6px",
                          transition: "background 0.12s ease"
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.05)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <Settings size={15} style={{ color: "#a855f7" }} />
                        <span>Settings</span>
                      </Link>

                      {/* Admin Panel Quick Entry (Conditional for Admins) */}
                      {user?.role === "admin" && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "7px 10px",
                            color: "#ec4899",
                            textDecoration: "none",
                            fontSize: "0.82rem",
                            borderRadius: "6px",
                            fontWeight: "600",
                            transition: "background 0.12s ease"
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(236,72,153,0.08)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <Shield size={15} />
                          <span>Admin Panel</span>
                        </Link>
                      )}

                      {/* Theme Mode Selector Row */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "6px 10px",
                          borderTop: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.06)",
                          marginTop: "4px"
                        }}
                      >
                        <span style={{ fontSize: "0.76rem", color: isLight ? "#64748b" : "#94a3b8" }}>Theme</span>
                        <div style={{ display: "flex", gap: "2px", background: isLight ? "#f1f5f9" : "rgba(255,255,255,0.05)", padding: "2px", borderRadius: "6px" }}>
                          <button
                            type="button"
                            onClick={() => setTheme("light")}
                            title="Light mode"
                            style={{
                              background: theme === "light" ? (isLight ? "#ffffff" : "rgba(255,255,255,0.15)") : "transparent",
                              border: "none",
                              borderRadius: "4px",
                              padding: "3px 6px",
                              cursor: "pointer",
                              color: theme === "light" ? "#f59e0b" : "#64748b",
                              display: "flex",
                              alignItems: "center"
                            }}
                          >
                            <Sun size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setTheme("dark")}
                            title="Dark mode"
                            style={{
                              background: theme === "dark" ? (isLight ? "#ffffff" : "rgba(255,255,255,0.15)") : "transparent",
                              border: "none",
                              borderRadius: "4px",
                              padding: "3px 6px",
                              cursor: "pointer",
                              color: theme === "dark" ? "#818cf8" : "#64748b",
                              display: "flex",
                              alignItems: "center"
                            }}
                          >
                            <Moon size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setTheme("system")}
                            title="System theme"
                            style={{
                              background: theme === "system" ? (isLight ? "#ffffff" : "rgba(255,255,255,0.15)") : "transparent",
                              border: "none",
                              borderRadius: "4px",
                              padding: "3px 6px",
                              cursor: "pointer",
                              color: theme === "system" ? (isLight ? "#0f172a" : "#ffffff") : "#64748b",
                              display: "flex",
                              alignItems: "center"
                            }}
                          >
                            <Laptop size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Sign Out Button */}
                      <button
                        type="button"
                        onClick={handleLogout}
                        style={{
                          width: "100%",
                          background: "transparent",
                          border: "none",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "7px 10px",
                          color: "#f87171",
                          cursor: "pointer",
                          fontSize: "0.82rem",
                          borderRadius: "6px",
                          textAlign: "left",
                          transition: "background 0.12s ease"
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <LogOut size={15} />
                        <span>Sign out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Link
                to="/login"
                style={{
                  color: isLight ? "#334155" : "#cbd5e1",
                  textDecoration: "none",
                  padding: "0 12px",
                  height: "32px",
                  display: "inline-flex",
                  alignItems: "center",
                  fontSize: "0.80rem",
                  fontWeight: "600",
                  borderRadius: "7px",
                  background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255, 255, 255, 0.05)",
                  border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)"
                }}
              >
                Log in
              </Link>
              <Link
                to="/register"
                style={{
                  color: "#ffffff",
                  textDecoration: "none",
                  padding: "0 14px",
                  height: "32px",
                  display: "inline-flex",
                  alignItems: "center",
                  fontSize: "0.80rem",
                  fontWeight: "600",
                  borderRadius: "7px",
                  background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                  boxShadow: "0 2px 10px rgba(79, 70, 229, 0.3)"
                }}
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Command Palette Modal */}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}
