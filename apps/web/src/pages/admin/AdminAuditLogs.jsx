import React, { useState, useEffect } from "react";
import {
  History,
  Search,
  Filter,
  Shield,
  Eye,
  RefreshCw,
  X,
  Calendar,
  UserCheck,
  FileCode2,
  Settings
} from "lucide-react";
import { adminApi } from "../../api/adminApiClient.js";

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 30, total: 0, totalPages: 1 });
  const [actionFilter, setActionFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [inspectLog, setInspectLog] = useState(null);

  async function fetchLogs(page = pagination.page) {
    setIsLoading(true);
    try {
      const res = await adminApi.getAuditLogs({
        page,
        limit: pagination.limit,
        action: actionFilter,
        search
      });
      setLogs(res.logs || []);
      setPagination(res.pagination || { page: 1, limit: 30, total: 0, totalPages: 1 });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchLogs(1);
  }, [actionFilter]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#f8fafc", margin: 0 }}>Administrative Audit Trail</h1>
          <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: "4px 0 0 0" }}>Immutable chronological log of all role adjustments, problem updates, and platform security events.</p>
        </div>

        <button type="button" onClick={() => fetchLogs(pagination.page)} className="admin-btn admin-btn-secondary">
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="admin-card" style={{ padding: "14px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit descriptions, admin email, or target ID..."
            className="admin-input"
            style={{ width: "100%", paddingLeft: "34px" }}
            onKeyDown={(e) => {
              if (e.key === "Enter") fetchLogs(1);
            }}
          />
          <Search size={15} color="#64748b" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
        </div>

        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="admin-input" style={{ fontSize: "0.8rem" }}>
          <option value="all">All Actions</option>
          <option value="ADMIN_LOGIN">Admin Login</option>
          <option value="USER_ROLE_CHANGE">Role Changes</option>
          <option value="USER_SUSPEND">Account Suspensions</option>
          <option value="PROBLEM_CREATE">Problem Created</option>
          <option value="PROBLEM_UPDATE">Problem Updated</option>
          <option value="TOPIC_CREATE">Topic Created</option>
          <option value="CONTEST_CREATE">Contest Created</option>
          <option value="SETTINGS_UPDATE">Settings Changed</option>
        </select>
      </div>

      {/* Audit Logs Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Admin Operator</th>
              <th>Action</th>
              <th>Target</th>
              <th>Description</th>
              <th style={{ textAlign: "right" }}>Inspect</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                  <RefreshCw size={22} className="animate-spin" style={{ margin: "0 auto 10px" }} />
                  <span>Loading audit trail...</span>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  No audit logs recorded for this criteria.
                </td>
              </tr>
            ) : (
              logs.map((log, idx) => (
                <tr key={log._id || idx}>
                  <td>
                    <span style={{ fontSize: "0.76rem", color: "#94a3b8" }}>
                      {new Date(log.createdAt || Date.now()).toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "#cbd5e1" }}>
                      {log.adminEmail || "admin@judgo.dev"}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      fontSize: "0.7rem",
                      fontWeight: "700",
                      padding: "2px 7px",
                      borderRadius: "4px",
                      background: "rgba(168, 85, 247, 0.12)",
                      color: "#c084fc",
                      border: "1px solid rgba(168, 85, 247, 0.25)"
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.76rem", color: "#38bdf8" }}>
                      {log.targetType}: {log.targetId || "global"}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.82rem", color: "#f8fafc" }}>{log.description}</span>
                  </td>
                  <td>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        onClick={() => setInspectLog(log)}
                        className="admin-btn admin-btn-secondary"
                        style={{ padding: "4px 8px", fontSize: "0.72rem" }}
                        title="View Metadata Payload"
                      >
                        <Eye size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* INSPECT METADATA MODAL */}
      {inspectLog && (
        <div className="admin-modal-overlay" onClick={() => setInspectLog(null)}>
          <div className="admin-modal" style={{ maxWidth: "560px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#f8fafc", margin: 0 }}>
                Audit Log Payload: {inspectLog.action}
              </h3>
              <button type="button" onClick={() => setInspectLog(null)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div style={{ fontSize: "0.8rem", color: "#cbd5e1" }}>
                <div>Admin: <strong style={{ color: "#f8fafc" }}>{inspectLog.adminEmail}</strong></div>
                <div>Target: <strong style={{ color: "#38bdf8" }}>{inspectLog.targetType} ({inspectLog.targetId})</strong></div>
                <div>IP Address: <strong style={{ color: "#94a3b8" }}>{inspectLog.ipAddress || "127.0.0.1"}</strong></div>
              </div>

              <pre style={{
                background: "#080c14",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px",
                padding: "12px",
                color: "#34d399",
                fontFamily: "monospace",
                fontSize: "0.8rem",
                margin: 0
              }}>
                {JSON.stringify(inspectLog.metadata || {}, null, 2)}
              </pre>
            </div>

            <div className="admin-modal-footer">
              <button type="button" onClick={() => setInspectLog(null)} className="admin-btn admin-btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
