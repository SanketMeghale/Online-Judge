import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary caught an error]:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/dashboard";
  };

  render() {
    if (this.state.hasError) {
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
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "50%",
              padding: "16px",
              marginBottom: "16px",
              color: "#ef4444"
            }}
          >
            <AlertTriangle size={36} />
          </div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: "700", marginBottom: "8px" }}>
            Something went wrong rendering this view
          </h2>
          <p style={{ color: "#94a3b8", maxWidth: "500px", fontSize: "0.9rem", marginBottom: "24px" }}>
            {this.state.error?.message || "An unexpected error occurred while processing page component."}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#7850ff",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "10px 20px",
              fontSize: "0.9rem",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(120, 80, 255, 0.4)"
            }}
          >
            <RefreshCw size={16} /> Return to Dashboard
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
