import { Link, Outlet } from "react-router-dom";
import { Code2 } from "lucide-react";

export default function AuthLayout() {
  return (
    <main className="auth-page">
      <Link className="brand auth-brand" to="/">
        <span className="brand-mark" style={{ background: "transparent", boxShadow: "0 0 20px rgba(120, 80, 255, 0.4)", width: "42px", height: "42px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src="/logo.png" alt="Online Judge Logo" style={{ width: "42px", height: "42px", objectFit: "contain" }} />
        </span>
        <span>Online Judge</span>
      </Link>
      <Outlet />
    </main>
  );
}
