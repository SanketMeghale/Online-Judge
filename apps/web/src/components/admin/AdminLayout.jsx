import React, { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileCode2,
  Layers,
  CheckSquare,
  Terminal,
  Trophy,
  BarChart3,
  Flag,
  Sparkles,
  History,
  Settings,
  LogOut,
  ArrowLeft,
  ShieldCheck,
  Menu,
  X,
  ExternalLink
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext.jsx";
import "../../styles/admin/adminLayout.css";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navGroups = [
    {
      title: "Core Operations",
      items: [
        { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { path: "/admin/users", label: "Users", icon: Users },
        { path: "/admin/problems", label: "Problems", icon: FileCode2 },
        { path: "/admin/topics", label: "Topics", icon: Layers },
        { path: "/admin/test-cases", label: "Test Cases", icon: CheckSquare },
        { path: "/admin/submissions", label: "Submissions", icon: Terminal }
      ]
    },
    {
      title: "Platform & Intelligence",
      items: [
        { path: "/admin/contests", label: "Contests", icon: Trophy },
        { path: "/admin/analytics", label: "Analytics", icon: BarChart3 },
        { path: "/admin/reports", label: "Reports", icon: Flag },
        { path: "/admin/ai-coach", label: "AI Coach", icon: Sparkles }
      ]
    },
    {
      title: "System & Governance",
      items: [
        { path: "/admin/audit-logs", label: "Audit Logs", icon: History },
        { path: "/admin/settings", label: "Settings", icon: Settings }
      ]
    }
  ];

  // Helper to extract current active page title
  const activeItem = navGroups
    .flatMap((g) => g.items)
    .find((item) => location.pathname === item.path || location.pathname.startsWith(`${item.path}/`));

  const pageTitle = activeItem ? activeItem.label : "Control Center";

  async function handleAdminLogout() {
    await logout();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="admin-layout-root">
      {/* Sidebar Navigation */}
      <aside className={`admin-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="admin-sidebar-header">
          <Link to="/admin/dashboard" className="admin-sidebar-brand">
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 10px rgba(124, 58, 237, 0.4)"
              }}
            >
              <ShieldCheck size={18} color="#fff" />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "0.98rem", fontWeight: "800", letterSpacing: "-0.01em" }}>Judgo</span>
              <span style={{ fontSize: "0.65rem", color: "#94a3b8" }}>Control Center</span>
            </div>
          </Link>
          <span className="admin-brand-badge">ADMIN</span>
        </div>

        <div className="admin-nav-section">
          {navGroups.map((group, idx) => (
            <div key={idx} style={{ marginBottom: "10px" }}>
              <div className="admin-nav-heading">{group.title}</div>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon size={17} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="admin-sidebar-footer">
          <div className="admin-user-capsule">
            <div className="admin-user-avatar">
              {(user?.name || user?.username || "A").charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "#f8fafc", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.name || user?.username || "Admin"}
              </div>
              <div style={{ fontSize: "0.68rem", color: "#a855f7", fontWeight: "600" }}>Platform Admin</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "6px" }}>
            <Link
              to="/dashboard"
              className="admin-btn admin-btn-secondary"
              style={{ flex: 1, fontSize: "0.74rem", padding: "6px 8px" }}
              title="Return to user dashboard"
            >
              <ArrowLeft size={13} />
              <span>User App</span>
            </Link>
            <button
              type="button"
              onClick={handleAdminLogout}
              className="admin-btn admin-btn-danger"
              style={{ padding: "6px 10px" }}
              title="Sign out of Admin Control Center"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main-wrapper">
        <header className="admin-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="admin-btn admin-btn-secondary"
              style={{ display: "none", padding: "6px 10px" }}
            >
              {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
            <div className="admin-topbar-title">
              <span>{pageTitle}</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="admin-system-badge">
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", display: "inline-block", boxShadow: "0 0 8px #10b981" }} />
              <span>Engine Online</span>
            </div>
            <Link
              to="/problems"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-btn admin-btn-secondary"
              style={{ fontSize: "0.76rem", padding: "6px 10px" }}
            >
              <span>Live Site</span>
              <ExternalLink size={12} />
            </Link>
          </div>
        </header>

        <main className="admin-content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
