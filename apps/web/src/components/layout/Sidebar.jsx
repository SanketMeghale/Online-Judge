import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Code2,
  Home,
  Rocket,
  Settings,
  Swords,
  TrendingUp,
  User
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useAppData } from "../../data/AppDataContext.jsx";

const navItems = [
  { label: "Dashboard", to: "/", icon: Home },
  { label: "Practice", to: "/problems", icon: Code2 },
  { label: "Contest", to: "/contests", icon: Swords },
  { label: "AI Coach", to: "/interviewer", icon: Bot },
  { label: "Progress", to: "/stats", icon: TrendingUp },
  { label: "Profile", to: "/profile", icon: User },
  { label: "Settings", to: "/settings", icon: Settings }
];

export default function Sidebar() {
  const { user } = useAuth();
  const { getUserById } = useAppData();
  const liveUser = getUserById(user?.id) ?? user;

  return (
    <aside className="sidebar">
      {/* Navigation Links */}
      <div className="sidebar-links">
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink key={label} className="sidebar-link" to={to} end={to === "/"}>
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%" }}
              >
                <motion.div whileHover={{ scale: 1.15, rotate: 3 }} transition={{ type: "spring", stiffness: 400 }}>
                  <Icon size={19} />
                </motion.div>
                <span>{label}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebarActiveIndicator"
                    style={{
                      marginLeft: "auto",
                      width: "4px",
                      height: "16px",
                      borderRadius: "2px",
                      background: "linear-gradient(180deg, #7850ff, #00c3ff)",
                      boxShadow: "0 0 8px #7850ff"
                    }}
                  />
                )}
              </motion.div>
            )}
          </NavLink>
        ))}
      </div>

      {/* Bottom Rocket Card */}
      <motion.div
        whileHover={{ y: -3, boxShadow: "0 15px 35px rgba(0,0,0,0.5), 0 0 20px rgba(120,80,255,0.3)" }}
        className="sidebar-rocket-card"
      >
        <div className="rocket-icon-wrapper">
          <Rocket size={26} className="rocket-svg" />
        </div>
        <h4>Upgrade your skills</h4>
        <p>Solve more problems and climb the leaderboard!</p>
        <NavLink className="rocket-button" to="/stats">
          <span>View Progress</span>
          <ArrowRight size={14} />
        </NavLink>
      </motion.div>
    </aside>
  );
}
