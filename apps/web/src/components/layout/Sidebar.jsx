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
