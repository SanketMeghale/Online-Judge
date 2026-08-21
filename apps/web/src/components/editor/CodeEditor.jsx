import { useRef, useState, useEffect } from "react";
import { AlignLeft, ChevronDown, Copy, Maximize2, Play, RotateCcw, TerminalSquare, Zap } from "lucide-react";
import { useTheme } from "../../context/ThemeContext.jsx";

const languages = [
  { id: "Python", name: "Python 3" },
  { id: "JavaScript", name: "JavaScript" },
  { id: "C++", name: "C++ 20" },
  { id: "Java", name: "Java 24" }
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
    } else if (escaped.includes("#") && (language === "Python" || language === "Python 3")) {
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
    .replace(/\b(true|false|null|undefined|None|True|False|\d+)\b/g, `<span style="color:${numColor};font-weight:600;">$&</span>`)
    // Keywords
    .replace(/\b(class|def|return|function|if|else|elif|for|while|const|let|var|public|private|protected|static|void|import|export|from|new|async|await|pass|self|this|in|of|try|except|finally|catch|case|switch|break|continue|struct|namespace|using)\b/g, `<span style="color:${kwColor};font-weight:bold;">$&</span>`)
    // Types
    .replace(/\b(Solution|TreeAncestor|String|Integer|List|ArrayList|Vector|vector|map|set|int|bool|boolean|char|double|float|long|short)\b/g, `<span style="color:${typeColor};font-weight:bold;">$&</span>`)
    // Functions
    .replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)(?=\s*\()/g, (match, fnName) => {
      const reserved = ["if", "for", "while", "switch", "catch", "return", "sizeof", "typeof"];
      if (reserved.includes(fnName)) return match;
      return `<span style="color:${fnColor};font-weight:600;">${fnName}</span>`;
    });
}

