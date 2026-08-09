import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Shield,
  UserCheck,
  UserX,
  Eye,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X,
  CheckCircle2,
  Calendar,
  Award,
  Terminal,
  RefreshCw
} from "lucide-react";
import { adminApi } from "../../api/adminApiClient.js";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleModalUser, setRoleModalUser] = useState(null);
  const [statusModalUser, setStatusModalUser] = useState(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [userDetails, setUserDetails] = useState(null);

  async function fetchUsers(page = pagination.page) {
    setIsLoading(true);
    try {
      const res = await adminApi.getUsers({
        page,
        limit: pagination.limit,
        search,
        role: roleFilter,
        status: statusFilter
      });
      setUsers(res.users || []);
      setPagination(res.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 });
    } catch (err) {
      console.error("[AdminUsers fetch error]:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers(1);
  }, [roleFilter, statusFilter]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    fetchUsers(1);
  }

  async function handleOpenDetails(user) {
    setSelectedUser(user);
    setDetailsLoading(true);
    try {
      const id = user.id || user._id;
      const res = await adminApi.getUserDetails(id);
      setUserDetails(res);
    } catch (e) {
      console.error(e);
    } finally {
      setDetailsLoading(false);
    }
  }

  async function handleConfirmRoleChange(newRole) {
    if (!roleModalUser) return;
    setActionLoading(true);
    try {
      const id = roleModalUser.id || roleModalUser._id;
      await adminApi.updateUserRole(id, newRole);
      setRoleModalUser(null);
      fetchUsers(pagination.page);
    } catch (err) {
      alert(err.message || "Failed to update role.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleConfirmStatusChange(newStatus) {
    if (!statusModalUser) return;
    setActionLoading(true);
    try {
      const id = statusModalUser.id || statusModalUser._id;
      await adminApi.updateUserStatus(id, newStatus, suspendReason);
      setStatusModalUser(null);
      setSuspendReason("");
      fetchUsers(pagination.page);
    } catch (err) {
      alert(err.message || "Failed to update user status.");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#f8fafc", margin: 0 }}>Developer Accounts &amp; Access</h1>
          <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: "4px 0 0 0" }}>Manage roles, account statuses, and review individual coding profiles.</p>
        </div>

        <button
          type="button"
          onClick={() => fetchUsers(pagination.page)}
          className="admin-btn admin-btn-secondary"
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="admin-card" style={{ padding: "14px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "8px", flex: 1, minWidth: "260px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, username, or email..."
              className="admin-input"
              style={{ width: "100%", paddingLeft: "34px" }}
            />
            <Search size={15} color="#64748b" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
          </div>
          <button type="submit" className="admin-btn admin-btn-primary" style={{ padding: "8px 14px" }}>
            Search
          </button>
        </form>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="admin-input"
            style={{ fontSize: "0.8rem" }}
          >
            <option value="all">All Roles</option>
            <option value="user">Standard User</option>
            <option value="admin">Administrator</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-input"
            style={{ fontSize: "0.8rem" }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>XP / Solved</th>
              <th>Streak</th>
              <th>Joined</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                  <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 10px" }} />
                  <p style={{ margin: 0, fontSize: "0.85rem" }}>Loading registered developers...</p>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  No developers matching the filter criteria.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isSuspended = u.status === "suspended";
                const isAdmin = u.role === "admin";
                return (
                  <tr key={u.id || u._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: isAdmin ? "linear-gradient(135deg, #a855f7, #6366f1)" : "linear-gradient(135deg, #3b82f6, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "0.78rem" }}>
                          {(u.name || u.username || "D").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: "700", color: "#f8fafc" }}>{u.name || u.username}</div>
                          <div style={{ fontSize: "0.72rem", color: "#64748b" }}>@{u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.82rem", color: "#cbd5e1" }}>{u.email}</span>
                    </td>
                    <td>
                      <span style={{
                        fontSize: "0.72rem",
                        fontWeight: "700",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        background: isAdmin ? "rgba(168, 85, 247, 0.15)" : "rgba(255, 255, 255, 0.05)",
                        color: isAdmin ? "#c084fc" : "#94a3b8",
                        border: isAdmin ? "1px solid rgba(168, 85, 247, 0.3)" : "1px solid rgba(255, 255, 255, 0.08)"
                      }}>
                        {u.role || "user"}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontSize: "0.72rem",
                        fontWeight: "700",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        background: isSuspended ? "rgba(239, 68, 68, 0.12)" : "rgba(16, 185, 129, 0.12)",
                        color: isSuspended ? "#f87171" : "#34d399",
                        border: isSuspended ? "1px solid rgba(239, 68, 68, 0.25)" : "1px solid rgba(16, 185, 129, 0.25)"
                      }}>
                        {isSuspended ? "Suspended" : "Active"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.82rem", color: "#f8fafc", fontWeight: "600" }}>{u.xp || 0} XP</span>
                      <span style={{ fontSize: "0.72rem", color: "#64748b", display: "block" }}>{u.solved || u.solvedProblemIds?.length || 0} solved</span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.82rem", color: "#fbbf24", fontWeight: "700" }}>🔥 {u.streak || 0}d</span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "2026-01-01"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
                        <button
                          type="button"
                          onClick={() => handleOpenDetails(u)}
                          className="admin-btn admin-btn-secondary"
                          style={{ padding: "5px 8px", fontSize: "0.74rem" }}
                          title="Inspect Profile"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRoleModalUser(u)}
                          className="admin-btn admin-btn-secondary"
                          style={{ padding: "5px 8px", fontSize: "0.74rem" }}
                          title="Change Role"
                        >
                          <Shield size={13} />
                        </button>
                        {isSuspended ? (
                          <button
                            type="button"
                            onClick={() => setStatusModalUser(u)}
                            className="admin-btn admin-btn-secondary"
                            style={{ padding: "5px 8px", fontSize: "0.74rem", color: "#34d399" }}
                            title="Reactivate Account"
                          >
                            <UserCheck size={13} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setStatusModalUser(u)}
                            className="admin-btn admin-btn-danger"
                            style={{ padding: "5px 8px", fontSize: "0.74rem" }}
                            title="Suspend Account"
                          >
                            <UserX size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div style={{ padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--admin-border)" }}>
          <span style={{ fontSize: "0.76rem", color: "#64748b" }}>
            Showing {users.length} of {pagination.total} developers
          </span>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => fetchUsers(pagination.page - 1)}
              className="admin-btn admin-btn-secondary"
              style={{ padding: "4px 10px", opacity: pagination.page <= 1 ? 0.4 : 1 }}
            >
              <ChevronLeft size={14} />
            </button>
            <span style={{ fontSize: "0.8rem", color: "#cbd5e1", display: "flex", alignItems: "center", padding: "0 6px" }}>
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchUsers(pagination.page + 1)}
              className="admin-btn admin-btn-secondary"
              style={{ padding: "4px 10px", opacity: pagination.page >= pagination.totalPages ? 0.4 : 1 }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* USER DETAILS INSPECTOR MODAL */}
      {selectedUser && (
        <div className="admin-modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "linear-gradient(135deg, #a855f7, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>
                  {(selectedUser.name || "D").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: "800", color: "#f8fafc", margin: 0 }}>
                    {selectedUser.name || selectedUser.username}
                  </h3>
                  <span style={{ fontSize: "0.74rem", color: "#94a3b8" }}>{selectedUser.email}</span>
                </div>
              </div>
              <button type="button" onClick={() => setSelectedUser(null)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              {detailsLoading ? (
                <div style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>Loading profile metrics...</div>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                    <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
                      <span style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase" }}>Rank</span>
                      <strong style={{ display: "block", fontSize: "1.1rem", color: "#c084fc", marginTop: "2px" }}>#{selectedUser.ranking || 999}</strong>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
                      <span style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase" }}>Problems Solved</span>
                      <strong style={{ display: "block", fontSize: "1.1rem", color: "#34d399", marginTop: "2px" }}>{selectedUser.solved || selectedUser.solvedProblemIds?.length || 0}</strong>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
                      <span style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase" }}>Streak</span>
                      <strong style={{ display: "block", fontSize: "1.1rem", color: "#fbbf24", marginTop: "2px" }}>{selectedUser.streak || 0} Days</strong>
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: "0.85rem", fontWeight: "700", color: "#f8fafc", margin: "0 0 8px 0" }}>Recent Submissions</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "180px", overflowY: "auto" }}>
                      {(userDetails?.submissions || []).length === 0 ? (
                        <span style={{ fontSize: "0.78rem", color: "#64748b" }}>No submissions on record for this account.</span>
                      ) : (
                        (userDetails?.submissions || []).map((s, idx) => (
                          <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: "#080c14", borderRadius: "6px", fontSize: "0.78rem" }}>
                            <span style={{ color: "#f8fafc", fontWeight: "600" }}>{s.problemId}</span>
                            <span style={{ color: s.verdict === "AC" || s.verdict === "ACCEPTED" ? "#34d399" : "#f87171", fontWeight: "700" }}>{s.verdict}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="admin-modal-footer">
              <button type="button" onClick={() => setSelectedUser(null)} className="admin-btn admin-btn-secondary">
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHANGE ROLE CONFIRMATION MODAL */}
      {roleModalUser && (
        <div className="admin-modal-overlay" onClick={() => setRoleModalUser(null)}>
          <div className="admin-modal" style={{ maxWidth: "420px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 style={{ fontSize: "1rem", fontWeight: "800", color: "#f8fafc", margin: 0 }}>
                Change Account Role
              </h3>
              <button type="button" onClick={() => setRoleModalUser(null)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ fontSize: "0.85rem", color: "#cbd5e1", margin: 0 }}>
                Modify permission role for <strong>{roleModalUser.name || roleModalUser.username}</strong> ({roleModalUser.email}).
              </p>
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  disabled={actionLoading || roleModalUser.role === "user"}
                  onClick={() => handleConfirmRoleChange("user")}
                  className="admin-btn admin-btn-secondary"
                  style={{ flex: 1, padding: "10px" }}
                >
                  Set as Standard User
                </button>
                <button
                  type="button"
                  disabled={actionLoading || roleModalUser.role === "admin"}
                  onClick={() => handleConfirmRoleChange("admin")}
                  className="admin-btn admin-btn-primary"
                  style={{ flex: 1, padding: "10px" }}
                >
                  Promote to Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUSPEND / REACTIVATE CONFIRMATION MODAL */}
      {statusModalUser && (
        <div className="admin-modal-overlay" onClick={() => setStatusModalUser(null)}>
          <div className="admin-modal" style={{ maxWidth: "440px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 style={{ fontSize: "1rem", fontWeight: "800", color: "#f8fafc", margin: 0 }}>
                {statusModalUser.status === "suspended" ? "Reactivate Developer Account" : "Suspend Developer Account"}
              </h3>
              <button type="button" onClick={() => setStatusModalUser(null)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ fontSize: "0.85rem", color: "#cbd5e1", margin: 0 }}>
                {statusModalUser.status === "suspended"
                  ? `Reactivating this account will restore coding submissions and platform access for ${statusModalUser.username}.`
                  : `Suspending this account will immediately block ${statusModalUser.username} from submitting code, entering contests, and modifying data.`}
              </p>

              {statusModalUser.status !== "suspended" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
                  <label style={{ fontSize: "0.76rem", color: "#94a3b8" }}>Suspension Reason / Violation Note</label>
                  <input
                    type="text"
                    value={suspendReason}
                    onChange={(e) => setSuspendReason(e.target.value)}
                    placeholder="e.g. Terms of Service violation, automated scraping"
                    className="admin-input"
                  />
                </div>
              )}
            </div>
            <div className="admin-modal-footer">
              <button type="button" onClick={() => setStatusModalUser(null)} className="admin-btn admin-btn-secondary">
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleConfirmStatusChange(statusModalUser.status === "suspended" ? "active" : "suspended")}
                className={statusModalUser.status === "suspended" ? "admin-btn admin-btn-primary" : "admin-btn admin-btn-danger"}
              >
                {actionLoading ? "Processing..." : statusModalUser.status === "suspended" ? "Confirm Reactivation" : "Confirm Suspension"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
