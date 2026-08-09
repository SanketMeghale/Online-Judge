import React, { useState } from "react";
import {
  X,
  User,
  Terminal,
  FileCode2,
  Trophy,
  TrendingUp,
  Activity,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Zap,
  Shield,
  Bot
} from "lucide-react";

export default function AdminUserDetailModal({ userDetails, onClose, onRoleChange, onStatusChange }) {
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "submissions" | "problems" | "progress" | "contests" | "activity"
  const [viewingCodeSub, setViewingCodeSub] = useState(null);

  if (!userDetails || !userDetails.user) return null;

  const {
    user,
    submissions = [],
    solvedProblems = [],
    attemptedProblems = [],
    topicBreakdown = {},
    contestHistory = [],
    aiSessions = [],
    solvedCount = 0,
    attemptedCount = 0
  } = userDetails;

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "submissions", label: `Submissions (${submissions.length})`, icon: Terminal },
    { id: "problems", label: `Problems (${solvedCount})`, icon: FileCode2 },
    { id: "progress", label: "Topic Progress", icon: TrendingUp },
    { id: "contests", label: `Contests (${contestHistory.length})`, icon: Trophy },
    { id: "activity", label: "Activity & AI", icon: Activity }
  ];

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div
        className="admin-modal"
        style={{ maxWidth: "840px", width: "95vw", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="admin-modal-header" style={{ padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(56,189,248,0.2))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(124,58,237,0.4)"
              }}
            >
              <User size={22} style={{ color: "#c084fc" }} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "700", color: "#f8fafc" }}>
                  {user.displayName || user.name || "User"}
                </h3>
                <span
                  className={`admin-badge badge-${user.role === "super_admin" ? "purple" : user.role === "admin" ? "blue" : "gray"}`}
                  style={{ textTransform: "uppercase", fontSize: "0.65rem" }}
                >
                  {user.role}
                </span>
                <span
                  className={`admin-badge badge-${user.status === "suspended" ? "red" : "green"}`}
                  style={{ textTransform: "uppercase", fontSize: "0.65rem" }}
                >
                  {user.status}
                </span>
              </div>
              <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#94a3b8" }}>
                @{user.username} • {user.email} • ID: {user.id}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="admin-modal-close">
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 18px", overflowX: "auto" }}>
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "12px 14px",
                  background: "none",
                  border: "none",
                  borderBottom: isActive ? "2px solid #818cf8" : "2px solid transparent",
                  color: isActive ? "#f8fafc" : "#94a3b8",
                  fontSize: "0.82rem",
                  fontWeight: isActive ? "700" : "500",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease"
                }}
              >
                <Icon size={14} style={{ color: isActive ? "#818cf8" : undefined }} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Quick Metrics Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
                <div className="admin-card" style={{ padding: "14px", background: "rgba(255,255,255,0.02)" }}>
                  <span style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase" }}>Total XP</span>
                  <div style={{ fontSize: "1.3rem", fontWeight: "800", color: "#fbbf24", marginTop: "4px" }}>
                    {user.xp || 0} XP
                  </div>
                </div>

                <div className="admin-card" style={{ padding: "14px", background: "rgba(255,255,255,0.02)" }}>
                  <span style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase" }}>Problems Solved</span>
                  <div style={{ fontSize: "1.3rem", fontWeight: "800", color: "#34d399", marginTop: "4px" }}>
                    {solvedCount}
                  </div>
                </div>

                <div className="admin-card" style={{ padding: "14px", background: "rgba(255,255,255,0.02)" }}>
                  <span style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase" }}>Current Streak</span>
                  <div style={{ fontSize: "1.3rem", fontWeight: "800", color: "#f97316", marginTop: "4px" }}>
                    🔥 {user.streak || 0}d <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>(Best: {user.bestStreak || 0}d)</span>
                  </div>
                </div>

                <div className="admin-card" style={{ padding: "14px", background: "rgba(255,255,255,0.02)" }}>
                  <span style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase" }}>Contest Rank</span>
                  <div style={{ fontSize: "1.3rem", fontWeight: "800", color: "#38bdf8", marginTop: "4px" }}>
                    #{user.ranking || 999}
                  </div>
                </div>
              </div>

              {/* Profile Details List */}
              <div className="admin-card" style={{ padding: "18px" }}>
                <h4 style={{ margin: "0 0 14px", fontSize: "0.92rem", color: "#f1f5f9", fontWeight: "700" }}>Account Specifications</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "0.82rem" }}>
                  <div>
                    <span style={{ color: "#64748b" }}>Provider: </span>
                    <span style={{ color: "#e2e8f0", fontWeight: "600" }}>{user.provider || "password"}</span>
                  </div>
                  <div>
                    <span style={{ color: "#64748b" }}>Timezone: </span>
                    <span style={{ color: "#e2e8f0" }}>{user.timezone || "UTC"}</span>
                  </div>
                  <div>
                    <span style={{ color: "#64748b" }}>Registered: </span>
                    <span style={{ color: "#e2e8f0" }}>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "#64748b" }}>Last Active Date: </span>
                    <span style={{ color: "#e2e8f0" }}>{user.lastActiveDate || "Today"}</span>
                  </div>
                  {user.suspendedReason && (
                    <div style={{ gridColumn: "1 / -1", background: "rgba(239, 68, 68, 0.1)", padding: "8px 12px", borderRadius: "6px", border: "1px solid rgba(239,68,68,0.2)" }}>
                      <span style={{ color: "#ef4444", fontWeight: "700" }}>Suspension Reason: </span>
                      <span style={{ color: "#fca5a5" }}>{user.suspendedReason}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SUBMISSIONS */}
          {activeTab === "submissions" && (
            <div>
              {submissions.length === 0 ? (
                <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>No submission records found for this user.</div>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Problem</th>
                        <th>Language</th>
                        <th>Verdict</th>
                        <th>Runtime</th>
                        <th>Memory</th>
                        <th>Date</th>
                        <th>Code</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((s) => {
                        const isAc = ["Accepted", "ACCEPTED", "AC"].includes(s.status || s.verdict);
                        return (
                          <tr key={s.id || s._id}>
                            <td style={{ fontWeight: "600", color: "#f8fafc" }}>{s.problemId}</td>
                            <td><span className="admin-badge badge-blue">{s.language}</span></td>
                            <td>
                              <span className={`admin-badge badge-${isAc ? "green" : "red"}`}>
                                {s.status || s.verdict}
                              </span>
                            </td>
                            <td>{s.runtimeMs || s.executionTimeMs || 0}ms</td>
                            <td>{s.memoryMb || s.memoryUsedMb || 14}MB</td>
                            <td style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                              {s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : "N/A"}
                            </td>
                            <td>
                              <button
                                type="button"
                                className="admin-btn-secondary"
                                style={{ padding: "3px 7px", fontSize: "0.7rem" }}
                                onClick={() => setViewingCodeSub(s)}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROBLEMS */}
          {activeTab === "problems" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <h4 style={{ margin: "0 0 10px", fontSize: "0.88rem", color: "#34d399", fontWeight: "700" }}>
                  ✓ Solved Problems ({solvedProblems.length})
                </h4>
                {solvedProblems.length === 0 ? (
                  <p style={{ color: "#64748b", fontSize: "0.8rem" }}>No problems solved yet.</p>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "8px" }}>
                    {solvedProblems.map((p) => (
                      <div key={p.id} className="admin-card" style={{ padding: "10px 12px" }}>
                        <div style={{ fontWeight: "600", color: "#f1f5f9", fontSize: "0.82rem" }}>{p.title || p.id}</div>
                        <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                          <span className={`admin-badge badge-${p.difficulty === "Easy" ? "green" : p.difficulty === "Medium" ? "yellow" : "red"}`} style={{ fontSize: "0.62rem" }}>
                            {p.difficulty}
                          </span>
                          <span className="admin-badge badge-gray" style={{ fontSize: "0.62rem" }}>{p.topic}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {attemptedProblems.length > 0 && (
                <div>
                  <h4 style={{ margin: "14px 0 10px", fontSize: "0.88rem", color: "#fbbf24", fontWeight: "700" }}>
                    ● Attempted But Not Yet Solved ({attemptedProblems.length})
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "8px" }}>
                    {attemptedProblems.map((p) => (
                      <div key={p.id} className="admin-card" style={{ padding: "10px 12px", borderColor: "rgba(251, 191, 36, 0.2)" }}>
                        <div style={{ fontWeight: "600", color: "#f1f5f9", fontSize: "0.82rem" }}>{p.title || p.id}</div>
                        <span className="admin-badge badge-yellow" style={{ fontSize: "0.62rem", marginTop: "4px" }}>{p.difficulty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PROGRESS */}
          {activeTab === "progress" && (
            <div>
              <h4 style={{ margin: "0 0 14px", fontSize: "0.9rem", color: "#f8fafc", fontWeight: "700" }}>Topic Proficiency Breakdown</h4>
              {Object.keys(topicBreakdown).length === 0 ? (
                <p style={{ color: "#64748b", fontSize: "0.82rem" }}>No topic data recorded yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {Object.entries(topicBreakdown).map(([topicName, count]) => (
                    <div key={topicName} className="admin-card" style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ fontWeight: "600", color: "#f1f5f9", fontSize: "0.85rem" }}>{topicName}</span>
                        <span style={{ color: "#34d399", fontWeight: "700", fontSize: "0.85rem" }}>{count} Solved</span>
                      </div>
                      <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "999px", overflow: "hidden" }}>
                        <div style={{ width: `${Math.min(100, count * 20)}%`, height: "100%", background: "linear-gradient(90deg, #6366f1, #38bdf8)" }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: CONTESTS */}
          {activeTab === "contests" && (
            <div>
              {contestHistory.length === 0 ? (
                <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>User has not participated in any contests.</div>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Contest</th>
                        <th>Score</th>
                        <th>Solved</th>
                        <th>Penalty</th>
                        <th>Registered Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contestHistory.map((c) => (
                        <tr key={c._id || c.id}>
                          <td style={{ fontWeight: "600", color: "#f8fafc" }}>{c.contestTitle || c.contestId}</td>
                          <td style={{ color: "#fbbf24", fontWeight: "700" }}>{c.score || 0}</td>
                          <td>{c.solvedCount || 0}</td>
                          <td>{c.penaltyTime || 0}m</td>
                          <td style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                            {c.registeredAt ? new Date(c.registeredAt).toLocaleDateString() : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: ACTIVITY & AI */}
          {activeTab === "activity" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="admin-card" style={{ padding: "16px" }}>
                <h4 style={{ margin: "0 0 10px", fontSize: "0.88rem", color: "#f8fafc", fontWeight: "700" }}>
                  <Bot size={15} style={{ display: "inline", marginRight: "6px", color: "#c084fc" }} />
                  AI Coach Conversation Sessions ({aiSessions.length})
                </h4>
                {aiSessions.length === 0 ? (
                  <p style={{ color: "#64748b", fontSize: "0.8rem", margin: 0 }}>No AI conversation logs for this user.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {aiSessions.map((s, idx) => (
                      <div key={idx} style={{ padding: "8px 12px", background: "rgba(255,255,255,0.02)", borderRadius: "6px", fontSize: "0.8rem" }}>
                        <span style={{ color: "#c084fc", fontWeight: "600" }}>{s.topic || s.mode || "Coding Mentor"}: </span>
                        <span style={{ color: "#94a3b8" }}>{s.lastMessage || `${s.messages?.length || 0} messages`}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="admin-card" style={{ padding: "16px" }}>
                <h4 style={{ margin: "0 0 10px", fontSize: "0.88rem", color: "#f8fafc", fontWeight: "700" }}>
                  <Calendar size={15} style={{ display: "inline", marginRight: "6px", color: "#38bdf8" }} />
                  Recorded Active Dates ({user.activeDates?.length || 0})
                </h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {(user.activeDates || []).map((dateKey, i) => (
                    <span key={i} className="admin-badge badge-gray" style={{ fontSize: "0.7rem" }}>
                      {dateKey}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="admin-modal-footer" style={{ padding: "14px 24px", display: "flex", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            {user.status === "active" ? (
              <button
                type="button"
                className="admin-btn-danger"
                style={{ fontSize: "0.78rem" }}
                onClick={() => onStatusChange(user, "suspended")}
              >
                Suspend Account
              </button>
            ) : (
              <button
                type="button"
                className="admin-btn-primary"
                style={{ fontSize: "0.78rem", background: "#10b981" }}
                onClick={() => onStatusChange(user, "active")}
              >
                Reactivate Account
              </button>
            )}

            <button
              type="button"
              className="admin-btn-secondary"
              style={{ fontSize: "0.78rem" }}
              onClick={() => onRoleChange(user)}
            >
              Change Role ({user.role})
            </button>
          </div>

          <button type="button" className="admin-btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      {/* Code Inspector Sub-Modal */}
      {viewingCodeSub && (
        <div className="admin-modal-overlay" style={{ zIndex: 1100 }} onClick={() => setViewingCodeSub(null)}>
          <div
            className="admin-modal"
            style={{ maxWidth: "680px", width: "90vw" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3>Submission Source Code ({viewingCodeSub.language})</h3>
              <button type="button" className="admin-modal-close" onClick={() => setViewingCodeSub(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="admin-modal-body" style={{ padding: "16px" }}>
              <pre
                style={{
                  background: "#030712",
                  color: "#38bdf8",
                  padding: "14px",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  fontFamily: "monospace",
                  overflowX: "auto",
                  maxHeight: "400px"
                }}
              >
                {viewingCodeSub.code || viewingCodeSub.sourceCode || "// No code captured"}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
