import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { useAppData } from "../../data/AppDataContext.jsx";
import CommandPalette from "../dashboard/CommandPalette.jsx";

export default function Navbar({ onToggleSidebar = () => {} }) {
  const { isAuthenticated, logout, user } = useAuth();
  const { getUserById } = useAppData();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [themeMode, setThemeMode] = useState("dark");

  const currentUserId = user?.id || user?._id || "";
  const liveUser = (currentUserId ? getUserById(currentUserId) : null) || user || {};

  const fullName = String(liveUser?.name || liveUser?.username || "Developer").trim();
  const username = String(liveUser?.username || "coder").trim();
  const email = String(liveUser?.email || "").trim();
  const avatarLetter = String(fullName || username || "D").slice(0, 1).toUpperCase();
  const streakCount = typeof liveUser?.streak === "number" ? liveUser.streak : (liveUser?.solved > 0 ? 1 : 0);

  // Scroll listener for smooth glass transition
  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
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
          background: isScrolled ? "rgba(8, 12, 20, 0.94)" : "rgba(8, 12, 20, 0.82)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "68px",
          padding: "0 24px",
          position: "sticky",
          top: 0,
          zIndex: 100,
          transition: "all 0.2s ease"
        }}
      >
        {/* Left: Hamburger (Mobile) & Brand Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={onToggleSidebar}
            className="mobile-hamburger-btn"
            aria-label="Toggle navigation menu"
            style={{
              background: "transparent",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "8px",
              width: "36px",
              height: "36px",
              display: "none",
              alignItems: "center",
              justifyContent: "center",
              color: "#94a3b8",
              cursor: "pointer"
            }}
          >
            <Menu size={18} />
          </button>

          {/* Logo & Wordmark */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <motion.div
              whileHover={{ scale: 1.12, rotate: 8 }}
              whileTap={{ scale: 0.92 }}
              animate={{ y: [0, -2.5, 0] }}
              transition={{
                y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
                scale: { duration: 0.2 },
                rotate: { duration: 0.2 }
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                filter: "drop-shadow(0 2px 10px rgba(100, 80, 255, 0.7)) drop-shadow(0 0 18px rgba(59,130,246,0.35))"
              }}
            >
              <img
                src="/logo.png"
                alt="Judgo Logo"
                style={{ width: "38px", height: "38px", objectFit: "contain", display: "block", background: "transparent" }}
              />
            </motion.div>
            <span style={{ fontSize: "1.22rem", fontWeight: "800", letterSpacing: "-0.02em", color: "#ffffff" }}>
              Judgo
            </span>
          </Link>
        </div>

        {/* Center: Search Command Bar */}
        <div
          className="search-command-btn"
          onClick={() => setPaletteOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "#0d111a",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "10px",
            padding: "8px 16px",
            width: "340px",
            maxWidth: "100%",
            color: "#64748b",
            fontSize: "0.85rem",
            cursor: "pointer",
            transition: "all 0.15s ease"
          }}
        >
          <Search size={15} style={{ color: "#64748b" }} />
          <span style={{ flex: 1 }}>Search problems, tags, topics...</span>
          <kbd
            style={{
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "4px",
              padding: "2px 6px",
              fontSize: "0.72rem",
              color: "#94a3b8"
            }}
          >
            ⌘ K
          </kbd>
        </div>

        {/* Right: Streak + Notifications + Profile Area */}
        <div className="topbar-right" style={{ display: "flex", alignItems: "center", gap: "14px" }}>
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
                  gap: "6px",
                  background: streakCount > 0 ? "rgba(245, 158, 11, 0.1)" : "rgba(100, 116, 139, 0.1)",
                  border: streakCount > 0 ? "1px solid rgba(245, 158, 11, 0.25)" : "1px solid rgba(100, 116, 139, 0.25)",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  fontSize: "0.82rem",
                  color: streakCount > 0 ? "#fbbf24" : "#94a3b8",
                  fontWeight: "600",
                  textDecoration: "none",
                  transition: "transform 0.15s ease, border-color 0.15s ease"
                }}
              >
                <Flame size={15} style={{ color: streakCount > 0 ? "#f59e0b" : "#64748b" }} />
                <span>{streakCount} {streakCount === 1 ? "Day" : "Days"}</span>
              </Link>

              {/* 2. Notifications Bell */}
              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => {
                    setNotifOpen((prev) => !prev);
                    setDropdownOpen(false);
                  }}
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "8px",
                    width: "36px",
                    height: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#94a3b8",
                    cursor: "pointer",
                    position: "relative"
                  }}
                >
                  <Bell size={16} />
                  <span
                    style={{
                      position: "absolute",
                      top: "7px",
                      right: "7px",
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#3b82f6"
                    }}
                  />
                </button>

                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -6 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: "absolute",
                        top: "calc(100% + 8px)",
                        right: 0,
                        width: "280px",
                        background: "#0d111a",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "12px",
                        boxShadow: "0 14px 35px rgba(0, 0, 0, 0.55)",
                        padding: "12px",
                        zIndex: 200
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <strong style={{ fontSize: "0.85rem", color: "#f8fafc" }}>Notifications</strong>
                        <span style={{ fontSize: "0.72rem", color: "#818cf8", cursor: "pointer" }}>Mark all read</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.78rem" }}>
                        <div style={{ padding: "8px 10px", background: "rgba(255,255,255,0.03)", borderRadius: "8px" }}>
                          <span style={{ color: "#10b981", fontWeight: "600" }}>✓ Solution Accepted</span>
                          <p style={{ margin: "2px 0 0 0", color: "#94a3b8" }}>Valid Parentheses passed all test cases.</p>
                        </div>
                        <div style={{ padding: "8px 10px", background: "rgba(255,255,255,0.03)", borderRadius: "8px" }}>
                          <span style={{ color: "#fbbf24", fontWeight: "600" }}>🏆 Weekly Contest</span>
                          <p style={{ margin: "2px 0 0 0", color: "#94a3b8" }}>Algorithm Sprint 42 starts in 2 days.</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 3. Top-Right Profile Pill: [Avatar] [User Name] [Chevron ▾] */}
              <div style={{ position: "relative" }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setDropdownOpen((prev) => !prev);
                    setNotifOpen(false);
                  }}
                  type="button"
                  style={{
                    cursor: "pointer",
                    background: dropdownOpen ? "rgba(99, 102, 241, 0.12)" : "rgba(255, 255, 255, 0.04)",
                    border: dropdownOpen ? "1px solid rgba(99, 102, 241, 0.35)" : "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "999px",
                    padding: "4px 12px 4px 4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "all 0.15s ease"
                  }}
                >
                  {/* Clean Circular Avatar */}
                  <span
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                      color: "#ffffff",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.84rem",
                      boxShadow: "0 2px 8px rgba(79, 70, 229, 0.3)"
                    }}
                  >
                    {avatarLetter}
                  </span>

                  {/* User Full Name */}
                  <strong style={{ color: "#f8fafc", fontSize: "0.86rem", fontWeight: "600" }}>
                    {fullName}
                  </strong>

                  {/* Chevron Indicator */}
                  <ChevronDown
                    size={14}
                    style={{
                      color: "#94a3b8",
                      transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.15s ease"
                    }}
                  />
                </motion.button>

                {/* Polished Profile Dropdown Menu */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -6 }}
                      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        position: "absolute",
                        top: "calc(100% + 8px)",
                        right: 0,
                        width: "230px",
                        background: "#0d111a",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "12px",
                        boxShadow: "0 16px 40px rgba(0, 0, 0, 0.6)",
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
                          padding: "10px 12px 12px",
                          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                          marginBottom: "4px",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px"
                        }}
                      >
                        <span
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                            color: "#ffffff",
                            fontWeight: "700",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.95rem"
                          }}
                        >
                          {avatarLetter}
                        </span>
                        <div style={{ overflow: "hidden" }}>
                          <strong style={{ color: "#f8fafc", fontSize: "0.88rem", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {fullName}
                          </strong>
                          <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            @{username}
                          </p>
                        </div>
                      </div>

                      {/* Dropdown Links */}
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "8px 12px",
                          color: "#cbd5e1",
                          textDecoration: "none",
                          fontSize: "0.84rem",
                          borderRadius: "6px",
                          transition: "background 0.12s ease"
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
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
                          padding: "8px 12px",
                          color: "#cbd5e1",
                          textDecoration: "none",
                          fontSize: "0.84rem",
                          borderRadius: "6px",
                          transition: "background 0.12s ease"
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <History size={15} style={{ color: "#818cf8" }} />
                        <span>Submissions</span>
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setDropdownOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "8px 12px",
                          color: "#cbd5e1",
                          textDecoration: "none",
                          fontSize: "0.84rem",
                          borderRadius: "6px",
                          transition: "background 0.12s ease"
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <Settings size={15} style={{ color: "#818cf8" }} />
                        <span>Account Settings</span>
                      </Link>

                      <Link
                        to="/settings?tab=editor"
                        onClick={() => setDropdownOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "8px 12px",
                          color: "#cbd5e1",
                          textDecoration: "none",
                          fontSize: "0.84rem",
                          borderRadius: "6px",
                          transition: "background 0.12s ease"
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <Code2 size={15} style={{ color: "#818cf8" }} />
                        <span>Editor Preferences</span>
                      </Link>

                      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", margin: "4px 0" }} />

                      {/* Sign Out Button */}
                      <button
                        onClick={handleLogout}
                        type="button"
                        style={{
                          width: "100%",
                          background: "transparent",
                          border: "none",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "8px 12px",
                          color: "#f87171",
                          cursor: "pointer",
                          fontSize: "0.84rem",
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
                  color: "#cbd5e1",
                  textDecoration: "none",
                  padding: "8px 16px",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  borderRadius: "8px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.08)"
                }}
              >
                Log in
              </Link>
              <Link
                to="/register"
                style={{
                  color: "#ffffff",
                  textDecoration: "none",
                  padding: "8px 16px",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                  boxShadow: "0 4px 14px rgba(79, 70, 229, 0.35)"
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
