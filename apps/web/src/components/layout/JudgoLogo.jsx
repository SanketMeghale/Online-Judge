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
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Right Shield Bracket */}
      <path
        d="M 19.5 4.5 L 24.5 4.5 C 26.8 4.5 28.5 6.2 28.5 8.5 L 28.5 17.2 C 28.5 19.5 27.3 21.6 25.4 22.8 L 18.2 27.2 C 17.5 27.6 16.8 27.9 16 27.9"
        stroke={`url(#${blueGradientId})`}
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Center `<` Code Bracket */}
      <path
        d="M 11.5 13 L 8 16 L 11.5 19"
        stroke={`url(#${gradientId})`}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Center `/` Slash */}
      <path
        d="M 17.2 11.8 L 14.2 20.2"
        stroke="#38bdf8"
        strokeWidth="2.6"
        strokeLinecap="round"
      />

      {/* Center `>` Code Bracket */}
      <path
        d="M 19.5 13 L 23 16 L 19.5 19"
        stroke={`url(#${blueGradientId})`}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Razor-sharp Bold Vector JUDGO Wordmark matching exact squircle geometric reference:
 * - J: Violet/purple with bold distinct horizontal base bar
 * - U, D, G, O: Bold modern squircle tech geometry
 */
export function JudgoWordmark({ height = 21, className = "" }) {
  const purpleGradId = "judgoWordmarkPurpleGrad";

  return (
    <svg
      height={height}
      viewBox="0 0 146 28"
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

      {/* Letter 'J' with distinct bold horizontal bottom tail */}
      <path
        d="M 3.5 24 L 15 24 C 18.5 24 20 22 20 18.5 L 20 4"
        stroke={`url(#${purpleGradId})`}
        strokeWidth="4.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Letter 'U' */}
      <path
        d="M 31 4 L 31 18 C 31 22 33.5 24 37 24 L 43 24 C 46.5 24 49 22 49 18 L 49 4"
        className="judgo-wordmark-rest"
        strokeWidth="4.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Letter 'D' */}
      <path
        d="M 60 24 L 60 4 L 68 4 C 74.5 4 79 7.5 79 14 C 79 20.5 74.5 24 68 24 Z"
        className="judgo-wordmark-rest"
        strokeWidth="4.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Letter 'G' */}
      <path
        d="M 108 7 C 108 4.5 105 4 101.5 4 L 95.5 4 C 91.5 4 89.5 6 89.5 10 L 89.5 18 C 89.5 22 91.5 24 95.5 24 L 102.5 24 C 106.5 24 108.5 22 108.5 18 L 108.5 13.5 L 98 13.5"
        className="judgo-wordmark-rest"
        strokeWidth="4.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Letter 'O' */}
      <path
        d="M 125.5 4 L 133.5 4 C 137.5 4 139.5 6 139.5 10 L 139.5 18 C 139.5 22 137.5 24 133.5 24 L 125.5 24 C 121.5 24 119.5 22 119.5 18 L 119.5 10 C 119.5 6 121.5 4 125.5 4 Z"
        className="judgo-wordmark-rest"
        strokeWidth="4.6"
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
