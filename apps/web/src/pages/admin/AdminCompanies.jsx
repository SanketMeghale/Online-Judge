import React, { useState, useEffect, useMemo } from "react";
import {
  Building2,
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Layers,
  FileCode2,
  CheckCircle2,
  X,
  Star,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { api } from "../../api/apiClient.js";
import { CompanyLogo } from "../../components/company/CompanyLogos.jsx";
import "../../styles/admin/adminLayout.css";

const CATEGORIES = ["FAANG", "Product Based", "Service Based", "Indian Product Companies", "Startups"];
const DIFFICULTIES = ["Easy", "Easy-Medium", "Medium", "Medium-Hard", "Hard"];

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category: "Product Based",
    difficulty: "Medium-Hard",
    description: "",
    tier: "Tier 1",
    frequentTopics: ""
  });

  // Problem Mapping Modal
  const [showProblemsModal, setShowProblemsModal] = useState(false);
  const [selectedCompanyForProblems, setSelectedCompanyForProblems] = useState(null);
  const [newProblemMapping, setNewProblemMapping] = useState({
    problemId: "",
    frequency: 5,
    interviewTags: "Technical Round",
    source: "Onsite Interview",
    year: "2025-2026"
  });

  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Fetch Companies
  const loadCompanies = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.adminGetCompanies();
      if (res && res.success) {
        setCompanies(res.companies || []);
      }
    } catch (e) {
      setErrorMsg(e.message || "Failed to load companies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  // Filtered List
  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === "all" || c.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [companies, search, categoryFilter]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingCompany(null);
    setFormData({
      name: "",
      slug: "",
      category: "Product Based",
      difficulty: "Medium-Hard",
      description: "",
      tier: "Tier 1",
      frequentTopics: "Arrays, Strings, Dynamic Programming"
    });
    setShowEditModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (comp) => {
    setEditingCompany(comp);
    setFormData({
      name: comp.name,
      slug: comp.slug || comp.id,
      category: comp.category || "Product Based",
      difficulty: comp.difficulty || "Medium-Hard",
      description: comp.description || "",
      tier: comp.tier || "Tier 1",
      frequentTopics: (comp.frequentTopics || []).join(", ")
    });
    setShowEditModal(true);
  };

  // Save Company (Create / Update)
  const handleSaveCompany = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const payload = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        category: formData.category,
        difficulty: formData.difficulty,
        description: formData.description,
        tier: formData.tier,
        frequentTopics: formData.frequentTopics
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      };

      if (editingCompany) {
        await api.adminUpdateCompany(editingCompany.id, payload);
        setSuccessMsg(`Company '${payload.name}' updated successfully.`);
      } else {
        await api.adminCreateCompany(payload);
        setSuccessMsg(`Company '${payload.name}' created successfully.`);
      }

      setShowEditModal(false);
      await loadCompanies();
    } catch (err) {
      setErrorMsg(err.message || "Failed to save company.");
    }
  };

  // Delete Company
  const handleDeleteCompany = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete '${name}' from Company Sheets?`)) return;
    try {
      await api.adminDeleteCompany(id);
      setSuccessMsg(`Company '${name}' deleted.`);
      await loadCompanies();
    } catch (err) {
      setErrorMsg(err.message || "Failed to delete company.");
    }
  };

  // Open Problem Management Modal
  const handleOpenProblems = (comp) => {
    setSelectedCompanyForProblems(comp);
    setNewProblemMapping({
      problemId: "",
      frequency: 5,
      interviewTags: "Technical Round",
      source: "Onsite Interview",
      year: "2025-2026"
    });
    setShowProblemsModal(true);
  };

  // Add Problem to Company
  const handleAddProblem = async (e) => {
    e.preventDefault();
    if (!selectedCompanyForProblems || !newProblemMapping.problemId.trim()) return;

    try {
      const payload = {
        problemId: newProblemMapping.problemId.trim().toLowerCase(),
        frequency: Number(newProblemMapping.frequency) || 5,
        interviewTags: newProblemMapping.interviewTags.split(",").map((t) => t.trim()).filter(Boolean),
        source: newProblemMapping.source,
        year: newProblemMapping.year
      };

      const res = await api.adminAddCompanyProblem(selectedCompanyForProblems.id, payload);
      if (res && res.company) {
        setSelectedCompanyForProblems(res.company);
      }
      setSuccessMsg(`Problem '${payload.problemId}' added to ${selectedCompanyForProblems.name}.`);
      setNewProblemMapping({
        problemId: "",
        frequency: 5,
        interviewTags: "Technical Round",
        source: "Onsite Interview",
        year: "2025-2026"
      });
      await loadCompanies();
    } catch (err) {
      setErrorMsg(err.message || "Failed to add problem.");
    }
  };

  // Remove Problem from Company
  const handleRemoveProblem = async (problemId) => {
    if (!selectedCompanyForProblems) return;
    try {
      const res = await api.adminRemoveCompanyProblem(selectedCompanyForProblems.id, problemId);
      if (res && res.company) {
        setSelectedCompanyForProblems(res.company);
      }
      setSuccessMsg(`Problem '${problemId}' removed.`);
      await loadCompanies();
    } catch (err) {
      setErrorMsg(err.message || "Failed to remove problem.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "800", margin: 0, color: "#f8fafc", display: "flex", alignItems: "center", gap: "10px" }}>
            <Building2 size={24} color="#a855f7" />
            Company Sheets Management
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "0.88rem" }}>
            Manage company preparation sheets, interview problem mappings, frequency weights, and topic tags.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={loadCompanies}
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={handleOpenCreate}
          >
            <Plus size={15} />
            <span>Add New Company</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#fca5a5", padding: "12px 16px", borderRadius: "10px", fontSize: "0.88rem" }}>
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div style={{ background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#86efac", padding: "12px 16px", borderRadius: "10px", fontSize: "0.88rem" }}>
          {successMsg}
        </div>
      )}

      {/* Search & Filter Bar */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", background: "rgba(30, 41, 59, 0.4)", padding: "14px 18px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "8px 12px", flex: 1, minWidth: "240px" }}>
          <Search size={15} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search companies by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ background: "transparent", border: "none", color: "#f8fafc", fontSize: "0.86rem", width: "100%", outline: "none" }}
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#cbd5e1", borderRadius: "8px", padding: "8px 12px", fontSize: "0.86rem", outline: "none" }}
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Companies Table */}
      <div style={{ background: "rgba(30, 41, 59, 0.3)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "14px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
          <thead>
            <tr style={{ background: "rgba(15, 23, 42, 0.7)", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "#94a3b8", fontSize: "0.78rem", textTransform: "uppercase" }}>
              <th style={{ padding: "12px 18px" }}>Company</th>
              <th style={{ padding: "12px 18px" }}>Category</th>
              <th style={{ padding: "12px 18px" }}>Difficulty</th>
              <th style={{ padding: "12px 18px" }}>Problems</th>
              <th style={{ padding: "12px 18px" }}>Frequent Topics</th>
              <th style={{ padding: "12px 18px", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.map((comp) => (
              <tr key={comp.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)", color: "#cbd5e1" }}>
                <td style={{ padding: "14px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <CompanyLogo name={comp.name} size={28} />
                    <div>
                      <strong style={{ color: "#f8fafc" }}>{comp.name}</strong>
                      <span style={{ display: "block", fontSize: "0.75rem", color: "#64748b" }}>
                        slug: /{comp.slug || comp.id}
                      </span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <span style={{ fontSize: "0.76rem", background: "rgba(255, 255, 255, 0.05)", padding: "3px 8px", borderRadius: "4px" }}>
                    {comp.category}
                  </span>
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <span className={`company-diff-badge ${comp.difficulty?.toLowerCase().replace(/\s+/g, "-")}`}>
                    {comp.difficulty}
                  </span>
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <button
                    type="button"
                    onClick={() => handleOpenProblems(comp)}
                    style={{
                      background: "rgba(124, 58, 237, 0.15)",
                      border: "1px solid rgba(124, 58, 237, 0.3)",
                      color: "#c084fc",
                      borderRadius: "6px",
                      padding: "4px 10px",
                      fontSize: "0.78rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px"
                    }}
                  >
                    <FileCode2 size={13} />
                    <span>{comp.problems?.length || 0} Problems (Manage)</span>
                  </button>
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                    {(comp.frequentTopics || []).slice(0, 3).map((t, idx) => (
                      <span key={idx} style={{ fontSize: "0.7rem", background: "rgba(255, 255, 255, 0.04)", padding: "2px 6px", borderRadius: "4px" }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </td>
                <td style={{ padding: "14px 18px", textAlign: "right" }}>
                  <div style={{ display: "inline-flex", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(comp)}
                      style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#cbd5e1", borderRadius: "6px", padding: "6px", cursor: "pointer" }}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCompany(comp.id, comp.name)}
                      style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#f87171", borderRadius: "6px", padding: "6px", cursor: "pointer" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit / Create Company Modal */}
      {showEditModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "#0f172a", border: "1px solid rgba(255, 255, 255, 0.12)", borderRadius: "16px", padding: "24px", width: "100%", maxWidth: "540px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, color: "#f8fafc", fontSize: "1.2rem" }}>
                {editingCompany ? `Edit ${editingCompany.name}` : "Create Company Sheet"}
              </h3>
              <button type="button" onClick={() => setShowEditModal(false)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCompany} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "4px" }}>Company Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: "100%", background: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "8px 12px", color: "#f8fafc" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "4px" }}>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: "100%", background: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "8px 12px", color: "#f8fafc" }}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "4px" }}>Difficulty Tier</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    style={{ width: "100%", background: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "8px 12px", color: "#f8fafc" }}
                  >
                    {DIFFICULTIES.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "4px" }}>Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: "100%", background: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "8px 12px", color: "#f8fafc", resize: "none" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "4px" }}>Frequent Topics (comma-separated)</label>
                <input
                  type="text"
                  value={formData.frequentTopics}
                  onChange={(e) => setFormData({ ...formData, frequentTopics: e.target.value })}
                  placeholder="Arrays, Dynamic Programming, Graphs"
                  style={{ width: "100%", background: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "8px 12px", color: "#f8fafc" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{ background: "transparent", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#cbd5e1", borderRadius: "8px", padding: "8px 16px", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: "#7c3aed", border: "none", color: "#ffffff", borderRadius: "8px", padding: "8px 20px", fontWeight: "700", cursor: "pointer" }}
                >
                  Save Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Problem Mapping Modal */}
      {showProblemsModal && selectedCompanyForProblems && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "#0f172a", border: "1px solid rgba(255, 255, 255, 0.12)", borderRadius: "16px", padding: "24px", width: "100%", maxWidth: "680px", maxHeight: "85vh", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CompanyLogo name={selectedCompanyForProblems.name} size={28} />
                <h3 style={{ margin: 0, color: "#f8fafc", fontSize: "1.15rem" }}>
                  {selectedCompanyForProblems.name} - Mapped Interview Problems ({selectedCompanyForProblems.problems?.length || 0})
                </h3>
              </div>
              <button type="button" onClick={() => setShowProblemsModal(false)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            {/* Add Problem Form */}
            <form onSubmit={handleAddProblem} style={{ display: "flex", gap: "10px", flexWrap: "wrap", background: "rgba(30, 41, 59, 0.5)", padding: "12px", borderRadius: "10px" }}>
              <input
                type="text"
                required
                placeholder="Problem ID (e.g. two-sum)"
                value={newProblemMapping.problemId}
                onChange={(e) => setNewProblemMapping({ ...newProblemMapping, problemId: e.target.value })}
                style={{ flex: "1 1 160px", background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "6px", padding: "6px 10px", color: "#f8fafc", fontSize: "0.82rem" }}
              />

              <select
                value={newProblemMapping.frequency}
                onChange={(e) => setNewProblemMapping({ ...newProblemMapping, frequency: Number(e.target.value) })}
                style={{ background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#cbd5e1", borderRadius: "6px", padding: "6px 10px", fontSize: "0.82rem" }}
              >
                <option value={5}>★★★★★ (5/5 Freq)</option>
                <option value={4}>★★★★☆ (4/5 Freq)</option>
                <option value={3}>★★★☆☆ (3/5 Freq)</option>
              </select>

              <input
                type="text"
                placeholder="Tags (e.g. Phone Screen, Onsite)"
                value={newProblemMapping.interviewTags}
                onChange={(e) => setNewProblemMapping({ ...newProblemMapping, interviewTags: e.target.value })}
                style={{ flex: "1 1 140px", background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "6px", padding: "6px 10px", color: "#f8fafc", fontSize: "0.82rem" }}
              />

              <button
                type="submit"
                style={{ background: "#7c3aed", border: "none", color: "#ffffff", borderRadius: "6px", padding: "6px 14px", fontWeight: "700", cursor: "pointer", fontSize: "0.82rem" }}
              >
                Add Problem
              </button>
            </form>

            {/* List of current mapped problems */}
            <div style={{ overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
              {(selectedCompanyForProblems.problems || []).map((p, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    borderRadius: "8px",
                    padding: "8px 12px"
                  }}
                >
                  <div>
                    <strong style={{ color: "#f8fafc", fontSize: "0.88rem" }}>{p.problemId}</strong>
                    <div style={{ display: "flex", gap: "8px", fontSize: "0.74rem", color: "#94a3b8", marginTop: "2px" }}>
                      <span style={{ color: "#fbbf24" }}>★ {p.frequency || 5}/5</span>
                      <span>{(p.interviewTags || []).join(", ")}</span>
                      <span>{p.source}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveProblem(p.problemId)}
                    style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer", padding: "4px" }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
