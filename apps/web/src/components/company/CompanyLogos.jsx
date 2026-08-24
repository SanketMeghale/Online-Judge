import React from "react";

export function CompanyLogo({ name = "", size = 28, style = {} }) {
  const normalized = String(name || "").toLowerCase().trim();

  if (normalized.includes("google")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
        <path d="M23.49 12.28c0-.8-.07-1.56-.19-2.28H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.81z" fill="#4285F4"/>
        <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.34 24 12 24z" fill="#34A853"/>
        <path d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" fill="#FBBC05"/>
        <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" fill="#EA4335"/>
      </svg>
    );
  }

  if (normalized.includes("microsoft")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
        <rect x="2" y="2" width="9.5" height="9.5" fill="#F25022"/>
        <rect x="12.5" y="2" width="9.5" height="9.5" fill="#7FBA00"/>
        <rect x="2" y="12.5" width="9.5" height="9.5" fill="#00A4EF"/>
        <rect x="12.5" y="12.5" width="9.5" height="9.5" fill="#FFB900"/>
      </svg>
    );
  }

  if (normalized.includes("amazon")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
        <path d="M13.84 14.28c-.28.33-.8.36-1.12.06-1.47-1.39-2.04-2.87-2.04-4.83 0-2.8 1.95-4.88 4.79-4.88 2.85 0 4.77 2.06 4.77 4.9 0 2.82-1.92 4.88-4.77 4.88-.6 0-1.14-.1-1.63-.33z" fill="#FF9900" />
        <path d="M2.5 17.8c4.66 3.6 11.24 4.8 17.13 1.2.33-.2.37-.6.07-.84-.3-.24-.71-.25-1.04-.08-5.32 3.16-11.23 2.12-15.43-1.08-.34-.26-.74-.08-.73.32z" fill="#FF9900" />
        <path d="M21.72 17.5c-.29-.39-1.92-.93-3.84-.25-.33.12-.39.46-.11.7 1.63 1.41 3.51 1.7 4.09 1.12.33-.33.15-1.18-.14-1.57z" fill="#FF9900" />
      </svg>
    );
  }

  if (normalized.includes("meta") || normalized.includes("facebook")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#0081FB" />
      </svg>
    );
  }

  if (normalized.includes("apple")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.76 1.05-1.81.93-2.87-.91.04-2 .6-2.65 1.36-.57.65-1.07 1.72-.94 2.74 1.01.08 2.03-.47 2.66-1.23z" fill="currentColor" />
      </svg>
    );
  }

  if (normalized.includes("adobe")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
        <rect width="24" height="24" rx="4" fill="#FF0000"/>
        <path d="M14.5 4H19.5L14.7 18.5H11.5L14.5 4ZM9.5 4H4.5L9.3 18.5H12.5L9.5 4ZM12 11.5L14.3 18.5H11.8L10.7 15.2H8.3L12 11.5Z" fill="white"/>
      </svg>
    );
  }

  if (normalized.includes("uber")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
        <rect width="24" height="24" rx="5" fill="#000000" stroke="#334155" strokeWidth="1" />
        <circle cx="12" cy="12" r="5.5" stroke="#FFFFFF" strokeWidth="2.2" fill="none"/>
        <rect x="11" y="9.5" width="5.5" height="5" fill="#FFFFFF"/>
      </svg>
    );
  }

  if (normalized.includes("netflix")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
        <rect width="24" height="24" rx="4" fill="#141414" />
        <path d="M6 4h3.5v16H6V4zm8.5 0h3.5v16h-3.5V4z" fill="#E50914" />
        <path d="M6 4l8.5 16h3.5L9.5 4H6z" fill="#B81D24" />
      </svg>
    );
  }

  if (normalized.includes("atlassian")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
        <path d="M11.64 12.87c-.36.43-.88.68-1.44.68H5.53c-.56 0-.96.53-.78 1.05 1.5 4.3 5.56 7.4 10.36 7.4.45 0 .89-.03 1.33-.08.43-.05.65-.54.38-.89l-5.18-8.16zm.72-1.74c.36-.43.88-.68 1.44-.68h4.67c.56 0 .96-.53.78-1.05C17.75 5.1 13.69 2 8.89 2c-.45 0-.89.03-1.33.08-.43.05-.65.54-.38.89l5.18 8.16z" fill="#0052CC"/>
      </svg>
    );
  }

  if (normalized.includes("goldman")) {
    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "6px",
          background: "linear-gradient(135deg, #7399C6 0%, #1e3a8a 100%)",
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "900",
          fontSize: `${size * 0.42}px`,
          letterSpacing: "-0.05em",
          ...style
        }}
      >
        GS
      </div>
    );
  }

  if (normalized.includes("jpmorgan") || normalized.includes("morgan")) {
    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "6px",
          background: "linear-gradient(135deg, #1A365D 0%, #0F172A 100%)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          color: "#E2E8F0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "900",
          fontSize: `${size * 0.4}px`,
          letterSpacing: "-0.04em",
          ...style
        }}
      >
        JPM
      </div>
    );
  }

  if (normalized.includes("walmart")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
        <rect width="24" height="24" rx="4" fill="#0071CE" />
        <path d="M12 7V3M12 21V17M16.5 9.5L20 7.5M4 16.5L7.5 14.5M16.5 14.5L20 16.5M4 7.5L7.5 9.5" stroke="#FFC220" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    );
  }

  if (normalized.includes("flipkart")) {
    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "6px",
          background: "#2874F0",
          color: "#FFE500",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "900",
          fontStyle: "italic",
          fontSize: `${size * 0.55}px`,
          ...style
        }}
      >
        f
      </div>
    );
  }

  if (normalized.includes("razorpay")) {
    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "6px",
          background: "linear-gradient(135deg, #0C2340 0%, #0284C7 100%)",
          color: "#38BDF8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "900",
          fontSize: `${size * 0.5}px`,
          ...style
        }}
      >
        R
      </div>
    );
  }

  if (normalized.includes("tcs")) {
    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "6px",
          background: "linear-gradient(135deg, #FF007A 0%, #7928CA 100%)",
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "800",
          fontSize: `${size * 0.38}px`,
          ...style
        }}
      >
        TCS
      </div>
    );
  }

  if (normalized.includes("infosys")) {
    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "6px",
          background: "#007CC3",
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "900",
          fontSize: `${size * 0.36}px`,
          ...style
        }}
      >
        INFY
      </div>
    );
  }

  if (normalized.includes("accenture")) {
    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "6px",
          background: "#000000",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          color: "#A100FF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "900",
          fontSize: `${size * 0.6}px`,
          ...style
        }}
      >
        &gt;
      </div>
    );
  }

  if (normalized.includes("cognizant")) {
    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "6px",
          background: "#0033A0",
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "800",
          fontSize: `${size * 0.4}px`,
          ...style
        }}
      >
        CTS
      </div>
    );
  }

  // Fallback initial badge
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "6px",
        background: "rgba(124, 58, 237, 0.2)",
        border: "1px solid rgba(124, 58, 237, 0.4)",
        color: "#c084fc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "800",
        fontSize: `${size * 0.45}px`,
        ...style
      }}
    >
      {name.slice(0, 1).toUpperCase()}
    </div>
  );
}
