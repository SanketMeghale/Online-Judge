import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  ChevronDown,
  Code2,
  Flame,
  History,
  LogOut,
  Search,
  Settings,
  User as UserIcon
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useAppData } from "../../data/AppDataContext.jsx";
import CommandPalette from "../dashboard/CommandPalette.jsx";

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const { getUserById } = useAppData();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const liveUser = getUserById(user?.id) ?? user;
  const firstName = liveUser?.name?.split(" ")[0] ?? liveUser?.username ?? "Coder";
  const avatarLetter = (liveUser?.name || liveUser?.username || "C").slice(0, 1).toUpperCase();

  // Scroll listener for smooth glass transition
  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > 15) {
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
      <header className={`navbar navbar-sticky-glass ${isScrolled ? "navbar-scrolled" : "navbar-transparent"}`}>
        {/* Left: Brand Logo & Wordmark */}
        <Link className="brand" to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <motion.div
            whileHover={{ rotate: 5, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="brand-mark"
            style={{
              background: "transparent",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0
            }}
          >
            <img src="/logo.png" alt="Judgo Logo" style={{ width: "36px", height: "36px", objectFit: "contain" }} />
          </motion.div>
          <span style={{ fontSize: "1.25rem", fontWeight: "800", letterSpacing: "-0.02em", color: "#ffffff" }}>
            Judgo
          </span>
        </Link>

        {/* Center: Search Command Bar */}
        <div className="search-command-btn" onClick={() => setPaletteOpen(true)}>
          <Search size={16} style={{ color: "#64748b" }} />
          <span>Search problems, contests, topics...</span>
          <kbd className="search-command-kbd">⌘ K</kbd>
        </div>

        {/* Right: Streak, Notifications, Profile Dropdown */}
        <div className="topbar-right" style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {isAuthenticated && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="streak-chip"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(245, 158, 11, 0.1)",
                border: "1px solid rgba(245, 158, 11, 0.25)",
                padding: "4px 10px",
                borderRadius: "999px",
                fontSize: "0.82rem"
              }}
            >
              <Flame size={15} style={{ color: "#f59e0b" }} />
              <strong style={{ color: "#fbbf24" }}>{liveUser?.streak ?? 1}</strong>
              <span style={{ color: "#94a3b8", fontSize: "0.76rem" }}>Day Streak</span>
            </motion.div>
          )}

          {/* Notifications Bell */}
          {isAuthenticated && (
            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => {
                  setNotifOpen((prev) => !prev);
                  setDropdownOpen(false);
                }}
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid var(--dash-border)",
                  borderRadius: "50%",
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
                    top: "8px",
                    right: "8px",
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
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ duration: 0.18 }}
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      right: 0,
                      width: "280px",
                      background: "#0f1628",
                      border: "1px solid var(--dash-border)",
                      borderRadius: "12px",
                      boxShadow: "0 12px 30px rgba(0,0,0,0.5)",
                      padding: "12px",
                      zIndex: 200
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <strong style={{ fontSize: "0.85rem", color: "#f8fafc" }}>Notifications</strong>
                      <span style={{ fontSize: "0.72rem", color: "#818cf8", cursor: "pointer" }}>Mark read</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.78rem", color: "#94a3b8" }}>
                      <div style={{ padding: "6px 8px", background: "rgba(255,255,255,0.03)", borderRadius: "6px" }}>
                        <span style={{ color: "#10b981", fontWeight: "600" }}>✓ Solution Accepted!</span>
                        <p style={{ margin: "2px 0 0 0", color: "#cbd5e1" }}>Two Sum passed all test cases.</p>
                      </div>
                      <div style={{ padding: "6px 8px", background: "rgba(255,255,255,0.03)", borderRadius: "6px" }}>
                        <span style={{ color: "#fbbf24", fontWeight: "600" }}>🏆 Next Contest</span>
                        <p style={{ margin: "2px 0 0 0", color: "#cbd5e1" }}>CodeSprint starts in 2 days.</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* User Profile Dropdown */}
          {isAuthenticated ? (
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
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid var(--dash-border)",
                  borderRadius: "999px",
                  padding: "4px 12px 4px 5px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <span
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)",
                    color: "#ffffff",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.82rem"
                  }}
                >
                  {avatarLetter}
                </span>
                <strong style={{ color: "#f8fafc", fontSize: "0.88rem", fontWeight: "600" }}>{firstName}</strong>
                <ChevronDown size={13} style={{ color: "#94a3b8" }} />
              </motion.button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      right: 0,
                      width: "190px",
                      background: "#0f1628",
                      border: "1px solid var(--dash-border)",
                      borderRadius: "10px",
                      boxShadow: "0 14px 35px rgba(0, 0, 0, 0.5)",
                      padding: "6px 0",
                      zIndex: 200
                    }}
                  >
                    <div style={{ padding: "8px 14px", borderBottom: "1px solid var(--dash-border-subtle)", marginBottom: "4px" }}>
                      <p style={{ margin: 0, fontSize: "0.78rem", color: "#64748b" }}>Signed in as</p>
                      <p style={{ margin: "2px 0 0 0", fontSize: "0.85rem", fontWeight: "600", color: "#f8fafc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {liveUser?.email || liveUser?.username || "Developer"}
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", color: "#cbd5e1", textDecoration: "none", fontSize: "0.84rem" }}
                    >
                      <UserIcon size={15} style={{ color: "#94a3b8" }} />
                      <span>Profile</span>
                    </Link>

                    <Link
                      to="/submissions"
                      onClick={() => setDropdownOpen(false)}
                      style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", color: "#cbd5e1", textDecoration: "none", fontSize: "0.84rem" }}
                    >
                      <History size={15} style={{ color: "#94a3b8" }} />
                      <span>Submissions</span>
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setDropdownOpen(false)}
                      style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", color: "#cbd5e1", textDecoration: "none", fontSize: "0.84rem" }}
                    >
                      <Settings size={15} style={{ color: "#94a3b8" }} />
                      <span>Settings</span>
                    </Link>

                    <div style={{ height: "1px", background: "var(--dash-border-subtle)", margin: "4px 0" }} />

                    <button
                      onClick={handleLogout}
                      type="button"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 14px",
                        width: "100%",
                        background: "transparent",
                        border: "none",
                        color: "#ef4444",
                        fontSize: "0.84rem",
                        cursor: "pointer",
                        textAlign: "left"
                      }}
                    >
                      <LogOut size={15} />
                      <span>Sign out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Link to="/login" className="dash-btn-secondary" style={{ padding: "7px 14px", fontSize: "0.84rem" }}>
                Log in
              </Link>
              <Link to="/register" className="dash-btn-primary" style={{ padding: "7px 14px", fontSize: "0.84rem" }}>
                Sign up
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* ⌘ K Command Palette Modal */}
      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}
