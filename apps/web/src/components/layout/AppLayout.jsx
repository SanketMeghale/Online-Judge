import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useSmoothScroll } from "../../hooks/useSmoothScroll.js";
import { AuroraBackground } from "../motion/MotionSystem.jsx";
import { ErrorBoundary } from "../common/ErrorBoundary.jsx";
import Footer from "./Footer.jsx";
import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";
import { applyThemeAndAppearance } from "../../utils/themeApplier.js";
import { useAuth } from "../../auth/AuthContext.jsx";

const SETTINGS_STORAGE_KEY = "judgo-user-settings-v1";

export default function AppLayout({ children }) {
  useSmoothScroll();
  const location = useLocation();
  const { user } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Initialize theme, accent, and density on layout mount & user change
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      const rawTheme = localStorage.getItem("judgo_theme");
      const mergedPrefs = {
        theme: rawTheme || user?.preferences?.theme || localPrefs.theme || "dark",
        accentColor: user?.preferences?.accentColor || localPrefs.accentColor || "indigo",
        density: user?.preferences?.density || localPrefs.density || "comfortable",
        compactMode: user?.preferences?.compactMode ?? localPrefs.compactMode ?? false
      };
      applyThemeAndAppearance(mergedPrefs);
    } catch {}
  }, [user?.preferences]);

  const isFullHeightWorkspace =
    location.pathname.startsWith("/ai-coach") ||
    location.pathname.startsWith("/interviewer") ||
    location.pathname.startsWith("/problems/");

  return (
    <div className="app">
      <AuroraBackground />
      <Navbar onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)} />
      <div className="app-grid">
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
        <div className={`content-shell ${isFullHeightWorkspace ? "content-shell-workspace" : ""}`}>
          <div
            key={location.pathname}
            className="page-enter-fade"
            style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}
          >
            <ErrorBoundary>
              {children || <Outlet />}
            </ErrorBoundary>
          </div>
          {!isFullHeightWorkspace && <Footer />}
        </div>
      </div>
    </div>
  );
}
