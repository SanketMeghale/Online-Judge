import React, { useState, useEffect } from "react";
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  X,
  Search,
  BookOpen
} from "lucide-react";
import { adminApi } from "../../api/adminApiClient.js";

export default function AdminTopics() {
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formCategory, setFormCategory] = useState("Data Structures");
  const [formDifficulty, setFormDifficulty] = useState("Medium");
  const [formIcon, setFormIcon] = useState("Layers");
  const [formDescription, setFormDescription] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);

  async function fetchTopics() {
    setIsLoading(true);
    try {
      const res = await adminApi.getTopics();
      setTopics(res.topics || []);
    } catch (err) {
      console.error("[AdminTopics fetch error]:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchTopics();
  }, []);

  function handleOpenCreate() {
    setEditingTopic(null);
    setFormName("");
    setFormSlug("");
    setFormCategory("Data Structures");
    setFormDifficulty("Medium");
    setFormIcon("Layers");
    setFormDescription("");
    setFormIsActive(true);
    setIsModalOpen(true);
  }

  function handleOpenEdit(topic) {
    setEditingTopic(topic);
    setFormName(topic.name || "");
    setFormSlug(topic.slug || topic.id || "");
    setFormCategory(topic.category || "Data Structures");
    setFormDifficulty(topic.difficulty || "Medium");
    setFormIcon(topic.icon || "Layers");
    setFormDescription(topic.description || "");
    setFormIsActive(typeof topic.isActive === "boolean" ? topic.isActive : true);
    setIsModalOpen(true);
  }

  async function handleSaveTopic(e) {
    e.preventDefault();
    if (!formName.trim()) return;

    setFormLoading(true);
    const payload = {
      name: formName.trim(),
      slug: formSlug.trim() || undefined,
      category: formCategory,
      difficulty: formDifficulty,
      icon: formIcon,
      description: formDescription,
      isActive: formIsActive
    };

    try {
      if (editingTopic) {
        await adminApi.updateTopic(editingTopic.id || editingTopic._id, payload);
      } else {
        await adminApi.createTopic(payload);
      }
      setIsModalOpen(false);
      fetchTopics();
    } catch (err) {
      alert(err.message || "Failed to save topic.");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleToggleActive(topic) {
    const id = topic.id || topic._id;
    try {
      await adminApi.updateTopic(id, { isActive: !topic.isActive });
      fetchTopics();
    } catch (err) {
      alert(err.message || "Failed to toggle topic status.");
    }
  }

  async function handleDeleteTopic(topic) {
    const id = topic.id || topic._id;
    if (topic.problemCount > 0) {
      if (!window.confirm(`Warning: ${topic.problemCount} problems currently reference '${topic.name}'. Are you sure you want to delete this topic?`)) return;
    } else {
      if (!window.confirm(`Delete topic '${topic.name}'?`)) return;
    }

    try {
      await adminApi.deleteTopic(id);
      fetchTopics();
    } catch (err) {
      alert(err.message || "Failed to delete topic.");
    }
  }

  const filteredTopics = topics.filter((t) =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#f8fafc", margin: 0 }}>DSA Topic Mastery Registry</h1>
          <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: "4px 0 0 0" }}>Single source of truth driving Practice catalog, Progress tracking, and the DSA Skill Tree.</p>
        </div>

        <button type="button" onClick={handleOpenCreate} className="admin-btn admin-btn-primary">
          <Plus size={15} />
          <span>Add Algorithmic Topic</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="admin-card" style={{ padding: "14px", display: "flex", gap: "12px", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topics by name or category..."
            className="admin-input"
            style={{ width: "100%", paddingLeft: "34px" }}
          />
          <Search size={15} color="#64748b" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
        </div>
      </div>

      {/* Topics Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
        {isLoading ? (
          <div style={{ colSpan: "all", textAlign: "center", padding: "40px", color: "#94a3b8" }}>
            <RefreshCw size={22} className="animate-spin" style={{ margin: "0 auto 10px" }} />
            <span>Loading topic hierarchy...</span>
          </div>
        ) : filteredTopics.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>No topics found.</div>
        ) : (
          filteredTopics.map((t) => (
            <div key={t.id || t._id} className="admin-card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "rgba(168, 85, 247, 0.12)", border: "1px solid rgba(168, 85, 247, 0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "#c084fc" }}>
                    <Layers size={17} />
                  </div>
                  <div>
                    <strong style={{ fontSize: "0.95rem", color: "#f8fafc", display: "block" }}>{t.name}</strong>
                    <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{t.category}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleActive(t)}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    alignItems: "center"
                  }}
                  title={t.isActive ? "Active in Practice & Skill Tree" : "Inactive / Hidden"}
                >
                  {t.isActive ? (
                    <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "#34d399", background: "rgba(16,185,129,0.1)", padding: "2px 6px", borderRadius: "4px" }}>
                      Active
                    </span>
                  ) : (
                    <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "#f87171", background: "rgba(239,68,68,0.1)", padding: "2px 6px", borderRadius: "4px" }}>
                      Disabled
                    </span>
                  )}
                </button>
              </div>

              <p style={{ fontSize: "0.78rem", color: "#cbd5e1", margin: 0, lineHeight: "1.4", minHeight: "34px" }}>
                {t.description || "Core algorithmic track for pattern mastery."}
              </p>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px", borderTop: "1px solid var(--admin-border)" }}>
                <span style={{ fontSize: "0.75rem", color: "#a855f7", fontWeight: "600" }}>
                  📚 {t.problemCount || 0} Problems in Catalog
                </span>

                <div style={{ display: "flex", gap: "6px" }}>
                  <button type="button" onClick={() => handleOpenEdit(t)} className="admin-btn admin-btn-secondary" style={{ padding: "4px 8px", fontSize: "0.72rem" }}>
                    <Edit size={12} />
                  </button>
                  <button type="button" onClick={() => handleDeleteTopic(t)} className="admin-btn admin-btn-danger" style={{ padding: "4px 8px", fontSize: "0.72rem" }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE / EDIT TOPIC MODAL */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal" style={{ maxWidth: "520px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#f8fafc", margin: 0 }}>
                {editingTopic ? `Edit Topic: ${editingTopic.name}` : "Create Algorithmic Topic"}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTopic}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label className="admin-form-label">Topic Name</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Dynamic Programming"
                    required
                    className="admin-input"
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Category</label>
                    <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="admin-input">
                      <option value="Data Structures">Data Structures</option>
                      <option value="Algorithms">Algorithms</option>
                      <option value="Techniques">Techniques</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Default Difficulty</label>
                    <select value={formDifficulty} onChange={(e) => setFormDifficulty(e.target.value)} className="admin-input">
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Description</label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Brief summary of concepts and techniques covered..."
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="admin-btn admin-btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={formLoading} className="admin-btn admin-btn-primary">
                  {formLoading ? "Saving..." : editingTopic ? "Update Topic" : "Save Topic"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
