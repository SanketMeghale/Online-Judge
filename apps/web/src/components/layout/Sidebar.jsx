import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Bot,
  ChevronLeft,
  ChevronRight,
  Code2,
  LayoutDashboard,
  Settings,
  Sparkles,
  Swords,
  TrendingUp,
  User
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext.jsx";
import { getUserDisplayName } from "../../auth/displayName.js";
import { useAppData } from "../../data/AppDataContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";

const navSections = [
  {
    category: "MAIN",
    items: [
      { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, iconColor: "#4f46e5" },
      { label: "Practice", to: "/problems", icon: Code2, iconColor: "#0284c7" },
      { label: "Contest", to: "/contests", icon: Swords, iconColor: "#ea580c" }
    ]
  },
  {
    category: "LEARNING",
    items: [
      { label: "Judgo Intelligence", to: "/ai-coach", icon: Bot, iconColor: "#7c3aed" },
      { label: "Progress", to: "/stats", icon: TrendingUp, iconColor: "#059669" }
    ]
  },
  {
    category: "ACCOUNT",
    items: [
      { label: "Profile", to: "/profile", icon: User, iconColor: "#4f46e5" },
      { label: "Settings", to: "/settings", icon: Settings, iconColor: "#64748b" }
    ]
  }
];

function isRouteActive(itemTo, pathname) {
  if (itemTo === "/dashboard") {
    return pathname === "/dashboard" || pathname === "/";
  }
  if (itemTo === "/problems") {
    return pathname.startsWith("/problems") || pathname.startsWith("/practice");
  }
  if (itemTo === "/contests") {
    return pathname.startsWith("/contests") || pathname.startsWith("/contest");
  }
  if (itemTo === "/ai-coach") {
    return (
      pathname.startsWith("/ai-coach") ||
      pathname.startsWith("/interviewer") ||
      pathname.startsWith("/companies")
    );
  }
  if (itemTo === "/stats") {
    return pathname.startsWith("/stats") || pathname.startsWith("/progress");
  }
  if (itemTo === "/profile") {
    return pathname.startsWith("/profile");
  }
  if (itemTo === "/settings") {
    return pathname.startsWith("/settings");
  }
  return pathname === itemTo;
}

