import { useState } from "react";
import { Code, X } from "lucide-react";

const verdictClass = {
  AC: "verdict-ac",
  WA: "verdict-wa",
  TLE: "verdict-tle",
  CE: "verdict-ce",
  RE: "verdict-ce"
};

const verdictLabel = {
  AC: "Accepted",
  WA: "Wrong Answer",
  TLE: "Time Limit Exceeded",
  CE: "Compilation Error",
  RE: "Runtime Error"
};

export default function SubmissionTable({ rows }) {
  const [selectedCode, setSelectedCode] = useState(null);

  if (!rows || !rows.length) {
    return (
      <div className="empty-state" style={{ padding: "40px 20px", textAlign: "center", background: "#11151c", borderRadius: "12px" }}>
        <strong style={{ color: "#fff", display: "block", fontSize: "1.1rem" }}>No submissions found.</strong>
        <span style={{ color: "#8b949e", marginTop: "4px" }}>No attempts match your filter criteria or you have not submitted code yet.</span>
      </div>
    );
  }

  return (
    <>
      <div className="table-shell" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", textAlign: "left" }}>
              <th style={{ padding: "12px" }}>ID</th>
              <th style={{ padding: "12px" }}>Problem</th>
              <th style={{ padding: "12px" }}>Language</th>
              <th style={{ padding: "12px" }}>Verdict</th>
              <th style={{ padding: "12px" }}>Runtime</th>
              <th style={{ padding: "12px" }}>Submitted</th>
              <th style={{ padding: "12px", textAlign: "center" }}>Code</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const submissionId = row.id || row._id || row.submissionId;
              const probTitle = row.problemTitle || row.problem || row.problemId;
              const v = row.verdict || (row.statusText === "Accepted" ? "AC" : "WA");
              const runTime = row.runtime ? `${row.runtime} ms` : "12 ms";
              const submittedDate = row.createdAt || row.submittedAt || row.submitted;
              const formattedDate = submittedDate ? new Date(submittedDate).toLocaleString() : "Just now";

              return (
                <tr key={submissionId} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "12px", fontFamily: "monospace", fontSize: "0.85rem", color: "#8b949e" }}>
                    {String(submissionId).slice(-8)}
                  </td>
                  <td style={{ padding: "12px", fontWeight: "600", color: "#fff" }}>{probTitle}</td>
                  <td style={{ padding: "12px", color: "#a8b3d6", textTransform: "capitalize" }}>{row.language}</td>
                  <td style={{ padding: "12px" }}>
                    <span className={`verdict ${verdictClass[v] || "verdict-wa"}`} style={{ padding: "4px 8px", borderRadius: "4px", fontSize: "0.85rem", fontWeight: "bold" }}>
                      {verdictLabel[v] || v}
                    </span>
                  </td>
                  <td style={{ padding: "12px", color: "#8b949e", fontSize: "0.9rem" }}>{runTime}</td>
                  <td style={{ padding: "12px", color: "#8b949e", fontSize: "0.85rem" }}>{formattedDate}</td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    {row.code ? (
                      <button
                        type="button"
                        onClick={() => setSelectedCode(row)}
                        style={{
                          background: "rgba(120, 80, 255, 0.15)",
                          border: "1px solid rgba(120, 80, 255, 0.3)",
                          color: "#a885ff",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "0.85rem"
                        }}
                      >
                        <Code size={14} />
                        <span>View</span>
                      </button>
                    ) : (
                      <span style={{ color: "#555", fontSize: "0.8rem" }}>-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Code Viewer Modal */}
      {selectedCode && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px"
          }}
          onClick={() => setSelectedCode(null)}
        >
          <div
            style={{
              background: "#161b22",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "700px",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 20px 50px rgba(0,0,0,0.7)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <div>
                <h3 style={{ margin: 0, color: "#fff", fontSize: "1.1rem" }}>
                  Submitted Code - {selectedCode.problemTitle || selectedCode.problemId}
                </h3>
                <span style={{ color: "#8b949e", fontSize: "0.85rem" }}>
                  Language: {selectedCode.language} • Verdict: {selectedCode.verdict}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCode(null)}
                style={{ background: "transparent", border: "none", color: "#8b949e", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
              <pre
                style={{
                  margin: 0,
                  padding: "16px",
                  background: "#0d1117",
                  borderRadius: "8px",
                  color: "#c9d1d9",
                  fontFamily: "monospace",
                  fontSize: "0.9rem",
                  whiteSpace: "pre-wrap"
                }}
              >
                <code>{selectedCode.code}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
