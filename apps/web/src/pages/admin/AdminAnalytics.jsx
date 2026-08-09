import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Activity,
  Users,
  Terminal,
  Calendar,
  Layers,
  RefreshCw,
  Cpu,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  PieChart
} from "lucide-react";
import { adminApi } from "../../api/adminApiClient.js";

export default function AdminAnalytics() {
  const [range, setRange] = useState("30d");
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadAnalytics() {
    setIsLoading(true);
    try {
      const res = await adminApi.getAnalytics(range);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, [range]);

  const maxSubmissions = Math.max(...(data?.timeline || []).map((t) => t.submissions), 10);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header & Range Selector */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.35rem", fontWeight: "800", color: "#f8fafc", margin: 0 }}>
            Platform Intelligence &amp; Analytics
          </h1>
          <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: "4px 0 0 0" }}>
            Real-time developer acquisition, submission throughput, and language telemetry from MongoDB.
          </p>
        </div>

        <div style={{ display: "flex", gap: "6px" }}>
          {["7d", "30d", "90d", "1y"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={range === r ? "admin-btn-primary" : "admin-btn-secondary"}
              style={{ padding: "6px 12px", fontSize: "0.78rem", textTransform: "uppercase" }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 12px" }} />
          <span>Aggregating analytics data across MongoDB collections...</span>
        </div>
      ) : (
        <>
          {/* Submissions Throughput Chart */}
          <div className="admin-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <TrendingUp size={18} color="#34d399" />
                <strong style={{ fontSize: "0.95rem", color: "#f8fafc" }}>Daily Submissions &amp; Acceptance Flow</strong>
              </div>
              <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Aggregated over {range}</span>
            </div>

            {/* Custom Bar Visualization */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "160px", paddingTop: "20px" }}>
              {(data?.timeline || []).map((t, idx) => {
                const heightPct = Math.min(100, Math.max(8, (t.submissions / maxSubmissions) * 100));
                return (
                  <div
                    key={idx}
                    style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}
                    title={`${t.date}: ${t.submissions} submissions (${t.accepted} AC, ${t.newUsers || 0} new users)`}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: `${heightPct}%`,
                        background: "linear-gradient(180deg, #7c3aed 0%, #38bdf8 100%)",
                        borderRadius: "3px 3px 0 0",
                        opacity: 0.85
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#64748b" }}>
              <span>{data?.timeline?.[0]?.date || "Start"}</span>
              <span>{data?.timeline?.[data.timeline.length - 1]?.date || "Today"}</span>
            </div>
          </div>

          {/* Verdicts & Language Distribution */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
            {/* Verdicts Card */}
            <div className="admin-card" style={{ padding: "18px" }}>
              <h3 style={{ margin: "0 0 14px", fontSize: "0.92rem", color: "#f8fafc", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                <PieChart size={16} color="#818cf8" />
                <span>Verdict Distribution</span>
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {(data?.verdicts || []).map((v) => (
                  <div key={v.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "4px" }}>
                      <span style={{ color: "#e2e8f0" }}>{v.name}</span>
                      <strong style={{ color: v.color }}>{v.value}</strong>
                    </div>
                    <div style={{ width: "100%", height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "999px", overflow: "hidden" }}>
                      <div style={{ width: `${Math.min(100, Math.max(5, v.value * 2))}%`, height: "100%", background: v.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Language Distribution Card */}
            <div className="admin-card" style={{ padding: "18px" }}>
              <h3 style={{ margin: "0 0 14px", fontSize: "0.92rem", color: "#f8fafc", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                <Cpu size={16} color="#38bdf8" />
                <span>Compiler &amp; Language Share</span>
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {(data?.languages || []).map((l) => (
                  <div key={l.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "4px" }}>
                      <span style={{ color: "#e2e8f0" }}>{l.name}</span>
                      <strong style={{ color: l.color }}>{l.share}% ({l.count || 0})</strong>
                    </div>
                    <div style={{ width: "100%", height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "999px", overflow: "hidden" }}>
                      <div style={{ width: `${l.share}%`, height: "100%", background: l.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Most Solved & Hardest Problems Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
            {/* Most Solved */}
            <div className="admin-card" style={{ padding: "18px" }}>
              <h3 style={{ margin: "0 0 12px", fontSize: "0.92rem", color: "#34d399", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle2 size={16} color="#34d399" />
                <span>Most Solved Problems</span>
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {(data?.topProblems || []).map((p, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: "rgba(255,255,255,0.02)", borderRadius: "6px", fontSize: "0.82rem" }}>
                    <div>
                      <span style={{ fontWeight: "600", color: "#f8fafc" }}>{p.title}</span>
                      <span className={`admin-badge badge-${p.difficulty === "Easy" ? "green" : p.difficulty === "Medium" ? "yellow" : "red"}`} style={{ marginLeft: "8px", fontSize: "0.62rem" }}>
                        {p.difficulty}
                      </span>
                    </div>
                    <span style={{ color: "#94a3b8" }}>{p.submissions} solves ({p.solveRate})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hardest Problems */}
            <div className="admin-card" style={{ padding: "18px" }}>
              <h3 style={{ margin: "0 0 12px", fontSize: "0.92rem", color: "#f87171", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle size={16} color="#f87171" />
                <span>Hardest Challenges (Lowest Acceptance)</span>
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {(data?.hardestProblems || []).map((p, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: "rgba(255,255,255,0.02)", borderRadius: "6px", fontSize: "0.82rem" }}>
                    <div>
                      <span style={{ fontWeight: "600", color: "#f8fafc" }}>{p.title}</span>
                      <span className={`admin-badge badge-${p.difficulty === "Easy" ? "green" : p.difficulty === "Medium" ? "yellow" : "red"}`} style={{ marginLeft: "8px", fontSize: "0.62rem" }}>
                        {p.difficulty}
                      </span>
                    </div>
                    <span style={{ color: "#f87171", fontWeight: "700" }}>{p.solveRate} AC</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
