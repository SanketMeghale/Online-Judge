import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useSmoothScroll } from "../../hooks/useSmoothScroll.js";
import { AuroraBackground } from "../motion/MotionSystem.jsx";
import Footer from "./Footer.jsx";
import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";

export default function AppLayout({ children }) {
  useSmoothScroll();
  const location = useLocation();

  return (
    <div className="app">
      <AuroraBackground />
      <Navbar />
      <div className="app-grid">
        <Sidebar />
        <div className="content-shell">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              style={{ width: "100%", height: "100%" }}
            >
              {children || <Outlet />}
            </motion.div>
          </AnimatePresence>
          <Footer />
        </div>
      </div>
    </div>
  );
}
