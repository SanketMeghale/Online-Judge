import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Code2, Trophy, Bot, ArrowRight, X, Sparkles } from "lucide-react";

const searchIndex = [
  { id: "two-sum", title: "Two Sum", category: "Problems", path: "/problems/two-sum", diff: "Easy" },
  { id: "valid-parentheses", title: "Valid Parentheses", category: "Problems", path: "/problems/valid-parentheses", diff: "Easy" },
  { id: "palindrome-number", title: "Palindrome Number", category: "Problems", path: "/problems/palindrome-number", diff: "Easy" },
  { id: "best-time-to-buy-and-sell-stock", title: "Best Time to Buy and Sell Stock", category: "Problems", path: "/problems/best-time-to-buy-and-sell-stock", diff: "Easy" },
  { id: "single-number", title: "Single Number", category: "Problems", path: "/problems/single-number", diff: "Easy" },
  { id: "climbing-stairs", title: "Climbing Stairs", category: "Problems", path: "/problems/climbing-stairs", diff: "Easy" },
  { id: "reverse-string", title: "Reverse String", category: "Problems", path: "/problems/reverse-string", diff: "Easy" },
  { id: "codesprint", title: "CodeSprint Biweekly Contest", category: "Contests", path: "/contests", diff: "Live" },
  { id: "ai-interview", title: "AI Technical Mock Interview", category: "Judgo Intelligence", path: "/ai-coach", diff: "AI" },
  { id: "leaderboard", title: "Global Developer Leaderboard", category: "Rankings", path: "/leaderboard", diff: "Stats" }
];

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const filtered = query.trim()
    ? searchIndex.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      )
    : searchIndex;

  useEffect(() => {
    function handleKeyDown(e) {
      if (!isOpen) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === "Enter" && filtered[selectedIndex]) {
        e.preventDefault();
        navigate(filtered[selectedIndex].path);
        onClose();
      } else if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, selectedIndex, navigate, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="cmd-palette-backdrop"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="cmd-palette-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cmd-palette-input-box">
              <Search size={18} style={{ color: "#64748b" }} />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search problems, contests, topics..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                className="cmd-palette-input"
              />
              <button
                type="button"
                onClick={onClose}
                style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center" }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="cmd-palette-results">
              {filtered.map((item, index) => {
                const isSelected = selectedIndex === index;
                return (
                  <div
                    key={item.id}
                    className={`cmd-palette-item ${isSelected ? "active" : ""}`}
                    onClick={() => {
                      navigate(item.path);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {item.category === "Problems" ? (
                        <Code2 size={16} style={{ color: "#38bdf8" }} />
                      ) : item.category === "Contests" ? (
                        <Trophy size={16} style={{ color: "#fbbf24" }} />
                      ) : item.category === "Judgo Intelligence" ? (
                        <Bot size={16} style={{ color: "#c084fc" }} />
                      ) : (
                        <Sparkles size={16} style={{ color: "#10b981" }} />
                      )}
                      <span style={{ fontSize: "0.88rem", fontWeight: "500" }}>{item.title}</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "0.72rem", color: "var(--dash-text-muted)", textTransform: "uppercase" }}>
                        {item.category}
                      </span>
                      {isSelected ? <ArrowRight size={14} style={{ color: "#c084fc" }} /> : null}
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div style={{ padding: "24px", textAlign: "center", color: "#64748b", fontSize: "0.88rem" }}>
                  No matching problems or topics found for "{query}".
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
