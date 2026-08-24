import React from "react";
import { motion } from "framer-motion";

/**
 * Modern vector Shield-Code Logo matching Judgo brand reference:
 * - Left shield bracket: Vibrant Purple/Violet
 * - Right shield bracket: Electric Blue/Cyan
 * - Center code brackets: `< / >`
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
 * Razor-sharp Vector JUDGO Wordmark matching exact squircle geometric reference:
 * - J: Violet/purple with distinct horizontal base bar
 * - U, D, G, O: Modern squircle tech geometry
 */
export function JudgoWordmark({ height = 20, className = "" }) {
  const purpleGradId = "judgoWordmarkPurpleGrad";

  return (
    <svg
      height={height}
      viewBox="0 0 138 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`judgo-wordmark-svg ${className}`.trim()}
      style={{ display: "block", height: `${height}px`, width: "auto", flexShrink: 0 }}
      aria-label="Judgo"
    >
      <defs>
        <linearGradient id={purpleGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>

      {/* Letter 'J' with distinct horizontal bottom tail */}
      <path
        d="M 2 22 L 14 22 C 17.5 22 19 20 19 16.5 L 19 2"
        stroke={`url(#${purpleGradId})`}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Letter 'U' */}
      <path
        d="M 29 2 L 29 16.5 C 29 20 31 22 34.5 22 L 42.5 22 C 46 22 48 20 48 16.5 L 48 2"
        className="judgo-wordmark-rest"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Letter 'D' */}
      <path
        d="M 58 22 L 58 2 L 67 2 C 73.5 2 77 5.5 77 12 C 77 18.5 73.5 22 67 22 Z"
        className="judgo-wordmark-rest"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Letter 'G' */}
      <path
        d="M 106 6 C 106 3 103 2 99.5 2 L 91.5 2 C 87.5 2 85.5 4 85.5 8 L 85.5 16 C 85.5 20 87.5 22 91.5 22 L 99.5 22 C 103.5 22 106 20 106 16 L 106 12 L 95.5 12"
        className="judgo-wordmark-rest"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Letter 'O' */}
      <path
        d="M 120 2 L 129 2 C 133 2 135 4 135 8 L 135 16 C 135 20 133 22 129 22 L 120 22 C 116 22 114 20 114 16 L 114 8 C 114 4 116 2 120 2 Z"
        className="judgo-wordmark-rest"
        strokeWidth="3.2"
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
  wordmarkHeight = 20,
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
        <JudgoWordmark height={wordmarkHeight} />
      )}
    </div>
  );
}

export default JudgoLogo;
