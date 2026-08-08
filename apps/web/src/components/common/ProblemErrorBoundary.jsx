import React from "react";
import { AlertOctagon, ArrowLeft, RefreshCw } from "lucide-react";

export class ProblemErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[Submission Component Error]:", error, errorInfo);
  }

  handleTryAgain = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleBackToProblems = () => {
    window.location.href = "/problems";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="problem-error-boundary-container"
          style={{
            minHeight: "450px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#0d111a",
            border: "1px solid rgba(248, 113, 113, 0.25)",
            borderRadius: "14px",
            padding: "40px 24px",
            textAlign: "center",
            margin: "20px 0"
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "rgba(248, 113, 113, 0.12)",
              border: "1px solid rgba(248, 113, 113, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#f87171",
              marginBottom: "16px"
            }}
          >
            <AlertOctagon size={28} />
          </div>

          <h2 style={{ fontSize: "1.35rem", fontWeight: "700", color: "#ffffff", margin: "0 0 8px 0" }}>
            Something went wrong
          </h2>

          <p style={{ color: "#94a3b8", fontSize: "0.92rem", maxWidth: "520px", margin: "0 0 20px 0", lineHeight: "1.5" }}>
            An unexpected error occurred while displaying the submission result.
          </p>

          {this.state.error?.message && (
            <div
              style={{
                background: "#080c14",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "8px",
                padding: "10px 14px",
                fontFamily: "monospace",
                fontSize: "0.82rem",
                color: "#f87171",
                maxWidth: "600px",
                width: "100%",
                marginBottom: "24px",
                wordBreak: "break-word",
                textAlign: "left"
              }}
            >
              Error: {this.state.error.message}
            </div>
          )}

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
            <button
              type="button"
              onClick={this.handleTryAgain}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "linear-gradient(135deg, #7850ff 0%, #9333ea 100%)",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "10px 18px",
                fontSize: "0.88rem",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(120, 80, 255, 0.35)"
              }}
            >
              <RefreshCw size={15} />
              Try Again
            </button>

            <button
              type="button"
              onClick={this.handleBackToProblems}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "transparent",
                color: "#cbd5e1",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "8px",
                padding: "10px 18px",
                fontSize: "0.88rem",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              <ArrowLeft size={15} />
              Back to Problems
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
