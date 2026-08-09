import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  FileCode2,
  Terminal,
  Trophy,
  Sparkles,
  Flag,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers
} from "lucide-react";
import { adminApi } from "../../api/adminApiClient.js";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  async function loadData(showRefreshIndicator = false) {
    if (showRefreshIndicator) setIsRefreshing(true);
    try {
      const res = await adminApi.getDashboardStats();
      setStats(res);
      setError(null);
    } catch (err) {
      console.error("[AdminDashboard load error]:", err);
      setError(err.message || "Failed to load dashboard metrics.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="admin-card" style={{ height: "110px", opacity: 0.5, animation: "pulse 1.5s infinite" }} />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Developers",
      value: stats?.users?.total || 0,
      sub: `${stats?.users?.active || 0} active • ${stats?.users?.suspended || 0} suspended`,
      icon: Users,
      color: "#38bdf8",
      link: "/admin/users"
    },
    {
      title: "Problems Catalog",
      value: stats?.problems?.total || 0,
      sub: `${stats?.problems?.published || 0} published • ${stats?.problems?.draft || 0} drafts`,
      icon: FileCode2,
      color: "#c084fc",
      link: "/admin/problems"
    },
    {
      title: "Platform Submissions",
      value: stats?.submissions?.total || 0,
      sub: `${stats?.submissions?.acceptanceRate || 78}% Acceptance Rate`,
      icon: Terminal,
      color: "#34d399",
      link: "/admin/submissions"
    },
    {
      title: "Active Contests",
      value: stats?.contests?.total || 0,
      sub: `${stats?.contests?.live || 0} live now • ${stats?.contests?.upcoming || 0} scheduled`,
      icon: Trophy,
      color: "#fbbf24",
      link: "/admin/contests"
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Banner & Quick Action Buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
        <div>
          <h1 style={{ fontSize: "1.35rem", fontWeight: "800", color: "#f8fafc", margin: 0 }}>Executive Control Overview</h1>
          <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: "4px 0 0 0" }}>Live aggregated telemetry, submissions throughput, and security health.</p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            onClick={() => loadData(true)}
            className="admin-btn admin-btn-secondary"
            disabled={isRefreshing}
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            <span>{isRefreshing ? "Syncing..." : "Refresh Feed"}</span>
          </button>
          <Link to="/admin/problems" className="admin-btn admin-btn-primary">
            <Plus size={14} />
            <span>Create Problem</span>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "16px" }}>
        {statCards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <Link key={idx} to={c.link} className="admin-card" style={{ textDecoration: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: "600", color: "#94a3b8" }}>{c.title}</span>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={16} color={c.color} />
                </div>
              </div>
              <div style={{ fontSize: "1.65rem", fontWeight: "800", color: "#f8fafc" }}>{c.value}</div>
              <div style={{ fontSize: "0.74rem", color: "#64748b" }}>{c.sub}</div>
            </Link>
          );
        })}
      </div>

      {/* Split Grids: Recent Submissions & Recent Users */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "20px" }}>
        {/* Left: Recent Live Submissions */}
        <div className="admin-table-container">
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--admin-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Terminal size={16} color="#34d399" />
              <strong style={{ fontSize: "0.92rem", color: "#f8fafc" }}>Recent Platform Submissions</strong>
            </div>
            <Link to="/admin/submissions" style={{ fontSize: "0.76rem", color: "#a855f7", textDecoration: "none", fontWeight: "600" }}>
              View All Submissions →
            </Link>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Problem</th>
                <th>User</th>
                <th>Verdict</th>
                <th>Lang</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recentSubmissions || []).slice(0, 6).map((s, idx) => {
                const isAc = s.verdict === "ACCEPTED" || s.verdict === "AC";
                return (
                  <tr key={idx}>
                    <td>
                      <span style={{ fontWeight: "600", color: "#f8fafc" }}>{s.problemId || "Two Sum"}</span>
                    </td>
                    <td>
                      <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>{s.userId || "u-coder"}</span>
                    </td>
                    <td>
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "0.72rem",
                        fontWeight: "700",
                        color: isAc ? "#34d399" : "#f87171",
                        background: isAc ? "rgba(52, 211, 153, 0.1)" : "rgba(239, 68, 68, 0.1)",
                        padding: "2px 8px",
                        borderRadius: "4px"
                      }}>
                        {isAc ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                        <span>{s.verdict || "AC"}</span>
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.75rem", color: "#c084fc", textTransform: "uppercase" }}>{s.language || "py"}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                        {new Date(s.submittedAt || s.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Right: Recent Registrations & Active Reports */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* New Users */}
          <div className="admin-table-container">
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--admin-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Users size={16} color="#38bdf8" />
                <strong style={{ fontSize: "0.92rem", color: "#f8fafc" }}>Latest Users</strong>
              </div>
              <Link to="/admin/users" style={{ fontSize: "0.76rem", color: "#a855f7", textDecoration: "none", fontWeight: "600" }}>
                Directory →
              </Link>
            </div>

            <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {(stats?.recentUsers || []).slice(0, 4).map((u, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px", borderRadius: "8px", background: "rgba(255,255,255,0.02)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "linear-gradient(135deg, #6366f1, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: "700" }}>
                      {(u.name || u.username || "D").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: "0.82rem", fontWeight: "600", color: "#f8fafc" }}>{u.name || u.username}</div>
                      <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{u.email}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: "0.7rem", fontWeight: "700", padding: "2px 6px", borderRadius: "4px", background: u.role === "admin" ? "rgba(168,85,247,0.15)" : "rgba(255,255,255,0.05)", color: u.role === "admin" ? "#c084fc" : "#94a3b8" }}>
                    {u.role || "user"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Reports / Action Center */}
          <div className="admin-table-container">
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--admin-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Flag size={16} color="#f87171" />
                <strong style={{ fontSize: "0.92rem", color: "#f8fafc" }}>Moderation &amp; Reports</strong>
              </div>
              <Link to="/admin/reports" style={{ fontSize: "0.76rem", color: "#a855f7", textDecoration: "none", fontWeight: "600" }}>
                Resolve ({stats?.reports?.open || 0}) →
              </Link>
            </div>

            <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {(stats?.recentReports || []).slice(0, 2).map((r, i) => (
                <div key={i} style={{ padding: "10px", borderRadius: "8px", background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.15)", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#f8fafc" }}>{r.targetTitle || r.reason}</span>
                    <span style={{ fontSize: "0.68rem", fontWeight: "700", color: "#f87171", textTransform: "uppercase" }}>{r.status}</span>
                  </div>
                  <span style={{ fontSize: "0.74rem", color: "#94a3b8" }}>{r.notes || "Report submitted by developer."}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
