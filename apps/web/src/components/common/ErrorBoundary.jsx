import React from "react";
import { AlertTriangle, RefreshCw, Sparkles } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, isChunkError: false };
  }

  static getDerivedStateFromError(error) {
    const errMsg = error?.message || String(error || "");
    const isChunkError =
      errMsg.includes("Failed to fetch dynamically imported module") ||
      errMsg.includes("Importing a module script failed") ||
      errMsg.includes("Loading chunk") ||
      errMsg.includes("error loading dynamically imported module");

    return { hasError: true, error, isChunkError };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary caught an error]:", error, errorInfo);

    const errMsg = error?.message || String(error || "");
    const isChunkError =
      errMsg.includes("Failed to fetch dynamically imported module") ||
      errMsg.includes("Importing a module script failed") ||
      errMsg.includes("Loading chunk");

    if (isChunkError) {
      try {
        const alreadyReloaded = sessionStorage.getItem("judgo-error-boundary-reload");
        if (!alreadyReloaded) {
          sessionStorage.setItem("judgo-error-boundary-reload", "true");
          window.location.reload();
        }
      } catch {}
    }
  }

  handleReload = () => {
    try {
      sessionStorage.removeItem("judgo-error-boundary-reload");
      sessionStorage.removeItem("judgo-chunk-retry");
    } catch {}
    window.location.reload();
  };

  handleReset = () => {
    try {
      sessionStorage.removeItem("judgo-error-boundary-reload");
      sessionStorage.removeItem("judgo-chunk-retry");
    } catch {}
    this.setState({ hasError: false, error: null, isChunkError: false });
    window.location.href = "/dashboard";
  };

  render() {
    if (this.state.hasError) {
      const isChunk = this.state.isChunkError;

      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
            padding: "40px 20px",
            textAlign: "center",
            color: "#e2e8f0"
          }}
        >
          <div
            style={{
              background: isChunk ? "rgba(99, 102, 241, 0.12)" : "rgba(239, 68, 68, 0.1)",
              border: isChunk ? "1px solid rgba(99, 102, 241, 0.35)" : "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "50%",
              padding: "16px",
              marginBottom: "16px",
              color: isChunk ? "#6366f1" : "#ef4444"
            }}
          >
            {isChunk ? <Sparkles size={36} /> : <AlertTriangle size={36} />}
          </div>

          <h2 style={{ fontSize: "1.4rem", fontWeight: "700", marginBottom: "8px" }}>
            {isChunk ? "A New Judgo Update is Ready" : "Something went wrong rendering this view"}
          </h2>

          <p style={{ color: "#94a3b8", maxWidth: "500px", fontSize: "0.9rem", marginBottom: "24px", lineHeight: "1.5" }}>
            {isChunk
              ? "A fresh version of Judgo has been deployed. Reloading the page will load the latest code and assets."
              : this.state.error?.message || "An unexpected error occurred while processing this page component."}
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
            <button
              type="button"
              onClick={this.handleReload}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "#6366f1",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "10px 22px",
                fontSize: "0.9rem",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(99, 102, 241, 0.4)",
                transition: "background 0.15s ease"
              }}
            >
              <RefreshCw size={16} /> Reload Application
            </button>

            <button
              type="button"
              onClick={this.handleReset}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(255, 255, 255, 0.06)",
                color: "#e2e8f0",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "8px",
                padding: "10px 18px",
                fontSize: "0.9rem",
                fontWeight: "500",
                cursor: "pointer"
              }}
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
