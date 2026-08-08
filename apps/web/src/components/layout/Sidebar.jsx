import { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  ChevronLeft,
  ChevronRight,
  Code2,
  Home,
  Rocket,
  Settings,
  Swords,
  TrendingUp,
  User
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useAppData } from "../../data/AppDataContext.jsx";

const navItems = [
  { label: "Dashboard", to: "/dashboard", icon: Home },
  { label: "Practice", to: "/problems", icon: Code2 },
  { label: "Contest", to: "/contests", icon: Swords },
  { label: "AI Coach", to: "/interviewer", icon: Bot },
  { label: "Progress", to: "/stats", icon: TrendingUp },
  { label: "Profile", to: "/profile", icon: User },
  { label: "Settings", to: "/settings", icon: Settings }
];

export default function Sidebar() {
  const { user } = useAuth();
  const { getUserById } = useAppData();
  const liveUser = getUserById(user?.id) ?? user;
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`sidebar sidebar-collapsible ${collapsed ? "sidebar-collapsed" : ""}`} style={{ width: collapsed ? "68px" : "240px" }}>
      {/* Collapse Toggle Row */}
      <div style={{ display: "flex", justifyContent: collapsed ? "center" : "flex-end", padding: "8px 12px 4px", borderBottom: "1px solid var(--dash-border-subtle)", marginBottom: "8px" }}>
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="sidebar-toggle-btn"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="sidebar-links" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={label}
            className="sidebar-link"
            to={to}
            title={collapsed ? label : ""}
            end={to === "/dashboard" || to === "/"}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: collapsed ? "10px 0" : "9px 14px",
              justifyContent: collapsed ? "center" : "flex-start",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "0.88rem",
              fontWeight: isActive ? "600" : "500",
              color: isActive ? "#ffffff" : "#94a3b8",
              background: isActive
                ? "linear-gradient(135deg, rgba(124, 58, 237, 0.12) 0%, rgba(59, 130, 246, 0.08) 100%)"
                : "transparent",
              border: isActive ? "1px solid rgba(124, 58, 237, 0.25)" : "1px solid transparent",
              position: "relative",
              transition: "all 0.2s ease"
            })}
          >
            {({ isActive }) => (
              <>
                <motion.div
                  whileHover={{ x: 2 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    color: isActive ? "#a78bfa" : "inherit"
                  }}
                >
                  <Icon size={18} />
                </motion.div>

                {!collapsed && (
                  <span style={{ transition: "color 0.15s ease" }}>
                    {label}
                  </span>
                )}

                {isActive && !collapsed && (
                  <motion.div
                    layoutId="sidebarActiveIndicator"
                    style={{
                      marginLeft: "auto",
                      width: "3px",
                      height: "16px",
                      borderRadius: "2px",
                      background: "#7c3aed"
                    }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Bottom Upgrade Card (Only in expanded view) */}
      {!collapsed && (
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="sidebar-rocket-card"
          style={{
            marginTop: "auto",
            background: "linear-gradient(135deg, rgba(15, 22, 40, 0.9) 0%, rgba(124, 58, 237, 0.1) 100%)",
            border: "1px solid var(--dash-border)",
            borderRadius: "12px",
            padding: "16px 14px",
            display: "flex",
            flexDirection: "column",
            gap: "6px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "26px", height: "26px", borderRadius: "6px", background: "rgba(124, 58, 237, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#c084fc" }}>
              <Rocket size={14} />
            </div>
            <strong style={{ fontSize: "0.85rem", color: "#f8fafc" }}>Pro Developer</strong>
          </div>
          <p style={{ fontSize: "0.76rem", color: "#94a3b8", margin: "4px 0 8px 0", lineHeight: "1.4" }}>
            Unlock unlimited AI mock interviews & system design tracks.
          </p>
          <NavLink
            to="/stats"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "0.78rem",
              fontWeight: "600",
              color: "#818cf8",
              textDecoration: "none"
            }}
          >
            <span>View Progress</span>
            <ArrowRight size={12} />
          </NavLink>
        </motion.div>
      )}
    </aside>
  );
}
