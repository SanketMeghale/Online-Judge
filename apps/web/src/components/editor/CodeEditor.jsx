import { ChevronDown, Moon, Settings, TerminalSquare } from "lucide-react";

const starterCode = `class Solution:
    def isPalindrome(self, s: str) -> bool:
        left, right = 0, len(s) - 1

        while left < right:
            while left < right and not s[left].isalnum():
                left += 1

            while left < right and not s[right].isalnum():
                right -= 1

            if s[left].lower() != s[right].lower():
                return False

            left += 1
            right -= 1

        return True`;

export default function CodeEditor() {
  return (
    <section className="editor-panel">
      <div className="editor-toolbar">
        <div className="editor-title">
          <TerminalSquare size={18} />
          <span>Python3</span>
          <ChevronDown size={15} />
        </div>
        <span className="auto-mode">Auto</span>
        <div className="editor-tools">
          <Moon size={17} />
          <Settings size={17} />
        </div>
      </div>
      <textarea className="code-editor" defaultValue={starterCode} spellCheck="false" />
      <div className="editor-status">
        <span className="accepted-text">Saved</span>
        <span>Ln 17, Col 19</span>
        <span>Spaces: 4</span>
        <span>UTF-8</span>
      </div>
    </section>
  );
}
