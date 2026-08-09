import React, { useState, useEffect } from "react";
import {
  Trophy,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  RefreshCw,
  X
} from "lucide-react";
import { adminApi } from "../../api/adminApiClient.js";

export default function AdminContests() {
  const [contests, setContests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContest, setEditingContest] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDuration, setFormDuration] = useState(90);
  const [formStartTime, setFormStartTime] = useState("");
  const [formStatus, setFormStatus] = useState("scheduled");
  const [formProblems, setFormProblems] = useState("two-sum, valid-parentheses, reverse-linked-list");

  async function fetchContests() {
    setIsLoading(true);
    try {
      const res = await adminApi.getContests();
      setContests(res.contests || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchContests();
  }, []);

  function handleOpenCreate() {
    setEditingContest(null);
    setFormTitle("");
    setFormSlug("");
    setFormDuration(90);
    setFormStartTime(new Date(Date.now() + 86400000).toISOString().slice(0, 16));
    setFormStatus("scheduled");
    setFormProblems("two-sum, valid-parentheses, reverse-linked-list");
    setIsModalOpen(true);
  }

  function handleOpenEdit(c) {
    setEditingContest(c);
    setFormTitle(c.title || "");
    setFormSlug(c.slug || c.id || "");
    setFormDuration(c.durationMinutes || 90);
    setFormStartTime(c.startTime ? new Date(c.startTime).toISOString().slice(0, 16) : "");
    setFormStatus(c.status || "scheduled");
    setFormProblems(Array.isArray(c.problemIds) ? c.problemIds.join(", ") : "two-sum, valid-parentheses");
    setIsModalOpen(true);
  }

  async function handleSaveContest(e) {
    e.preventDefault();
    if (!formTitle.trim()) return;

    setFormLoading(true);
    const payload = {
      title: formTitle.trim(),
      slug: formSlug.trim() || undefined,
      durationMinutes: parseInt(formDuration, 10) || 90,
      startTime: formStartTime ? new Date(formStartTime) : new Date(),
      status: formStatus,
      problemIds: formProblems.split(",").map((s) => s.trim()).filter(Boolean)
    };

    try {
      if (editingContest) {
        await adminApi.updateContest(editingContest.id || editingContest._id, payload);
      } else {
        await adminApi.createContest(payload);
      }
      setIsModalOpen(false);
      fetchContests();
    } catch (err) {
      alert(err.message || "Failed to save contest.");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDeleteContest(id) {
    if (!window.confirm("Delete this contest?")) return;
    try {
      await adminApi.deleteContest(id);
      fetchContests();
    } catch (err) {
      alert(err.message || "Failed to delete contest.");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#f8fafc", margin: 0 }}>Contest Operations &amp; Scheduler</h1>
          <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: "4px 0 0 0" }}>Schedule competitive rounds, set timers, and configure problem sets.</p>
        </div>

        <button type="button" onClick={handleOpenCreate} className="admin-btn admin-btn-primary">
          <Plus size={15} />
          <span>Schedule New Contest</span>
        </button>
      </div>

      {/* Contests Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
            <RefreshCw size={22} className="animate-spin" style={{ margin: "0 auto 10px" }} />
            <span>Loading scheduled rounds...</span>
          </div>
        ) : contests.length === 0 ? (
          <div className="admin-card" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
            No contests currently scheduled.
          </div>
        ) : (
          contests.map((c) => {
            const isLive = c.status === "live";
            return (
              <div key={c.id || c._id} className="admin-card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "rgba(251, 191, 36, 0.12)", border: "1px solid rgba(251, 191, 36, 0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fbbf24" }}>
                      <Trophy size={17} />
                    </div>
                    <div>
                      <strong style={{ fontSize: "0.95rem", color: "#f8fafc", display: "block" }}>{c.title}</strong>
                      <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{c.durationMinutes || 90} Minutes Duration</span>
                    </div>
                  </div>

                  <span style={{
                    fontSize: "0.7rem",
                    fontWeight: "700",
                    padding: "2px 7px",
                    borderRadius: "4px",
                    background: isLive ? "rgba(239, 68, 68, 0.15)" : "rgba(251, 191, 36, 0.15)",
                    color: isLive ? "#f87171" : "#fbbf24",
                    border: isLive ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(251, 191, 36, 0.3)"
                  }}>
                    {c.status || "scheduled"}
                  </span>
                </div>

                <div style={{ fontSize: "0.78rem", color: "#cbd5e1", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Calendar size={13} color="#94a3b8" />
                  <span>Start: {c.startTime ? new Date(c.startTime).toLocaleString() : "TBD"}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px", borderTop: "1px solid var(--admin-border)" }}>
                  <span style={{ fontSize: "0.74rem", color: "#a855f7", fontWeight: "600" }}>
                    🧩 {c.problemIds?.length || 3} Problems Assigned
                  </span>

                  <div style={{ display: "flex", gap: "6px" }}>
                    <button type="button" onClick={() => handleOpenEdit(c)} className="admin-btn admin-btn-secondary" style={{ padding: "4px 8px", fontSize: "0.72rem" }}>
                      <Edit size={12} />
                    </button>
                    <button type="button" onClick={() => handleDeleteContest(c.id || c._id)} className="admin-btn admin-btn-danger" style={{ padding: "4px 8px", fontSize: "0.72rem" }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE / EDIT CONTEST MODAL */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal" style={{ maxWidth: "560px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#f8fafc", margin: 0 }}>
                {editingContest ? `Edit Contest: ${editingContest.title}` : "Schedule Competitive Contest"}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveContest}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label className="admin-form-label">Contest Title</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Judgo Weekly Sprint #14"
                    required
                    className="admin-input"
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Duration (Minutes)</label>
                    <input
                      type="number"
                      value={formDuration}
                      onChange={(e) => setFormDuration(e.target.value)}
                      className="admin-input"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Status</label>
                    <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)} className="admin-input">
                      <option value="scheduled">Scheduled</option>
                      <option value="live">Live</option>
                      <option value="completed">Completed</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Start Time</label>
                  <input
                    type="datetime-local"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="admin-input"
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Assigned Problem Slugs (Comma-separated)</label>
                  <input
                    type="text"
                    value={formProblems}
                    onChange={(e) => setFormProblems(e.target.value)}
                    placeholder="two-sum, valid-parentheses, reverse-linked-list"
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="admin-btn admin-btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={formLoading} className="admin-btn admin-btn-primary">
                  {formLoading ? "Saving..." : editingContest ? "Update Contest" : "Schedule Round"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
