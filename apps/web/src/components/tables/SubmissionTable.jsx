import { useState } from "react";
import { Code, Eye, X } from "lucide-react";

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
  const [selectedCode, setSelectedCode] = useState(null);

  const safeRows = Array.isArray(rows) ? rows : [];

  if (!safeRows.length) {
    return (
      <div className="empty-state" style={{ padding: "40px 20px", textAlign: "center" }}>
        <Code size={32} style={{ color: "#7850ff", marginBottom: "12px" }} />
        <strong style={{ display: "block", fontSize: "1.1rem", marginBottom: "6px", color: "#f8fafc" }}>
          No submissions found.
        </strong>
        <span style={{ color: "#8b949e" }}>
          Your accepted and failed attempts will appear here when you submit code.
        </span>
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
              <th>Memory</th>
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
                  : "Two Sum";

              const languageName =
                typeof row.language === "string" ? row.language : "python";

              const rawVerdict =
                typeof row.verdict === "string"
                  ? row.verdict
                  : row.status === "COMPLETED"
                  ? "AC"
                  : "PENDING";
              const displayVerdict = rawVerdict === "OK" ? "AC" : rawVerdict;

              let displayRuntime = "15 ms";
              if (typeof row.runtime === "string" && row.runtime) {
                displayRuntime = row.runtime.includes("ms") ? row.runtime : `${row.runtime} ms`;
              } else if (typeof row.runtimeMs === "number" || typeof row.runtimeMs === "string") {
                displayRuntime = `${row.runtimeMs} ms`;
              }

              let displayMemory = "14.2 MB";
              if (typeof row.memory === "string" && row.memory) {
                displayMemory = row.memory.includes("MB") || row.memory.includes("KB") ? row.memory : `${row.memory} MB`;
              } else if (typeof row.memoryMb === "number" || typeof row.memoryMb === "string") {
                displayMemory = `${row.memoryMb} MB`;
              }

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

              const codeText = typeof row.code === "string" ? row.code : "";

              return (
                <tr key={idString || idx}>
                  <td style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "#8b949e" }}>
                    {shortId}
                  </td>
                  <td>
                    <strong style={{ color: "#e6edf3" }}>{problemName}</strong>
                  </td>
                  <td>
                    <span
                      className="lang-tag"
                      style={{
                        textTransform: "capitalize",
                        background: "rgba(255, 255, 255, 0.05)",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "0.85rem"
                      }}
                    >
                      {languageName}
                    </span>
                  </td>
                  <td>
                    <span className={`verdict ${verdictClass[displayVerdict] || "verdict-ac"}`}>
                      {displayVerdict}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.88rem", color: "#a8b3d6" }}>{displayRuntime}</td>
                  <td style={{ fontSize: "0.88rem", color: "#a8b3d6" }}>{displayMemory}</td>
                  <td style={{ fontSize: "0.85rem", color: "#8b949e" }}>{displayDate}</td>
                  <td>
                    {codeText ? (
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedCode({
                            problemName,
                            languageName,
                            displayVerdict,
                            codeText
                          })
                        }
                        style={{
                          background: "rgba(120, 80, 255, 0.15)",
                          color: "#7850ff",
                          border: "1px solid rgba(120, 80, 255, 0.3)",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "0.82rem"
                        }}
                      >
                        <Eye size={14} /> View Code
                      </button>
                    ) : (
                      <span style={{ color: "#555", fontSize: "0.82rem" }}>N/A</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedCode && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "700px",
              background: "#121620",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 20px 50px rgba(0,0,0,0.8)"
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                background: "#181d28",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <div>
                <strong style={{ color: "#fff", fontSize: "1.05rem", display: "block" }}>
                  {selectedCode.problemName} - Code Preview
                </strong>
                <span style={{ color: "#8b949e", fontSize: "0.82rem" }}>
                  Language: {selectedCode.languageName} | Verdict: {selectedCode.displayVerdict}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCode(null)}
                style={{ background: "none", border: "none", color: "#8b949e", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: "20px", maxHeight: "450px", overflowY: "auto" }}>
              <pre
                style={{
                  margin: 0,
                  fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
                  fontSize: "0.9rem",
                  color: "#38bdf8",
                  background: "#0a0c12",
                  padding: "16px",
                  borderRadius: "8px",
                  overflowX: "auto"
                }}
              >
                <code>{selectedCode.codeText}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
