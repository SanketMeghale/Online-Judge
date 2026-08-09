import { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Bot,
  ChevronLeft,
  ChevronRight,
  Code2,
  Home,
  LayoutDashboard,
  Rocket,
  Settings,
  Sparkles,
  Swords,
  TrendingUp,
  User,
  X
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useAppData } from "../../data/AppDataContext.jsx";

const navSections = [
  {
    category: "MAIN",
    items: [
      { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
      { label: "Practice", to: "/problems", icon: Code2 },
      { label: "Contest", to: "/contests", icon: Swords }
    ]
  },
  {
    category: "LEARNING",
    items: [
      { label: "AI Coach", to: "/ai-coach", icon: Bot },
      { label: "Mock Interview", to: "/interviewer", icon: Sparkles },
      { label: "Progress", to: "/stats", icon: TrendingUp }
    ]
  },
  {
    category: "ACCOUNT",
    items: [
      { label: "Profile", to: "/profile", icon: User },
      { label: "Settings", to: "/settings", icon: Settings }
    ]
  }
];

export default function Sidebar({ mobileOpen = false, onCloseMobile = () => {} }) {
  const { user } = useAuth();
  const { getUserById } = useAppData();
  const liveUser = (user?.id ? getUserById(user.id) : null) || user || {};

  const [collapsed, setCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const sidebarWidth = collapsed ? "68px" : "240px";

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseMobile}
            className="mobile-sidebar-backdrop"
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.7)",
              backdropFilter: "blur(4px)",
              zIndex: 90
            }}
          />
        )}
      </AnimatePresence>

      <aside
        className={`sidebar sidebar-modern ${collapsed ? "sidebar-collapsed" : ""} ${
          mobileOpen ? "sidebar-mobile-open" : ""
        }`}
        style={{
          width: sidebarWidth,
          background: "#080c14",
          borderRight: "1px solid rgba(255, 255, 255, 0.07)",
          display: "flex",
          flexDirection: "column",
          minHeight: "calc(100vh - 68px)",
          position: "sticky",
          top: "68px",
          transition: "width 0.24s cubic-bezier(0.16, 1, 0.3, 1)",
          zIndex: 95,
          padding: collapsed ? "14px 8px 16px" : "14px 12px 18px",
          userSelect: "none"
        }}
      >
        {/* Collapse Toggle Row (Desktop only) */}
        <div
          className="sidebar-toggle-row"
          style={{
            display: "flex",
            justifyContent: collapsed ? "center" : "space-between",
            alignItems: "center",
            padding: "0 4px 12px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
            marginBottom: "12px"
          }}
        >
          {!collapsed && (
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: "700",
                letterSpacing: "0.06em",
                color: "#64748b",
                textTransform: "uppercase"
              }}
            >
              Navigation
            </span>
          )}

          {/* Desktop Toggle Button */}
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className="sidebar-collapse-btn"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "6px",
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94a3b8",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>

        {/* Navigation Categories & Links */}
        <div
          className="sidebar-nav-sections"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            flex: 1
          }}
        >
          {navSections.map(({ category, items }) => (
            <div key={category} className="sidebar-group" style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              {/* Category Header Label */}
              {!collapsed ? (
                <span
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: "700",
                    letterSpacing: "0.08em",
                    color: "#475569",
                    padding: "0 10px 4px",
                    textTransform: "uppercase"
                  }}
                >
                  {category}
                </span>
              ) : (
                <div style={{ height: "1px", background: "rgba(255,255,255,0.04)", margin: "4px 8px" }} />
              )}

              {/* Items List */}
              {items.map(({ label, to, icon: Icon }) => (
                <div
                  key={label}
                  style={{ position: "relative" }}
                  onMouseEnter={() => setHoveredItem(label)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <NavLink
                    to={to}
                    onClick={onCloseMobile}
                    end={to === "/dashboard"}
                    style={({ isActive }) => ({
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: collapsed ? "10px 0" : "8px 12px",
                      justifyContent: collapsed ? "center" : "flex-start",
                      borderRadius: "8px",
                      textDecoration: "none",
                      fontSize: "0.86rem",
                      fontWeight: isActive ? "600" : "500",
                      color: isActive ? "#ffffff" : "#94a3b8",
                      background: isActive
                        ? "rgba(99, 102, 241, 0.12)"
                        : hoveredItem === label
                        ? "rgba(255, 255, 255, 0.04)"
                        : "transparent",
                      border: isActive ? "1px solid rgba(99, 102, 241, 0.28)" : "1px solid transparent",
                      position: "relative",
                      transition: "all 0.15s ease"
                    })}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size={17}
                          style={{
                            color: isActive ? "#818cf8" : "#64748b",
                            flexShrink: 0,
                            transition: "color 0.15s ease"
                          }}
                        />

                        {!collapsed && (
                          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {label}
                          </span>
                        )}

                        {/* Active Accent Indicator */}
                        {isActive && !collapsed && (
                          <div
                            style={{
                              marginLeft: "auto",
                              width: "3px",
                              height: "14px",
                              borderRadius: "2px",
                              background: "#6366f1"
                            }}
                          />
                        )}
                      </>
                    )}
                  </NavLink>

                  {/* Hover Tooltip when Collapsed */}
                  {collapsed && hoveredItem === label && (
                    <motion.div
                      initial={{ opacity: 0, x: 6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      style={{
                        position: "absolute",
                        left: "calc(100% + 10px)",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "#0f1628",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        color: "#f8fafc",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "0.78rem",
                        fontWeight: "600",
                        whiteSpace: "nowrap",
                        zIndex: 110,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                        pointerEvents: "none"
                      }}
                    >
                      {label}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Footer: Compact Pro Developer Card */}
        {!collapsed && (
          <div
            className="sidebar-pro-card"
            style={{
              marginTop: "auto",
              background: "linear-gradient(135deg, rgba(15, 22, 40, 0.95) 0%, rgba(99, 102, 241, 0.08) 100%)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "10px",
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: "4px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Sparkles size={14} style={{ color: "#a855f7" }} />
              <strong style={{ fontSize: "0.82rem", color: "#f8fafc", fontWeight: "700" }}>Pro Developer</strong>
            </div>
            <p style={{ fontSize: "0.74rem", color: "#94a3b8", margin: 0, lineHeight: "1.4" }}>
              Unlock advanced AI mock interviews and system tracks.
            </p>
            <NavLink
              to="/stats"
              onClick={onCloseMobile}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "0.76rem",
                fontWeight: "600",
                color: "#818cf8",
                textDecoration: "none",
                marginTop: "4px"
              }}
            >
              <span>View Progress</span>
              <ArrowRight size={12} />
            </NavLink>
          </div>
        )}
      </aside>
    </>
  );
}
