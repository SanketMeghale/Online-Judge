import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { applyThemeAndAppearance } from "../utils/themeApplier.js";
import { useAuth } from "../auth/AuthContext.jsx";

const SETTINGS_STORAGE_KEY = "judgo-user-settings-v1";
const THEME_STORAGE_KEY = "judgo_theme";

const DEFAULT_PREFERENCES = {
  theme: "light",
  accentColor: "indigo",
  density: "comfortable",
  compactMode: false,
  fontSize: 14,
  tabSize: 4,
  wordWrap: true,
  lineNumbers: true,
  autoSave: true,
  editorTheme: "judgo-dark",
  contestReminders: true,
  submissionResults: true,
  achievementAlerts: true,
  dailyStreakReminders: true,
  aiCoachNotifications: true,
  publicProfile: true,
  showSolvedProblems: true,
  showActivity: true,
  showContestRanking: true
};

const ThemeContext = createContext({
  theme: "light",
  resolvedTheme: "light",
  isLight: true,
  isDark: false,
  setTheme: () => {},
  toggleTheme: () => {},
  accentColor: "indigo",
  setAccentColor: () => {},
  density: "comfortable",
  setDensity: () => {},
  preferences: DEFAULT_PREFERENCES,
  updatePreferences: () => {}
});

function getInitialPreferences() {
  if (typeof window === "undefined") {
    return DEFAULT_PREFERENCES;
  }

  try {
    const rawTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    const parsedSettings = storedSettings ? JSON.parse(storedSettings) : {};

    const theme = rawTheme || parsedSettings.theme || "light";
    const accentColor = parsedSettings.accentColor || "indigo";
    const density = parsedSettings.density || (parsedSettings.compactMode ? "compact" : "comfortable");
    const compactMode = Boolean(parsedSettings.compactMode || density === "compact");

    return {
      ...DEFAULT_PREFERENCES,
      ...parsedSettings,
      theme,
      accentColor,
      density,
      compactMode
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function ThemeProvider({ children }) {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState(getInitialPreferences);

  // Compute resolved theme ('dark' | 'light')
  const [resolvedTheme, setResolvedTheme] = useState(() => {
    const theme = preferences.theme;
    if (theme === "system" && typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return theme === "light" ? "light" : "dark";
  });

  // Apply to DOM whenever preferences or resolvedTheme change
  const applyCurrentPreferences = useCallback((prefs) => {
    let resolved = prefs.theme;
    if (prefs.theme === "system" && typeof window !== "undefined") {
      resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    setResolvedTheme(resolved);
    applyThemeAndAppearance(prefs);
  }, []);

  // Initialize on mount
  useEffect(() => {
    applyCurrentPreferences(preferences);
  }, [preferences, applyCurrentPreferences]);

  // Sync with logged-in user profile preferences if available
  useEffect(() => {
    if (user?.preferences) {
      setPreferences((prev) => {
        const next = {
          ...prev,
          ...user.preferences,
          theme: user.preferences.theme || prev.theme,
          accentColor: user.preferences.accentColor || prev.accentColor,
          density: user.preferences.density || prev.density,
          compactMode: user.preferences.compactMode ?? prev.compactMode
        };
        applyCurrentPreferences(next);
        return next;
      });
    }
  }, [user?.preferences, applyCurrentPreferences]);

  // Listen to OS color scheme changes when theme === 'system'
  useEffect(() => {
    if (preferences.theme !== "system" || typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      const newResolved = e.matches ? "dark" : "light";
      setResolvedTheme(newResolved);
      applyThemeAndAppearance({ ...preferences, theme: "system" });
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [preferences]);

  const updatePreferences = useCallback(
    (newPrefs) => {
      setPreferences((prev) => {
        const next = { ...prev, ...newPrefs };
        try {
          if (newPrefs.theme) {
            localStorage.setItem(THEME_STORAGE_KEY, newPrefs.theme);
          }
          localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
        } catch {}
        applyCurrentPreferences(next);
        return next;
      });
    },
    [applyCurrentPreferences]
  );

  const setTheme = useCallback(
    (themeMode) => {
      updatePreferences({ theme: themeMode });
    },
    [updatePreferences]
  );

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  const setAccentColor = useCallback(
    (color) => {
      updatePreferences({ accentColor: color });
    },
    [updatePreferences]
  );

  const setDensity = useCallback(
    (densityMode) => {
      const isCompact = densityMode === "compact";
      updatePreferences({ density: densityMode, compactMode: isCompact });
    },
    [updatePreferences]
  );

  return (
    <ThemeContext.Provider
      value={{
        theme: preferences.theme,
        resolvedTheme,
        isLight: resolvedTheme === "light",
        isDark: resolvedTheme === "dark",
        setTheme,
        toggleTheme,
        accentColor: preferences.accentColor,
        setAccentColor,
        density: preferences.density,
        setDensity,
        preferences,
        updatePreferences
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
