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
      <div className="empty-state submission-empty-state">
        <Code size={32} className="submission-empty-icon" />
        <strong>
          No submissions found.
        </strong>
        <span>
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
                  <td className="submission-id-cell">
                    {shortId}
                  </td>
                  <td>
                    <strong className="submission-problem-name">{problemName}</strong>
                  </td>
                  <td>
                    <span
                      className="lang-tag"
                    >
                      {languageName}
                    </span>
                  </td>
                  <td>
                    <span className={`verdict ${verdictClass[displayVerdict] || "verdict-ac"}`}>
                      {displayVerdict}
                    </span>
                  </td>
                  <td className="submission-metric-cell">{displayRuntime}</td>
                  <td className="submission-metric-cell">{displayMemory}</td>
                  <td className="submission-date-cell">{displayDate}</td>
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
                        className="submission-view-button"
                      >
                        <Eye size={14} /> View Code
                      </button>
                    ) : (
                      <span className="submission-unavailable">N/A</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedCode && (
        <div className="submission-modal-backdrop" role="presentation" onMouseDown={() => setSelectedCode(null)}>
          <div className="submission-modal" role="dialog" aria-modal="true" aria-label="Submitted code preview" onMouseDown={(event) => event.stopPropagation()}>
            <div className="submission-modal-header">
              <div>
                <strong className="submission-modal-title">
                  {selectedCode.problemName} - Code Preview
                </strong>
                <span className="submission-modal-meta">
                  Language: {selectedCode.languageName} | Verdict: {selectedCode.displayVerdict}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCode(null)}
                className="submission-modal-close"
                aria-label="Close code preview"
              >
                <X size={20} />
              </button>
            </div>
            <div className="submission-code-wrap">
              <pre className="submission-code-preview">
                <code>{selectedCode.codeText}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
