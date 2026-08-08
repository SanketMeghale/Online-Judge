import { useEffect, useState } from "react";
import { Filter, RefreshCw } from "lucide-react";
import SubmissionTable from "../components/tables/SubmissionTable.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { api } from "../api/apiClient.js";
import { useAppData } from "../data/AppDataContext.jsx";

export default function SubmissionHistoryPage() {
  const { user } = useAuth();
  const { getSubmissionsForUser } = useAppData();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [verdictFilter, setVerdictFilter] = useState("All");
  const [languageFilter, setLanguageFilter] = useState("All");

  useEffect(() => {
    let isMounted = true;
    async function loadHistory() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (verdictFilter !== "All") queryParams.append("verdict", verdictFilter);
        if (languageFilter !== "All") queryParams.append("language", languageFilter);

        const data = await api.getSubmissions(queryParams.toString());
        const fetchedList = Array.isArray(data)
          ? data
          : data?.submissions || data?.data || null;

        if (isMounted && Array.isArray(fetchedList)) {
          setSubmissions(fetchedList);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn("[SubmissionHistoryPage] Failed to fetch from API, using local fallback:", err);
      }

      if (isMounted) {
        let fallback = getSubmissionsForUser(user?.id) || [];
        if (verdictFilter !== "All") {
          fallback = fallback.filter((s) => s.verdict === verdictFilter);
        }
        if (languageFilter !== "All") {
          fallback = fallback.filter(
            (s) => (s.language || "").toLowerCase() === languageFilter.toLowerCase()
          );
        }
        setSubmissions(fallback);
        setLoading(false);
      }
    }

    loadHistory();
    return () => {
      isMounted = false;
    };
  }, [user?.id, verdictFilter, languageFilter]);

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <span className="section-kicker">Submissions</span>
          <h1>Submission history</h1>
          <p>Review and filter all your code evaluation submissions, verdicts, and performance metrics.</p>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading compact" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <span className="section-kicker">History</span>
            <h2>Recent Attempts ({submissions.length})</h2>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(255, 255, 255, 0.05)", padding: "4px 10px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <Filter size={14} style={{ color: "#7850ff" }} />
              <span style={{ fontSize: "0.82rem", color: "#8b949e" }}>Verdict:</span>
              <select
                value={verdictFilter}
                onChange={(e) => setVerdictFilter(e.target.value)}
                style={{ background: "transparent", border: "none", color: "#fff", outline: "none", cursor: "pointer", fontSize: "0.85rem" }}
              >
                <option value="All" style={{ background: "#181d28" }}>All Verdicts</option>
                <option value="AC" style={{ background: "#181d28" }}>Accepted (AC)</option>
                <option value="WA" style={{ background: "#181d28" }}>Wrong Answer (WA)</option>
                <option value="RE" style={{ background: "#181d28" }}>Runtime Error (RE)</option>
                <option value="TLE" style={{ background: "#181d28" }}>Time Limit Exceeded (TLE)</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(255, 255, 255, 0.05)", padding: "4px 10px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <span style={{ fontSize: "0.82rem", color: "#8b949e" }}>Language:</span>
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                style={{ background: "transparent", border: "none", color: "#fff", outline: "none", cursor: "pointer", fontSize: "0.85rem" }}
              >
                <option value="All" style={{ background: "#181d28" }}>All Languages</option>
                <option value="python" style={{ background: "#181d28" }}>Python</option>
                <option value="javascript" style={{ background: "#181d28" }}>JavaScript</option>
                <option value="cpp" style={{ background: "#181d28" }}>C++</option>
                <option value="java" style={{ background: "#181d28" }}>Java</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#8b949e" }}>
            <RefreshCw size={24} className="spin-icon" style={{ marginBottom: "8px" }} />
            <p>Loading submission history...</p>
          </div>
        ) : (
          <SubmissionTable rows={submissions} />
        )}
      </section>
    </div>
  );
}
