import { Link, Outlet } from "react-router-dom";
import { Code2 } from "lucide-react";

export default function AuthLayout() {
  return (
    <main className="auth-page">
      <Link className="brand auth-brand" to="/">
        <span className="brand-mark">
          <Code2 size={21} />
        </span>
        <span>Online Judge</span>
      </Link>
      <Outlet />
    </main>
  );
}
