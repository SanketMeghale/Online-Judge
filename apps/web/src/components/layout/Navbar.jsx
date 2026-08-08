import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Code2, Flame, LogOut, Search, User as UserIcon } from "lucide-react";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useAppData } from "../../data/AppDataContext.jsx";

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const { getUserById } = useAppData();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const liveUser = getUserById(user?.id) ?? user;
  const firstName = liveUser?.name?.split(" ")[0] ?? liveUser?.username ?? "User";
  const avatarLetter = (liveUser?.name || liveUser?.username || "U").slice(0, 1).toUpperCase();

  async function handleLogout() {
    setDropdownOpen(false);
    await logout();
    navigate("/", { replace: true });
  }

  return (
    <motion.header
      initial={{ y: -25, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="navbar"
    >
      <Link className="brand" to="/">
        <motion.span
          whileHover={{ rotate: 8, scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="brand-mark"
          style={{ background: "transparent", boxShadow: "0 0 16px rgba(120, 80, 255, 0.4)", width: "36px", height: "36px", padding: 0 }}
        >
          <img src="/logo.png" alt="Judgo Logo" style={{ width: "36px", height: "36px", objectFit: "contain" }} />
        </motion.span>
        <span>Judgo</span>
      </Link>

      <div className="search-pill">
        <Search size={18} style={{ color: "#7e8b9b" }} />
        <input
          type="text"
          placeholder="Search problems, topics, contests..."
          readOnly
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#a8b3d6", fontSize: "0.92rem" }}
        />
        <kbd>⌘ K</kbd>
      </div>

      <div className="topbar-right">
        {isAuthenticated && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="streak-chip"
          >
            <Flame size={18} style={{ color: "#ff6b35" }} />
            <strong>{liveUser?.streak ?? 1}</strong>
            <span>Day Streak</span>
          </motion.div>
        )}

        {isAuthenticated ? (
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "8px" }}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="profile-pill"
              onClick={() => setDropdownOpen((prev) => !prev)}
              type="button"
              style={{ cursor: "pointer", background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "20px", padding: "4px 12px 4px 6px", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <span className="mini-avatar" style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #7850ff, #00c3ff)", color: "#fff", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem" }}>
                {avatarLetter}
              </span>
              <strong style={{ color: "#eee", fontSize: "0.9rem" }}>{firstName}</strong>
              <ChevronDown size={14} style={{ color: "#888" }} />
            </motion.button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    width: "180px",
                    background: "#181d28",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "10px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                    padding: "6px 0",
                    zIndex: 100
                  }}
                >
                  <div style={{ padding: "8px 16px", borderBottom: "1px solid rgba(255, 255, 255, 0.06)", fontSize: "0.8rem", color: "#8b949e" }}>
                    Logged in as <strong style={{ color: "#fff", display: "block", overflow: "hidden", textOverflow: "ellipsis" }}>{liveUser?.email}</strong>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", color: "#e6edf3", textDecoration: "none", fontSize: "0.88rem" }}
                  >
                    <UserIcon size={16} /> Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    type="button"
                    style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", color: "#ff4d4f", background: "none", border: "none", cursor: "pointer", fontSize: "0.88rem" }}
                  >
                    <LogOut size={16} /> Log Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "10px" }}>
            <Link to="/login" className="btn-secondary" style={{ padding: "6px 14px", borderRadius: "6px", color: "#fff", textDecoration: "none" }}>Log In</Link>
            <Link to="/register" className="btn-primary" style={{ padding: "6px 14px", borderRadius: "6px", background: "#7850ff", color: "#fff", textDecoration: "none" }}>Sign Up</Link>
          </div>
        )}
      </div>
    </motion.header>
  );
}
