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
  RotateCcw,
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
import { useTheme } from "../context/ThemeContext.jsx";
import { writeStoredSession, readStoredSession } from "../auth/authStorage.js";
import { getUserDisplayName } from "../auth/displayName.js";
import CodeEditor from "../components/editor/CodeEditor.jsx";
import "../styles/settings.css";

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
  { id: "hi-IN", name: "Hindi" },
  { id: "mr-IN", name: "Marathi" }
];

const SAMPLE_PREVIEW_CODE = `# Live Code Editor Preview
def two_sum(nums: list[int], target: int) -> list[int]:
    lookup = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in lookup:
            return [lookup[complement], i]
        lookup[num] = i
    return []
`;

export default function Settings() {
  const { user, logout } = useAuth();
  const { getUserById, updateDatabase } = useAppData();
  const {
    theme,
    setTheme,
    accentColor,
    setAccentColor,
    density,
    setDensity,
    isLight,
    updatePreferences
  } = useTheme();
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

  // Preview code editor state
  const [previewCode, setPreviewCode] = useState(SAMPLE_PREVIEW_CODE);

  // Initial Form State loaded from live user & storage
  const [formData, setFormData] = useState(() => {
    let localPrefs = {};
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) localPrefs = JSON.parse(stored);
    } catch {}

    const userPrefs = liveUser?.preferences || {};

    return {
      displayName: getUserDisplayName(liveUser),
      username: liveUser?.username || "",
      email: liveUser?.email || "",
      bio: liveUser?.bio || "",
      location: liveUser?.location || "",
      github: liveUser?.github || "",
      linkedin: liveUser?.linkedin || "",
      website: liveUser?.website || "",
      language: liveUser?.language || localPrefs?.language || "en-US",
      timezone: liveUser?.timezone || localPrefs?.timezone || "UTC-5 (Eastern Time / US & Canada)",
      theme: userPrefs?.theme || localPrefs?.theme || theme || "light",
      accentColor: userPrefs?.accentColor || localPrefs?.accentColor || accentColor || "indigo",
      density: userPrefs?.density || localPrefs?.density || density || "comfortable",
      compactMode: userPrefs?.compactMode ?? localPrefs?.compactMode ?? (density === "compact"),
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
    const nextDisplayName = getUserDisplayName(liveUser);
    if (nextDisplayName && !savedBaseline.displayName) {
      const updated = {
        ...formData,
        displayName: nextDisplayName || formData.displayName,
        username: liveUser.username || formData.username,
        email: liveUser.email || formData.email,
        bio: liveUser.bio || formData.bio,
        location: liveUser.location || formData.location,
        github: liveUser.github || formData.github,
        linkedin: liveUser.linkedin || formData.linkedin,
        website: liveUser.website || formData.website
      };
      setFormData(updated);
      setSavedBaseline(updated);
    }
  }, [liveUser?.displayName, liveUser?.name, liveUser?.username, liveUser?.email]);

  // Tab Sync with URL search params
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Compute if form is dirty
  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(savedBaseline);
  }, [formData, savedBaseline]);

  function handleTabChange(tabKey) {
    setActiveTab(tabKey);
    setSearchParams({ tab: tabKey });
  }

  function handleChange(key, value) {
    setFormData((prev) => {
      const next = { ...prev, [key]: value };

      // Apply real-time updates for appearance & editor immediately
      if (key === "theme") {
        setTheme(value);
      } else if (key === "accentColor") {
        setAccentColor(value);
      } else if (key === "density") {
        setDensity(value);
      } else if (key === "compactMode") {
        setDensity(value ? "compact" : "comfortable");
      } else if (
        [
          "fontSize",
          "tabSize",
          "wordWrap",
          "lineNumbers",
          "autoSave",
          "editorTheme",
          "contestReminders",
          "submissionResults",
          "achievementAlerts",
          "dailyStreakReminders",
          "aiCoachNotifications",
          "publicProfile",
          "showSolvedProblems",
          "showActivity",
          "showContestRanking"
        ].includes(key)
      ) {
        updatePreferences({ [key]: value });
      }

      return next;
    });

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
          const res = await api.checkUsername(cleanUser);
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

  function handleResetChanges() {
    setFormData(savedBaseline);
    updatePreferences(savedBaseline);
    setSaveErrorMsg("");
    setSaveSuccessMsg("");
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
          location: formData.location.trim(),
          github: formData.github.trim(),
          linkedin: formData.linkedin.trim(),
          website: formData.website.trim(),
          language: formData.language,
          timezone: formData.timezone,
          preferences
        });
        if (apiRes?.user) {
          updatedUser = apiRes.user;
        }
      } catch (apiErr) {
        console.warn("[Settings API Update Notice]:", apiErr);
      }

      // 2. Persist to localStorage & trigger live preferences
      updatePreferences(preferences);

      // 3. Update session storage
      const currentSession = readStoredSession();
      if (currentSession && currentSession.user) {
        const nextUser = {
          ...currentSession.user,
          name: formData.displayName.trim(),
          displayName: formData.displayName.trim(),
          username: formData.username.trim(),
          bio: formData.bio.trim(),
          location: formData.location.trim(),
          github: formData.github.trim(),
          linkedin: formData.linkedin.trim(),
          website: formData.website.trim(),
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
                displayName: formData.displayName.trim(),
                username: formData.username.trim(),
                bio: formData.bio.trim(),
                location: formData.location.trim(),
                github: formData.github.trim(),
                linkedin: formData.linkedin.trim(),
                website: formData.website.trim(),
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
    if (newPassword.length < 12) {
      setPasswordStatus({ type: "error", text: "New password must be at least 12 characters long." });
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

      if (res?.success) {
        setPasswordStatus({ type: "success", text: "✓ Password updated successfully." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordStatus({ type: "error", text: res?.error || "Failed to update password." });
      }
    } catch (err) {
      setPasswordStatus({ type: "error", text: err?.message || "Incorrect current password." });
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== "DELETE") {
      setDeleteError("Please type DELETE in all caps to confirm.");
      return;
    }

    setIsDeleting(true);
    setDeleteError("");

    try {
      const res = await api.deleteAccount({ confirmation: "DELETE" });
      if (res?.success) {
        setShowDeleteModal(false);
        await logout();
        navigate("/", { replace: true });
      } else {
        setDeleteError(res?.error || "Could not delete account.");
      }
    } catch (err) {
      setDeleteError(err?.message || "Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  const tabs = [
    { key: "general", label: "General", icon: User, desc: "Profile identity & bio" },
    { key: "appearance", label: "Appearance", icon: Palette, desc: "Theme, accents & density" },
    { key: "editor", label: "Editor", icon: Code2, desc: "Font, tabs & syntax theme" },
    { key: "notifications", label: "Notifications", icon: Bell, desc: "Contest, streak & coach alerts" },
    { key: "privacy", label: "Privacy", icon: Shield, desc: "Profile & activity visibility" },
    { key: "account", label: "Account", icon: KeyRound, desc: "Security, password & danger zone" }
  ];

  const avatarLetter = String(formData.displayName || formData.username || "U").slice(0, 1).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="settings-page-wrapper"
    >
      {/* Header */}
      <header className="settings-header">
        <div>
          <span className="settings-kicker">Preferences & Security</span>
          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">Customize your Judgo developer experience.</p>
        </div>

        {/* Global Save & Cancel Actions */}
        <div className="settings-header-actions">
          {isDirty && !saveSuccessMsg && (
            <span className="settings-unsaved-pill">● Unsaved changes</span>
          )}

          {isDirty && (
            <button
              onClick={handleResetChanges}
              disabled={isSaving}
              type="button"
              className="settings-btn-cancel"
            >
              <RotateCcw size={14} />
              <span>Cancel</span>
            </button>
          )}

          <button
            onClick={handleSaveAll}
            disabled={!isDirty || isSaving}
            type="button"
            className={`settings-btn-save ${
              saveSuccessMsg ? "success" : isDirty ? "active" : "disabled"
            }`}
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
        <div
          style={{
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid #ef4444",
            color: "#f87171",
            padding: "10px 16px",
            borderRadius: "8px",
            fontSize: "0.86rem",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <AlertTriangle size={16} />
          <span>{saveErrorMsg}</span>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="settings-grid">
        {/* LEFT COLUMN: Settings Navigation */}
        <nav className="settings-nav-card">
          {tabs.map(({ key, label, icon: Icon, desc }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleTabChange(key)}
                className={`settings-nav-btn ${isActive ? "active" : ""}`}
              >
                <Icon size={18} className="settings-nav-btn-icon" />
                <div>
                  <span className="settings-nav-btn-label">{label}</span>
                  <span className="settings-nav-btn-desc">{desc}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* RIGHT COLUMN: Interactive Settings Panels */}
        <main className="settings-content-card">
          {/* TAB 1: GENERAL */}
          {activeTab === "general" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
              <div className="settings-section-header">
                <h2 className="settings-section-title">General Settings</h2>
                <p className="settings-section-desc">Manage your personal identity, bio, location, and locale.</p>
              </div>

              {/* Avatar Preview & Display Identity */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "14px 18px",
                  background: isLight ? "#f8fafc" : "#080c14",
                  border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "10px"
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                    fontWeight: "800",
                    fontSize: "1.2rem",
                    flexShrink: 0
                  }}
                >
                  {avatarLetter}
                </div>
                <div>
                  <strong style={{ color: isLight ? "#0f172a" : "#f8fafc", fontSize: "0.95rem", display: "block" }}>
                    {formData.displayName || "Judgo Developer"}
                  </strong>
                  <span style={{ color: isLight ? "#475569" : "#94a3b8", fontSize: "0.78rem" }}>
                    @{formData.username || "username"} · {formData.email || "developer@example.com"}
                  </span>
                </div>
              </div>

              <div className="settings-row-2">
                {/* Display Name */}
                <div className="settings-form-group">
                  <label className="settings-label">Display Name</label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => handleChange("displayName", e.target.value)}
                    className="settings-input"
                    placeholder="Jane Doe"
                  />
                  <span className="settings-hint">Appears on leaderboard, submissions & profile badge.</span>
                </div>

                {/* Username */}
                <div className="settings-form-group">
                  <div className="settings-label">
                    <span>Username</span>
                    {usernameCheck.message && (
                      <span
                        style={{
                          fontSize: "0.72rem",
                          color: usernameCheck.available ? "#10b981" : "#ef4444",
                          fontWeight: "600"
                        }}
                      >
                        {usernameCheck.message}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleChange("username", e.target.value)}
                    className="settings-input"
                    placeholder="janedoe"
                  />
                  <span className="settings-hint">Unique handle for your coding track and profile URL.</span>
                </div>
              </div>

              {/* Email Address (Read-only / Authenticated) */}
              <div className="settings-form-group">
                <label className="settings-label">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="settings-input"
                  placeholder="developer@example.com"
                />
                <span className="settings-hint">Connected authentication email (managed via account security).</span>
              </div>

              {/* Bio / Headline */}
              <div className="settings-form-group">
                <div className="settings-label">
                  <span>Bio / Headline</span>
                  <span style={{ fontSize: "0.72rem", color: formData.bio.length > 280 ? "#f59e0b" : "#64748b" }}>
                    {formData.bio.length}/300
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={300}
                  value={formData.bio}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  className="settings-textarea"
                  placeholder="Tell other competitive programmers a little about your journey, favorite algorithms & tech stack..."
                />
              </div>

              {/* Location & Social Links */}
              <div className="settings-row-2">
                <div className="settings-form-group">
                  <label className="settings-label">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    className="settings-input"
                    placeholder="San Francisco, CA"
                  />
                </div>

                <div className="settings-form-group">
                  <label className="settings-label">GitHub Profile</label>
                  <input
                    type="text"
                    value={formData.github}
                    onChange={(e) => handleChange("github", e.target.value)}
                    className="settings-input"
                    placeholder="https://github.com/username"
                  />
                </div>
              </div>

              <div className="settings-row-2">
                <div className="settings-form-group">
                  <label className="settings-label">LinkedIn Profile</label>
                  <input
                    type="text"
                    value={formData.linkedin}
                    onChange={(e) => handleChange("linkedin", e.target.value)}
                    className="settings-input"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div className="settings-form-group">
                  <label className="settings-label">Personal Website</label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => handleChange("website", e.target.value)}
                    className="settings-input"
                    placeholder="https://yourportfolio.dev"
                  />
                </div>
              </div>

              {/* Language & Time Zone */}
              <div className="settings-row-2">
                <div className="settings-form-group">
                  <label className="settings-label">Interface Language</label>
                  <select
                    value={formData.language}
                    onChange={(e) => handleChange("language", e.target.value)}
                    className="settings-select"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.id} value={lang.id}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="settings-form-group">
                  <label className="settings-label">Time Zone</label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => handleChange("timezone", e.target.value)}
                    className="settings-select"
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
              <div className="settings-section-header">
                <h2 className="settings-section-title">Appearance & Theme</h2>
                <p className="settings-section-desc">Customize color palette, system theme, and UI density.</p>
              </div>

              {/* Theme Mode Selector (Dark / Light / System) */}
              <div>
                <label className="settings-label" style={{ marginBottom: "10px" }}>Theme Mode</label>
                <div className="settings-theme-grid">
                  {[
                    { id: "light", label: "Light", icon: Sun, desc: "Crisp light contrast & clean surfaces" },
                    { id: "dark", label: "Dark", icon: Moon, desc: "Charcoal navy for focused coding" },
                    { id: "system", label: "System", icon: Laptop, desc: "Automatically matches your OS" }
                  ].map((t) => {
                    const isSelected = formData.theme === t.id;
                    const Icon = t.icon;
                    return (
                      <div
                        key={t.id}
                        onClick={() => handleChange("theme", t.id)}
                        className={`settings-theme-card ${isSelected ? "active" : ""}`}
                      >
                        <div className="settings-theme-card-header">
                          <Icon size={16} />
                          <span>{t.label}</span>
                        </div>
                        <span className="settings-theme-card-desc">{t.desc}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Accent Color Palette (Indigo, Purple, Blue, Green) */}
              <div>
                <label className="settings-label" style={{ marginBottom: "10px" }}>Accent Color</label>
                <div className="settings-accent-row">
                  {[
                    { id: "indigo", color: "#6366f1", label: "Indigo" },
                    { id: "purple", color: "#a855f7", label: "Purple" },
                    { id: "blue", color: "#3b82f6", label: "Blue" },
                    { id: "emerald", color: "#10b981", label: "Emerald Green" }
                  ].map((c) => {
                    const isSelected = formData.accentColor === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleChange("accentColor", c.id)}
                        className={`settings-accent-btn ${isSelected ? "active" : ""}`}
                      >
                        <span className="settings-accent-dot" style={{ background: c.color }} />
                        <span>{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Display Density Mode (Comfortable vs Compact) */}
              <div>
                <label className="settings-label" style={{ marginBottom: "10px" }}>Display Density</label>
                <div className="settings-row-2">
                  {[
                    { id: "comfortable", label: "Comfortable", desc: "Standard spacing for relaxed readability" },
                    { id: "compact", label: "Compact", desc: "Compact row heights for higher information density" }
                  ].map((d) => {
                    const isSelected = formData.density === d.id;
                    return (
                      <div
                        key={d.id}
                        onClick={() => {
                          handleChange("density", d.id);
                          handleChange("compactMode", d.id === "compact");
                        }}
                        className={`settings-theme-card ${isSelected ? "active" : ""}`}
                      >
                        <strong style={{ color: isSelected ? "var(--accent-primary)" : isLight ? "#0f172a" : "#f8fafc", fontSize: "0.88rem", display: "block" }}>
                          {d.label}
                        </strong>
                        <span className="settings-theme-card-desc">{d.desc}</span>
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
              <div className="settings-section-header">
                <h2 className="settings-section-title">Code Editor Settings</h2>
                <p className="settings-section-desc">Configure typography, indentation, syntax themes, and editor behaviors.</p>
              </div>

              {/* Font Size (12, 13, 14, 15, 16, 18, 20) */}
              <div className="settings-form-group">
                <div className="settings-label">
                  <span>Editor Font Size</span>
                  <strong style={{ color: "var(--accent-primary, #6366f1)", fontSize: "0.85rem" }}>
                    {formData.fontSize}px
                  </strong>
                </div>
                <div className="settings-font-row">
                  {[12, 13, 14, 15, 16, 18, 20].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleChange("fontSize", size)}
                      className={`settings-font-btn ${formData.fontSize === size ? "active" : ""}`}
                    >
                      {size}px
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Size & Editor Theme */}
              <div className="settings-row-2">
                <div className="settings-form-group">
                  <label className="settings-label">Tab Indentation</label>
                  <select
                    value={formData.tabSize}
                    onChange={(e) => handleChange("tabSize", Number(e.target.value))}
                    className="settings-select"
                  >
                    <option value={2}>2 Spaces</option>
                    <option value={4}>4 Spaces (Standard)</option>
                    <option value={8}>8 Spaces</option>
                  </select>
                </div>

                <div className="settings-form-group">
                  <label className="settings-label">Syntax Highlighting Theme</label>
                  <select
                    value={formData.editorTheme}
                    onChange={(e) => handleChange("editorTheme", e.target.value)}
                    className="settings-select"
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
                  {
                    key: "wordWrap",
                    label: "Word Wrap",
                    desc: "Wrap code lines that exceed editor horizontal boundary."
                  },
                  {
                    key: "lineNumbers",
                    label: "Line Numbers",
                    desc: "Display numbered gutter along the left edge of the code editor."
                  },
                  {
                    key: "autoSave",
                    label: "Auto Save Drafts",
                    desc: "Automatically save code buffer to local storage on problem change."
                  }
                ].map((item) => (
                  <div
                    key={item.key}
                    onClick={() => handleChange(item.key, !formData[item.key])}
                    className="judgo-toggle-card"
                  >
                    <div>
                      <span className="judgo-toggle-title">{item.label}</span>
                      <span className="judgo-toggle-desc">{item.desc}</span>
                    </div>
                    <button
                      type="button"
                      className={`judgo-toggle-switch ${formData[item.key] ? "on" : ""}`}
                      aria-label={`Toggle ${item.label}`}
                    >
                      <span className="judgo-toggle-thumb" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Embedded Live Code Editor Preview */}
              <div className="settings-preview-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: "0.86rem", color: isLight ? "#0f172a" : "#f8fafc" }}>
                    Live Editor Preview
                  </strong>
                  <span style={{ fontSize: "0.72rem", color: isLight ? "#64748b" : "#94a3b8" }}>
                    {formData.fontSize}px · {formData.tabSize} spaces · {formData.editorTheme}
                  </span>
                </div>
                <div style={{ height: "160px", borderRadius: "8px", overflow: "hidden" }}>
                  <CodeEditor
                    initialCode={previewCode}
                    language="Python"
                    onChange={(code) => setPreviewCode(code)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="settings-section-header">
                <h2 className="settings-section-title">Notification Preferences</h2>
                <p className="settings-section-desc">Control platform alerts, contest notifications, and streak reminders.</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  {
                    key: "contestReminders",
                    label: "Contest Reminders",
                    desc: "Receive alerts 30 minutes before weekly scheduled contests start."
                  },
                  {
                    key: "submissionResults",
                    label: "Submission Results",
                    desc: "Get notified when background judge worker finishes evaluating your code."
                  },
                  {
                    key: "achievementAlerts",
                    label: "Achievement Notifications",
                    desc: "Notify when you earn new problem milestones or streak badges."
                  },
                  {
                    key: "dailyStreakReminders",
                    label: "Daily Coding Reminders",
                    desc: "Daily evening reminder to solve a problem and protect your streak."
                  },
                  {
                    key: "aiCoachNotifications",
                    label: "Judgo Intelligence Notifications",
                    desc: "Get feedback and interview tips from Judgo Intelligence after solving."
                  }
                ].map((item) => (
                  <div
                    key={item.key}
                    onClick={() => handleChange(item.key, !formData[item.key])}
                    className="judgo-toggle-card"
                  >
                    <div>
                      <span className="judgo-toggle-title">{item.label}</span>
                      <span className="judgo-toggle-desc">{item.desc}</span>
                    </div>
                    <button
                      type="button"
                      className={`judgo-toggle-switch ${formData[item.key] ? "on" : ""}`}
                      aria-label={`Toggle ${item.label}`}
                    >
                      <span className="judgo-toggle-thumb" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PRIVACY */}
          {activeTab === "privacy" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="settings-section-header">
                <h2 className="settings-section-title">Privacy Controls</h2>
                <p className="settings-section-desc">Control who can view your profile, statistics, and leaderboard standings.</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  {
                    key: "publicProfile",
                    label: "Public Profile",
                    desc: "Allow other coders to view your profile and achievement badges."
                  },
                  {
                    key: "showSolvedProblems",
                    label: "Show Solved Problems",
                    desc: "Display your topic strength bar charts on your public card."
                  },
                  {
                    key: "showActivity",
                    label: "Show Activity Feeds",
                    desc: "Include your recent submission history in global activity feeds."
                  },
                  {
                    key: "showContestRanking",
                    label: "Show Contest Ranking",
                    desc: "Display your competitive score and rank on public leaderboards."
                  }
                ].map((item) => (
                  <div
                    key={item.key}
                    onClick={() => handleChange(item.key, !formData[item.key])}
                    className="judgo-toggle-card"
                  >
                    <div>
                      <span className="judgo-toggle-title">{item.label}</span>
                      <span className="judgo-toggle-desc">{item.desc}</span>
                    </div>
                    <button
                      type="button"
                      className={`judgo-toggle-switch ${formData[item.key] ? "on" : ""}`}
                      aria-label={`Toggle ${item.label}`}
                    >
                      <span className="judgo-toggle-thumb" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: ACCOUNT */}
          {activeTab === "account" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="settings-section-header">
                <h2 className="settings-section-title">Account Security & Data</h2>
                <p className="settings-section-desc">Change your password, review connected accounts, or delete your account.</p>
              </div>

              {/* Password Form */}
              <form onSubmit={handlePasswordChange} className="settings-account-panel">
                <strong style={{ fontSize: "0.95rem", color: isLight ? "#0f172a" : "#f8fafc" }}>
                  Change Password
                </strong>

                {passwordStatus.text && (
                  <div
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      fontSize: "0.82rem",
                      background: passwordStatus.type === "error" ? "rgba(239,68,68,0.12)" : "rgba(16,185,129,0.12)",
                      color: passwordStatus.type === "error" ? "#f87171" : "#10b981",
                      border: `1px solid ${passwordStatus.type === "error" ? "#ef4444" : "#10b981"}`
                    }}
                  >
                    {passwordStatus.text}
                  </div>
                )}

                <div className="settings-form-group">
                  <label className="settings-label">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="settings-input"
                    placeholder="Enter current password"
                  />
                </div>

                <div className="settings-row-2">
                  <div className="settings-form-group">
                    <label className="settings-label">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="settings-input"
                      placeholder="Minimum 12 characters"
                    />
                  </div>
                  <div className="settings-form-group">
                    <label className="settings-label">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="settings-input"
                      placeholder="Re-enter new password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                  className="settings-btn-save active"
                  style={{ alignSelf: "flex-start" }}
                >
                  {isChangingPassword ? "Updating..." : "Update Password"}
                </button>
              </form>

              {/* Connected Accounts */}
              <div className="settings-account-panel">
                <strong style={{ fontSize: "0.95rem", color: isLight ? "#0f172a" : "#f8fafc" }}>
                  Connected Accounts
                </strong>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.06)",
                    paddingBottom: "10px"
                  }}
                >
                  <div>
                    <strong style={{ fontSize: "0.88rem", color: isLight ? "#0f172a" : "#f8fafc", display: "block" }}>
                      Email & Password
                    </strong>
                    <span style={{ fontSize: "0.76rem", color: isLight ? "#475569" : "#64748b" }}>
                      Primary authenticated login credential
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "0.78rem",
                      color: "#10b981",
                      background: "rgba(16,185,129,0.12)",
                      border: "1px solid rgba(16,185,129,0.25)",
                      padding: "2px 8px",
                      borderRadius: "999px"
                    }}
                  >
                    Connected
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong style={{ fontSize: "0.88rem", color: isLight ? "#0f172a" : "#f8fafc", display: "block" }}>
                      Google Authentication
                    </strong>
                    <span style={{ fontSize: "0.76rem", color: isLight ? "#475569" : "#64748b" }}>
                      Fast single sign-on authentication
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "0.78rem",
                      color: isLight ? "#64748b" : "#94a3b8",
                      background: isLight ? "#f1f5f9" : "rgba(255,255,255,0.05)",
                      border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.08)",
                      padding: "2px 8px",
                      borderRadius: "999px"
                    }}
                  >
                    OAuth Available
                  </span>
                </div>
              </div>

              {/* Active Session / Logout */}
              <div className="settings-account-panel" style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ fontSize: "0.92rem", color: isLight ? "#0f172a" : "#f8fafc", display: "block" }}>
                    Active Session
                  </strong>
                  <span style={{ fontSize: "0.78rem", color: isLight ? "#475569" : "#64748b" }}>
                    Log out from this device and clear cached credentials.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="settings-btn-cancel"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>

              {/* Danger Zone: Delete Account */}
              <div className="settings-danger-card">
                <div>
                  <strong style={{ color: "#ef4444", fontSize: "0.92rem", display: "block" }}>
                    Delete Account
                  </strong>
                  <span style={{ color: isLight ? "#475569" : "#94a3b8", fontSize: "0.78rem" }}>
                    Permanently remove your account and all associated test submissions.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(true);
                    setDeleteConfirmText("");
                    setDeleteError("");
                  }}
                  className="settings-btn-danger"
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
          <div className="settings-modal-backdrop">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="settings-modal-box"
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ fontSize: "1.1rem", color: "#ef4444", display: "flex", alignItems: "center", gap: "6px" }}>
                  <AlertTriangle size={18} />
                  Delete your Judgo account?
                </strong>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  style={{ background: "transparent", border: "none", color: isLight ? "#475569" : "#94a3b8", cursor: "pointer" }}
                >
                  <X size={18} />
                </button>
              </div>

              <p style={{ fontSize: "0.85rem", color: isLight ? "#334155" : "#cbd5e1", margin: 0, lineHeight: "1.5" }}>
                This action permanently removes your account, coding XP, ranking, and all historical submissions. <strong>This cannot be undone.</strong>
              </p>

              {deleteError && (
                <div
                  style={{
                    padding: "8px 12px",
                    background: "rgba(239,68,68,0.15)",
                    border: "1px solid #ef4444",
                    borderRadius: "6px",
                    color: "#f87171",
                    fontSize: "0.8rem"
                  }}
                >
                  {deleteError}
                </div>
              )}

              <div className="settings-form-group">
                <label className="settings-label" style={{ fontSize: "0.78rem" }}>
                  Type <strong>DELETE</strong> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="settings-input"
                  style={{ textTransform: "uppercase" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="settings-btn-cancel"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleteConfirmText !== "DELETE" || isDeleting}
                  onClick={handleDeleteAccount}
                  className="settings-btn-danger"
                  style={{
                    opacity: deleteConfirmText === "DELETE" && !isDeleting ? 1 : 0.4,
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
