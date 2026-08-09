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
  Cpu
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header & Range Selector */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#f8fafc", margin: 0 }}>Platform Intelligence &amp; Analytics</h1>
          <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: "4px 0 0 0" }}>Developer acquisition, submission throughput, and language telemetry.</p>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          {["7d", "30d", "90d"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={range === r ? "admin-btn admin-btn-primary" : "admin-btn admin-btn-secondary"}
              style={{ padding: "6px 14px", fontSize: "0.78rem" }}
            >
              {r.toUpperCase()}
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
                <strong style={{ fontSize: "0.95rem", color: "#f8fafc" }}>Daily Submission Volume &amp; Acceptance Flow</strong>
              </div>
              <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Aggregated over {range}</span>
            </div>

            {/* Custom Bar Visualization */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "160px", paddingTop: "20px" }}>
              {(data?.timeline || []).map((t, idx) => {
                const heightPct = Math.min(100, Math.max(15, t.submissions * 3));
                return (
                  <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }} title={`${t.date}: ${t.submissions} submissions (${t.accepted} AC)`}>
                    <div
                      style={{
                        width: "100%",
                        height: `${heightPct}%`,
                        background: "linear-gradient(180deg, #7c3aed 0%, #3b82f6 100%)",
                        borderRadius: "4px 4px 0 0",
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

          {/* 3-Column Visual Metrics: Verdicts, Languages, Topic Popularity */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            {/* Verdict Distribution */}
            <div className="admin-card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <strong style={{ fontSize: "0.9rem", color: "#f8fafc" }}>Verdict Breakdown</strong>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {(data?.verdicts || []).map((v, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                      <span style={{ color: "#cbd5e1" }}>{v.name}</span>
                      <strong style={{ color: v.color }}>{v.value}%</strong>
                    </div>
                    <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "999px", overflow: "hidden" }}>
                      <div style={{ width: `${v.value}%`, height: "100%", background: v.color, borderRadius: "999px" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Language Distribution */}
            <div className="admin-card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <strong style={{ fontSize: "0.9rem", color: "#f8fafc" }}>Language Popularity</strong>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {(data?.languages || []).map((l, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                      <span style={{ color: "#cbd5e1" }}>{l.name}</span>
                      <strong style={{ color: l.color }}>{l.share}%</strong>
                    </div>
                    <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "999px", overflow: "hidden" }}>
                      <div style={{ width: `${l.share}%`, height: "100%", background: l.color, borderRadius: "999px" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Problem Solves */}
            <div className="admin-card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <strong style={{ fontSize: "0.9rem", color: "#f8fafc" }}>Most Practiced Challenges</strong>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {(data?.topProblems || []).map((p, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px", background: "#080c14", borderRadius: "6px", fontSize: "0.78rem" }}>
                    <span style={{ color: "#f8fafc", fontWeight: "600" }}>{p.title}</span>
                    <span style={{ color: "#34d399", fontWeight: "700" }}>{p.solveRate} solve</span>
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
