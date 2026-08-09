import React, { useState, useEffect } from "react";
import {
  Flag,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  X,
  MessageSquare
} from "lucide-react";
import { adminApi } from "../../api/adminApiClient.js";

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const [selectedReport, setSelectedReport] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  async function fetchReports() {
    setIsLoading(true);
    try {
      const res = await adminApi.getReports({
        status: statusFilter,
        targetType: typeFilter
      });
      setReports(res.reports || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchReports();
  }, [statusFilter, typeFilter]);

  function handleOpenReport(r) {
    setSelectedReport(r);
    setAdminNotes(r.adminNotes || "");
  }

  async function handleUpdateStatus(newStatus) {
    if (!selectedReport) return;
    setUpdating(true);
    try {
      await adminApi.updateReportStatus(selectedReport._id || selectedReport.id, {
        status: newStatus,
        adminNotes
      });
      setSelectedReport(null);
      fetchReports();
    } catch (err) {
      alert(err.message || "Failed to update report.");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#f8fafc", margin: 0 }}>Community Reports &amp; Moderation</h1>
          <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: "4px 0 0 0" }}>Review user-submitted test case bugs, problem corrections, and platform reports.</p>
        </div>

        <button type="button" onClick={fetchReports} className="admin-btn admin-btn-secondary">
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          <span>Refresh Reports</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="admin-card" style={{ padding: "14px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="admin-input" style={{ fontSize: "0.8rem" }}>
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="investigating">Investigating</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="admin-input" style={{ fontSize: "0.8rem" }}>
          <option value="all">All Target Types</option>
          <option value="problem">Problem Challenge</option>
          <option value="bug">Platform Bug</option>
          <option value="submission">Submission Evaluation</option>
          <option value="user">User Account</option>
        </select>
      </div>

      {/* Reports Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Target / Title</th>
              <th>Type</th>
              <th>Reason</th>
              <th>Reporter</th>
              <th>Status</th>
              <th>Date</th>
              <th style={{ textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                  <RefreshCw size={22} className="animate-spin" style={{ margin: "0 auto 10px" }} />
                  <span>Loading moderation queue...</span>
                </td>
              </tr>
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  No reports currently pending resolution.
                </td>
              </tr>
            ) : (
              reports.map((r) => {
                const isOpen = r.status === "open";
                const isResolved = r.status === "resolved";
                return (
                  <tr key={r._id || r.id}>
                    <td>
                      <strong style={{ color: "#f8fafc", fontSize: "0.88rem" }}>{r.targetTitle || r.targetId}</strong>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.75rem", color: "#c084fc", textTransform: "uppercase", fontWeight: "700" }}>
                        {r.targetType}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.82rem", color: "#cbd5e1" }}>{r.reason}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>{r.reporterEmail || r.reporterId}</span>
                    </td>
                    <td>
                      <span style={{
                        fontSize: "0.72rem",
                        fontWeight: "700",
                        padding: "2px 7px",
                        borderRadius: "4px",
                        background: isOpen ? "rgba(239, 68, 68, 0.12)" : isResolved ? "rgba(16, 185, 129, 0.12)" : "rgba(251, 191, 36, 0.12)",
                        color: isOpen ? "#f87171" : isResolved ? "#34d399" : "#fbbf24"
                      }}>
                        {r.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.74rem", color: "#64748b" }}>
                        {new Date(r.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          onClick={() => handleOpenReport(r)}
                          className="admin-btn admin-btn-secondary"
                          style={{ padding: "5px 10px", fontSize: "0.74rem" }}
                        >
                          Resolve
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

      {/* RESOLVE REPORT MODAL */}
      {selectedReport && (
        <div className="admin-modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="admin-modal" style={{ maxWidth: "540px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#f8fafc", margin: 0 }}>
                Moderation Action: {selectedReport.targetTitle || selectedReport.targetId}
              </h3>
              <button type="button" onClick={() => setSelectedReport(null)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div style={{ background: "#080c14", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "0.76rem", color: "#94a3b8" }}>Reporter Complaint:</span>
                <strong style={{ fontSize: "0.85rem", color: "#f8fafc" }}>{selectedReport.reason}</strong>
                <p style={{ fontSize: "0.8rem", color: "#cbd5e1", margin: "4px 0 0 0" }}>{selectedReport.notes || "No additional comments."}</p>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Administrator Investigation Notes</label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record resolution actions, test case adjustments, or dismissal reasons..."
                  className="admin-input"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleUpdateStatus("investigating")}
                  className="admin-btn admin-btn-secondary"
                  style={{ padding: "8px" }}
                >
                  Mark Investigating
                </button>
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleUpdateStatus("rejected")}
                  className="admin-btn admin-btn-danger"
                  style={{ padding: "8px" }}
                >
                  Dismiss / Reject
                </button>
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleUpdateStatus("resolved")}
                  className="admin-btn admin-btn-primary"
                  style={{ padding: "8px" }}
                >
                  Mark Resolved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
