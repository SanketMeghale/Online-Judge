import React, { useState, useEffect } from "react";
import {
  Settings,
  Shield,
  Save,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Globe,
  Sliders
} from "lucide-react";
import { adminApi } from "../../api/adminApiClient.js";

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form Fields
  const [platformName, setPlatformName] = useState("Judgo");
  const [tagline, setTagline] = useState("Elite Algorithmic & Coding Platform");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const [defaultTimeLimitMs, setDefaultTimeLimitMs] = useState(2000);
  const [defaultMemoryLimitMb, setDefaultMemoryLimitMb] = useState(256);
  const [aiCoachEnabled, setAiCoachEnabled] = useState(true);
  const [dailyAiLimitPerUser, setDailyAiLimitPerUser] = useState(50);
  const [contestsEnabled, setContestsEnabled] = useState(true);

  async function loadSettings() {
    setIsLoading(true);
    try {
      const res = await adminApi.getSettings();
      const s = res.settings || res;
      setSettings(s);
      setPlatformName(s.platformName || "Judgo");
      setTagline(s.tagline || "Elite Algorithmic & Coding Platform");
      setMaintenanceMode(Boolean(s.maintenanceMode));
      setRegistrationEnabled(typeof s.registrationEnabled === "boolean" ? s.registrationEnabled : true);
      setDefaultTimeLimitMs(s.defaultTimeLimitMs || 2000);
      setDefaultMemoryLimitMb(s.defaultMemoryLimitMb || 256);
      setAiCoachEnabled(typeof s.aiCoachEnabled === "boolean" ? s.aiCoachEnabled : true);
      setDailyAiLimitPerUser(s.dailyAiLimitPerUser || 50);
      setContestsEnabled(typeof s.contestsEnabled === "boolean" ? s.contestsEnabled : true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await adminApi.updateSettings({
        platformName,
        tagline,
        maintenanceMode,
        registrationEnabled,
        defaultTimeLimitMs: parseInt(defaultTimeLimitMs, 10) || 2000,
        defaultMemoryLimitMb: parseInt(defaultMemoryLimitMb, 10) || 256,
        aiCoachEnabled,
        dailyAiLimitPerUser: parseInt(dailyAiLimitPerUser, 10) || 50,
        contestsEnabled
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(err.message || "Failed to update platform settings.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
        <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 12px" }} />
        <span>Loading system configurations...</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "840px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#f8fafc", margin: 0 }}>Platform Configuration &amp; Governance</h1>
          <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: "4px 0 0 0" }}>Configure global judge parameters, Judgo Intelligence quotas, and platform accessibility.</p>
        </div>

        {saveSuccess && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#34d399", fontSize: "0.82rem", fontWeight: "700" }}>
            <CheckCircle2 size={16} />
            <span>Settings Saved!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* General Settings */}
        <div className="admin-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--admin-border)", paddingBottom: "10px" }}>
            <Globe size={18} color="#38bdf8" />
            <strong style={{ fontSize: "0.95rem", color: "#f8fafc" }}>General Platform Identity</strong>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div className="admin-form-group">
              <label className="admin-form-label">Platform Name</label>
              <input
                type="text"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="admin-input"
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Platform Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="admin-input"
              />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", background: "#080c14", borderRadius: "8px" }}>
            <div>
              <strong style={{ fontSize: "0.84rem", color: "#f8fafc", display: "block" }}>Maintenance Mode</strong>
              <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>When enabled, non-admin users receive a maintenance banner.</span>
            </div>
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              style={{ width: "18px", height: "18px", accentColor: "#a855f7", cursor: "pointer" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", background: "#080c14", borderRadius: "8px" }}>
            <div>
              <strong style={{ fontSize: "0.84rem", color: "#f8fafc", display: "block" }}>Developer Registration</strong>
              <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Allow new users to create accounts on Judgo.</span>
            </div>
            <input
              type="checkbox"
              checked={registrationEnabled}
              onChange={(e) => setRegistrationEnabled(e.target.checked)}
              style={{ width: "18px", height: "18px", accentColor: "#a855f7", cursor: "pointer" }}
            />
          </div>
        </div>

        {/* Judge Execution Limits */}
        <div className="admin-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--admin-border)", paddingBottom: "10px" }}>
            <Cpu size={18} color="#c084fc" />
            <strong style={{ fontSize: "0.95rem", color: "#f8fafc" }}>Code Execution Engine (Judge)</strong>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div className="admin-form-group">
              <label className="admin-form-label">Default Time Limit (Milliseconds)</label>
              <input
                type="number"
                value={defaultTimeLimitMs}
                onChange={(e) => setDefaultTimeLimitMs(e.target.value)}
                className="admin-input"
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Default Memory Limit (MB)</label>
              <input
                type="number"
                value={defaultMemoryLimitMb}
                onChange={(e) => setDefaultMemoryLimitMb(e.target.value)}
                className="admin-input"
              />
            </div>
          </div>
        </div>

        {/* AI Mentor & Telemetry Policy */}
        <div className="admin-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--admin-border)", paddingBottom: "10px" }}>
            <Sliders size={18} color="#34d399" />
            <strong style={{ fontSize: "0.95rem", color: "#f8fafc" }}>AI Mentor Quotas &amp; Contests</strong>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", background: "#080c14", borderRadius: "8px" }}>
            <div>
              <strong style={{ fontSize: "0.84rem", color: "#f8fafc", display: "block" }}>Judgo Intelligence &amp; Mock Interviewer</strong>
              <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Enable conversational AI hints and mock technical rounds platform-wide.</span>
            </div>
            <input
              type="checkbox"
              checked={aiCoachEnabled}
              onChange={(e) => setAiCoachEnabled(e.target.checked)}
              style={{ width: "18px", height: "18px", accentColor: "#a855f7", cursor: "pointer" }}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Daily AI Request Quota per User</label>
            <input
              type="number"
              value={dailyAiLimitPerUser}
              onChange={(e) => setDailyAiLimitPerUser(e.target.value)}
              className="admin-input"
            />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="submit"
            disabled={isSaving}
            className="admin-btn admin-btn-primary"
            style={{ padding: "12px 24px", fontSize: "0.88rem" }}
          >
            <Save size={15} />
            <span>{isSaving ? "Applying Configuration..." : "Save Platform Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
