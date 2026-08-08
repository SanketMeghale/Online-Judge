import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Check,
  CheckCircle2,
  Code2,
  Eye,
  Globe,
  KeyRound,
  Laptop,
  Lock,
  Moon,
  Palette,
  Save,
  Shield,
  Sliders,
  Sparkles,
  Sun,
  Trash2,
  User,
  Zap
} from "lucide-react";
import { useAuth } from "../auth/AuthContext.jsx";
import { useAppData } from "../data/AppDataContext.jsx";

const SETTINGS_STORAGE_KEY = "judgo-user-settings-v1";

const defaultSettings = {
  // General
  displayName: "",
  username: "",
  email: "",
  bio: "Full-stack developer mastering data structures & algorithms on Judgo.",
  language: "en-US",
  timezone: "UTC-5 (Eastern Time)",

  // Appearance
  theme: "dark",
  accentColor: "indigo",
  compactMode: false,

  // Editor
  fontSize: 14,
  tabSize: 4,
  wordWrap: true,
  autoSave: true,
  showLineNumbers: true,
  editorTheme: "judgo-dark",

  // Notifications
  contestReminders: true,
  submissionResults: true,
  achievementAlerts: true,
  dailyStreakReminders: true,

  // Privacy
  publicProfile: true,
  showSolvedProblems: true,
  showActivity: true,
  showContestRanking: true
};

