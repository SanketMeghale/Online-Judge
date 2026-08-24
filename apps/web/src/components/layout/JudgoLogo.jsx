import React from "react";
import { motion } from "framer-motion";

/**
 * Modern vector Shield-Code Logo matching Judgo brand reference:
 * - Left shield bracket: Vibrant Purple/Violet
 * - Right shield bracket: Electric Blue/Cyan
 * - Center code brackets: `< / >`
 * - Subtle vertical divider: `|`
 * - Wordmark: Vibrant Purple `J` + High-contrast `udgo`
 */
export function JudgoShieldIcon({ size = 28, className = "" }) {
  const gradientId = "judgoBrandShieldGrad";
  const blueGradientId = "judgoBrandBlueGrad";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "block", flexShrink: 0 }}
    >
      <defs>
        {/* Left Purple/Violet Gradient */}
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>

        {/* Right Electric Blue Gradient */}
        <linearGradient id={blueGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>

      {/* Left Shield Bracket */}
      <path
        d="M 12.5 4.5 L 7.5 4.5 C 5.2 4.5 3.5 6.2 3.5 8.5 L 3.5 17.2 C 3.5 19.5 4.7 21.6 6.6 22.8 L 13.8 27.2 C 14.5 27.6 15.2 27.9 16 27.9"
        stroke={`url(#${gradientId})`}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Right Shield Bracket */}
      <path
        d="M 19.5 4.5 L 24.5 4.5 C 26.8 4.5 28.5 6.2 28.5 8.5 L 28.5 17.2 C 28.5 19.5 27.3 21.6 25.4 22.8 L 18.2 27.2 C 17.5 27.6 16.8 27.9 16 27.9"
        stroke={`url(#${blueGradientId})`}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Center `<` Code Bracket */}
      <path
        d="M 11.5 13 L 8 16 L 11.5 19"
        stroke={`url(#${gradientId})`}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Center `/` Slash */}
      <path
        d="M 17.2 11.8 L 14.2 20.2"
        stroke="#38bdf8"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Center `>` Code Bracket */}
      <path
        d="M 19.5 13 L 23 16 L 19.5 19"
        stroke={`url(#${blueGradientId})`}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Complete Judgo Brand Component with Icon + Divider + Wordmark
 */
export function JudgoLogo({
  size = 28,
  textSize = "1.22rem",
  showDivider = true,
  showText = true,
  animated = false,
  className = ""
}) {
  const iconContent = (
    <div className="judgo-brand-icon-wrap">
      <JudgoShieldIcon size={size} />
    </div>
  );

  return (
    <div className={`judgo-brand-logo ${className}`.trim()}>
      {animated ? (
        <motion.div
          whileHover={{ scale: 1.06, rotate: 3 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.18 }}
          style={{ display: "flex", alignItems: "center" }}
        >
          {iconContent}
        </motion.div>
      ) : (
        iconContent
      )}

      {showDivider && showText && (
        <div className="judgo-brand-divider" aria-hidden="true" />
      )}

      {showText && (
        <span className="judgo-brand-text" style={{ fontSize: textSize }}>
          <span className="judgo-brand-j">J</span>
          <span className="judgo-brand-rest">udgo</span>
        </span>
      )}
    </div>
  );
}

export default JudgoLogo;
