import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlignLeft,
  Check,
  ChevronDown,
  Copy,
  Maximize2,
  Minimize2,
  Play,
  RotateCcw,
  Sparkles,
  TerminalSquare,
  Zap,
  Loader2
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext.jsx";

const LANGUAGES = [
  { id: "Python", name: "Python 3", tag: "PY", color: "#38bdf8", badgeBg: "rgba(56, 189, 248, 0.12)" },
  { id: "JavaScript", name: "JavaScript", tag: "JS", color: "#facc15", badgeBg: "rgba(250, 204, 21, 0.12)" },
  { id: "C++", name: "C++ 20", tag: "C++", color: "#06b6d4", badgeBg: "rgba(6, 182, 212, 0.12)" },
  { id: "Java", name: "Java 24", tag: "JAVA", color: "#fb923c", badgeBg: "rgba(251, 146, 60, 0.12)" }
];

const THEME_STYLES = {
  "judgo-dark": {
    bg: "#080c14",
    gutterBg: "#060910",
    gutterColor: "#475569",
    gutterBorder: "rgba(255,255,255,0.05)",
    textColor: "#f1f5f9",
    caretColor: "#38bdf8"
  },
  monokai: {
    bg: "#272822",
    gutterBg: "#1e1f1c",
    gutterColor: "#75715e",
    gutterBorder: "rgba(255,255,255,0.08)",
    textColor: "#f8f8f2",
    caretColor: "#fd971f"
  },
  "github-dark": {
    bg: "#0d1117",
    gutterBg: "#010409",
    gutterColor: "#484f58",
    gutterBorder: "rgba(255,255,255,0.06)",
    textColor: "#c9d1d9",
    caretColor: "#58a6ff"
  },
  dracula: {
    bg: "#282a36",
    gutterBg: "#21222c",
    gutterColor: "#6272a4",
    gutterBorder: "rgba(255,255,255,0.08)",
    textColor: "#f8f8f2",
    caretColor: "#bd93f9"
  },
  light: {
    bg: "#ffffff",
    gutterBg: "#f8fafc",
    gutterColor: "#94a3b8",
    gutterBorder: "#e2e8f0",
    textColor: "#0f172a",
    caretColor: "#2563eb"
  }
};

function highlightSyntax(code = "", language = "Python", theme = "judgo-dark") {
  if (!code) return "";

  const langKey = String(language).toLowerCase();
  const lines = code.split("\n");

  const highlightedLines = lines.map((line) => {
    let escaped = line
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    let commentSpan = "";
    let codePart = escaped;

    if (escaped.includes("//")) {
      const idx = escaped.indexOf("//");
      codePart = escaped.slice(0, idx);
      commentSpan = `<span style="color:#64748b;font-style:italic;">${escaped.slice(idx)}</span>`;
    } else if (escaped.includes("#") && (langKey === "python" || langKey === "python 3" || langKey === "py")) {
      const idx = escaped.indexOf("#");
      codePart = escaped.slice(0, idx);
      commentSpan = `<span style="color:#64748b;font-style:italic;">${escaped.slice(idx)}</span>`;
    }

    return highlightLine(codePart, theme) + commentSpan;
  });

  return highlightedLines.join("\n");
}

