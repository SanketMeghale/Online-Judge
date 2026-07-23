import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Bot,
  ChevronRight,
  Code2,
  Flame,
  History,
  Home,
  ListChecks,
  Swords,
  Trophy,
  UsersRound
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useAppData } from "../../data/AppDataContext.jsx";

const links = [
  { label: "Dashboard", to: "/", icon: Home },
  { label: "Problems", to: "/problems", icon: ListChecks },
  { label: "Submissions", to: "/submissions", icon: History },
  { label: "Contests", to: "/contests", icon: Swords },
  { label: "Leaderboard", to: "/leaderboard", icon: BarChart3 },
  { label: "Collaboration", to: "/collaboration", icon: UsersRound },
  { label: "AI Interviewer", to: "/interviewer", icon: Bot },
  { label: "Streaks", to: "/profile", icon: Flame }
];

export default function Sidebar() {
  const { user } = useAuth();
  const { getUserById } = useAppData();
  const liveUser = getUserById(user?.id) ?? user;

  return (
    <aside className="sidebar">
      <div className="sidebar-links">
        {links.map(({ label, to, icon: Icon }) => (
          <NavLink key={label} className="sidebar-link" to={to} end={to === "/"}>
            <Icon size={23} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>

      <div className="sidebar-art">
        <div className="code-screen">
          <Code2 size={58} />
        </div>
        <Trophy className="art-trophy" size={40} />
      </div>

      <div className="sidebar-profile">
        <div className="side-user-row">
          <span className="side-avatar">{liveUser?.name?.slice(0, 1) ?? "U"}</span>
          <div>
            <strong>{liveUser?.name ?? "User"}</strong>
            <span>Explorer</span>
          </div>
          <ChevronRight size={20} />
        </div>
        <div className="xp-track">
          <span style={{ width: `${Math.min(100, ((liveUser?.xp ?? 0) % 3000) / 30)}%` }} />
        </div>
        <div className="xp-copy">
          <strong>Level {Math.max(1, Math.ceil((liveUser?.xp ?? 0) / 1000))}</strong>
          <span>{(liveUser?.xp ?? 0) % 3000} / 3,000 XP</span>
        </div>
        <NavLink className="profile-button" to="/profile">
          View Profile
        </NavLink>
      </div>
    </aside>
  );
}
