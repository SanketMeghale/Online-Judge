const ACCENT_COLORS = {
  indigo: {
    primary: "#6366f1",
    hover: "#4f46e5",
    glow: "rgba(99, 102, 241, 0.35)",
    tint: "rgba(99, 102, 241, 0.12)"
  },
  purple: {
    primary: "#a855f7",
    hover: "#9333ea",
    glow: "rgba(168, 85, 247, 0.35)",
    tint: "rgba(168, 85, 247, 0.12)"
  },
  blue: {
    primary: "#3b82f6",
    hover: "#2563eb",
    glow: "rgba(59, 130, 246, 0.35)",
    tint: "rgba(59, 130, 246, 0.12)"
  },
  emerald: {
    primary: "#10b981",
    hover: "#059669",
    glow: "rgba(16, 185, 129, 0.35)",
    tint: "rgba(16, 185, 129, 0.12)"
  }
};

export function applyThemeAndAppearance(preferences = {}) {
  if (typeof window === "undefined" || !document?.documentElement) return;

  const root = document.documentElement;
  const body = document.body;

  // 1. Resolve Theme mode (dark, light, system)
  const theme = preferences.theme || "light";
  let resolvedTheme = theme;
  if (theme === "system") {
    resolvedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  root.setAttribute("data-theme", resolvedTheme);
  root.classList.remove("theme-dark", "theme-light");
  root.classList.add(`theme-${resolvedTheme}`);

  if (body) {
    body.setAttribute("data-theme", resolvedTheme);
    body.classList.remove("theme-dark", "theme-light");
    body.classList.add(`theme-${resolvedTheme}`);
  }

  // 2. Set Theme CSS Custom Variables
  if (resolvedTheme === "light") {
    // Light Theme Palette
    root.style.setProperty("--bg-app", "#f8fafc");
    root.style.setProperty("--bg-base", "#f1f5f9");
    root.style.setProperty("--bg-surface", "#ffffff");
    root.style.setProperty("--bg-card", "#ffffff");
    root.style.setProperty("--bg-card-hover", "#f8fafc");
    root.style.setProperty("--bg-card-elevated", "#f1f5f9");
    root.style.setProperty("--bg-input", "#ffffff");
    root.style.setProperty("--bg-input-focus", "#ffffff");
    root.style.setProperty("--bg-gutter", "#f1f5f9");
    root.style.setProperty("--nav-bg", "rgba(255, 255, 255, 0.94)");
    root.style.setProperty("--sidebar-bg", "#ffffff");
    root.style.setProperty("--modal-bg", "#ffffff");

    root.style.setProperty("--border-subtle", "#e2e8f0");
    root.style.setProperty("--border-card", "#e2e8f0");
    root.style.setProperty("--border-input", "#cbd5e1");
    root.style.setProperty("--border-focus", "rgba(99, 102, 241, 0.5)");

    root.style.setProperty("--text-primary", "#0f172a");
    root.style.setProperty("--text-secondary", "#475569");
    root.style.setProperty("--text-muted", "#64748b");
    root.style.setProperty("--text-heading", "#0f172a");
    root.style.setProperty("--text-on-card", "#334155");

    root.style.setProperty("--table-row-hover", "rgba(0, 0, 0, 0.03)");
    root.style.setProperty("--pill-bg", "rgba(0, 0, 0, 0.04)");
    root.style.setProperty("--pill-border", "rgba(0, 0, 0, 0.08)");

    // Legacy Dashboard variables
    root.style.setProperty("--dash-bg-deep", "#f1f5f9");
    root.style.setProperty("--dash-bg-card", "#ffffff");
    root.style.setProperty("--dash-bg-card-hover", "#f8fafc");
    root.style.setProperty("--dash-bg-elevated", "#f1f5f9");
    root.style.setProperty("--dash-border", "#e2e8f0");
    root.style.setProperty("--dash-border-subtle", "#e2e8f0");
    root.style.setProperty("--dash-text-primary", "#0f172a");
    root.style.setProperty("--dash-text-secondary", "#475569");
    root.style.setProperty("--dash-text-muted", "#64748b");
  } else {
    // Dark Theme Palette
    root.style.setProperty("--bg-app", "#050a18");
    root.style.setProperty("--bg-base", "#030814");
    root.style.setProperty("--bg-surface", "#080c14");
    root.style.setProperty("--bg-card", "#0d111a");
    root.style.setProperty("--bg-card-hover", "#131b2e");
    root.style.setProperty("--bg-card-elevated", "#111827");
    root.style.setProperty("--bg-input", "#080c14");
    root.style.setProperty("--bg-input-focus", "#0b1020");
    root.style.setProperty("--bg-gutter", "#060910");
    root.style.setProperty("--nav-bg", "rgba(8, 12, 20, 0.94)");
    root.style.setProperty("--sidebar-bg", "#080c14");
    root.style.setProperty("--modal-bg", "#0c101a");

    root.style.setProperty("--border-subtle", "rgba(255, 255, 255, 0.08)");
    root.style.setProperty("--border-card", "rgba(255, 255, 255, 0.08)");
    root.style.setProperty("--border-input", "rgba(255, 255, 255, 0.12)");
    root.style.setProperty("--border-focus", "rgba(124, 58, 237, 0.4)");

    root.style.setProperty("--text-primary", "#f8fafc");
    root.style.setProperty("--text-secondary", "#94a3b8");
    root.style.setProperty("--text-muted", "#64748b");
    root.style.setProperty("--text-heading", "#ffffff");
    root.style.setProperty("--text-on-card", "#cbd5e1");

    root.style.setProperty("--table-row-hover", "rgba(255, 255, 255, 0.03)");
    root.style.setProperty("--pill-bg", "rgba(255, 255, 255, 0.06)");
    root.style.setProperty("--pill-border", "rgba(255, 255, 255, 0.08)");

    // Legacy Dashboard variables
    root.style.setProperty("--dash-bg-deep", "#070b14");
    root.style.setProperty("--dash-bg-card", "#0f1628");
    root.style.setProperty("--dash-bg-card-hover", "#131b31");
    root.style.setProperty("--dash-bg-elevated", "#111827");
    root.style.setProperty("--dash-border", "#1e293b");
    root.style.setProperty("--dash-border-subtle", "rgba(255, 255, 255, 0.06)");
    root.style.setProperty("--dash-text-primary", "#f8fafc");
    root.style.setProperty("--dash-text-secondary", "#94a3b8");
    root.style.setProperty("--dash-text-muted", "#64748b");
  }

  // 3. Accent Color
  const accentKey = preferences.accentColor || "indigo";
  const palette = ACCENT_COLORS[accentKey] || ACCENT_COLORS.indigo;

  root.style.setProperty("--dash-accent-primary", palette.primary);
  root.style.setProperty("--dash-accent-hover", palette.hover);
  root.style.setProperty("--dash-accent-glow", palette.glow);
  root.style.setProperty("--dash-accent-tint", palette.tint);
  root.style.setProperty("--accent-primary", palette.primary);
  root.style.setProperty("--accent-hover", palette.hover);

  // 4. Density Mode
  const isCompact = preferences.compactMode || preferences.density === "compact";
  root.setAttribute("data-density", isCompact ? "compact" : "comfortable");

  if (isCompact) {
    root.style.setProperty("--dash-padding-card", "12px 16px");
    root.style.setProperty("--table-cell-padding", "10px 12px");
  } else {
    root.style.setProperty("--dash-padding-card", "20px 24px");
    root.style.setProperty("--table-cell-padding", "16px 16px");
  }
}
