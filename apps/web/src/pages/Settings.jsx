import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCircle2,
  Code2,
  Eye,
  Globe,
  KeyRound,
  Laptop,
  Lock,
  LogOut,
  Moon,
  Palette,
  Save,
  Shield,
  Sliders,
  Sparkles,
  Sun,
  Trash2,
  User,
  X,
  Zap
} from "lucide-react";
import { useAuth } from "../auth/AuthContext.jsx";
import { useAppData } from "../data/AppDataContext.jsx";
import { api } from "../api/apiClient.js";
import { applyThemeAndAppearance } from "../utils/themeApplier.js";
import { writeStoredSession, readStoredSession } from "../auth/authStorage.js";

const SETTINGS_STORAGE_KEY = "judgo-user-settings-v1";

const TIMEZONES = [
  "UTC-8 (Pacific Time / US & Canada)",
  "UTC-7 (Mountain Time / US & Canada)",
  "UTC-6 (Central Time / US & Canada)",
  "UTC-5 (Eastern Time / US & Canada)",
  "UTC+0 (GMT / London / Dublin)",
  "UTC+1 (Central European Time / Berlin / Paris)",
  "UTC+2 (Eastern European Time / Athens / Cairo)",
  "UTC+3 (Moscow / Riyadh / Istanbul)",
  "UTC+4 (Dubai / Baku / Samara)",
  "UTC+5:30 (IST / India / Mumbai / Delhi)",
  "UTC+6 (Dhaka / Almaty / Omsk)",
  "UTC+7 (Bangkok / Jakarta / Hanoi)",
  "UTC+8 (Singapore / Beijing / Perth)",
  "UTC+9 (Tokyo / Seoul / Yakutsk)",
  "UTC+10 (Sydney / Melbourne / Brisbane)",
  "UTC+12 (Auckland / Fiji)"
];

const LANGUAGES = [
  { id: "en-US", name: "English (United States)" },
  { id: "hi-IN", name: "Hindi (हिंदी)" },
  { id: "mr-IN", name: "Marathi (मराठी)" }
];

