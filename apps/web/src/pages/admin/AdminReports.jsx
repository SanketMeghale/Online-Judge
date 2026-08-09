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
  Download,
  FileSpreadsheet,
  Users,
  Terminal,
  FileCode2,
  Trophy
} from "lucide-react";
import { adminApi } from "../../api/adminApiClient.js";

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [exportingType, setExportingType] = useState(null);

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

  async function handleExportCsv(type) {
    setExportingType(type);
    try {
      await adminApi.downloadReportCsv(type);
    } catch (err) {
      alert(err.message || "Failed to export report.");
    } finally {
      setExportingType(null);
    }
  }

  const exportCards = [
    { type: "users", label: "Users Dataset", desc: "User identities, roles, XP, streaks, solved counts.", icon: Users, color: "#38bdf8" },
    { type: "submissions", label: "Submissions Log", desc: "Verdicts, execution times, memory usage, timestamps.", icon: Terminal, color: "#34d399" },
    { type: "problems", label: "Problems Catalog", desc: "Catalog specifications, difficulties, acceptance rates.", icon: FileCode2, color: "#c084fc" },
    { type: "contests", label: "Contests History", desc: "Scheduled contests, start/end dates, participant counts.", icon: Trophy, color: "#fbbf24" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.35rem", fontWeight: "800", color: "#f8fafc", margin: 0 }}>
            Reports, Moderation &amp; Data Exports
          </h1>
          <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: "4px 0 0 0" }}>
            Generate structured CSV data reports and triage user-submitted bug tickets.
          </p>
        </div>

        <button type="button" onClick={fetchReports} className="admin-btn-secondary" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          <span>Refresh Reports</span>
        </button>
      </div>

      {/* CSV Export Center */}
      <div className="admin-card" style={{ padding: "18px 20px" }}>
        <h3 style={{ margin: "0 0 14px", fontSize: "0.95rem", color: "#f8fafc", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
          <FileSpreadsheet size={16} style={{ color: "#34d399" }} />
          <span>Platform Data Export Center (CSV)</span>
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
          {exportCards.map((c) => {
            const Icon = c.icon;
            const isThisExporting = exportingType === c.type;
            return (
              <div
                key={c.type}
                style={{
                  padding: "14px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "10px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "10px"
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <Icon size={16} style={{ color: c.color }} />
                    <span style={{ fontWeight: "700", color: "#f8fafc", fontSize: "0.88rem" }}>{c.label}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8", lineHeight: "1.4" }}>
                    {c.desc}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleExportCsv(c.type)}
                  disabled={isThisExporting}
                  className="admin-btn-secondary"
                  style={{ width: "100%", justifyContent: "center", fontSize: "0.76rem", gap: "6px" }}
                >
                  <Download size={13} />
                  <span>{isThisExporting ? "Exporting..." : "Download CSV"}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Community Reports Filter */}
      <div className="admin-card" style={{ padding: "14px 18px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <h3 style={{ margin: 0, fontSize: "0.92rem", color: "#f1f5f9", fontWeight: "700" }}>
          Active Community Issue Tickets ({reports.length})
        </h3>

        <div style={{ display: "flex", gap: "8px" }}>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="admin-select">
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="admin-select">
            <option value="all">All Target Types</option>
            <option value="problem">Problem Challenge</option>
            <option value="bug">Platform Bug</option>
            <option value="submission">Submission</option>
            <option value="user">User Account</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Target Item</th>
                <th>Type</th>
                <th>Reporter</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    <RefreshCw size={18} className="animate-spin" style={{ margin: "0 auto 8px" }} />
                    <div>Loading community reports...</div>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    No reports matching criteria.
                  </td>
                </tr>
              ) : (
                reports.map((r) => {
                  const id = r._id || r.id;
                  const isResolved = r.status === "resolved";
                  const isOpen = r.status === "open";
                  return (
                    <tr key={id}>
                      <td style={{ fontWeight: "600", color: "#f8fafc" }}>
                        {r.targetTitle || r.targetId || "General Issue"}
                      </td>
                      <td>
                        <span className="admin-badge badge-purple" style={{ textTransform: "capitalize" }}>
                          {r.targetType || "bug"}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                        {r.reporterEmail || r.reporterId || "Anonymous"}
                      </td>
                      <td style={{ fontSize: "0.82rem", color: "#cbd5e1" }}>
                        {r.reason}
                      </td>
                      <td>
                        <span
                          className={`admin-badge badge-${
                            isResolved ? "green" : isOpen ? "red" : "yellow"
                          }`}
                          style={{ textTransform: "capitalize" }}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          className="admin-btn-secondary"
                          style={{ padding: "4px 8px", fontSize: "0.74rem" }}
                          onClick={() => handleOpenReport(r)}
                        >
                          Review Ticket
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Report Modal */}
      {selectedReport && (
        <div className="admin-modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="admin-modal" style={{ maxWidth: "560px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Review Community Report</h3>
              <button type="button" className="admin-modal-close" onClick={() => setSelectedReport(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="admin-modal-body" style={{ padding: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.85rem" }}>
                <div>
                  <span style={{ color: "#64748b" }}>Target: </span>
                  <strong style={{ color: "#f8fafc" }}>{selectedReport.targetTitle || selectedReport.targetId}</strong>{" "}
                  ({selectedReport.targetType})
                </div>

                <div>
                  <span style={{ color: "#64748b" }}>Reason: </span>
                  <span style={{ color: "#e2e8f0" }}>{selectedReport.reason}</span>
                </div>

                {selectedReport.notes && (
                  <div style={{ padding: "10px 12px", background: "rgba(255,255,255,0.03)", borderRadius: "6px" }}>
                    <span style={{ color: "#94a3b8", display: "block", marginBottom: "4px", fontSize: "0.75rem" }}>
                      User Description:
                    </span>
                    <span style={{ color: "#cbd5e1" }}>{selectedReport.notes}</span>
                  </div>
                )}

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "#94a3b8", marginBottom: "6px" }}>
                    Admin Notes / Resolution Action:
                  </label>
                  <textarea
                    rows="3"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Enter internal notes or resolution summary..."
                    className="admin-input"
                    style={{ width: "100%", fontSize: "0.82rem" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "20px" }}>
                <button
                  type="button"
                  className="admin-btn-secondary"
                  disabled={updating}
                  onClick={() => handleUpdateStatus("rejected")}
                >
                  Reject Ticket
                </button>
                <button
                  type="button"
                  className="admin-btn-secondary"
                  style={{ color: "#fbbf24" }}
                  disabled={updating}
                  onClick={() => handleUpdateStatus("investigating")}
                >
                  Mark Investigating
                </button>
                <button
                  type="button"
                  className="admin-btn-primary"
                  disabled={updating}
                  onClick={() => handleUpdateStatus("resolved")}
                >
                  Resolve &amp; Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
