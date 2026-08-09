import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Shield,
  UserCheck,
  UserX,
  Eye,
  Trash2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X,
  CheckCircle2,
  Calendar,
  Award,
  Terminal,
  RefreshCw,
  Plus
} from "lucide-react";
import { adminApi } from "../../api/adminApiClient.js";
import AdminUserDetailModal from "../../components/admin/AdminUserDetailModal.jsx";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [roleModalUser, setRoleModalUser] = useState(null);
  const [statusModalUser, setStatusModalUser] = useState(null);
  const [deleteModalUser, setDeleteModalUser] = useState(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

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
    try {
      const id = user.id || user._id;
      const res = await adminApi.getUserDetails(id);
      setSelectedUserDetails(res);
    } catch (e) {
      console.error(e);
      alert("Failed to load user details.");
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
      if (selectedUserDetails) setSelectedUserDetails(null);
    } catch (err) {
      alert(err.message || "Failed to update status.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteModalUser) return;
    setActionLoading(true);
    try {
      const id = deleteModalUser.id || deleteModalUser._id;
      await adminApi.deleteUser(id);
      setDeleteModalUser(null);
      fetchUsers(pagination.page);
    } catch (err) {
      alert(err.message || "Failed to delete user.");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.35rem", fontWeight: "800", color: "#f8fafc", margin: 0 }}>
            User Management & Identity
          </h1>
          <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: "4px 0 0" }}>
            Total registered developers: {pagination.total} • Inspect profiles, assign roles, and enforce moderation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchUsers(pagination.page)}
          className="admin-btn-secondary"
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-card" style={{ padding: "14px 18px" }}>
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: "240px", position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
            <input
              type="text"
              placeholder="Search by name, username, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input"
              style={{ paddingLeft: "36px", width: "100%" }}
            />
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="admin-select"
            >
              <option value="all">All Roles</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
              <option value="super_admin">Super Admins</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="admin-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>

            <button type="submit" className="admin-btn-primary">
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Role</th>
                <th>Status</th>
                <th>XP / Streak</th>
                <th>Solved</th>
                <th>Created</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    <RefreshCw size={20} className="animate-spin" style={{ margin: "0 auto 8px" }} />
                    <div>Loading user records...</div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const id = u.id || u._id;
                  return (
                    <tr key={id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div
                            style={{
                              width: "34px",
                              height: "34px",
                              borderRadius: "8px",
                              background: "rgba(99, 102, 241, 0.15)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#818cf8",
                              fontWeight: "700",
                              fontSize: "0.85rem"
                            }}
                          >
                            {(u.name || u.username || "U")[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: "600", color: "#f8fafc" }}>
                              {u.displayName || u.name || "User"}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                              @{u.username} • {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`admin-badge badge-${
                            u.role === "super_admin" ? "purple" : u.role === "admin" ? "blue" : "gray"
                          }`}
                          style={{ textTransform: "uppercase", fontSize: "0.65rem" }}
                        >
                          {u.role || "user"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`admin-badge badge-${u.status === "suspended" ? "red" : "green"}`}
                          style={{ textTransform: "uppercase", fontSize: "0.65rem" }}
                        >
                          {u.status || "active"}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "#fbbf24" }}>
                          {u.xp || 0} XP
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "#f97316" }}>
                          🔥 {u.streak || 0}d streak
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: "700", color: "#34d399" }}>
                          {u.solvedProblemIds?.length || 0}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "6px" }}>
                          <button
                            type="button"
                            className="admin-btn-secondary"
                            style={{ padding: "4px 8px", fontSize: "0.72rem" }}
                            onClick={() => handleOpenDetails(u)}
                            title="Inspect User Details"
                          >
                            <Eye size={13} style={{ marginRight: "4px" }} />
                            View
                          </button>

                          <button
                            type="button"
                            className="admin-btn-secondary"
                            style={{ padding: "4px 8px", fontSize: "0.72rem" }}
                            onClick={() => setRoleModalUser(u)}
                            title="Change Role"
                          >
                            <Shield size={13} />
                          </button>

                          {u.status === "suspended" ? (
                            <button
                              type="button"
                              className="admin-btn-secondary"
                              style={{ padding: "4px 8px", fontSize: "0.72rem", color: "#34d399" }}
                              onClick={() => setStatusModalUser({ ...u, targetStatus: "active" })}
                              title="Reactivate Account"
                            >
                              <UserCheck size={13} />
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="admin-btn-secondary"
                              style={{ padding: "4px 8px", fontSize: "0.72rem", color: "#f87171" }}
                              onClick={() => setStatusModalUser({ ...u, targetStatus: "suspended" })}
                              title="Suspend Account"
                            >
                              <UserX size={13} />
                            </button>
                          )}

                          <button
                            type="button"
                            className="admin-btn-secondary"
                            style={{ padding: "4px 8px", fontSize: "0.72rem", color: "#ef4444" }}
                            onClick={() => setDeleteModalUser(u)}
                            title="Deactivate / Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div
          style={{
            padding: "12px 18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            fontSize: "0.82rem",
            color: "#94a3b8"
          }}
        >
          <span>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </span>

          <div style={{ display: "flex", gap: "6px" }}>
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => fetchUsers(pagination.page - 1)}
              className="admin-btn-secondary"
              style={{ padding: "4px 8px" }}
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchUsers(pagination.page + 1)}
              className="admin-btn-secondary"
              style={{ padding: "4px 8px" }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* User Details 6-Tab Modal */}
      {selectedUserDetails && (
        <AdminUserDetailModal
          userDetails={selectedUserDetails}
          onClose={() => setSelectedUserDetails(null)}
          onRoleChange={(u) => {
            setSelectedUserDetails(null);
            setRoleModalUser(u);
          }}
          onStatusChange={(u, targetStatus) => {
            setSelectedUserDetails(null);
            setStatusModalUser({ ...u, targetStatus });
          }}
        />
      )}

      {/* Role Change Modal */}
      {roleModalUser && (
        <div className="admin-modal-overlay" onClick={() => setRoleModalUser(null)}>
          <div className="admin-modal" style={{ maxWidth: "420px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Change User Role</h3>
              <button type="button" className="admin-modal-close" onClick={() => setRoleModalUser(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="admin-modal-body" style={{ padding: "16px 20px" }}>
              <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: "0 0 14px" }}>
                Select new role for <strong>{roleModalUser.username}</strong> ({roleModalUser.email}):
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {["user", "admin", "super_admin"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`admin-btn-secondary ${roleModalUser.role === r ? "active" : ""}`}
                    style={{
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      textTransform: "uppercase",
                      fontSize: "0.8rem",
                      fontWeight: "700"
                    }}
                    onClick={() => handleConfirmRoleChange(r)}
                    disabled={actionLoading}
                  >
                    <span>{r}</span>
                    {roleModalUser.role === r && <CheckCircle2 size={16} style={{ color: "#34d399" }} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Suspend / Activate Modal */}
      {statusModalUser && (
        <div className="admin-modal-overlay" onClick={() => setStatusModalUser(null)}>
          <div className="admin-modal" style={{ maxWidth: "440px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{statusModalUser.targetStatus === "suspended" ? "Suspend Account" : "Reactivate Account"}</h3>
              <button type="button" className="admin-modal-close" onClick={() => setStatusModalUser(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="admin-modal-body" style={{ padding: "16px 20px" }}>
              <p style={{ fontSize: "0.85rem", color: "#cbd5e1", margin: "0 0 12px" }}>
                Are you sure you want to {statusModalUser.targetStatus === "suspended" ? "suspend" : "reactivate"} user{" "}
                <strong>@{statusModalUser.username}</strong>?
              </p>

              {statusModalUser.targetStatus === "suspended" && (
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "#94a3b8", marginBottom: "6px" }}>
                    Reason for Suspension (required):
                  </label>
                  <textarea
                    rows="3"
                    value={suspendReason}
                    onChange={(e) => setSuspendReason(e.target.value)}
                    placeholder="e.g. Malicious submission flood, terms of service violation..."
                    className="admin-input"
                    style={{ width: "100%", fontSize: "0.82rem" }}
                  />
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <button type="button" className="admin-btn-secondary" onClick={() => setStatusModalUser(null)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className={statusModalUser.targetStatus === "suspended" ? "admin-btn-danger" : "admin-btn-primary"}
                  disabled={actionLoading || (statusModalUser.targetStatus === "suspended" && !suspendReason.trim())}
                  onClick={() => handleConfirmStatusChange(statusModalUser.targetStatus)}
                >
                  {actionLoading ? "Processing..." : `Confirm ${statusModalUser.targetStatus === "suspended" ? "Suspension" : "Activation"}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete / Deactivation Confirmation Modal */}
      {deleteModalUser && (
        <div className="admin-modal-overlay" onClick={() => setDeleteModalUser(null)}>
          <div className="admin-modal" style={{ maxWidth: "440px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 style={{ color: "#ef4444" }}>Deactivate Account</h3>
              <button type="button" className="admin-modal-close" onClick={() => setDeleteModalUser(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="admin-modal-body" style={{ padding: "16px 20px" }}>
              <p style={{ fontSize: "0.85rem", color: "#cbd5e1", margin: "0 0 14px" }}>
                Are you sure you want to deactivate <strong>@{deleteModalUser.username}</strong> ({deleteModalUser.email})?
                This will soft-delete the account and revoke platform access.
              </p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <button type="button" className="admin-btn-secondary" onClick={() => setDeleteModalUser(null)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="admin-btn-danger"
                  disabled={actionLoading}
                  onClick={handleConfirmDelete}
                >
                  {actionLoading ? "Deactivating..." : "Confirm Deactivation"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
