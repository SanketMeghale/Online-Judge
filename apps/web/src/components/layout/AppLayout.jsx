import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useSmoothScroll } from "../../hooks/useSmoothScroll.js";
import { AuroraBackground } from "../motion/MotionSystem.jsx";
import { ErrorBoundary } from "../common/ErrorBoundary.jsx";
import Footer from "./Footer.jsx";
import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";

export default function AppLayout({ children }) {
  useSmoothScroll();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isFullHeightWorkspace = location.pathname.startsWith("/problems/");

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
            style={{ width: "100%", minHeight: "100%", display: "flex", flexDirection: "column" }}
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
