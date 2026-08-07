import { NavLink } from "react-router-dom";
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
      {/* Brand Logo Header */}
      <div className="sidebar-brand">
        <div className="judgo-mark" style={{ background: "transparent", border: "none", boxShadow: "0 0 16px rgba(120, 80, 255, 0.4)", width: "36px", height: "36px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src="/logo.png" alt="Judgo Logo" style={{ width: "36px", height: "36px", objectFit: "contain" }} />
        </div>
        <span className="judgo-title">Judgo</span>
      </div>

      {/* Navigation Links */}
      <div className="sidebar-links">
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink key={label} className="sidebar-link" to={to} end={to === "/"}>
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>

      {/* Bottom Rocket Card */}
      <div className="sidebar-rocket-card">
        <div className="rocket-icon-wrapper">
          <Rocket size={26} className="rocket-svg" />
        </div>
        <h4>Upgrade your skills</h4>
        <p>Solve more problems and climb the leaderboard!</p>
        <NavLink className="rocket-button" to="/stats">
          <span>View Progress</span>
          <ArrowRight size={14} />
        </NavLink>
      </div>
    </aside>
  );
}