function highlightLine(str, theme) {
  const isLight = theme === "light";
  const strColor = isLight ? "#16a34a" : "#4ade80";
  const numColor = isLight ? "#d97706" : "#fb923c";
  const kwColor = isLight ? "#9333ea" : "#c084fc";
  const typeColor = isLight ? "#0284c7" : "#38bdf8";
  const fnColor = isLight ? "#ca8a04" : "#facc15";

  return str
    // Strings
    .replace(/(["'])(?:(?=(\\?))\2[\s\S])*?\1|(`[\s\S]*?`)/g, `<span style="color:${strColor};">$&</span>`)
    // Numbers & Booleans
    .replace(/\b(true|false|null|undefined|None|True|False|nullptr|\d+)\b/g, `<span style="color:${numColor};font-weight:600;">$&</span>`)
    // Keywords (C++, Java, JS, Python)
    .replace(/\b(class|def|return|function|if|else|elif|for|while|const|let|var|public|private|protected|static|final|void|import|export|from|new|async|await|pass|self|this|in|of|try|except|finally|catch|case|switch|break|continue|struct|namespace|using|template|typename|auto|throw|throws|implements|extends|interface|include)\b/g, `<span style="color:${kwColor};font-weight:bold;">$&</span>`)
    // Types
    .replace(/\b(Solution|String|Integer|List|ArrayList|Vector|vector|map|unordered_map|set|unordered_set|pair|int|bool|boolean|char|double|float|long|short|void|System|Math|Array|Object|Set|Map|Promise)\b/g, `<span style="color:${typeColor};font-weight:bold;">$&</span>`)
    // Functions
    .replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)(?=\s*\()/g, (match, fnName) => {
      const reserved = ["if", "for", "while", "switch", "catch", "return", "sizeof", "typeof", "include"];
      if (reserved.includes(fnName)) return match;
      return `<span style="color:${fnColor};font-weight:600;">${fnName}</span>`;
    });
}

export default function CodeEditor({
  code,
  value,
  language = "Python",
  onCodeChange,
  onChange,
  onLanguageChange,
  onRun,
  onSubmit,
  onReset,
  starterCode,
  isRunning = false,
  isSubmitting = false
}) {
  const currentCode = code !== undefined ? code : value || "";
  const handleCodeUpdate = onCodeChange || onChange || (() => {});

  const { isLight } = useTheme();
  const textareaRef = useRef(null);
  const preRef = useRef(null);
  const langDropdownRef = useRef(null);

  const [isLangOpen, setIsLangOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formattedNotice, setFormattedNotice] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setIsLangOpen(false);
      }
    }
    function handleKeyDownEsc(event) {
      if (event.key === "Escape") {
        setIsLangOpen(false);
      }
    }
    if (isLangOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDownEsc);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDownEsc);
    };
  }, [isLangOpen]);

  // Read live editor settings from localStorage
  const [editorSettings, setEditorSettings] = useState(() => {
    try {
      const stored = localStorage.getItem("judgo-user-settings-v1");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    function handleStorageChange() {
      try {
        const stored = localStorage.getItem("judgo-user-settings-v1");
        if (stored) setEditorSettings(JSON.parse(stored));
      } catch {}
    }
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const fontSize = editorSettings.fontSize || 14;
  const tabSize = editorSettings.tabSize || (String(language).toLowerCase().includes("python") ? 4 : 2);
  const wordWrap = editorSettings.wordWrap !== false;
  const showLineNumbers = editorSettings.showLineNumbers !== false;
  
  const configuredTheme = editorSettings.editorTheme;
  const currentEditorTheme = configuredTheme
    ? (configuredTheme === "judgo-dark" && isLight ? "light" : configuredTheme)
    : (isLight ? "light" : "judgo-dark");
  const themePalette = THEME_STYLES[currentEditorTheme] || (isLight ? THEME_STYLES.light : THEME_STYLES["judgo-dark"]);

  const indentStr = " ".repeat(tabSize);
  const linesCount = currentCode.split("\n").length;

  const currentLangObj = LANGUAGES.find(
    (l) => l.id.toLowerCase() === String(language).toLowerCase() ||
           (l.id === "C++" && String(language).toLowerCase() === "cpp")
  ) || LANGUAGES[0];

  function handleScroll() {
    if (preRef.current && textareaRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }

  function handleCopyCode() {
    if (!currentCode) return;
    try {
      navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Fallback if clipboard API restricted
      const ta = document.createElement("textarea");
      ta.value = currentCode;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  }

  function handleFormatCode() {
    if (!currentCode) return;
    try {
      // Clean trailing spaces and normalize indentation
      const lines = currentCode.split("\n");
      const trimmed = lines.map((line) => line.trimEnd()).join("\n");
      handleCodeUpdate(trimmed);
      setFormattedNotice(true);
      setTimeout(() => setFormattedNotice(false), 1500);
    } catch {}
  }

  function handleResetCode() {
    if (onReset) {
      onReset();
    } else if (starterCode) {
      handleCodeUpdate(starterCode);
    }
  }

  function handleKeyDown(e) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd } = textarea;

    if (e.key === "Tab") {
      e.preventDefault();
      if (e.shiftKey) {
        const beforeCursor = currentCode.substring(0, selectionStart);
        const lineStart = beforeCursor.lastIndexOf("\n") + 1;
        const lineText = currentCode.substring(lineStart, selectionEnd);

        if (lineText.startsWith(indentStr)) {
          const nextCode = currentCode.substring(0, lineStart) + lineText.substring(indentStr.length) + currentCode.substring(selectionEnd);
          handleCodeUpdate(nextCode);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = Math.max(lineStart, selectionStart - indentStr.length);
          }, 0);
        }
      } else {
        const nextCode = currentCode.substring(0, selectionStart) + indentStr + currentCode.substring(selectionEnd);
        handleCodeUpdate(nextCode);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart + indentStr.length;
        }, 0);
      }
      return;
    }

    if (e.key === "Enter") {
      const beforeCursor = currentCode.substring(0, selectionStart);
      const lastNewline = beforeCursor.lastIndexOf("\n");
      const currentLine = beforeCursor.substring(lastNewline + 1);

      const match = currentLine.match(/^(\s*)/);
      let nextIndent = match ? match[1] : "";

      const trimmed = currentLine.trim();
      const needsExtraIndent =
        trimmed.endsWith(":") ||
        trimmed.endsWith("{") ||
        trimmed.endsWith("(") ||
        trimmed.endsWith("[") ||
        /^(if|else|elif|for|while|def|class|function|try|except|finally|catch)\b/.test(trimmed);

      if (needsExtraIndent) {
        nextIndent += indentStr;
      }

      e.preventDefault();
      const insertText = "\n" + nextIndent;
      const nextCode = currentCode.substring(0, selectionStart) + insertText + currentCode.substring(selectionEnd);

      handleCodeUpdate(nextCode);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + insertText.length;
      }, 0);
      return;
    }

    const openClosePairs = {
      "{": "}",
      "(": ")",
      "[": "]",
      '"': '"',
      "'": "'"
    };

    if (openClosePairs[e.key] && selectionStart === selectionEnd) {
      const closingChar = openClosePairs[e.key];
      const nextChar = currentCode.charAt(selectionStart);
      if (!nextChar || /\s|\)|\]|\}|;|:/.test(nextChar)) {
        e.preventDefault();
        const insertText = e.key + closingChar;
        const nextCode = currentCode.substring(0, selectionStart) + insertText + currentCode.substring(selectionEnd);
        handleCodeUpdate(nextCode);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
        }, 0);
      }
    }
  }

  return (
    <section
      className={`editor-panel ${isFullscreen ? "is-fullscreen" : ""}`}
      data-lenis-prevent="true"
      style={{
        background: themePalette.bg,
        border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.08)",
        borderRadius: isFullscreen ? "0" : "14px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: isLight ? "0 1px 4px rgba(0,0,0,0.04)" : "none",
        position: isFullscreen ? "fixed" : "relative",
        inset: isFullscreen ? 0 : "auto",
        zIndex: isFullscreen ? 9999 : 10,
        height: isFullscreen ? "100vh" : "auto"
      }}
    >
      {/* Modern Redesigned Editor Toolbar Header */}
      <div
        className="editor-toolbar"
        style={{
          background: isLight ? "#f8fafc" : "#0d111a",
          padding: "8px 14px",
          borderBottom: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          position: "relative",
          zIndex: 30
        }}
      >
        {/* Left Side: Animated Language Dropdown & Essential Action Icons */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          
          {/* Animated Custom Language Selection Dropdown */}
          <div ref={langDropdownRef} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setIsLangOpen((prev) => !prev)}
              aria-expanded={isLangOpen}
              aria-haspopup="listbox"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: isLight ? "#ffffff" : "#131826",
                border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255,255,255,0.12)",
                borderRadius: "8px",
                padding: "5px 10px",
                color: themePalette.textColor,
                fontSize: "0.82rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.15s ease",
                boxShadow: isLight ? "0 1px 2px rgba(0,0,0,0.05)" : "0 1px 3px rgba(0,0,0,0.2)"
              }}
            >
              <span
                style={{
                  background: currentLangObj.badgeBg,
                  color: currentLangObj.color,
                  fontSize: "0.72rem",
                  fontWeight: "800",
                  padding: "2px 6px",
                  borderRadius: "5px",
                  letterSpacing: "0.02em"
                }}
              >
                {currentLangObj.tag}
              </span>
              <span>{currentLangObj.name}</span>
              <motion.span
                animate={{ rotate: isLangOpen ? 180 : 0 }}
                transition={{ duration: 0.18, ease: "easeInOut" }}
                style={{ display: "inline-flex", color: isLight ? "#64748b" : "#94a3b8", marginLeft: "2px" }}
              >
                <ChevronDown size={14} />
              </motion.span>
            </button>

            {/* Dropdown Menu Overlay */}
            <AnimatePresence>
              {isLangOpen && (
                <motion.div
                  role="listbox"
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    left: 0,
                    background: isLight ? "#ffffff" : "#111726",
                    border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "10px",
                    padding: "5px",
                    boxShadow: isLight
                      ? "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
                      : "0 12px 30px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)",
                    minWidth: "175px",
                    zIndex: 100,
                    backdropFilter: "blur(12px)"
                  }}
                >
                  {LANGUAGES.map((item) => {
                    const isSelected = item.id.toLowerCase() === currentLangObj.id.toLowerCase();
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          if (onLanguageChange) onLanguageChange(item.id);
                          setIsLangOpen(false);
                        }}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "10px",
                          padding: "7px 10px",
                          borderRadius: "6px",
                          background: isSelected
                            ? isLight ? "#eef2ff" : "rgba(99, 102, 241, 0.15)"
                            : "transparent",
                          border: "none",
                          color: isSelected
                            ? isLight ? "#4f46e5" : "#a5b4fc"
                            : isLight ? "#334155" : "#cbd5e1",
                          fontSize: "0.82rem",
                          fontWeight: isSelected ? "700" : "500",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "all 0.15s ease"
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background = isLight ? "#f1f5f9" : "rgba(255,255,255,0.06)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background = "transparent";
                          }
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span
                            style={{
                              background: item.badgeBg,
                              color: item.color,
                              fontSize: "0.7rem",
                              fontWeight: "800",
                              padding: "2px 5px",
                              borderRadius: "4px"
                            }}
                          >
                            {item.tag}
                          </span>
                          <span>{item.name}</span>
                        </div>
                        {isSelected && <Check size={14} style={{ color: isLight ? "#4f46e5" : "#818cf8" }} />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Vertical Divider */}
          <div
            style={{
              width: "1px",
              height: "20px",
              background: isLight ? "#e2e8f0" : "rgba(255,255,255,0.1)",
              margin: "0 2px"
            }}
          />

          {/* Essential Toolbar Actions with Active States & Feedback */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            
            {/* Format Code */}
            <button
              type="button"
              onClick={handleFormatCode}
              title="Format Code (Auto-indent & Clean)"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "30px",
                height: "30px",
                borderRadius: "6px",
                background: formattedNotice ? "rgba(34, 197, 94, 0.15)" : "transparent",
                border: formattedNotice ? "1px solid rgba(34, 197, 94, 0.3)" : "1px solid transparent",
                color: formattedNotice ? "#16a34a" : isLight ? "#64748b" : "#94a3b8",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
              onMouseEnter={(e) => {
                if (!formattedNotice) e.currentTarget.style.background = isLight ? "#e2e8f0" : "rgba(255,255,255,0.08)";
              }}
              onMouseLeave={(e) => {
                if (!formattedNotice) e.currentTarget.style.background = "transparent";
              }}
            >
              {formattedNotice ? <Sparkles size={14} /> : <AlignLeft size={15} />}
            </button>

            {/* Copy Code */}
            <button
              type="button"
              onClick={handleCopyCode}
              title={copied ? "Copied!" : "Copy Code"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "30px",
                height: "30px",
                borderRadius: "6px",
                background: copied ? "rgba(34, 197, 94, 0.15)" : "transparent",
                border: copied ? "1px solid rgba(34, 197, 94, 0.3)" : "1px solid transparent",
                color: copied ? "#16a34a" : isLight ? "#64748b" : "#94a3b8",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
              onMouseEnter={(e) => {
                if (!copied) e.currentTarget.style.background = isLight ? "#e2e8f0" : "rgba(255,255,255,0.08)";
              }}
              onMouseLeave={(e) => {
                if (!copied) e.currentTarget.style.background = "transparent";
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={15} />}
            </button>

            {/* Reset Code */}
            <button
              type="button"
              onClick={handleResetCode}
              title="Reset Code to Starter Template"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "30px",
                height: "30px",
                borderRadius: "6px",
                background: "transparent",
                border: "1px solid transparent",
                color: isLight ? "#64748b" : "#94a3b8",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isLight ? "#e2e8f0" : "rgba(255,255,255,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <RotateCcw size={15} />
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen((prev) => !prev)}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Editor"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "30px",
                height: "30px",
                borderRadius: "6px",
                background: isFullscreen ? (isLight ? "#e2e8f0" : "rgba(255,255,255,0.12)") : "transparent",
                border: "1px solid transparent",
                color: isFullscreen ? (isLight ? "#0f172a" : "#ffffff") : (isLight ? "#64748b" : "#94a3b8"),
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isLight ? "#e2e8f0" : "rgba(255,255,255,0.08)";
              }}
              onMouseLeave={(e) => {
                if (!isFullscreen) e.currentTarget.style.background = "transparent";
              }}
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          </div>
        </div>

        {/* Right Side: Run & Submit Action Buttons */}
        {onRun && onSubmit ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={onRun}
              disabled={isRunning || isSubmitting}
              type="button"
              style={{
                background: isLight ? "#ffffff" : "#151b29",
                border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255,255,255,0.14)",
                borderRadius: "8px",
                color: isLight ? "#0f172a" : "#f1f5f9",
                padding: "6px 14px",
                fontSize: "0.82rem",
                fontWeight: "700",
                cursor: isRunning || isSubmitting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                opacity: isRunning || isSubmitting ? 0.7 : 1,
                transition: "all 0.15s ease",
                boxShadow: isLight ? "0 1px 2px rgba(0,0,0,0.05)" : "none"
              }}
            >
              {isRunning ? (
                <Loader2 size={14} className="animate-spin" style={{ color: "#38bdf8" }} />
              ) : (
                <Play size={14} style={{ color: "#22c55e", fill: "#22c55e" }} />
              )}
              {isRunning ? "Running..." : "Run"}
            </button>

            <button
              onClick={onSubmit}
              disabled={isRunning || isSubmitting}
              type="button"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                border: "none",
                borderRadius: "8px",
                color: "#ffffff",
                padding: "6px 16px",
                fontSize: "0.82rem",
                fontWeight: "700",
                cursor: isRunning || isSubmitting ? "not-allowed" : "pointer",
                boxShadow: "0 2px 10px rgba(99, 102, 241, 0.35)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                opacity: isRunning || isSubmitting ? 0.7 : 1,
                transition: "all 0.15s ease"
              }}
            >
              {isSubmitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Zap size={14} style={{ fill: "#ffffff" }} />
              )}
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        ) : null}
      </div>

      {/* Editor Body with Dynamic Line Numbers, Font Size & Theme */}
      <div style={{ display: "flex", flex: 1, minHeight: "380px", background: themePalette.bg, position: "relative" }}>
        {/* Line Numbers Column (Conditionally Rendered by showLineNumbers setting) */}
        {showLineNumbers && (
          <div
            style={{
              padding: "18px 12px",
              background: themePalette.gutterBg,
              color: themePalette.gutterColor,
              fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
              fontSize: `${fontSize}px`,
              lineHeight: "1.75",
              userSelect: "none",
              textAlign: "right",
              borderRight: `1px solid ${themePalette.gutterBorder}`,
              minWidth: "44px"
            }}
          >
            {Array.from({ length: Math.max(8, linesCount) }, (_, i) => (
              <div key={i + 1}>{i + 1}</div>
            ))}
          </div>
        )}

        {/* Textarea Editor & Syntax Highlight Container */}
        <div style={{ position: "relative", flex: 1, minHeight: "380px" }}>
          {/* Syntax Highlighted View (Behind) */}
          <pre
            ref={preRef}
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              margin: 0,
              padding: "18px 16px",
              fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
              fontSize: `${fontSize}px`,
              lineHeight: "1.75",
              whiteSpace: wordWrap ? "pre-wrap" : "pre",
              wordWrap: wordWrap ? "break-word" : "normal",
              overflow: "hidden",
              pointerEvents: "none",
              color: themePalette.textColor,
              background: "transparent"
            }}
            dangerouslySetInnerHTML={{ __html: highlightSyntax(currentCode, language, currentEditorTheme) }}
          />

          {/* Editable Textarea (Front, Transparent Text with Caret) */}
          <textarea
            ref={textareaRef}
            className="code-editor"
            data-lenis-prevent="true"
            onChange={(event) => handleCodeUpdate(event.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            spellCheck="false"
            value={currentCode}
            style={{
              position: "absolute",
              inset: 0,
              background: "transparent",
              border: "none",
              color: "transparent",
              caretColor: themePalette.caretColor,
              fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
              fontSize: `${fontSize}px`,
              lineHeight: "1.75",
              whiteSpace: wordWrap ? "pre-wrap" : "pre",
              padding: "18px 16px",
              outline: "none",
              resize: "none",
              width: "100%",
              height: "100%"
            }}
          />
        </div>
      </div>

      {/* Editor Status Bar */}
      <div className="editor-status" style={{ background: themePalette.gutterBg, padding: "4px 14px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#64748b", fontSize: "0.78rem" }}>
        <div style={{ display: "flex", gap: "12px" }}>
          <span>Ln {linesCount}, Col 1</span>
          <span>Tab: {tabSize}</span>
          <span>Size: {fontSize}px</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: currentLangObj.color }}>
          <span>{currentLangObj.name}</span>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: currentLangObj.color }} />
        </div>
      </div>
    </section>
  );
}
