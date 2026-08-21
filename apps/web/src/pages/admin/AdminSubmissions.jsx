import React, { useState, useEffect } from "react";
import {
  Terminal,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Code2,
  RefreshCw,
  X,
  Copy,
  Check
} from "lucide-react";
import { adminApi } from "../../api/adminApiClient.js";

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });
  const [verdictFilter, setVerdictFilter] = useState("all");
  const [langFilter, setLangFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [inspectModalSub, setInspectModalSub] = useState(null);
  const [copied, setCopied] = useState(false);

  async function fetchSubmissions(page = pagination.page) {
    setIsLoading(true);
    try {
      const res = await adminApi.getSubmissions({
        page,
        limit: pagination.limit,
        verdict: verdictFilter,
        language: langFilter,
        search
      });
      setSubmissions(res.submissions || []);
      setPagination(res.pagination || { page: 1, limit: 25, total: 0, totalPages: 1 });
    } catch (e) {
      console.error("[AdminSubmissions error]:", e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchSubmissions(1);
  }, [verdictFilter, langFilter]);

  function handleCopyCode(code) {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#f8fafc", margin: 0 }}>Submission Traffic &amp; Diagnostics</h1>
          <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: "4px 0 0 0" }}>Inspect submitted developer solutions, evaluation times, and runtime logs.</p>
        </div>

        <button type="button" onClick={() => fetchSubmissions(pagination.page)} className="admin-btn admin-btn-secondary">
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="admin-card" style={{ padding: "14px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by problem ID, user, or submission ID..."
            className="admin-input"
            style={{ width: "100%", paddingLeft: "34px" }}
            onKeyDown={(e) => {
              if (e.key === "Enter") fetchSubmissions(1);
            }}
          />
          <Search size={15} color="#64748b" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
        </div>

        <select value={verdictFilter} onChange={(e) => setVerdictFilter(e.target.value)} className="admin-input" style={{ fontSize: "0.8rem" }}>
          <option value="all">All Verdicts</option>
          <option value="ACCEPTED">Accepted (AC)</option>
          <option value="WRONG_ANSWER">Wrong Answer (WA)</option>
          <option value="TIME_LIMIT_EXCEEDED">Time Limit Exceeded (TLE)</option>
          <option value="RUNTIME_ERROR">Runtime Error (RE)</option>
        </select>

        <select value={langFilter} onChange={(e) => setLangFilter(e.target.value)} className="admin-input" style={{ fontSize: "0.8rem" }}>
          <option value="all">All Languages</option>
          <option value="python">Python 3</option>
          <option value="javascript">JavaScript</option>
          <option value="cpp">C++ 20</option>
          <option value="java">Java</option>
        </select>
      </div>

      {/* Submissions Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Problem</th>
              <th>User</th>
              <th>Language</th>
              <th>Verdict</th>
              <th>Runtime</th>
              <th>Memory</th>
              <th>Timestamp</th>
              <th style={{ textAlign: "right" }}>Code</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                  <RefreshCw size={22} className="animate-spin" style={{ margin: "0 auto 10px" }} />
                  <span>Loading submissions stream...</span>
                </td>
              </tr>
            ) : submissions.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  No submissions matching the filters.
                </td>
              </tr>
            ) : (
              submissions.map((s, idx) => {
                const isAc = s.verdict === "ACCEPTED" || s.verdict === "AC";
                return (
                  <tr key={s.id || s._id || idx}>
                    <td>
                      <strong style={{ color: "#f8fafc", fontSize: "0.88rem" }}>{s.problemId || "Two Sum"}</strong>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{s.userId || "coder"}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.75rem", color: "#c084fc", textTransform: "uppercase", fontWeight: "700" }}>
                        {s.language || "py"}
                      </span>
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
                        <span>{s.verdict || "PENDING"}</span>
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.8rem", color: "#cbd5e1" }}>{s.runtimeMs || 0} ms</span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.8rem", color: "#cbd5e1" }}>{s.memoryMb > 0 ? `${s.memoryMb} MB` : "—"}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.74rem", color: "#64748b" }}>
                        {new Date(s.submittedAt || s.createdAt || Date.now()).toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          onClick={() => setInspectModalSub(s)}
                          className="admin-btn admin-btn-secondary"
                          style={{ padding: "5px 8px", fontSize: "0.74rem" }}
                          title="Inspect Source Code"
                        >
                          <Eye size={13} />
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

      {/* CODE INSPECT MODAL */}
      {inspectModalSub && (
        <div className="admin-modal-overlay" onClick={() => setInspectModalSub(null)}>
          <div className="admin-modal" style={{ maxWidth: "720px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Code2 size={18} color="#c084fc" />
                <h3 style={{ fontSize: "1rem", fontWeight: "800", color: "#f8fafc", margin: 0 }}>
                  Submission Inspector ({inspectModalSub.problemId})
                </h3>
              </div>
              <button type="button" onClick={() => setInspectModalSub(null)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#080c14", padding: "10px 14px", borderRadius: "8px" }}>
                <div style={{ display: "flex", gap: "12px", fontSize: "0.8rem" }}>
                  <span>User: <strong style={{ color: "#f8fafc" }}>{inspectModalSub.userId}</strong></span>
                  <span>Verdict: <strong style={{ color: inspectModalSub.verdict === "AC" || inspectModalSub.verdict === "ACCEPTED" ? "#34d399" : "#f87171" }}>{inspectModalSub.verdict}</strong></span>
                  <span>Lang: <strong style={{ color: "#c084fc" }}>{inspectModalSub.language}</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCode(inspectModalSub.code || "")}
                  className="admin-btn admin-btn-secondary"
                  style={{ padding: "4px 8px", fontSize: "0.72rem" }}
                >
                  {copied ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>

              <pre style={{
                background: "#080c14",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px",
                padding: "14px",
                color: "#38bdf8",
                fontFamily: "monospace",
                fontSize: "0.82rem",
                lineHeight: "1.4",
                maxHeight: "340px",
                overflowY: "auto",
                margin: 0
              }}>
                {inspectModalSub.code || "// No code attached to this submission payload"}
              </pre>
            </div>

            <div className="admin-modal-footer">
              <button type="button" onClick={() => setInspectModalSub(null)} className="admin-btn admin-btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