export default function CodeEditor({
  code,
  language,
  onCodeChange,
  onLanguageChange,
  onRun,
  onSubmit,
  isRunning,
  isSubmitting
}) {
  const { isLight } = useTheme();
  const textareaRef = useRef(null);
  const preRef = useRef(null);

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
  const tabSize = editorSettings.tabSize || (language === "Python" ? 4 : 2);
  const wordWrap = editorSettings.wordWrap !== false;
  const showLineNumbers = editorSettings.showLineNumbers !== false;
  
  const configuredTheme = editorSettings.editorTheme;
  const currentEditorTheme = configuredTheme
    ? (configuredTheme === "judgo-dark" && isLight ? "light" : configuredTheme)
    : (isLight ? "light" : "judgo-dark");
  const themePalette = THEME_STYLES[currentEditorTheme] || (isLight ? THEME_STYLES.light : THEME_STYLES["judgo-dark"]);

  const indentStr = " ".repeat(tabSize);
  const linesCount = (code || "").split("\n").length;

  function handleScroll() {
    if (preRef.current && textareaRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }

  function handleKeyDown(e) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd } = textarea;

    if (e.key === "Tab") {
      e.preventDefault();
      if (e.shiftKey) {
        const beforeCursor = code.substring(0, selectionStart);
        const lineStart = beforeCursor.lastIndexOf("\n") + 1;
        const lineText = code.substring(lineStart, selectionEnd);

        if (lineText.startsWith(indentStr)) {
          const nextCode = code.substring(0, lineStart) + lineText.substring(indentStr.length) + code.substring(selectionEnd);
          onCodeChange(nextCode);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = Math.max(lineStart, selectionStart - indentStr.length);
          }, 0);
        }
      } else {
        const nextCode = code.substring(0, selectionStart) + indentStr + code.substring(selectionEnd);
        onCodeChange(nextCode);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart + indentStr.length;
        }, 0);
      }
      return;
    }

    if (e.key === "Enter") {
      const beforeCursor = code.substring(0, selectionStart);
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
      const nextCode = code.substring(0, selectionStart) + insertText + code.substring(selectionEnd);

      onCodeChange(nextCode);

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
      const nextChar = code.charAt(selectionStart);
      if (!nextChar || /\s|\)|\]|\}|;|:/.test(nextChar)) {
        e.preventDefault();
        const insertText = e.key + closingChar;
        const nextCode = code.substring(0, selectionStart) + insertText + code.substring(selectionEnd);
        onCodeChange(nextCode);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
        }, 0);
      }
    }
  }

  return (
    <section className="editor-panel" style={{ background: themePalette.bg, border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: isLight ? "0 1px 4px rgba(0,0,0,0.04)" : "none" }}>
      {/* Editor Header Bar */}
      <div className="editor-toolbar" style={{ background: themePalette.gutterBg, padding: "8px 14px", borderBottom: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label className="editor-title" style={{ background: isLight ? "#ffffff" : "rgba(255,255,255,0.06)", border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "4px 10px", display: "flex", alignItems: "center", gap: "6px", color: themePalette.textColor, cursor: "pointer" }}>
            <TerminalSquare size={15} style={{ color: "#a855f7" }} />
            <select
              onChange={(event) => onLanguageChange(event.target.value)}
              value={language}
              style={{ background: "transparent", border: "none", color: themePalette.textColor, fontSize: "0.85rem", fontWeight: "bold", cursor: "pointer", outline: "none" }}
            >
              {languages.map((item) => (
                <option key={item.id} value={item.id} style={{ background: isLight ? "#ffffff" : "#131826", color: isLight ? "#0f172a" : "#fff" }}>{item.name}</option>
              ))}
            </select>
            <ChevronDown size={14} style={{ color: isLight ? "#64748b" : "#888" }} />
          </label>
          <span style={{ fontSize: "0.75rem", background: "rgba(34, 197, 94, 0.15)", color: "#16a34a", border: "1px solid rgba(34, 197, 94, 0.3)", padding: "2px 8px", borderRadius: "999px", fontWeight: "600" }}>
            • Auto
          </span>

          <div style={{ display: "flex", gap: "8px", marginLeft: "6px", color: isLight ? "#64748b" : "#8b9bb4" }}>
            <AlignLeft size={15} style={{ cursor: "pointer" }} title="Format code" />
            <Copy size={15} style={{ cursor: "pointer" }} title="Copy code" />
            <RotateCcw size={15} style={{ cursor: "pointer" }} title="Reset code" />
            <Maximize2 size={15} style={{ cursor: "pointer" }} title="Full Screen" />
          </div>
        </div>

        {/* Action Buttons in Editor Toolbar */}
        {onRun && onSubmit ? (
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={onRun}
              disabled={isRunning || isSubmitting}
              type="button"
              style={{
                background: isLight ? "#f8fafc" : "transparent",
                border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255,255,255,0.18)",
                borderRadius: "8px",
                color: isLight ? "#0f172a" : "#eee",
                padding: "6px 14px",
                fontSize: "0.85rem",
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <Play size={14} />
              {isRunning ? "Running..." : "Run"}
            </button>

            <button
              onClick={onSubmit}
              disabled={isRunning || isSubmitting}
              type="button"
              style={{
                background: "linear-gradient(135deg, #7850ff 0%, #9333ea 100%)",
                border: "none",
                borderRadius: "8px",
                color: "#ffffff",
                padding: "6px 16px",
                fontSize: "0.85rem",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(120, 80, 255, 0.4)",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <Zap size={14} />
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
            dangerouslySetInnerHTML={{ __html: highlightSyntax(code, language, currentEditorTheme) }}
          />

          {/* Editable Textarea (Front, Transparent Text with Caret) */}
          <textarea
            ref={textareaRef}
            className="code-editor"
            onChange={(event) => onCodeChange(event.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            spellCheck="false"
            value={code}
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
        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#4ade80" }}>
          <span>{language}</span>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80" }} />
        </div>
      </div>
    </section>
  );
}
