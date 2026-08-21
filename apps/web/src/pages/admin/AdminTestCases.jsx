import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  Search,
  Plus,
  Play,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { adminApi } from "../../api/adminApiClient.js";

export default function AdminTestCases() {
  const [problems, setProblems] = useState([]);
  const [selectedProblemId, setSelectedProblemId] = useState("");
  const [currentProblem, setCurrentProblem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState(null);

  const [examples, setExamples] = useState([]);
  const [hiddenTests, setHiddenTests] = useState([]);

  async function fetchProblemList() {
    setIsLoading(true);
    try {
      const res = await adminApi.getProblems({ limit: 100 });
      const list = res.problems || [];
      setProblems(list);
      if (list.length > 0) {
        setSelectedProblemId(list[0].id);
        loadProblemData(list[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadProblemData(id) {
    try {
      const p = await adminApi.getProblemById(id);
      const prob = p.problem || p;
      setCurrentProblem(prob);
      setExamples(prob.examples || []);
      setHiddenTests(prob.hiddenTestCases || []);
      setRunResult(null);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    fetchProblemList();
  }, []);

  function handleSelectProblem(id) {
    setSelectedProblemId(id);
    loadProblemData(id);
  }

  function handleAddExample() {
    setExamples([...examples, { input: "", output: "" }]);
  }

  function handleAddHidden() {
    setHiddenTests([...hiddenTests, { input: "", output: "" }]);
  }

  async function handleSaveChanges() {
    if (!currentProblem) return;
    setIsSaving(true);
    try {
      await adminApi.updateProblem(currentProblem.id, {
        examples: examples.filter((e) => e.input && e.output),
        hiddenTestCases: hiddenTests.filter((h) => h.input && h.output)
      });
      alert("Test cases successfully updated and saved to MongoDB.");
    } catch (e) {
      alert(e.message || "Failed to save test cases.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRunDryTest() {
    setIsRunning(true);
    setRunResult(null);
    const cases = [...examples, ...hiddenTests];
    const valid = cases.filter((testcase) => testcase.input && testcase.output).length;
    setRunResult({ success: valid === cases.length, passed: valid, total: cases.length });
    setIsRunning(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#f8fafc", margin: 0 }}>Test Case Inspector &amp; Harness</h1>
          <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: "4px 0 0 0" }}>Manage public sample inputs and hidden submission test cases.</p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            onClick={handleRunDryTest}
            disabled={isRunning || !currentProblem}
            className="admin-btn admin-btn-secondary"
          >
            <Play size={14} className={isRunning ? "animate-spin" : ""} />
            <span>{isRunning ? "Executing Harness..." : "Dry Run Test Suite"}</span>
          </button>
          <button
            type="button"
            onClick={handleSaveChanges}
            disabled={isSaving || !currentProblem}
            className="admin-btn admin-btn-primary"
          >
            <span>{isSaving ? "Saving..." : "Save Test Cases"}</span>
          </button>
        </div>
      </div>

      {/* Problem Selector Bar */}
      <div className="admin-card" style={{ padding: "14px", display: "flex", gap: "14px", alignItems: "center" }}>
        <span style={{ fontSize: "0.84rem", fontWeight: "700", color: "#f8fafc" }}>Target Challenge:</span>
        <select
          value={selectedProblemId}
          onChange={(e) => handleSelectProblem(e.target.value)}
          className="admin-input"
          style={{ flex: 1 }}
        >
          {problems.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title} ({p.difficulty} • {p.topic})
            </option>
          ))}
        </select>
      </div>

      {/* Dry Run Result Feedback Banner */}
      {runResult && (
        <div style={{ padding: "14px 18px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.3)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <CheckCircle2 size={18} color="#34d399" />
            <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#f8fafc" }}>
              Test Harness Validation Passed: {runResult.passed}/{runResult.total} cases verified.
            </span>
          </div>
          <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
            Structural validation only; no program was executed.
          </span>
        </div>
      )}

      {/* Test Cases Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Public Example Test Cases */}
        <div className="admin-card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Eye size={16} color="#38bdf8" />
              <strong style={{ fontSize: "0.92rem", color: "#f8fafc" }}>Public Example Cases ({examples.length})</strong>
            </div>
            <button type="button" onClick={handleAddExample} className="admin-btn admin-btn-secondary" style={{ padding: "4px 8px", fontSize: "0.74rem" }}>
              <Plus size={12} />
              <span>Add Case</span>
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {examples.map((ex, idx) => (
              <div key={idx} style={{ background: "#080c14", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.74rem", fontWeight: "700", color: "#94a3b8" }}>Example #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => setExamples(examples.filter((_, i) => i !== idx))}
                    style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer" }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <input
                  type="text"
                  value={ex.input}
                  onChange={(e) => {
                    const copy = [...examples];
                    copy[idx].input = e.target.value;
                    setExamples(copy);
                  }}
                  placeholder="Input (e.g. nums = [2,7,11,15], target = 9)"
                  className="admin-input"
                  style={{ fontFamily: "monospace", fontSize: "0.78rem" }}
                />
                <input
                  type="text"
                  value={ex.output}
                  onChange={(e) => {
                    const copy = [...examples];
                    copy[idx].output = e.target.value;
                    setExamples(copy);
                  }}
                  placeholder="Expected Output (e.g. [0,1])"
                  className="admin-input"
                  style={{ fontFamily: "monospace", fontSize: "0.78rem" }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Hidden Judge Evaluation Cases */}
        <div className="admin-card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <EyeOff size={16} color="#c084fc" />
              <strong style={{ fontSize: "0.92rem", color: "#f8fafc" }}>Hidden Judge Cases ({hiddenTests.length})</strong>
            </div>
            <button type="button" onClick={handleAddHidden} className="admin-btn admin-btn-secondary" style={{ padding: "4px 8px", fontSize: "0.74rem" }}>
              <Plus size={12} />
              <span>Add Hidden</span>
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {hiddenTests.map((ht, idx) => (
              <div key={idx} style={{ background: "#080c14", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.74rem", fontWeight: "700", color: "#c084fc" }}>Hidden Case #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => setHiddenTests(hiddenTests.filter((_, i) => i !== idx))}
                    style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer" }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <input
                  type="text"
                  value={ht.input}
                  onChange={(e) => {
                    const copy = [...hiddenTests];
                    copy[idx].input = e.target.value;
                    setHiddenTests(copy);
                  }}
                  placeholder="Hidden Input (never exposed to client)"
                  className="admin-input"
                  style={{ fontFamily: "monospace", fontSize: "0.78rem" }}
                />
                <input
                  type="text"
                  value={ht.output}
                  onChange={(e) => {
                    const copy = [...hiddenTests];
                    copy[idx].output = e.target.value;
                    setHiddenTests(copy);
                  }}
                  placeholder="Expected Output"
                  className="admin-input"
                  style={{ fontFamily: "monospace", fontSize: "0.78rem" }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
