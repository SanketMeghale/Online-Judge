import { useState } from "react";
import { Code, Eye, X, Cpu, Zap, Brain, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

const verdictClass = {
  AC: "verdict-ac",
  Accepted: "verdict-ac",
  WA: "verdict-wa",
  "Wrong Answer": "verdict-wa",
  TLE: "verdict-tle",
  "Time Limit Exceeded": "verdict-tle",
  CE: "verdict-ce",
  "Compilation Error": "verdict-ce",
  RE: "verdict-ce",
  "Runtime Error": "verdict-ce"
};

export default function SubmissionTable({ rows = [] }) {
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const safeRows = Array.isArray(rows) ? rows : [];

  if (!safeRows.length) {
    return (
      <div className="empty-state submission-empty-state">
        <Code size={32} className="submission-empty-icon" />
        <strong>No submissions recorded yet.</strong>
        <span>Your verified compilation, execution, and complexity analysis will appear here when you submit code.</span>
      </div>
    );
  }

  return (
    <>
      <div className="table-shell">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Problem</th>
              <th>Language</th>
              <th>Verdict</th>
              <th>Runtime</th>
              <th>Peak Memory</th>
              <th>Complexity</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {safeRows.map((row, idx) => {
              if (!row || typeof row !== "object") return null;

              const idString = String(row.id || row.submissionId || row._id || `sub_${idx}`);
              const shortId = idString.length > 8 ? idString.slice(-6) : idString;

              const problemName =
                typeof row.problem === "string"
                  ? row.problem
                  : typeof row.problem === "object" && row.problem?.title
                  ? row.problem.title
                  : typeof row.problemTitle === "string" && row.problemTitle
                  ? row.problemTitle
                  : typeof row.problemId === "string"
                  ? row.problemId
                  : "Problem";

              const languageName = typeof row.language === "string" ? row.language : "python";

              const rawVerdict =
                typeof row.verdict === "string"
                  ? row.verdict
                  : row.status === "COMPLETED"
                  ? "AC"
                  : row.status || "PENDING";
              const displayVerdict = rawVerdict === "OK" ? "AC" : rawVerdict;

              // Distinguish real measured metrics from compilation errors
              let displayRuntime = "—";
              if (displayVerdict !== "CE" && displayVerdict !== "COMPILATION_ERROR") {
                if (typeof row.runtimeMs === "number" && row.runtimeMs > 0) {
                  displayRuntime = `${row.runtimeMs} ms`;
                } else if (typeof row.execution_time_ms === "number" && row.execution_time_ms > 0) {
                  displayRuntime = `${row.execution_time_ms} ms`;
                } else if (typeof row.runtime === "string" && row.runtime && row.runtime !== "0 ms") {
                  displayRuntime = row.runtime.includes("ms") ? row.runtime : `${row.runtime} ms`;
                }
              }

              let displayMemory = "—";
              if (displayVerdict !== "CE" && displayVerdict !== "COMPILATION_ERROR") {
                if (typeof row.memoryMb === "number" && row.memoryMb > 0) {
                  displayMemory = `${row.memoryMb} MB`;
                } else if (typeof row.memory === "string" && row.memory && row.memory !== "0 MB") {
                  displayMemory = row.memory.includes("MB") || row.memory.includes("KB") ? row.memory : `${row.memory} MB`;
                }
              }

              const timeComplexity = row.complexity?.time || "—";
              const spaceComplexity = row.complexity?.space || "—";

              const rawDate = row.submitted || row.submittedAt || row.createdAt;
              let displayDate = "Just now";
              if (rawDate) {
                try {
                  const d = new Date(rawDate);
                  if (!isNaN(d.getTime())) {
                    displayDate = d.toLocaleString();
                  }
                } catch (_) {}
              }

              const codeText = typeof row.code === "string" ? row.code : typeof row.sourceCode === "string" ? row.sourceCode : "";

              return (
                <tr key={idString || idx}>
                  <td className="submission-id-cell">{shortId}</td>
                  <td>
                    <strong className="submission-problem-name">{problemName}</strong>
                  </td>
                  <td>
                    <span className="lang-tag">{languageName}</span>
                  </td>
                  <td>
                    <span className={`verdict ${verdictClass[displayVerdict] || "verdict-ac"}`}>
                      {displayVerdict}
                    </span>
                  </td>
                  <td className="submission-metric-cell">{displayRuntime}</td>
                  <td className="submission-metric-cell">{displayMemory}</td>
                  <td className="submission-metric-cell">
                    {timeComplexity !== "—" ? (
                      <span style={{ fontSize: "0.78rem", fontWeight: "600", color: "#818cf8" }}>
                        {timeComplexity}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="submission-date-cell">{displayDate}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedSubmission({
                          id: idString,
                          problemName,
                          languageName,
                          displayVerdict,
                          displayRuntime,
                          displayMemory,
                          compiler: row.compiler,
                          execution: row.execution,
                          complexity: row.complexity,
                          diagnostic: row.diagnostic || row.compileOutput || row.stderr,
                          codeText
                        })
                      }
                      className="submission-view-button"
                    >
                      <Eye size={14} /> Telemetry
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Structured Details Modal */}
      {selectedSubmission && (
        <div className="submission-modal-backdrop" role="presentation" onMouseDown={() => setSelectedSubmission(null)}>
          <div
            className="submission-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Submission Telemetry & Code"
            onMouseDown={(event) => event.stopPropagation()}
            style={{ maxWidth: "780px" }}
          >
            <div className="submission-modal-header">
              <div>
                <strong className="submission-modal-title">
                  {selectedSubmission.problemName} — Evaluation Telemetry
                </strong>
                <span className="submission-modal-meta">
                  Language: <strong style={{ textTransform: "capitalize" }}>{selectedSubmission.languageName}</strong> • Verdict: <strong style={{ color: selectedSubmission.displayVerdict === "AC" ? "#4ade80" : "#f87171" }}>{selectedSubmission.displayVerdict}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="submission-modal-close"
                aria-label="Close telemetry preview"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "14px", maxHeight: "75vh", overflowY: "auto" }}>
              {/* 3 Structured Telemetry Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                {/* 1. Compilation Card */}
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                    <Cpu size={14} color="#818cf8" />
                    <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: "bold", textTransform: "uppercase" }}>Compilation</span>
                  </div>
                  <strong style={{ display: "block", fontSize: "0.88rem", color: selectedSubmission.displayVerdict === "CE" ? "#f87171" : "#4ade80" }}>
                    {selectedSubmission.displayVerdict === "CE" ? "✕ Failed" : "✓ Successful"}
                  </strong>
                  <span style={{ fontSize: "0.74rem", color: "#64748b", display: "block", marginTop: "2px" }}>
                    {selectedSubmission.compiler?.name ? `${selectedSubmission.compiler.name} ${selectedSubmission.compiler.version || ""}` : selectedSubmission.languageName}
                  </span>
                  {selectedSubmission.compiler?.timeMs > 0 && (
                    <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Duration: {selectedSubmission.compiler.timeMs} ms</span>
                  )}
                </div>

                {/* 2. Execution Metrics Card */}
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                    <Zap size={14} color="#38bdf8" />
                    <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: "bold", textTransform: "uppercase" }}>Execution</span>
                  </div>
                  <strong style={{ display: "block", fontSize: "0.88rem", color: selectedSubmission.displayVerdict === "AC" ? "#4ade80" : selectedSubmission.displayVerdict === "CE" ? "#64748b" : "#f87171" }}>
                    {selectedSubmission.displayVerdict === "CE" ? "Not Executed" : selectedSubmission.displayVerdict === "AC" ? "✓ Accepted" : selectedSubmission.displayVerdict}
                  </strong>
                  <span style={{ fontSize: "0.74rem", color: "#cbd5e1", display: "block", marginTop: "2px" }}>
                    Runtime: {selectedSubmission.displayRuntime}
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Peak Memory: {selectedSubmission.displayMemory}</span>
                </div>

                {/* 3. Algorithm Complexity Card */}
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                    <Brain size={14} color="#c084fc" />
                    <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: "bold", textTransform: "uppercase" }}>Algorithm Analysis</span>
                  </div>
                  <strong style={{ display: "block", fontSize: "0.88rem", color: "#c084fc" }}>
                    Time: {selectedSubmission.complexity?.time || "Unable to determine reliably"}
                  </strong>
                  <span style={{ fontSize: "0.74rem", color: "#cbd5e1", display: "block", marginTop: "2px" }}>
                    Space: {selectedSubmission.complexity?.space || "Unable to determine reliably"}
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Confidence: {selectedSubmission.complexity?.confidence || "Unavailable"}</span>
                </div>
              </div>

              {/* Diagnostic Error Box if compilation failed */}
              {selectedSubmission.displayVerdict === "CE" && selectedSubmission.diagnostic && (
                <div style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "8px", padding: "10px 14px", color: "#fca5a5", fontSize: "0.82rem" }}>
                  <strong style={{ color: "#ef4444" }}>Compiler Diagnostics:</strong>
                  <pre style={{ margin: "6px 0 0 0", fontFamily: "monospace", fontSize: "0.8rem", whiteSpace: "pre-wrap", color: "#fca5a5" }}>
                    {selectedSubmission.diagnostic}
                  </pre>
                </div>
              )}

              {/* Structural Complexity Explanation */}
              {selectedSubmission.complexity?.explanation && (
                <div style={{ background: "rgba(120, 80, 255, 0.06)", border: "1px solid rgba(120, 80, 255, 0.2)", borderRadius: "8px", padding: "10px 14px", fontSize: "0.82rem", color: "#cbd5e1" }}>
                  <strong style={{ color: "#c084fc" }}>Structural Complexity Analysis:</strong>
                  <p style={{ margin: "4px 0 0 0", lineHeight: "1.5" }}>{selectedSubmission.complexity.explanation}</p>
                </div>
              )}

              {/* Submitted Code Preview */}
              <div>
                <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: "bold", marginBottom: "6px", display: "block" }}>Submitted Source Code:</span>
                <div className="submission-code-wrap">
                  <pre className="submission-code-preview">
                    <code>{selectedSubmission.codeText || "// No code available"}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
