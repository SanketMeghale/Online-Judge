import { Outlet } from "react-router-dom";
import Footer from "./Footer.jsx";
import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";

export default function AppLayout() {
  return (
    <div className="app">
      <Navbar />
      <div className="app-grid">
        <Sidebar />
        <div className="content-shell">
          <Outlet />
          <Footer />
        </div>
      </div>
    </div>
  );
}
