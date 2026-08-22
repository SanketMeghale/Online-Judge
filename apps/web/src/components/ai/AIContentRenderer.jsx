import React, { useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Copy, Check } from "lucide-react";
import "../../styles/aiContentRenderer.css";

/**
 * Pre-processes raw AI markdown to ensure clean LaTeX math and bullet rendering
 */
function normalizeAIMarkdown(rawText = "") {
  if (!rawText || typeof rawText !== "string") return "";

  let text = rawText;

  // 1. Normalize LaTeX block delimiters \[ ... \] to $$ ... $$
  text = text.replace(/\\\[([\s\S]*?)\\\]/g, (match, p1) => `\n$$\n${p1.trim()}\n$$\n`);

  // 2. Normalize LaTeX inline delimiters \( ... \) to $ ... $
  text = text.replace(/\\\(([\s\S]*?)\\\)/g, (match, p1) => `$${p1.trim()}$`);

  // 3. Fix un-spaced markdown headers (e.g., "###Header" -> "### Header")
  text = text.replace(/^(#{1,6})([^\s#])/gm, "$1 $2");

  // 4. Ensure Big-O expressions with superscripts like O(n²) get normalized to $O(n^2)$
  text = text.replace(/\bO\(n²\)/gi, "$O(n^2)$");
  text = text.replace(/\bO\(1\)/g, "$O(1)$");

  return text;
}

/**
 * Fenced Code Block with copy action and language header
 */
function CodeBlockComponent({ language, value }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="judgo-ai-codeblock">
      <div className="judgo-ai-codeblock-header">
        <span className="judgo-ai-codeblock-lang">{language || "code"}</span>
        <button
          type="button"
          onClick={handleCopy}
          className={`judgo-ai-copy-btn ${copied ? "copied" : ""}`}
          title="Copy code to clipboard"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          <span>{copied ? "Copied" : "Copy Code"}</span>
        </button>
      </div>
      <pre>
        <code>{value}</code>
      </pre>
    </div>
  );
}

/**
 * Centralized, secure, robust AI Content & Markdown Renderer for Judgo
 */
export default function AIContentRenderer({
  content = "",
  children,
  isUser = false,
  compact = false,
  className = ""
}) {
  const rawInput = content || (typeof children === "string" ? children : "") || "";
  const normalizedContent = useMemo(() => normalizeAIMarkdown(rawInput), [rawInput]);

  if (!normalizedContent) return null;

  const components = {
    // Code Blocks & Inline Code
    code({ node, inline, className: codeClassName, children: codeChildren, ...props }) {
      const match = /language-(\w+)/.exec(codeClassName || "");
      const codeString = String(codeChildren || "").replace(/\n$/, "");

      // If inline code or single token without language
      if (inline || (!match && !codeString.includes("\n"))) {
        return (
          <code className="judgo-ai-inline-code" {...props}>
            {codeChildren}
          </code>
        );
      }

      return (
        <CodeBlockComponent
          language={match ? match[1] : ""}
          value={codeString}
        />
      );
    },

    // Responsive UI Tables
    table({ children: tableChildren }) {
      return (
        <div className="judgo-ai-table-wrapper">
          <table className="judgo-ai-table">{tableChildren}</table>
        </div>
      );
    },

    // Blockquotes & Callouts
    blockquote({ children: quoteChildren }) {
      return <blockquote className="judgo-ai-blockquote">{quoteChildren}</blockquote>;
    },

    // Horizontal Rule Dividers
    hr() {
      return <hr className="judgo-ai-hr" />;
    },

    // Safe Links
    a({ href, children: linkChildren }) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="judgo-ai-link"
        >
          {linkChildren}
        </a>
      );
    }
  };

  return (
    <div
      className={`judgo-ai-content ${isUser ? "user-bubble" : ""} ${compact ? "compact" : ""} ${className}`.trim()}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {normalizedContent}
      </ReactMarkdown>
    </div>
  );
}
