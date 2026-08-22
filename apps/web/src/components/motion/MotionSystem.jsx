import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import "../../styles/animations.css";

/* ==========================================================================
   1. GLOBAL PAGE TRANSITION
   ========================================================================== */
const pageVariants = {
  initial: {
    opacity: 0,
    y: 16,
    scale: 0.995
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -12,
    scale: 0.995,
    transition: {
      duration: 0.2,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

export function AnimatedPage({ children, className = "", style = {} }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`animated-page ${className}`}
      style={{ width: "100%", ...style }}
    >
      {children}
    </motion.div>
  );
}

/* ==========================================================================
   2. REUSABLE ANIMATED CARD
   ========================================================================== */
export function AnimatedCard({
  children,
  className = "",
  style = {},
  onClick,
  glowColor = "rgba(120, 80, 255, 0.35)",
  delay = 0
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{
        y: -4,
        boxShadow: `0 16px 36px rgba(0, 0, 0, 0.5), 0 0 25px ${glowColor}`,
        borderColor: "rgba(120, 80, 255, 0.45)"
      }}
      whileTap={onClick ? { scale: 0.985 } : undefined}
      onClick={onClick}
      className={`card-glow-interactive ${className}`}
      style={{
        borderRadius: "14px",
        transition: "border-color 0.25s ease, background-color 0.25s ease",
        ...style
      }}
    >
      {children}
    </motion.div>
  );
}

/* ==========================================================================
   3. REUSABLE ANIMATED BUTTON
   ========================================================================== */
export function AnimatedButton({
  children,
  onClick,
  type = "button",
  variant = "primary",
  isLoading = false,
  disabled = false,
  className = "",
  style = {},
  icon: Icon
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      whileHover={!disabled && !isLoading ? { scale: 1.025, translateY: -1 } : undefined}
      whileTap={!disabled && !isLoading ? { scale: 0.965 } : undefined}
      transition={{ type: "spring", stiffness: 450, damping: 25 }}
      className={`btn-animated-glow ${className}`}
      style={{
        cursor: disabled || isLoading ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        ...style
      }}
    >
      {isLoading ? (
        <>
          <Loader2 size={16} className="spin-smooth" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && <Icon size={16} />}
          {children}
        </>
      )}
    </motion.button>
  );
}

/* ==========================================================================
   4. ANIMATED COUNTER (Counting Upward Smoothly)
   ========================================================================== */
export function AnimatedCounter({ value, to, duration = 1.0, suffix = "", prefix = "" }) {
  const target = value !== undefined ? value : to;
  const numericTarget = typeof target === "number" ? target : parseFloat(String(target ?? 0).replace(/[^0-9.]/g, "")) || 0;
  const [displayValue, setDisplayValue] = useState(numericTarget);

  useEffect(() => {
    if (numericTarget === 0) {
      setDisplayValue(0);
      return;
    }

    let startTimestamp = null;
    const startValue = 0;

    function step(timestamp) {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      const easeOutProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startValue + (numericTarget - startValue) * easeOutProgress);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayValue(numericTarget);
      }
    }

    const frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [numericTarget, duration]);

  const rawStr = String(target ?? "");
  const isK = rawStr.includes("K");
  const isPercent = rawStr.includes("%");
  const isPlus = rawStr.includes("+");

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString()}
      {isK && "K"}
      {isPercent && "%"}
      {isPlus && "+"}
      {suffix}
    </span>
  );
}

/* ==========================================================================
   5. VIEWPORT ANIMATED SECTION (Stagger Children)
   ========================================================================== */
const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

export function AnimatedSection({ children, className = "", style = {}, id }) {
  return (
    <motion.section
      id={id}
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      className={className}
      style={style}
    >
      {children}
    </motion.section>
  );
}

/* ==========================================================================
   6. ANIMATED PROGRESS BAR
   ========================================================================== */
export function AnimatedProgressBar({ progress = 0, color = "#7850ff", height = "6px" }) {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div
      style={{
        width: "100%",
        height,
        background: "rgba(255, 255, 255, 0.08)",
        borderRadius: "999px",
        overflow: "hidden",
        position: "relative"
      }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{
          height: "100%",
          background: color,
          borderRadius: "999px",
          boxShadow: `0 0 10px ${color}`
        }}
      />
    </div>
  );
}

/* ==========================================================================
   7. ANIMATED BADGE
   ========================================================================== */
export function AnimatedBadge({ children, color = "#10b981", pulse = false, className = "", style = {} }) {
  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      className={`tag-pulse ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 10px",
        borderRadius: "6px",
        fontSize: "0.78rem",
        fontWeight: 700,
        backgroundColor: `${color}18`,
        color,
        border: `1px solid ${color}40`,
        ...style
      }}
    >
      {pulse && (
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}`
          }}
        />
      )}
      {children}
    </motion.span>
  );
}

/* ==========================================================================
   8. SHIMMER SKELETON LOADER
   ========================================================================== */
export function ShimmerSkeleton({ width = "100%", height = "20px", borderRadius = "8px", style = {} }) {
  return (
    <div
      className="shimmer-skeleton"
      style={{
        width,
        height,
        borderRadius,
        ...style
      }}
    />
  );
}

/* ==========================================================================
   9. ANIMATED MODAL WITH ESC KEY & BACKDROP BLUR
   ========================================================================== */
export function AnimatedModal({ isOpen, onClose, title, children, maxWidth = "520px" }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isOpen && onClose) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
        >
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(3, 8, 20, 0.75)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)"
            }}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: "spring", stiffness: 450, damping: 30 }}
            style={{
              position: "relative",
              width: "100%",
              maxWidth,
              background: "#0c101a",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "18px",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(120, 80, 255, 0.2)",
              overflow: "hidden",
              zIndex: 1
            }}
          >
            {title && (
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>{title}</h3>
                {onClose && (
                  <button
                    onClick={onClose}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#94a3b8",
                      fontSize: "1.2rem",
                      cursor: "pointer",
                      padding: "4px 8px"
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            )}
            <div style={{ padding: "24px" }}>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ==========================================================================
   10. AURORA & FLOATING CODING GLYPHS BACKGROUND
   ========================================================================== */
const glyphs = ["</>", "{ }", "[]", "()", "=>", "&&", "++", "//", "λ", "0x1F"];

export function AuroraBackground() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden"
      }}
    >
      {/* Global Coding Architecture Background Pattern */}
      <div className="global-app-bg-pattern" aria-hidden="true" />

      {/* Floating Ambient Glyphs */}
      {glyphs.map((g, idx) => (
        <span
          key={idx}
          className="floating-code-glyph"
          style={{
            top: `${(idx * 11 + 7) % 90}%`,
            left: `${(idx * 17 + 5) % 92}%`,
            fontSize: `${14 + (idx % 4) * 5}px`,
            animationDelay: `${idx * -1.8}s`,
            animationDuration: `${7 + (idx % 3) * 3}s`
          }}
        >
          {g}
        </span>
      ))}
    </div>
  );
}
