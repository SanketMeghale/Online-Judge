import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

export function AdminRoute() {
  const { isAuthenticated, isCheckingSession, user } = useAuth();
  const location = useLocation();

  if (isCheckingSession) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#080c14",
          color: "#f8fafc",
          gap: "16px"
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            border: "3px solid rgba(124, 58, 237, 0.2)",
            borderTopColor: "#a855f7",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite"
          }}
        />
        <span style={{ fontSize: "0.86rem", color: "#94a3b8", fontWeight: "600" }}>
          Verifying Administrator Privileges...
        </span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/admin/login"
        state={{ from: location, message: "Administrator authentication required." }}
        replace
      />
    );
  }

  if (user?.role !== "admin" && user?.role !== "super_admin") {
    return (
      <Navigate
        to="/admin/login"
        state={{ error: "You don't have administrator access." }}
        replace
      />
    );
  }

  return <Outlet />;
}

export default AdminRoute;
