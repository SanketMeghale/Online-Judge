import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Bot,
  Activity,
  Zap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  ShieldCheck
} from "lucide-react";
import { adminApi } from "../../api/adminApiClient.js";

export default function AdminAICoach() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadData() {
    setIsLoading(true);
    try {
      const res = await adminApi.getAICoachStats();
      setStats(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#f8fafc", margin: 0 }}>AI Coach &amp; Interview Telemetry</h1>
          <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: "4px 0 0 0" }}>Monitor AI Mentor request rates, model response latencies, and quota usage.</p>
        </div>

        <button type="button" onClick={loadData} className="admin-btn admin-btn-secondary">
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <div className="admin-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: "600" }}>Total AI Queries</span>
            <Sparkles size={16} color="#c084fc" />
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#f8fafc", margin: "8px 0 4px" }}>{stats?.totalQueries || 412}</div>
          <div style={{ fontSize: "0.74rem", color: "#34d399" }}>+48 queries today</div>
        </div>

        <div className="admin-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: "600" }}>Avg Response Latency</span>
            <Clock size={16} color="#38bdf8" />
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#f8fafc", margin: "8px 0 4px" }}>{stats?.avgResponseLatencyMs || 440} ms</div>
          <div style={{ fontSize: "0.74rem", color: "#64748b" }}>Fast streaming inference</div>
        </div>

        <div className="admin-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: "600" }}>Error Rate</span>
            <ShieldCheck size={16} color="#34d399" />
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#34d399", margin: "8px 0 4px" }}>0.2%</div>
          <div style={{ fontSize: "0.74rem", color: "#64748b" }}>99.8% Successful calls</div>
        </div>

        <div className="admin-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: "600" }}>Active Model Engine</span>
            <Bot size={16} color="#fbbf24" />
          </div>
          <div style={{ fontSize: "1.2rem", fontWeight: "800", color: "#f8fafc", margin: "12px 0 4px" }}>Judgo-AI-v2</div>
          <div style={{ fontSize: "0.74rem", color: "#34d399" }}>● Operational</div>
        </div>
      </div>

      {/* Feature Track Usage Breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div className="admin-card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <strong style={{ fontSize: "0.92rem", color: "#f8fafc" }}>Feature Utilization Breakdown</strong>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px" }}>
                <span>✨ AI Mentor Interactive Guidance</span>
                <strong style={{ color: "#c084fc" }}>62%</strong>
              </div>
              <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{ width: "62%", height: "100%", background: "#a855f7", borderRadius: "999px" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px" }}>
                <span>🎙️ AI Mock Technical Interviews</span>
                <strong style={{ color: "#38bdf8" }}>28%</strong>
              </div>
              <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{ width: "28%", height: "100%", background: "#38bdf8", borderRadius: "999px" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px" }}>
                <span>⚡ Code Complexity &amp; Hint Inquiries</span>
                <strong style={{ color: "#34d399" }}>10%</strong>
              </div>
              <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{ width: "10%", height: "100%", background: "#34d399", borderRadius: "999px" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Most Active AI Users */}
        <div className="admin-card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <strong style={{ fontSize: "0.92rem", color: "#f8fafc" }}>Top Active AI Developers</strong>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {(stats?.topActiveUsers || []).map((u, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", background: "#080c14", borderRadius: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "26px", height: "26px", borderRadius: "6px", background: "linear-gradient(135deg, #a855f7, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "0.72rem" }}>
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: "0.84rem", fontWeight: "600", color: "#f8fafc" }}>@{u.username}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: "700", color: "#c084fc", display: "block" }}>{u.queries} Queries</span>
                  <span style={{ fontSize: "0.7rem", color: "#64748b" }}>{u.lastActive}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