export default function Sidebar({ mobileOpen = false, onCloseMobile = () => {} }) {
  const location = useLocation();
  const { user } = useAuth();
  const { getUserById } = useAppData();
  const { isLight } = useTheme();

  const currentUserId = user?.id || user?._id || "";
  const liveUser = { ...(currentUserId ? getUserById(currentUserId) : {}), ...(user || {}) };
  const displayName = getUserDisplayName(liveUser);
  const userHandle = String(liveUser?.username || liveUser?.email || "").trim();
  const avatarLetter = String(displayName || userHandle || "D").slice(0, 1).toUpperCase();

  // Dashboard exception: expanded by default on Dashboard; collapsed icon rail (60px) on all other routes
  const isDashboardRoute = location.pathname === "/dashboard" || location.pathname === "/";
  const [collapsed, setCollapsed] = useState(!isDashboardRoute);
  const [hoveredItem, setHoveredItem] = useState(null);

  // Automatically update default collapse state upon route navigation
  useEffect(() => {
    setCollapsed(!isDashboardRoute);
  }, [location.pathname, isDashboardRoute]);

  const isEffectiveCollapsed = collapsed && !mobileOpen;
  const sidebarWidth = isEffectiveCollapsed ? "60px" : "240px";

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
              zIndex: 990
            }}
          />
        )}
      </AnimatePresence>

      <aside
        className={`sidebar sidebar-modern ${isEffectiveCollapsed ? "sidebar-collapsed" : ""} ${
          mobileOpen ? "sidebar-mobile-open" : ""
        }`}
        style={{
          width: sidebarWidth,
          minWidth: sidebarWidth,
          maxWidth: sidebarWidth,
          background: isLight ? "#ffffff" : "#080c14",
          borderRight: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.07)",
          display: "flex",
          flexDirection: "column",
          minHeight: "calc(100dvh - var(--global-nav-height, 64px))",
          height: "calc(100dvh - var(--global-nav-height, 64px))",
          position: "sticky",
          top: "var(--global-nav-height, 64px)",
          transition:
            "width 220ms cubic-bezier(0.16, 1, 0.3, 1), min-width 220ms cubic-bezier(0.16, 1, 0.3, 1), max-width 220ms cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s ease, border-color 0.15s ease",
          willChange: "width, min-width, max-width",
          zIndex: mobileOpen ? 999 : 95,
          padding: isEffectiveCollapsed ? "8px 6px 10px" : "10px 10px 14px",
          userSelect: "none",
          overflowX: "visible",
          overflowY: "auto",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          boxSizing: "border-box"
        }}
      >
        {/* Collapse Toggle Row */}
        <div
          className="sidebar-toggle-row"
          style={{
            display: "flex",
            justifyContent: isEffectiveCollapsed ? "center" : "space-between",
            alignItems: "center",
            padding: isEffectiveCollapsed ? "0 0 6px" : "0 4px 6px",
            borderBottom: isLight ? "1px solid #f1f5f9" : "1px solid rgba(255, 255, 255, 0.06)",
            marginBottom: "6px",
            minHeight: "28px",
            width: "100%"
          }}
        >
          {!isEffectiveCollapsed && (
            <span
              style={{
                fontSize: "0.68rem",
                fontWeight: "700",
                letterSpacing: "0.06em",
                color: isLight ? "#64748b" : "#475569",
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
              background: isLight ? "rgba(0, 0, 0, 0.04)" : "rgba(255, 255, 255, 0.04)",
              border: isLight ? "1px solid rgba(0, 0, 0, 0.08)" : "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "6px",
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: isLight ? "#475569" : "#94a3b8",
              cursor: "pointer",
              transition: "all 0.15s ease",
              flexShrink: 0
            }}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Navigation Categories & Links */}
        <div
          className="sidebar-nav-sections"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: isEffectiveCollapsed ? "4px" : "8px",
            flex: 1,
            width: "100%",
            scrollbarWidth: "none",
            msOverflowStyle: "none"
          }}
        >
          {navSections.map(({ category, items }) => (
            <div
              key={category}
              className="sidebar-group"
              style={{ display: "flex", flexDirection: "column", gap: "2px", width: "100%" }}
            >
              {/* Category Header Label or Subtle Divider */}
              {!isEffectiveCollapsed ? (
                <span
                  style={{
                    fontSize: "0.64rem",
                    fontWeight: "700",
                    letterSpacing: "0.08em",
                    color: isLight ? "#94a3b8" : "#475569",
                    padding: "0 8px 2px",
                    textTransform: "uppercase"
                  }}
                >
                  {category}
                </span>
              ) : (
                <div
                  style={{
                    height: "1px",
                    background: isLight ? "#f1f5f9" : "rgba(255, 255, 255, 0.06)",
                    margin: "2px 4px 3px"
                  }}
                />
              )}

              {/* Navigation Items */}
              {items.map(({ label, to, icon: Icon, iconColor }) => {
                const active = isRouteActive(to, location.pathname);

                return (
                  <div
                    key={label}
                    style={{ position: "relative", width: "100%" }}
                    onMouseEnter={() => setHoveredItem(label)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <NavLink
                      to={to}
                      onClick={onCloseMobile}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: isEffectiveCollapsed ? "0" : "6px 10px",
                        width: isEffectiveCollapsed ? "38px" : "100%",
                        height: isEffectiveCollapsed ? "36px" : "auto",
                        margin: isEffectiveCollapsed ? "0 auto" : "0",
                        justifyContent: isEffectiveCollapsed ? "center" : "flex-start",
                        borderRadius: isEffectiveCollapsed ? "8px" : "7px",
                        textDecoration: "none",
                        fontSize: "0.82rem",
                        fontWeight: active ? "600" : "500",
                        color: active
                          ? isLight ? "#4f46e5" : "#ffffff"
                          : isLight ? "#475569" : "#94a3b8",
                        background: active
                          ? isLight ? "#eef2ff" : "rgba(99, 102, 241, 0.14)"
                          : hoveredItem === label
                          ? isLight ? "#f1f5f9" : "rgba(255, 255, 255, 0.04)"
                          : "transparent",
                        border: active
                          ? isLight ? "1px solid rgba(99, 102, 241, 0.3)" : "1px solid rgba(99, 102, 241, 0.32)"
                          : "1px solid transparent",
                        boxShadow: active && isEffectiveCollapsed
                          ? "0 2px 6px rgba(99, 102, 241, 0.18)"
                          : "none",
                        position: "relative",
                        transition: "background-color 0.14s ease, border-color 0.14s ease, color 0.14s ease, transform 0.14s ease",
                        boxSizing: "border-box"
                      }}
                    >
                      <Icon
                        size={16}
                        style={{
                          color: active ? "#6366f1" : isLight ? iconColor : "#64748b",
                          flexShrink: 0,
                          transition: "color 0.15s ease"
                        }}
                      />

                      {!isEffectiveCollapsed && (
                        <span
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}
                        >
                          {label}
                        </span>
                      )}

                      {/* Active Accent Indicator for Expanded Mode */}
                      {active && !isEffectiveCollapsed && (
                        <div
                          style={{
                            marginLeft: "auto",
                            width: "3px",
                            height: "12px",
                            borderRadius: "2px",
                            background: "#6366f1"
                          }}
                        />
                      )}
                    </NavLink>

                    {/* Floating Tooltip when Collapsed */}
                    <AnimatePresence>
                      {isEffectiveCollapsed && hoveredItem === label && (
                        <motion.div
                          initial={{ opacity: 0, x: 6, scale: 0.95 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: 4, scale: 0.95 }}
                          transition={{ duration: 0.14, ease: "easeOut" }}
                          style={{
                            position: "absolute",
                            left: "calc(100% + 10px)",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: isLight ? "#ffffff" : "#0f1628",
                            border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.14)",
                            color: isLight ? "#0f172a" : "#f8fafc",
                            padding: "4px 10px",
                            borderRadius: "6px",
                            fontSize: "0.76rem",
                            fontWeight: "600",
                            whiteSpace: "nowrap",
                            zIndex: 120,
                            boxShadow: isLight
                              ? "0 4px 14px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.06)"
                              : "0 8px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)",
                            pointerEvents: "none",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px"
                          }}
                        >
                          <span
                            style={{
                              width: "5px",
                              height: "5px",
                              borderRadius: "50%",
                              background: iconColor
                            }}
                          />
                          <span>{label}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer Area: User Pro Card when Expanded, Mini Avatar Button when Collapsed */}
        <div style={{ marginTop: "auto", paddingTop: "6px", width: "100%" }}>
          {!isEffectiveCollapsed ? (
            <div
              className="sidebar-pro-card"
              style={{
                background: isLight
                  ? "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)"
                  : "linear-gradient(135deg, rgba(15, 22, 40, 0.95) 0%, rgba(99, 102, 241, 0.08) 100%)",
                border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "8px",
                padding: "8px 10px",
                display: "flex",
                flexDirection: "column",
                gap: "2px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Sparkles size={13} style={{ color: "#a855f7" }} />
                <strong
                  style={{
                    fontSize: "0.78rem",
                    color: isLight ? "#0f172a" : "#f8fafc",
                    fontWeight: "700"
                  }}
                >
                  {displayName}
                </strong>
              </div>
              <p
                style={{
                  fontSize: "0.70rem",
                  color: isLight ? "#475569" : "#94a3b8",
                  margin: 0,
                  lineHeight: "1.3",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
              >
                {userHandle ? (liveUser?.username ? `@${userHandle}` : userHandle) : "Authenticated user"}
              </p>
              <NavLink
                to="/stats"
                onClick={onCloseMobile}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "0.72rem",
                  fontWeight: "600",
                  color: "#6366f1",
                  textDecoration: "none",
                  marginTop: "2px"
                }}
              >
                <span>View Progress</span>
                <ArrowRight size={11} />
              </NavLink>
            </div>
          ) : (
            <div
              style={{ position: "relative", display: "flex", justifyContent: "center", width: "100%" }}
              onMouseEnter={() => setHoveredItem("User Profile")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <NavLink
                to="/profile"
                onClick={onCloseMobile}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: isLight ? "#f1f5f9" : "rgba(255, 255, 255, 0.05)",
                  border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6366f1",
                  fontWeight: "800",
                  fontSize: "0.80rem",
                  textDecoration: "none",
                  transition: "all 0.15s ease"
                }}
              >
                {avatarLetter}
              </NavLink>

              {/* Floating Tooltip for Profile */}
              <AnimatePresence>
                {hoveredItem === "User Profile" && (
                  <motion.div
                    initial={{ opacity: 0, x: 6, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 4, scale: 0.95 }}
                    transition={{ duration: 0.14, ease: "easeOut" }}
                    style={{
                      position: "absolute",
                      left: "calc(100% + 14px)",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: isLight ? "#ffffff" : "#0f1628",
                      border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.14)",
                      color: isLight ? "#0f172a" : "#f8fafc",
                      padding: "5px 12px",
                      borderRadius: "7px",
                      fontSize: "0.79rem",
                      fontWeight: "600",
                      whiteSpace: "nowrap",
                      zIndex: 120,
                      boxShadow: isLight
                        ? "0 4px 14px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.06)"
                        : "0 8px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)",
                      pointerEvents: "none"
                    }}
                  >
                    <span>{displayName}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
