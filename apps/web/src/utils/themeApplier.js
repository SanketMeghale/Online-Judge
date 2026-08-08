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

  // 1. Theme mode (dark, light, system)
  const theme = preferences.theme || "dark";
  let resolvedTheme = theme;
  if (theme === "system") {
    resolvedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  root.setAttribute("data-theme", resolvedTheme);

  if (resolvedTheme === "light") {
    root.style.setProperty("--dash-bg-deep", "#f1f5f9");
    root.style.setProperty("--dash-bg-card", "#ffffff");
    root.style.setProperty("--dash-bg-card-hover", "#f8fafc");
    root.style.setProperty("--dash-border", "#cbd5e1");
    root.style.setProperty("--dash-text-primary", "#0f172a");
    root.style.setProperty("--dash-text-secondary", "#475569");
  } else {
    root.style.setProperty("--dash-bg-deep", "#070b14");
    root.style.setProperty("--dash-bg-card", "#0f1628");
    root.style.setProperty("--dash-bg-card-hover", "#131b31");
    root.style.setProperty("--dash-border", "#1e293b");
    root.style.setProperty("--dash-text-primary", "#f8fafc");
    root.style.setProperty("--dash-text-secondary", "#94a3b8");
  }

  // 2. Accent Color
  const accentKey = preferences.accentColor || "indigo";
  const palette = ACCENT_COLORS[accentKey] || ACCENT_COLORS.indigo;

  root.style.setProperty("--dash-accent-primary", palette.primary);
  root.style.setProperty("--dash-accent-hover", palette.hover);
  root.style.setProperty("--dash-accent-glow", palette.glow);
  root.style.setProperty("--dash-accent-tint", palette.tint);

  // 3. Density Mode
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
