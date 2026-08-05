import { useRef } from "react";
import { AlignLeft, ChevronDown, Copy, Maximize2, Play, RotateCcw, Settings, TerminalSquare, Zap } from "lucide-react";

const languages = [
  { id: "Python", name: "Python 3" },
  { id: "JavaScript", name: "JavaScript" },
  { id: "C++", name: "C++ 20" },
  { id: "Java", name: "Java 24" }
];

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
  const textareaRef = useRef(null);
  const indentStr = language === "Python" ? "    " : "  ";
  const linesCount = (code || "").split("\n").length;

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
    <section className="editor-panel" style={{ background: "#0d111a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Editor Header Bar */}
      <div className="editor-toolbar" style={{ background: "#131826", padding: "8px 14px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label className="editor-title" style={{ background: "#1c2234", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "4px 10px", display: "flex", alignItems: "center", gap: "6px", color: "#fff", cursor: "pointer" }}>
            <TerminalSquare size={15} style={{ color: "#a855f7" }} />
            <select
              onChange={(event) => onLanguageChange(event.target.value)}
              value={language}
              style={{ background: "transparent", border: "none", color: "#fff", fontSize: "0.85rem", fontWeight: "bold", cursor: "pointer", outline: "none" }}
            >
              {languages.map((item) => (
                <option key={item.id} value={item.id} style={{ background: "#131826", color: "#fff" }}>{item.name}</option>
              ))}
            </select>
            <ChevronDown size={14} style={{ color: "#888" }} />
          </label>
          <span style={{ fontSize: "0.75rem", background: "rgba(34, 197, 94, 0.15)", color: "#4ade80", border: "1px solid rgba(34, 197, 94, 0.3)", padding: "2px 8px", borderRadius: "999px", fontWeight: "600" }}>
            • Auto
          </span>

          <div style={{ display: "flex", gap: "8px", marginLeft: "6px", color: "#8b9bb4" }}>
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
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: "8px",
                color: "#eee",
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

      {/* Editor Body with Line Numbers */}
      <div style={{ display: "flex", flex: 1, minHeight: "380px", background: "#080c14", position: "relative" }}>
        {/* Line Numbers Column */}
        <div style={{ padding: "18px 12px", background: "#060910", color: "#475569", fontFamily: "monospace", fontSize: "0.88rem", lineHeight: "1.75", select: "none", textAlign: "right", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
          {Array.from({ length: Math.max(8, linesCount) }, (_, i) => (
            <div key={i + 1}>{i + 1}</div>
          ))}
        </div>

        {/* Textarea Editor */}
        <textarea
          ref={textareaRef}
          className="code-editor"
          onChange={(event) => onCodeChange(event.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck="false"
          value={code}
          style={{ flex: 1, background: "transparent", border: "none", color: "#f1f5f9", fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace", fontSize: "0.92rem", lineHeight: "1.75", padding: "18px 16px", outline: "none", resize: "none", width: "100%" }}
        />
      </div>

      {/* Editor Status Bar */}
      <div className="editor-status" style={{ background: "#070b13", padding: "4px 14px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#64748b", fontSize: "0.78rem" }}>
        <div style={{ display: "flex", gap: "12px" }}>
          <span>Ln 8, Col 1</span>
          <span>Spaces: 4</span>
          <span>UTF-8</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#4ade80" }}>
          <span>{language}</span>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80" }} />
        </div>
      </div>
    </section>
  );
}
