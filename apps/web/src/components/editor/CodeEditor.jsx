import { ChevronDown, Settings, TerminalSquare } from "lucide-react";

const languages = ["Python", "JavaScript", "Java"];

export default function CodeEditor({
  code,
  language,
  onCodeChange,
  onLanguageChange
}) {
  return (
    <section className="editor-panel">
      <div className="editor-toolbar">
        <label className="editor-title">
          <TerminalSquare size={18} />
          <select onChange={(event) => onLanguageChange(event.target.value)} value={language}>
            {languages.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <ChevronDown size={15} />
        </label>
        <span className="auto-mode">Saved locally</span>
        <div className="editor-tools">
          <Settings size={17} />
        </div>
      </div>
      <textarea
        className="code-editor"
        onChange={(event) => onCodeChange(event.target.value)}
        spellCheck="false"
        value={code}
      />
      <div className="editor-status">
        <span className="accepted-text">Draft synced</span>
        <span>{language}</span>
        <span>{code.split("\n").length} lines</span>
        <span>UTF-8</span>
      </div>
    </section>
  );
}