export default function Settings() {
  const { user } = useAuth();
  const { getUserById, updateDatabase } = useAppData();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentUserId = user?.id || user?._id || "";
  const liveUser = (currentUserId ? getUserById(currentUserId) : null) || user || {};

  const initialTab = searchParams.get("tab") || "general";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Settings State
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : {};
      return {
        ...defaultSettings,
        displayName: liveUser?.name || "Developer",
        username: liveUser?.username || "coder",
        email: liveUser?.email || "developer@judgo.io",
        ...parsed
      };
    } catch {
      return {
        ...defaultSettings,
        displayName: liveUser?.name || "Developer",
        username: liveUser?.username || "coder",
        email: liveUser?.email || "developer@judgo.io"
      };
    }
  });

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (searchParams.get("tab")) {
      setActiveTab(searchParams.get("tab"));
    }
  }, [searchParams]);

  function handleTabChange(tabKey) {
    setActiveTab(tabKey);
    setSearchParams({ tab: tabKey });
  }

  function updateSetting(key, value) {
    setSettings((prev) => ({
      ...prev,
      [key]: value
    }));
  }

  function handleSaveAll(e) {
    if (e) e.preventDefault();
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));

      // Synchronize name & username into AppDataContext if modified
      if (currentUserId) {
        updateDatabase((current) => {
          return {
            ...current,
            users: (current.users || []).map((u) => {
              if (String(u.id) === String(currentUserId) || String(u._id) === String(currentUserId)) {
                return {
                  ...u,
                  name: settings.displayName || u.name,
                  username: settings.username || u.username,
                  email: settings.email || u.email
                };
              }
              return u;
            })
          };
        });
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.warn("[Settings Save Error]:", err);
    }
  }

  function handlePasswordChange(e) {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordMessage({ type: "error", text: "Please enter your current password." });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    setPasswordMessage({ type: "success", text: "Password updated successfully." });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPasswordMessage({ type: "", text: "" }), 3500);
  }

  const tabs = [
    { key: "general", label: "General", icon: User, desc: "Personal info & profile defaults" },
    { key: "appearance", label: "Appearance", icon: Palette, desc: "Themes, colors & visual density" },
    { key: "editor", label: "Editor", icon: Code2, desc: "Code font, tabs & behavior" },
    { key: "notifications", label: "Notifications", icon: Bell, desc: "Alerts & contest reminders" },
    { key: "privacy", label: "Privacy", icon: Shield, desc: "Profile & solved problem visibility" },
    { key: "account", label: "Account", icon: Lock, desc: "Security, password & danger zone" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="settings-page-wrapper"
      style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "60px", display: "flex", flexDirection: "column", gap: "24px" }}
    >
      {/* Header */}
      <header className="settings-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <span className="section-kicker" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#818cf8", fontWeight: "700" }}>
            Preferences & Security
          </span>
          <h1 style={{ fontSize: "1.85rem", fontWeight: "800", color: "#ffffff", margin: "6px 0 4px 0", letterSpacing: "-0.02em" }}>
            Settings
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.92rem", margin: 0 }}>
            Customize your Judgo coding experience, workspace defaults, and profile details.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          type="button"
          style={{
            background: savedSuccess ? "#10b981" : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
            color: "#ffffff",
            border: "1px solid rgba(255,255,255,0.15)",
            padding: "10px 20px",
            borderRadius: "8px",
            fontSize: "0.88rem",
            fontWeight: "600",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 14px rgba(79, 70, 229, 0.3)",
            transition: "all 0.2s ease"
          }}
        >
          {savedSuccess ? <Check size={16} /> : <Save size={16} />}
          <span>{savedSuccess ? "Saved Changes!" : "Save Changes"}</span>
        </button>
      </header>

      {/* Main Two-Column Layout */}
      <div className="settings-grid" style={{ display: "grid", gridTemplateColumns: "260px minmax(0, 1fr)", gap: "24px", alignItems: "start" }}>
        
        {/* LEFT COLUMN: Settings Navigation */}
        <nav
          className="settings-nav-card"
          style={{
            background: "#0d111a",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "12px",
            padding: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "4px"
          }}
        >
          {tabs.map(({ key, label, icon: Icon, desc }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleTabChange(key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: isActive ? "rgba(99, 102, 241, 0.12)" : "transparent",
                  border: isActive ? "1px solid rgba(99, 102, 241, 0.3)" : "1px solid transparent",
                  color: isActive ? "#ffffff" : "#94a3b8",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  width: "100%"
                }}
              >
                <Icon size={18} style={{ color: isActive ? "#818cf8" : "#64748b" }} />
                <div>
                  <div style={{ fontSize: "0.88rem", fontWeight: isActive ? "600" : "500" }}>{label}</div>
                  <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "1px" }}>{desc}</div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* RIGHT COLUMN: Tab Content Panel */}
        <main
          className="settings-content-card"
          style={{
            background: "#0d111a",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "14px",
            padding: "28px 32px",
            display: "flex",
            flexDirection: "column",
            gap: "28px"
          }}
        >
          {/* TAB 1: GENERAL */}
          {activeTab === "general" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "14px" }}>
                <h2 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#f8fafc", margin: "0 0 4px 0" }}>General Information</h2>
                <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: 0 }}>Manage your personal identity, bio, and locale settings.</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: "600", color: "#cbd5e1" }}>Display Name</label>
                  <input
                    type="text"
                    value={settings.displayName}
                    onChange={(e) => updateSetting("displayName", e.target.value)}
                    style={{
                      background: "#080c14",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      color: "#ffffff",
                      fontSize: "0.88rem"
                    }}
                    placeholder="Jane Doe"
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: "600", color: "#cbd5e1" }}>Username</label>
                  <input
                    type="text"
                    value={settings.username}
                    onChange={(e) => updateSetting("username", e.target.value)}
                    style={{
                      background: "#080c14",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      color: "#ffffff",
                      fontSize: "0.88rem"
                    }}
                    placeholder="janedoe"
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.82rem", fontWeight: "600", color: "#cbd5e1" }}>Email Address</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => updateSetting("email", e.target.value)}
                  style={{
                    background: "#080c14",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    color: "#ffffff",
                    fontSize: "0.88rem"
                  }}
                  placeholder="developer@example.com"
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.82rem", fontWeight: "600", color: "#cbd5e1" }}>Bio / Headline</label>
                <textarea
                  rows={3}
                  value={settings.bio}
                  onChange={(e) => updateSetting("bio", e.target.value)}
                  style={{
                    background: "#080c14",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    color: "#ffffff",
                    fontSize: "0.88rem",
                    resize: "vertical"
                  }}
                  placeholder="Tell other competitive programmers a little about your journey..."
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: "600", color: "#cbd5e1" }}>Interface Language</label>
                  <select
                    value={settings.language}
                    onChange={(e) => updateSetting("language", e.target.value)}
                    style={{
                      background: "#080c14",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      color: "#ffffff",
                      fontSize: "0.88rem"
                    }}
                  >
                    <option value="en-US">English (United States)</option>
                    <option value="en-GB">English (UK)</option>
                    <option value="es-ES">Español</option>
                    <option value="fr-FR">Français</option>
                    <option value="de-DE">Deutsch</option>
                    <option value="ja-JP">日本語 (Japanese)</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: "600", color: "#cbd5e1" }}>Time Zone</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => updateSetting("timezone", e.target.value)}
                    style={{
                      background: "#080c14",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      color: "#ffffff",
                      fontSize: "0.88rem"
                    }}
                  >
                    <option value="UTC-5 (Eastern Time)">UTC-5 (Eastern Time)</option>
                    <option value="UTC-8 (Pacific Time)">UTC-8 (Pacific Time)</option>
                    <option value="UTC+0 (GMT / London)">UTC+0 (GMT / London)</option>
                    <option value="UTC+1 (Central Europe)">UTC+1 (Central Europe)</option>
                    <option value="UTC+5:30 (IST / India)">UTC+5:30 (IST / India)</option>
                    <option value="UTC+9 (Tokyo)">UTC+9 (Tokyo)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: APPEARANCE */}
          {activeTab === "appearance" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "14px" }}>
                <h2 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#f8fafc", margin: "0 0 4px 0" }}>Appearance & Theme</h2>
                <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: 0 }}>Customize color palette, system theme, and UI density.</p>
              </div>

              {/* Theme Mode Selector */}
              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#cbd5e1", display: "block", marginBottom: "10px" }}>Theme Mode</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                  {[
                    { id: "dark", label: "Dark Modern", icon: Moon, desc: "Default charcoal navy" },
                    { id: "system", label: "System Sync", icon: Laptop, desc: "Matches OS preference" },
                    { id: "light", label: "High Contrast", icon: Sun, desc: "Crisp readability" }
                  ].map((t) => {
                    const isSelected = settings.theme === t.id;
                    const Icon = t.icon;
                    return (
                      <div
                        key={t.id}
                        onClick={() => updateSetting("theme", t.id)}
                        style={{
                          background: isSelected ? "rgba(99, 102, 241, 0.15)" : "#080c14",
                          border: isSelected ? "1.5px solid #6366f1" : "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "10px",
                          padding: "14px",
                          cursor: "pointer",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: isSelected ? "#818cf8" : "#94a3b8", fontWeight: "600", fontSize: "0.9rem" }}>
                          <Icon size={16} />
                          <span>{t.label}</span>
                        </div>
                        <span style={{ fontSize: "0.76rem", color: "#64748b", marginTop: "4px", display: "block" }}>{t.desc}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Accent Color Palette */}
              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#cbd5e1", display: "block", marginBottom: "10px" }}>Accent Accent</label>
                <div style={{ display: "flex", gap: "14px" }}>
                  {[
                    { id: "indigo", color: "#6366f1", label: "Indigo" },
                    { id: "purple", color: "#a855f7", label: "Purple" },
                    { id: "blue", color: "#3b82f6", label: "Blue" },
                    { id: "emerald", color: "#10b981", label: "Emerald" }
                  ].map((c) => {
                    const isSelected = settings.accentColor === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => updateSetting("accentColor", c.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          background: isSelected ? "rgba(255,255,255,0.08)" : "#080c14",
                          border: isSelected ? `2px solid ${c.color}` : "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "8px",
                          padding: "8px 14px",
                          color: "#ffffff",
                          fontSize: "0.82rem",
                          cursor: "pointer"
                        }}
                      >
                        <span style={{ width: 12, height: 12, borderRadius: "50%", background: c.color }} />
                        <span>{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Compact Mode Toggle */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#080c14", border: "1px solid rgba(255,255,255,0.08)", padding: "14px 18px", borderRadius: "10px" }}>
                <div>
                  <strong style={{ color: "#f8fafc", fontSize: "0.9rem", display: "block" }}>Compact Mode</strong>
                  <span style={{ color: "#64748b", fontSize: "0.78rem" }}>Reduces padding in tables and problem lists for higher screen density.</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.compactMode}
                  onChange={(e) => updateSetting("compactMode", e.target.checked)}
                  style={{ width: "18px", height: "18px", accentColor: "#6366f1", cursor: "pointer" }}
                />
              </div>
            </div>
          )}

          {/* TAB 3: EDITOR */}
          {activeTab === "editor" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "14px" }}>
                <h2 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#f8fafc", margin: "0 0 4px 0" }}>Code Editor Preferences</h2>
                <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: 0 }}>Configure typography, tab indentation, and execution settings.</p>
              </div>

              {/* Font Size Slider */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#cbd5e1" }}>Editor Font Size</label>
                  <strong style={{ color: "#818cf8", fontSize: "0.85rem" }}>{settings.fontSize}px</strong>
                </div>
                <input
                  type="range"
                  min={12}
                  max={20}
                  value={settings.fontSize}
                  onChange={(e) => updateSetting("fontSize", Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#6366f1", cursor: "pointer" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#64748b" }}>
                  <span>12px (Compact)</span>
                  <span>14px (Standard)</span>
                  <span>20px (Large)</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: "600", color: "#cbd5e1" }}>Tab Size</label>
                  <select
                    value={settings.tabSize}
                    onChange={(e) => updateSetting("tabSize", Number(e.target.value))}
                    style={{
                      background: "#080c14",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      color: "#ffffff",
                      fontSize: "0.88rem"
                    }}
                  >
                    <option value={2}>2 Spaces (JavaScript / Python standard)</option>
                    <option value={4}>4 Spaces (C++ / Java standard)</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: "600", color: "#cbd5e1" }}>Editor Theme</label>
                  <select
                    value={settings.editorTheme}
                    onChange={(e) => updateSetting("editorTheme", e.target.value)}
                    style={{
                      background: "#080c14",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      color: "#ffffff",
                      fontSize: "0.88rem"
                    }}
                  >
                    <option value="judgo-dark">Judgo Dark (Default)</option>
                    <option value="monokai">Monokai Pro</option>
                    <option value="github-dark">GitHub Dark</option>
                    <option value="dracula">Dracula</option>
                  </select>
                </div>
              </div>

              {/* Toggles Grid */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { key: "wordWrap", label: "Word Wrap", desc: "Wrap code lines that exceed editor horizontal boundary." },
                  { key: "autoSave", label: "Auto-Save Drafts", desc: "Save code changes to local storage every 5 seconds." },
                  { key: "showLineNumbers", label: "Show Line Numbers", desc: "Display numbered gutter along left edge of editor." }
                ].map((item) => (
                  <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#080c14", border: "1px solid rgba(255,255,255,0.06)", padding: "12px 16px", borderRadius: "8px" }}>
                    <div>
                      <strong style={{ color: "#f8fafc", fontSize: "0.88rem", display: "block" }}>{item.label}</strong>
                      <span style={{ color: "#64748b", fontSize: "0.76rem" }}>{item.desc}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(settings[item.key])}
                      onChange={(e) => updateSetting(item.key, e.target.checked)}
                      style={{ width: "18px", height: "18px", accentColor: "#6366f1", cursor: "pointer" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "14px" }}>
                <h2 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#f8fafc", margin: "0 0 4px 0" }}>Notification Preferences</h2>
                <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: 0 }}>Choose which system events and reminders you wish to receive.</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { key: "contestReminders", label: "Contest Reminders", desc: "Receive alerts 30 minutes before weekly scheduled contests start." },
                  { key: "submissionResults", label: "Async Submission Completion", desc: "Get notified when background judge worker finishes evaluating your code." },
                  { key: "achievementAlerts", label: "Achievement & Badge Unlocks", desc: "Notify when you earn new problem sprint or streak milestones." },
                  { key: "dailyStreakReminders", label: "Daily Streak Reminders", desc: "Daily evening reminder if you haven't solved a problem today." }
                ].map((item) => (
                  <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#080c14", border: "1px solid rgba(255,255,255,0.06)", padding: "14px 18px", borderRadius: "10px" }}>
                    <div>
                      <strong style={{ color: "#f8fafc", fontSize: "0.9rem", display: "block" }}>{item.label}</strong>
                      <span style={{ color: "#64748b", fontSize: "0.78rem" }}>{item.desc}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(settings[item.key])}
                      onChange={(e) => updateSetting(item.key, e.target.checked)}
                      style={{ width: "18px", height: "18px", accentColor: "#6366f1", cursor: "pointer" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PRIVACY */}
          {activeTab === "privacy" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "14px" }}>
                <h2 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#f8fafc", margin: "0 0 4px 0" }}>Privacy & Visibility</h2>
                <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: 0 }}>Control who can see your statistics, streak, and solved submissions.</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { key: "publicProfile", label: "Public Profile Page", desc: "Allow other coders to view your profile and achievement badges." },
                  { key: "showSolvedProblems", label: "Show Solved Problems Breakdown", desc: "Display your topic strength bar charts on your public card." },
                  { key: "showActivity", label: "Show Practice Activity", desc: "Include your recent submission history in global activity feeds." },
                  { key: "showContestRanking", label: "Show Global Ranking", desc: "Display your competitive score and rank on the leaderboards." }
                ].map((item) => (
                  <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#080c14", border: "1px solid rgba(255,255,255,0.06)", padding: "14px 18px", borderRadius: "10px" }}>
                    <div>
                      <strong style={{ color: "#f8fafc", fontSize: "0.9rem", display: "block" }}>{item.label}</strong>
                      <span style={{ color: "#64748b", fontSize: "0.78rem" }}>{item.desc}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(settings[item.key])}
                      onChange={(e) => updateSetting(item.key, e.target.checked)}
                      style={{ width: "18px", height: "18px", accentColor: "#6366f1", cursor: "pointer" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: ACCOUNT */}
          {activeTab === "account" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "14px" }}>
                <h2 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#f8fafc", margin: "0 0 4px 0" }}>Account Security</h2>
                <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: 0 }}>Update your security credentials and connected accounts.</p>
              </div>

              {/* Password Form */}
              <form onSubmit={handlePasswordChange} style={{ display: "flex", flexDirection: "column", gap: "16px", background: "#080c14", padding: "20px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <strong style={{ fontSize: "0.95rem", color: "#f8fafc" }}>Change Password</strong>

                {passwordMessage.text && (
                  <div style={{ padding: "8px 12px", borderRadius: "6px", fontSize: "0.82rem", background: passwordMessage.type === "error" ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)", color: passwordMessage.type === "error" ? "#f87171" : "#4ade80", border: `1px solid ${passwordMessage.type === "error" ? "#ef4444" : "#10b981"}` }}>
                    {passwordMessage.text}
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    style={{ background: "#0d111a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "8px 12px", color: "#ffffff", fontSize: "0.85rem" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.8rem", color: "#94a3b8" }}>New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{ background: "#0d111a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "8px 12px", color: "#ffffff", fontSize: "0.85rem" }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{ background: "#0d111a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "8px 12px", color: "#ffffff", fontSize: "0.85rem" }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    alignSelf: "flex-start",
                    background: "#4f46e5",
                    color: "#ffffff",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    fontSize: "0.82rem",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  Update Password
                </button>
              </form>

              {/* Danger Zone */}
              <div style={{ border: "1px solid rgba(239, 68, 68, 0.3)", background: "rgba(239, 68, 68, 0.05)", borderRadius: "10px", padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ color: "#f87171", fontSize: "0.92rem", display: "block" }}>Delete Account</strong>
                  <span style={{ color: "#94a3b8", fontSize: "0.78rem" }}>Permanently remove your account, profile XP, and historical test submissions.</span>
                </div>
                <button
                  type="button"
                  onClick={() => alert("To delete your account, please confirm by contacting support@judgo.io.")}
                  style={{ background: "#ef4444", color: "#ffffff", border: "none", padding: "8px 16px", borderRadius: "6px", fontSize: "0.82rem", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </motion.div>
  );
}
