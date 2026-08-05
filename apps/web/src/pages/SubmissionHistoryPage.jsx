import { useState, useEffect } from "react";
import SubmissionTable from "../components/tables/SubmissionTable.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { api } from "../api/apiClient.js";
import { Filter, RefreshCw } from "lucide-react";

export default function SubmissionHistoryPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verdictFilter, setVerdictFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");

  async function fetchHistory() {
    try {
      setLoading(true);
      const params = {};
      if (verdictFilter !== "all") params.verdict = verdictFilter;
      if (languageFilter !== "all") params.language = languageFilter;

      const res = await api.getSubmissions(params);
      if (res && res.submissions) {
        setSubmissions(res.submissions);
      }
    } catch (err) {
      console.warn("Failed to fetch submission history:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHistory();
  }, [verdictFilter, languageFilter]);

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <span className="section-kicker">Submissions</span>
          <h1>Submission History</h1>
          <p>Review all your submitted solutions, runtime metrics, and evaluation verdicts.</p>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="section-block" style={{ paddingBottom: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            background: "#161b26",
            padding: "16px 20px",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.08)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#8b949e" }}>
              <Filter size={18} />
              <span style={{ fontWeight: "600", fontSize: "0.9rem", color: "#c9d1d9" }}>Filters:</span>
            </div>

            {/* Verdict Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <label style={{ fontSize: "0.85rem", color: "#8b949e" }}>Verdict:</label>
              <select
                value={verdictFilter}
                onChange={(e) => setVerdictFilter(e.target.value)}
                style={{
                  background: "#0d1117",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#fff",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "0.85rem"
                }}
              >
                <option value="all">All Verdicts</option>
                <option value="AC">Accepted (AC)</option>
                <option value="WA">Wrong Answer (WA)</option>
                <option value="RE">Runtime Error (RE)</option>
                <option value="TLE">Time Limit Exceeded (TLE)</option>
              </select>
            </div>

            {/* Language Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <label style={{ fontSize: "0.85rem", color: "#8b949e" }}>Language:</label>
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                style={{
                  background: "#0d1117",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#fff",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "0.85rem"
                }}
              >
                <option value="all">All Languages</option>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchHistory}
            style={{
              background: "transparent",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#c9d1d9",
              padding: "6px 14px",
              borderRadius: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.85rem"
            }}
          >
            <RefreshCw size={14} className={loading ? "spin-icon" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </section>

      <section className="section-block">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#8b949e" }}>
            Loading submission history...
          </div>
        ) : (
          <SubmissionTable rows={submissions} />
        )}
      </section>
    </div>
  );
}
