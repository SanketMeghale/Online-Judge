import { Link, useNavigate } from "react-router-dom";
import { Bell, Code2, Flame, LogOut, Search } from "lucide-react";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useAppData } from "../../data/AppDataContext.jsx";

export default function Navbar() {
  const { logout, user } = useAuth();
  const { getUserById } = useAppData();
  const navigate = useNavigate();
  const liveUser = getUserById(user?.id) ?? user;
  const firstName = liveUser?.name?.split(" ")[0] ?? "User";

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="navbar">
      <Link className="brand" to="/">
        <span className="brand-mark">
          <Code2 size={25} />
        </span>
        <span>Online Judge</span>
      </Link>

      <div className="search-pill">
        <Search size={22} />
        <span>Search problems, topics, contests...</span>
        <kbd>Ctrl K</kbd>
      </div>

      <div className="topbar-right">
        <div className="streak-chip">
          <Flame size={30} />
          <strong>{liveUser?.streak ?? 0}</strong>
          <span>day streak</span>
        </div>
        <button className="icon-button" aria-label="Notifications" type="button">
          <Bell size={24} />
          <span className="notification-dot">3</span>
        </button>
        <Link className="profile-pill" to="/profile">
          <span className="mini-avatar">{liveUser?.name?.slice(0, 1) ?? "U"}</span>
          <strong>{firstName}</strong>
        </Link>
        <button className="icon-button" aria-label="Logout" onClick={handleLogout} type="button">
          <LogOut size={22} />
        </button>
      </div>
    </header>
  );
}
