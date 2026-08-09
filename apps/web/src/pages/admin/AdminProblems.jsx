import React, { useState, useEffect } from "react";
import {
  FileCode2,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  Archive,
  RefreshCw,
  X,
  PlusCircle,
  Play,
  FileText
} from "lucide-react";
import { adminApi } from "../../api/adminApiClient.js";

export default function AdminProblems() {
  const [problems, setProblems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // Editor modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formId, setFormId] = useState("");
  const [formDifficulty, setFormDifficulty] = useState("Easy");
  const [formTopic, setFormTopic] = useState("Arrays");
  const [formStatus, setFormStatus] = useState("published");
  const [formStatement, setFormStatement] = useState("");
  const [formConstraints, setFormConstraints] = useState("1 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9");
  const [formExamples, setFormExamples] = useState([
    { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" }
  ]);
  const [formHiddenTests, setFormHiddenTests] = useState([
    { input: "nums = [3,3], target = 6", output: "[0,1]" }
  ]);
  const [formStarterPy, setFormStarterPy] = useState("class Solution:\n    def solve(self, nums: list[int]) -> int:\n        pass");
  const [formStarterJs, setFormStarterJs] = useState("function solve(nums) {\n    // Implementation\n}");
  const [formStarterCpp, setFormStarterCpp] = useState("class Solution {\npublic:\n    int solve(vector<int>& nums) {\n        return 0;\n    }\n};");

  async function fetchProblems(page = pagination.page) {
    setIsLoading(true);
    try {
      const res = await adminApi.getProblems({
        page,
        limit: pagination.limit,
        search,
        difficulty: diffFilter,
        topic: topicFilter,
        status: statusFilter
      });
      setProblems(res.problems || []);
      setPagination(res.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
    } catch (err) {
      console.error("[AdminProblems fetch error]:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchProblems(1);
  }, [diffFilter, topicFilter, statusFilter]);

  function handleOpenCreate() {
    setEditingProblem(null);
    setFormTitle("");
    setFormId("");
    setFormDifficulty("Easy");
    setFormTopic("Arrays");
    setFormStatus("published");
    setFormStatement("Given an array of integers `nums`, find the optimal solution.");
    setFormConstraints("1 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9");
    setFormExamples([{ input: "nums = [2,7,11,15], target = 9", output: "[0,1]" }]);
    setFormHiddenTests([{ input: "nums = [3,3], target = 6", output: "[0,1]" }]);
    setFormStarterPy("class Solution:\n    def solve(self, nums: list[int]) -> int:\n        pass");
    setFormStarterJs("function solve(nums) {\n    // Write your code\n}");
    setFormStarterCpp("class Solution {\npublic:\n    int solve(vector<int>& nums) {\n        return 0;\n    }\n};");
    setIsModalOpen(true);
  }

  function handleOpenEdit(problem) {
    setEditingProblem(problem);
    setFormTitle(problem.title || "");
    setFormId(problem.id || "");
    setFormDifficulty(problem.difficulty || "Easy");
    setFormTopic(problem.topic || "Arrays");
    setFormStatus(problem.status || "published");
    setFormStatement(problem.statement || "");
    setFormConstraints(Array.isArray(problem.constraints) ? problem.constraints.join("\n") : (problem.constraints || ""));
    setFormExamples(problem.examples?.length > 0 ? problem.examples : [{ input: "", output: "" }]);
    setFormHiddenTests(problem.hiddenTestCases?.length > 0 ? problem.hiddenTestCases : [{ input: "", output: "" }]);
    setFormStarterPy(problem.starterCode?.python || "");
    setFormStarterJs(problem.starterCode?.javascript || "");
    setFormStarterCpp(problem.starterCode?.cpp || "");
    setIsModalOpen(true);
  }

  async function handleSaveProblem(e) {
    e.preventDefault();
    if (!formTitle.trim() || !formStatement.trim()) return;

    setFormLoading(true);
    const payload = {
      title: formTitle.trim(),
      id: formId.trim() || undefined,
      difficulty: formDifficulty,
      topic: formTopic,
      status: formStatus,
      statement: formStatement,
      constraints: formConstraints.split("\n").filter((c) => c.trim()),
      examples: formExamples.filter((ex) => ex.input && ex.output),
      hiddenTestCases: formHiddenTests.filter((ex) => ex.input && ex.output),
      starterCode: {
        python: formStarterPy,
        javascript: formStarterJs,
        cpp: formStarterCpp
      }
    };

    try {
      if (editingProblem) {
        await adminApi.updateProblem(editingProblem.id, payload);
      } else {
        await adminApi.createProblem(payload);
      }
      setIsModalOpen(false);
      fetchProblems(pagination.page);
    } catch (err) {
      alert(err.message || "Failed to save problem.");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDeleteProblem(id) {
    if (!window.confirm(`Are you sure you want to permanently delete problem '${id}'?`)) return;
    try {
      await adminApi.deleteProblem(id);
      fetchProblems(pagination.page);
    } catch (err) {
      alert(err.message || "Failed to delete problem.");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#f8fafc", margin: 0 }}>Coding Challenges Catalog</h1>
          <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: "4px 0 0 0" }}>Create, publish, edit constraints, and manage algorithm test cases.</p>
        </div>

        <button type="button" onClick={handleOpenCreate} className="admin-btn admin-btn-primary">
          <Plus size={15} />
          <span>New Problem Challenge</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="admin-card" style={{ padding: "14px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems by title, topic, or slug..."
            className="admin-input"
            style={{ width: "100%", paddingLeft: "34px" }}
            onKeyDown={(e) => {
              if (e.key === "Enter") fetchProblems(1);
            }}
          />
          <Search size={15} color="#64748b" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
        </div>

        <select value={diffFilter} onChange={(e) => setDiffFilter(e.target.value)} className="admin-input" style={{ fontSize: "0.8rem" }}>
          <option value="all">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="admin-input" style={{ fontSize: "0.8rem" }}>
          <option value="all">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Problems Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Problem</th>
              <th>Topic</th>
              <th>Difficulty</th>
              <th>Status</th>
              <th>Submissions</th>
              <th>Acceptance</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                  <RefreshCw size={22} className="animate-spin" style={{ margin: "0 auto 10px" }} />
                  <p style={{ margin: 0 }}>Loading problems collection...</p>
                </td>
              </tr>
            ) : problems.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  No problems found matching criteria.
                </td>
              </tr>
            ) : (
              problems.map((p) => {
                const isDraft = p.status === "draft";
                const isArchived = p.status === "archived";
                return (
                  <tr key={p.id || p._id}>
                    <td>
                      <div>
                        <strong style={{ color: "#f8fafc", fontSize: "0.9rem" }}>{p.title}</strong>
                        <div style={{ fontSize: "0.72rem", color: "#64748b" }}>slug: {p.id}</div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.8rem", color: "#c084fc", fontWeight: "600" }}>{p.topic}</span>
                    </td>
                    <td>
                      <span style={{
                        fontSize: "0.72rem",
                        fontWeight: "700",
                        padding: "2px 7px",
                        borderRadius: "4px",
                        background: p.difficulty === "Easy" ? "rgba(52, 211, 153, 0.1)" : p.difficulty === "Hard" ? "rgba(239, 68, 68, 0.1)" : "rgba(251, 191, 36, 0.1)",
                        color: p.difficulty === "Easy" ? "#34d399" : p.difficulty === "Hard" ? "#ef4444" : "#fbbf24"
                      }}>
                        {p.difficulty}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontSize: "0.72rem",
                        fontWeight: "700",
                        padding: "2px 7px",
                        borderRadius: "4px",
                        background: isDraft ? "rgba(251, 191, 36, 0.1)" : isArchived ? "rgba(100, 116, 139, 0.1)" : "rgba(16, 185, 129, 0.1)",
                        color: isDraft ? "#fbbf24" : isArchived ? "#94a3b8" : "#34d399"
                      }}>
                        {p.status || "published"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.82rem", color: "#cbd5e1" }}>{p.submissions || 0}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.82rem", color: "#34d399", fontWeight: "700" }}>{p.acceptance || 50}%</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(p)}
                          className="admin-btn admin-btn-secondary"
                          style={{ padding: "5px 8px", fontSize: "0.74rem" }}
                          title="Edit Specification"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProblem(p.id)}
                          className="admin-btn admin-btn-danger"
                          style={{ padding: "5px 8px", fontSize: "0.74rem" }}
                          title="Delete Challenge"
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

      {/* CREATE / EDIT PROBLEM MODAL */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal" style={{ maxWidth: "780px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#f8fafc", margin: 0 }}>
                {editingProblem ? `Edit Problem: ${editingProblem.title}` : "Create New Algorithmic Challenge"}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProblem}>
              <div className="admin-modal-body">
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "12px" }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Problem Title</label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g. Reverse Linked List II"
                      required
                      className="admin-input"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Difficulty</label>
                    <select value={formDifficulty} onChange={(e) => setFormDifficulty(e.target.value)} className="admin-input">
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Status</label>
                    <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)} className="admin-input">
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Algorithmic Topic</label>
                    <input
                      type="text"
                      value={formTopic}
                      onChange={(e) => setFormTopic(e.target.value)}
                      placeholder="e.g. Dynamic Programming"
                      required
                      className="admin-input"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Custom Slug (Optional)</label>
                    <input
                      type="text"
                      value={formId}
                      onChange={(e) => setFormId(e.target.value)}
                      placeholder="e.g. reverse-linked-list-ii"
                      className="admin-input"
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Problem Statement (Markdown Supported)</label>
                  <textarea
                    rows={4}
                    value={formStatement}
                    onChange={(e) => setFormStatement(e.target.value)}
                    placeholder="Describe the algorithmic challenge..."
                    required
                    className="admin-input"
                    style={{ fontFamily: "monospace", fontSize: "0.82rem", lineHeight: "1.4" }}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Constraints (One per line)</label>
                  <textarea
                    rows={2}
                    value={formConstraints}
                    onChange={(e) => setFormConstraints(e.target.value)}
                    placeholder="1 <= nums.length <= 10^4"
                    className="admin-input"
                    style={{ fontFamily: "monospace", fontSize: "0.82rem" }}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Starter Code (Python 3)</label>
                  <textarea
                    rows={3}
                    value={formStarterPy}
                    onChange={(e) => setFormStarterPy(e.target.value)}
                    className="admin-input"
                    style={{ fontFamily: "monospace", fontSize: "0.82rem", color: "#38bdf8" }}
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="admin-btn admin-btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={formLoading} className="admin-btn admin-btn-primary">
                  {formLoading ? "Saving..." : editingProblem ? "Update Problem" : "Publish Challenge"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