export default function Settings() {
  const { user, logout } = useAuth();
  const { getUserById, updateDatabase } = useAppData();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentUserId = user?.id || user?._id || "";
  const liveUser = (currentUserId ? getUserById(currentUserId) : null) || user || {};

  const initialTab = searchParams.get("tab") || "general";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Status & Feedback States
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [saveErrorMsg, setSaveErrorMsg] = useState("");

  // Username validation state
  const [usernameCheck, setUsernameCheck] = useState({ checking: false, available: null, message: "" });
  const checkTimeoutRef = useRef(null);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState({ type: "", text: "" });

  // Initial Form State loaded from live user & storage
  const [formData, setFormData] = useState(() => {
    let localPrefs = {};
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) localPrefs = JSON.parse(stored);
    } catch {}

    const userPrefs = liveUser?.preferences || {};

    return {
      displayName: liveUser?.name || "Developer",
      username: liveUser?.username || "coder",
      email: liveUser?.email || "developer@judgo.io",
      bio: liveUser?.bio || "",
      language: liveUser?.language || localPrefs?.language || "en-US",
      timezone: liveUser?.timezone || localPrefs?.timezone || "UTC-5 (Eastern Time / US & Canada)",
      theme: userPrefs?.theme || localPrefs?.theme || "dark",
      accentColor: userPrefs?.accentColor || localPrefs?.accentColor || "indigo",
      density: userPrefs?.density || localPrefs?.density || "comfortable",
      compactMode: userPrefs?.compactMode ?? localPrefs?.compactMode ?? false,
      fontSize: userPrefs?.fontSize || localPrefs?.fontSize || 14,
      tabSize: userPrefs?.tabSize || localPrefs?.tabSize || 4,
      wordWrap: userPrefs?.wordWrap ?? localPrefs?.wordWrap ?? true,
      lineNumbers: userPrefs?.lineNumbers ?? localPrefs?.lineNumbers ?? true,
      autoSave: userPrefs?.autoSave ?? localPrefs?.autoSave ?? true,
      editorTheme: userPrefs?.editorTheme || localPrefs?.editorTheme || "judgo-dark",
      contestReminders: userPrefs?.contestReminders ?? localPrefs?.contestReminders ?? true,
      submissionResults: userPrefs?.submissionResults ?? localPrefs?.submissionResults ?? true,
      achievementAlerts: userPrefs?.achievementAlerts ?? localPrefs?.achievementAlerts ?? true,
      dailyStreakReminders: userPrefs?.dailyStreakReminders ?? localPrefs?.dailyStreakReminders ?? true,
      aiCoachNotifications: userPrefs?.aiCoachNotifications ?? localPrefs?.aiCoachNotifications ?? true,
      publicProfile: userPrefs?.publicProfile ?? localPrefs?.publicProfile ?? true,
      showSolvedProblems: userPrefs?.showSolvedProblems ?? localPrefs?.showSolvedProblems ?? true,
      showActivity: userPrefs?.showActivity ?? localPrefs?.showActivity ?? true,
      showContestRanking: userPrefs?.showContestRanking ?? localPrefs?.showContestRanking ?? true
    };
  });

  // Saved baseline for detecting changes
  const [savedBaseline, setSavedBaseline] = useState(formData);

  // Sync baseline if liveUser initializes after mount
  useEffect(() => {
    if (liveUser?.name && !savedBaseline.displayName) {
      const updated = {
        ...formData,
        displayName: liveUser.name || formData.displayName,
        username: liveUser.username || formData.username,
        email: liveUser.email || formData.email,
        bio: liveUser.bio || formData.bio
      };
      setFormData(updated);
      setSavedBaseline(updated);
    }
  }, [liveUser?.name, liveUser?.username]);

  // Tab Sync with URL search params
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Apply theme & appearance immediately when appearance settings change
  useEffect(() => {
    applyThemeAndAppearance({
      theme: formData.theme,
      accentColor: formData.accentColor,
      density: formData.density,
      compactMode: formData.compactMode
    });
  }, [formData.theme, formData.accentColor, formData.density, formData.compactMode]);

  // Compute if form is dirty
  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(savedBaseline);
  }, [formData, savedBaseline]);

  function handleTabChange(tabKey) {
    setActiveTab(tabKey);
    setSearchParams({ tab: tabKey });
  }

  function handleChange(key, value) {
    setFormData((prev) => ({
      ...prev,
      [key]: value
    }));

    // Check username availability when typing username
    if (key === "username") {
      const cleanUser = String(value).trim();
      if (cleanUser === savedBaseline.username) {
        setUsernameCheck({ checking: false, available: true, message: "Current username" });
        return;
      }
      if (cleanUser.length < 3) {
        setUsernameCheck({ checking: false, available: false, message: "Must be at least 3 characters" });
        return;
      }

      if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
      setUsernameCheck({ checking: true, available: null, message: "Checking availability..." });

      checkTimeoutRef.current = setTimeout(async () => {
        try {
          const res = await api.checkUsername(cleanUser, currentUserId);
          if (res?.available) {
            setUsernameCheck({ checking: false, available: true, message: "Username available" });
          } else {
            setUsernameCheck({ checking: false, available: false, message: "Username already taken" });
          }
        } catch {
          setUsernameCheck({ checking: false, available: null, message: "" });
        }
      }, 350);
    }
  }

  async function handleSaveAll(e) {
    if (e) e.preventDefault();
    if (!isDirty || isSaving) return;

    if (!formData.displayName.trim()) {
      setSaveErrorMsg("Display Name cannot be empty.");
      return;
    }

    if (!formData.username.trim()) {
      setSaveErrorMsg("Username cannot be empty.");
      return;
    }

    setIsSaving(true);
    setSaveErrorMsg("");
    setSaveSuccessMsg("");

    try {
      const preferences = {
        theme: formData.theme,
        accentColor: formData.accentColor,
        density: formData.density,
        compactMode: formData.compactMode,
        fontSize: formData.fontSize,
        tabSize: formData.tabSize,
        wordWrap: formData.wordWrap,
        lineNumbers: formData.lineNumbers,
        autoSave: formData.autoSave,
        editorTheme: formData.editorTheme,
        contestReminders: formData.contestReminders,
        submissionResults: formData.submissionResults,
        achievementAlerts: formData.achievementAlerts,
        dailyStreakReminders: formData.dailyStreakReminders,
        aiCoachNotifications: formData.aiCoachNotifications,
        publicProfile: formData.publicProfile,
        showSolvedProblems: formData.showSolvedProblems,
        showActivity: formData.showActivity,
        showContestRanking: formData.showContestRanking
      };

      // 1. Send update to Backend API
      let updatedUser = null;
      try {
        const apiRes = await api.updateSettings({
          displayName: formData.displayName.trim(),
          name: formData.displayName.trim(),
          username: formData.username.trim(),
          bio: formData.bio.trim(),
          language: formData.language,
          timezone: formData.timezone,
          preferences
        });
        if (apiRes?.user) {
          updatedUser = apiRes.user;
        }
      } catch (apiErr) {
        console.warn("[Settings API Update Warning]:", apiErr);
      }

      // 2. Persist to localStorage
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(formData));

      // 3. Update session storage & trigger cross-component updates
      const currentSession = readStoredSession();
      if (currentSession && currentSession.user) {
        const nextUser = {
          ...currentSession.user,
          name: formData.displayName.trim(),
          username: formData.username.trim(),
          bio: formData.bio.trim(),
          language: formData.language,
          timezone: formData.timezone,
          preferences,
          ...(updatedUser || {})
        };
        writeStoredSession({ ...currentSession, user: nextUser });
      }

      // 4. Update AppDataContext global database
      if (currentUserId) {
        updateDatabase((current) => ({
          ...current,
          users: (current.users || []).map((u) => {
            if (String(u.id) === String(currentUserId) || String(u._id) === String(currentUserId)) {
              return {
                ...u,
                name: formData.displayName.trim(),
                username: formData.username.trim(),
                bio: formData.bio.trim(),
                language: formData.language,
                timezone: formData.timezone,
                preferences,
                ...(updatedUser || {})
              };
            }
            return u;
          })
        }));
      }

      // 5. Update local state baseline
      setSavedBaseline(formData);
      setSaveSuccessMsg("✓ Changes saved successfully");
      setTimeout(() => setSaveSuccessMsg(""), 3500);
    } catch (err) {
      console.error("[Save Settings Error]:", err);
      setSaveErrorMsg(err?.message || "Unable to save preferences. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordStatus({ type: "error", text: "Please enter your current password." });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordStatus({ type: "error", text: "New password must be at least 6 characters long." });
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordStatus({ type: "error", text: "New password cannot equal your current password." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: "error", text: "New passwords do not match." });
      return;
    }

    setIsChangingPassword(true);
    setPasswordStatus({ type: "", text: "" });

    try {
      const res = await api.changePassword({
        currentPassword,
        newPassword,
        confirmPassword
      });

      setPasswordStatus({ type: "success", text: "✓ Password changed successfully" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordStatus({ type: "", text: "" }), 4000);
    } catch (err) {
      setPasswordStatus({ type: "error", text: err?.message || "Failed to update password. Please check your current password." });
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText.trim() !== "DELETE") {
      setDeleteError("Please type 'DELETE' in all caps to confirm.");
      return;
    }

    setIsDeleting(true);
    setDeleteError("");

    try {
      await api.deleteAccount({ confirmation: "DELETE" });
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      setDeleteError(err?.message || "Failed to delete account. Please try again.");
      setIsDeleting(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  const tabs = [
    { key: "general", label: "General", icon: User, desc: "Personal info & profile identity" },
    { key: "appearance", label: "Appearance", icon: Palette, desc: "Themes, accent colors & density" },
    { key: "editor", label: "Editor", icon: Code2, desc: "Font size, tabs, wrap & keybindings" },
    { key: "notifications", label: "Notifications", icon: Bell, desc: "Contest, streak & coach alerts" },
    { key: "privacy", label: "Privacy", icon: Shield, desc: "Public profile & solved visibility" },
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
            Customize your Judgo experience.
          </p>
        </div>

        {/* Global Save Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {isDirty && !saveSuccessMsg && (
            <span style={{ fontSize: "0.78rem", color: "#fbbf24", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
              ● Unsaved changes
            </span>
          )}

          <button
            onClick={handleSaveAll}
            disabled={!isDirty || isSaving}
            type="button"
            style={{
              background: saveSuccessMsg
                ? "#10b981"
                : isDirty
                ? "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)"
                : "rgba(255, 255, 255, 0.05)",
              color: isDirty || saveSuccessMsg ? "#ffffff" : "#64748b",
              border: isDirty || saveSuccessMsg ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(255,255,255,0.06)",
              padding: "10px 22px",
              borderRadius: "8px",
              fontSize: "0.88rem",
              fontWeight: "600",
              cursor: !isDirty || isSaving ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: isDirty ? "0 4px 14px rgba(79, 70, 229, 0.3)" : "none",
              transition: "all 0.2s ease"
            }}
          >
            {saveSuccessMsg ? (
              <>
                <Check size={16} />
                <span>{saveSuccessMsg}</span>
              </>
            ) : isSaving ? (
              <span>Saving...</span>
            ) : (
              <>
                <Save size={16} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Global Error Banner if any */}
      {saveErrorMsg && (
        <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", color: "#f87171", padding: "10px 16px", borderRadius: "8px", fontSize: "0.86rem", display: "flex", alignItems: "center", gap: "8px" }}>
          <AlertTriangle size={16} />
          <span>{saveErrorMsg}</span>
        </div>
      )}

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

        {/* RIGHT COLUMN: Interactive Settings Panels */}
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
                <h2 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#f8fafc", margin: "0 0 4px 0" }}>General Settings</h2>
                <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: 0 }}>Manage your personal identity, bio, and locale settings.</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                {/* Display Name */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: "600", color: "#cbd5e1" }}>Display Name</label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => handleChange("displayName", e.target.value)}
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
                  <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Appears on leaderboard, submissions & profile badge.</span>
                </div>

                {/* Username */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <label style={{ fontSize: "0.82rem", fontWeight: "600", color: "#cbd5e1" }}>Username</label>
                    {usernameCheck.message && (
                      <span style={{ fontSize: "0.72rem", color: usernameCheck.available ? "#4ade80" : "#f87171", fontWeight: "600" }}>
                        {usernameCheck.message}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleChange("username", e.target.value)}
                    style={{
                      background: "#080c14",
                      border: usernameCheck.available === false ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      color: "#ffffff",
                      fontSize: "0.88rem"
                    }}
                    placeholder="janedoe"
                  />
                  <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Unique handle for your coding track and profile URL.</span>
                </div>
              </div>

              {/* Email Address (Read-only / Authenticated) */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.82rem", fontWeight: "600", color: "#cbd5e1" }}>Email Address</label>
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  style={{
                    background: "rgba(8, 12, 20, 0.6)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    color: "#94a3b8",
                    fontSize: "0.88rem",
                    cursor: "not-allowed"
                  }}
                  placeholder="developer@example.com"
                />
                <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Connected authentication email (contact support to modify).</span>
              </div>

              {/* Bio / Headline */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: "600", color: "#cbd5e1" }}>Bio / Headline</label>
                  <span style={{ fontSize: "0.72rem", color: formData.bio.length > 280 ? "#f59e0b" : "#64748b" }}>
                    {formData.bio.length}/300
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={300}
                  value={formData.bio}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  style={{
                    background: "#080c14",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    color: "#ffffff",
                    fontSize: "0.88rem",
                    resize: "vertical"
                  }}
                  placeholder="Tell other competitive programmers a little about your journey, favorite algorithms & tech stack..."
                />
              </div>

              {/* Language & Time Zone */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: "600", color: "#cbd5e1" }}>Interface Language</label>
                  <select
                    value={formData.language}
                    onChange={(e) => handleChange("language", e.target.value)}
                    style={{
                      background: "#080c14",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      color: "#ffffff",
                      fontSize: "0.88rem"
                    }}
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.id} value={lang.id}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: "600", color: "#cbd5e1" }}>Time Zone</label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => handleChange("timezone", e.target.value)}
                    style={{
                      background: "#080c14",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      color: "#ffffff",
                      fontSize: "0.88rem"
                    }}
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
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

              {/* Theme Mode Selector (Dark / Light / System) */}
              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#cbd5e1", display: "block", marginBottom: "10px" }}>Theme Mode</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                  {[
                    { id: "dark", label: "Dark", icon: Moon, desc: "Default charcoal navy" },
                    { id: "light", label: "Light", icon: Sun, desc: "Crisp light contrast" },
                    { id: "system", label: "System", icon: Laptop, desc: "Matches OS preference" }
                  ].map((t) => {
                    const isSelected = formData.theme === t.id;
                    const Icon = t.icon;
                    return (
                      <div
                        key={t.id}
                        onClick={() => handleChange("theme", t.id)}
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

              {/* Accent Color Palette (Blue, Purple, Indigo, Green) */}
              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#cbd5e1", display: "block", marginBottom: "10px" }}>Accent Color</label>
                <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                  {[
                    { id: "blue", color: "#3b82f6", label: "Blue" },
                    { id: "purple", color: "#a855f7", label: "Purple" },
                    { id: "indigo", color: "#6366f1", label: "Indigo" },
                    { id: "emerald", color: "#10b981", label: "Green" }
                  ].map((c) => {
                    const isSelected = formData.accentColor === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleChange("accentColor", c.id)}
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

              {/* Display Density Mode (Comfortable vs Compact) */}
              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#cbd5e1", display: "block", marginBottom: "10px" }}>Display Density</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {[
                    { id: "comfortable", label: "Comfortable", desc: "Standard spacing for relaxed reading" },
                    { id: "compact", label: "Compact", desc: "Tight row heights for maximum information density" }
                  ].map((d) => {
                    const isSelected = formData.density === d.id;
                    return (
                      <div
                        key={d.id}
                        onClick={() => {
                          handleChange("density", d.id);
                          handleChange("compactMode", d.id === "compact");
                        }}
                        style={{
                          background: isSelected ? "rgba(99, 102, 241, 0.15)" : "#080c14",
                          border: isSelected ? "1.5px solid #6366f1" : "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "10px",
                          padding: "14px",
                          cursor: "pointer"
                        }}
                      >
                        <strong style={{ color: isSelected ? "#818cf8" : "#f8fafc", fontSize: "0.88rem", display: "block" }}>{d.label}</strong>
                        <span style={{ color: "#64748b", fontSize: "0.76rem", marginTop: "2px", display: "block" }}>{d.desc}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EDITOR */}
          {activeTab === "editor" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "14px" }}>
                <h2 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#f8fafc", margin: "0 0 4px 0" }}>Code Editor Settings</h2>
                <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: 0 }}>Configure typography, indentation, syntax themes, and editor behaviors.</p>
              </div>

              {/* Font Size (12, 13, 14, 15, 16, 18, 20) */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#cbd5e1" }}>Font Size</label>
                  <strong style={{ color: "#818cf8", fontSize: "0.85rem" }}>{formData.fontSize}px</strong>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[12, 13, 14, 15, 16, 18, 20].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleChange("fontSize", size)}
                      style={{
                        flex: 1,
                        background: formData.fontSize === size ? "rgba(99, 102, 241, 0.2)" : "#080c14",
                        border: formData.fontSize === size ? "1.5px solid #6366f1" : "1px solid rgba(255,255,255,0.08)",
                        color: formData.fontSize === size ? "#ffffff" : "#94a3b8",
                        borderRadius: "6px",
                        padding: "8px 0",
                        fontSize: "0.84rem",
                        fontWeight: formData.fontSize === size ? "700" : "500",
                        cursor: "pointer"
                      }}
                    >
                      {size}px
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Size & Editor Theme */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: "600", color: "#cbd5e1" }}>Tab Size</label>
                  <select
                    value={formData.tabSize}
                    onChange={(e) => handleChange("tabSize", Number(e.target.value))}
                    style={{
                      background: "#080c14",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      color: "#ffffff",
                      fontSize: "0.88rem"
                    }}
                  >
                    <option value={2}>2 Spaces</option>
                    <option value={4}>4 Spaces (Standard)</option>
                    <option value={8}>8 Spaces</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: "600", color: "#cbd5e1" }}>Editor Theme</label>
                  <select
                    value={formData.editorTheme}
                    onChange={(e) => handleChange("editorTheme", e.target.value)}
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
                    <option value="light">High Contrast Light</option>
                  </select>
                </div>
              </div>

              {/* Toggles Grid: Word Wrap, Line Numbers, Auto Save */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { key: "wordWrap", label: "Word Wrap", desc: "Wrap code lines that exceed editor horizontal boundary." },
                  { key: "lineNumbers", label: "Line Numbers", desc: "Display numbered gutter along the left edge of the code editor." },
                  { key: "autoSave", label: "Auto Save Drafts", desc: "Automatically save code buffer to local storage on problem change." }
                ].map((item) => (
                  <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#080c14", border: "1px solid rgba(255,255,255,0.06)", padding: "12px 16px", borderRadius: "8px" }}>
                    <div>
                      <strong style={{ color: "#f8fafc", fontSize: "0.88rem", display: "block" }}>{item.label}</strong>
                      <span style={{ color: "#64748b", fontSize: "0.76rem" }}>{item.desc}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(formData[item.key])}
                      onChange={(e) => handleChange(item.key, e.target.checked)}
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
                <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: 0 }}>Control platform alerts, contest notifications, and streak reminders.</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { key: "contestReminders", label: "Contest Reminders", desc: "Receive alerts 30 minutes before weekly scheduled contests start." },
                  { key: "submissionResults", label: "Submission Results", desc: "Get notified when background judge worker finishes evaluating your code." },
                  { key: "achievementAlerts", label: "Achievement Notifications", desc: "Notify when you earn new problem milestones or streak badges." },
                  { key: "dailyStreakReminders", label: "Daily Coding Reminders", desc: "Daily evening reminder to solve a problem and protect your streak." },
                  { key: "aiCoachNotifications", label: "AI Coach Notifications", desc: "Get feedback and interview tips from the AI Coach after solving." }
                ].map((item) => (
                  <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#080c14", border: "1px solid rgba(255,255,255,0.06)", padding: "14px 18px", borderRadius: "10px" }}>
                    <div>
                      <strong style={{ color: "#f8fafc", fontSize: "0.9rem", display: "block" }}>{item.label}</strong>
                      <span style={{ color: "#64748b", fontSize: "0.78rem" }}>{item.desc}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(formData[item.key])}
                      onChange={(e) => handleChange(item.key, e.target.checked)}
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
                <h2 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#f8fafc", margin: "0 0 4px 0" }}>Privacy Controls</h2>
                <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: 0 }}>Control who can view your profile, statistics, and leaderboard standings.</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { key: "publicProfile", label: "Public Profile", desc: "Allow other coders to view your profile and achievement badges." },
                  { key: "showSolvedProblems", label: "Show Solved Problems", desc: "Display your topic strength bar charts on your public card." },
                  { key: "showActivity", label: "Show Activity", desc: "Include your recent submission history in global activity feeds." },
                  { key: "showContestRanking", label: "Show Contest Ranking", desc: "Display your competitive score and rank on public leaderboards." }
                ].map((item) => (
                  <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#080c14", border: "1px solid rgba(255,255,255,0.06)", padding: "14px 18px", borderRadius: "10px" }}>
                    <div>
                      <strong style={{ color: "#f8fafc", fontSize: "0.9rem", display: "block" }}>{item.label}</strong>
                      <span style={{ color: "#64748b", fontSize: "0.78rem" }}>{item.desc}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(formData[item.key])}
                      onChange={(e) => handleChange(item.key, e.target.checked)}
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
                <h2 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#f8fafc", margin: "0 0 4px 0" }}>Account Security & Data</h2>
                <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: 0 }}>Change your password, review connected accounts, or delete your account.</p>
              </div>

              {/* Password Form */}
              <form onSubmit={handlePasswordChange} style={{ display: "flex", flexDirection: "column", gap: "16px", background: "#080c14", padding: "20px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <strong style={{ fontSize: "0.95rem", color: "#f8fafc" }}>Change Password</strong>

                {passwordStatus.text && (
                  <div style={{ padding: "8px 12px", borderRadius: "6px", fontSize: "0.82rem", background: passwordStatus.type === "error" ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)", color: passwordStatus.type === "error" ? "#f87171" : "#4ade80", border: `1px solid ${passwordStatus.type === "error" ? "#ef4444" : "#10b981"}` }}>
                    {passwordStatus.text}
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
                  disabled={isChangingPassword}
                  style={{
                    alignSelf: "flex-start",
                    background: "#4f46e5",
                    color: "#ffffff",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    fontSize: "0.82rem",
                    fontWeight: "600",
                    cursor: isChangingPassword ? "not-allowed" : "pointer"
                  }}
                >
                  {isChangingPassword ? "Updating..." : "Update Password"}
                </button>
              </form>

              {/* Connected Accounts */}
              <div style={{ background: "#080c14", padding: "20px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", gap: "14px" }}>
                <strong style={{ fontSize: "0.95rem", color: "#f8fafc" }}>Connected Accounts</strong>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "10px" }}>
                  <div>
                    <strong style={{ fontSize: "0.88rem", color: "#f8fafc", display: "block" }}>Email & Password</strong>
                    <span style={{ fontSize: "0.76rem", color: "#64748b" }}>Primary authenticated login provider</span>
                  </div>
                  <span style={{ fontSize: "0.78rem", color: "#4ade80", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", padding: "2px 8px", borderRadius: "999px" }}>
                    Connected
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong style={{ fontSize: "0.88rem", color: "#f8fafc", display: "block" }}>GitHub OAuth</strong>
                    <span style={{ fontSize: "0.76rem", color: "#64748b" }}>Fast single sign-on</span>
                  </div>
                  <span style={{ fontSize: "0.78rem", color: "#94a3b8", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", padding: "2px 8px", borderRadius: "999px" }}>
                    Not connected
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <div style={{ background: "#080c14", padding: "18px 20px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ fontSize: "0.92rem", color: "#f8fafc", display: "block" }}>Active Session</strong>
                  <span style={{ fontSize: "0.78rem", color: "#64748b" }}>Log out from this device and clear cached credentials.</span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#f8fafc",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    fontSize: "0.82rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>

              {/* Danger Zone: Delete Account */}
              <div style={{ border: "1px solid rgba(239, 68, 68, 0.3)", background: "rgba(239, 68, 68, 0.05)", borderRadius: "10px", padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ color: "#f87171", fontSize: "0.92rem", display: "block" }}>Delete Account</strong>
                  <span style={{ color: "#94a3b8", fontSize: "0.78rem" }}>Permanently remove your account and all associated test submissions.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(true);
                    setDeleteConfirmText("");
                    setDeleteError("");
                  }}
                  style={{ background: "#ef4444", color: "#ffffff", border: "none", padding: "8px 16px", borderRadius: "6px", fontSize: "0.82rem", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Trash2 size={14} />
                  <span>Delete Account</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.75)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 300,
              padding: "16px"
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                background: "#0f1628",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                borderRadius: "14px",
                padding: "24px",
                maxWidth: "440px",
                width: "100%",
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8)",
                display: "flex",
                flexDirection: "column",
                gap: "14px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ fontSize: "1.1rem", color: "#f87171", display: "flex", alignItems: "center", gap: "6px" }}>
                  <AlertTriangle size={18} />
                  Delete your Judgo account?
                </strong>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
                >
                  <X size={18} />
                </button>
              </div>

              <p style={{ fontSize: "0.85rem", color: "#cbd5e1", margin: 0, lineHeight: "1.5" }}>
                This action permanently removes your account, coding XP, ranking, and all historical submissions. <strong>This cannot be undone.</strong>
              </p>

              {deleteError && (
                <div style={{ padding: "8px 12px", background: "rgba(239,68,68,0.15)", border: "1px solid #ef4444", borderRadius: "6px", color: "#f87171", fontSize: "0.8rem" }}>
                  {deleteError}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                  Type <strong>DELETE</strong> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  style={{
                    background: "#080c14",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "6px",
                    padding: "8px 12px",
                    color: "#ffffff",
                    fontSize: "0.88rem",
                    textTransform: "uppercase"
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "6px",
                    padding: "8px 16px",
                    color: "#cbd5e1",
                    fontSize: "0.84rem",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleteConfirmText !== "DELETE" || isDeleting}
                  onClick={handleDeleteAccount}
                  style={{
                    background: deleteConfirmText === "DELETE" ? "#ef4444" : "rgba(239,68,68,0.3)",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 16px",
                    color: "#ffffff",
                    fontSize: "0.84rem",
                    fontWeight: "600",
                    cursor: deleteConfirmText === "DELETE" && !isDeleting ? "pointer" : "not-allowed"
                  }}
                >
                  {isDeleting ? "Deleting..." : "Delete Account"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
