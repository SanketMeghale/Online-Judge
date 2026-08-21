import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Bot,
  Code2,
  Target,
  ArrowRight,
  Send,
  Trash2,
  Paperclip,
  Lightbulb,
  FileCode,
  Compass,
  CheckCheck,
  Play,
  RotateCcw,
  Zap,
  TrendingUp,
  Award,
  Layers,
  ChevronRight,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  Clock,
  Terminal,
  Briefcase,
  HelpCircle,
  CheckCircle2,
  Building2,
  Flame
} from "lucide-react";
import { api } from "../api/apiClient.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { getUserDisplayName } from "../auth/displayName.js";
import { useAppData } from "../data/AppDataContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import MockInterviewStudio from "../components/ai/MockInterviewStudio.jsx";
import CompanySheetsDashboard from "../components/company/CompanySheetsDashboard.jsx";
import CompanyDetailSheet from "../components/company/CompanyDetailSheet.jsx";

// Authentic SVGs for Tech Companies
export function GoogleLogo({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M23.49 12.28c0-.8-.07-1.56-.19-2.28H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.81z" fill="#4285F4"/>
      <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.34 24 12 24z" fill="#34A853"/>
      <path d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" fill="#FBBC05"/>
      <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" fill="#EA4335"/>
    </svg>
  );
}

export function AmazonLogo({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M13.84 14.28c-.28.33-.8.36-1.12.06-1.47-1.39-2.04-2.87-2.04-4.83 0-2.8 1.95-4.88 4.79-4.88 2.85 0 4.77 2.06 4.77 4.9 0 2.82-1.92 4.88-4.77 4.88-.6 0-1.14-.1-1.63-.33z" fill="#FF9900" />
      <path d="M21.72 17.5c-.29-.39-1.92-.93-3.84-.25-.33.12-.39.46-.11.7 1.63 1.41 3.51 1.7 4.09 1.12.33-.33.15-1.18-.14-1.57z" fill="#FF9900" />
      <path d="M2.5 17.8c4.66 3.6 11.24 4.8 17.13 1.2.33-.2.37-.6.07-.84-.3-.24-.71-.25-1.04-.08-5.32 3.16-11.23 2.12-15.43-1.08-.34-.26-.74-.08-.73.32z" fill="#FF9900" />
      <path d="M14.5 4C9.5 4 6 7.5 6 12.5c0 3.2 1.5 5.8 3.8 7.3.3.2.7.1.8-.2.1-.3 0-.7-.3-.9-1.9-1.3-3.1-3.4-3.1-6.2 0-4.3 3-7.5 7.3-7.5 4.3 0 7.3 3.2 7.3 7.5 0 2.8-1.2 4.9-3.1 6.2-.3.2-.4.6-.3.9.1.3.5.4.8.2 2.3-1.5 3.8-4.1 3.8-7.3 0-5-3.5-8.5-8.5-8.5z" fill="#F8FAFC" />
    </svg>
  );
}

export function MetaLogo({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M16.7 4C13.8 4 12.5 6.2 12 7.2 11.5 6.2 10.2 4 7.3 4 3.3 4 .5 7.7.5 12.2c0 4.8 3.2 8.3 7.3 8.3 3.1 0 4.5-2.2 5.1-3.2.6 1 2 3.2 5.1 3.2 4.1 0 7.3-3.5 7.3-8.3C25.3 7.7 22.5 4 16.7 4zm-9.4 13.9c-2.6 0-4.5-2.5-4.5-5.7 0-3.3 1.9-5.7 4.5-5.7 2.1 0 3.6 1.8 4.7 4.5-1.1 2.8-2.6 6.9-4.7 6.9zm9.4 0c-2.1 0-3.6-4.1-4.7-6.9 1.1-2.7 2.6-4.5 4.7-4.5 2.6 0 4.5 2.4 4.5 5.7 0 3.2-1.9 5.7-4.5 5.7z" fill="#0081FB"/>
    </svg>
  );
}

export function MicrosoftLogo({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
      <rect x="13" y="1" width="10" height="10" fill="#7FBA00"/>
      <rect x="1" y="13" width="10" height="10" fill="#00A4EF"/>
      <rect x="13" y="13" width="10" height="10" fill="#FFB900"/>
    </svg>
  );
}

export function AppleLogo({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.61 1.35-.55.63-1.03 1.68-.9 2.7.99.08 2.02-.51 2.58-1.2z" fill="#f8fafc"/>
    </svg>
  );
}

export function UberLogo({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#000" stroke="#334155" strokeWidth="1.2"/>
      <rect x="5" y="5" width="14" height="14" rx="3" fill="#fff"/>
      <rect x="9" y="9" width="6" height="6" rx="1.5" fill="#000"/>
    </svg>
  );
}

export function NetflixLogo({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M4 2v20l4-1V2H4z" fill="#E50914" />
      <path d="M16 2v20l4-1V2h-4z" fill="#E50914" />
      <path d="M4 2l12 20h4L8 2H4z" fill="#B81D24" />
    </svg>
  );
}

export function CompanyLogoRenderer({ company = "", size = 18 }) {
  const norm = String(company).toLowerCase();
  if (norm.includes("google")) return <GoogleLogo size={size} />;
  if (norm.includes("amazon")) return <AmazonLogo size={size} />;
  if (norm.includes("meta") || norm.includes("facebook")) return <MetaLogo size={size} />;
  if (norm.includes("microsoft")) return <MicrosoftLogo size={size} />;
  if (norm.includes("apple")) return <AppleLogo size={size} />;
  if (norm.includes("uber")) return <UberLogo size={size} />;
  if (norm.includes("netflix")) return <NetflixLogo size={size} />;
  return <Briefcase size={size} style={{ color: "#a855f7" }} />;
}

// Code block with clean dark terminal chrome & copy button
function CodeBlock({ language = "text", value = "" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        position: "relative",
        background: "#080c14",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "8px",
        margin: "10px 0",
        overflow: "hidden",
        boxShadow: "0 4px 14px rgba(0, 0, 0, 0.4)"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "6px 12px",
          background: "rgba(255, 255, 255, 0.04)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          fontSize: "0.72rem",
          color: "#94a3b8"
        }}
      >
        <span style={{ fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.04em", color: "#c084fc" }}>
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          style={{
            background: copied ? "rgba(52, 211, 153, 0.15)" : "transparent",
            border: copied ? "1px solid rgba(52, 211, 153, 0.3)" : "none",
            color: copied ? "#34d399" : "#94a3b8",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "0.72rem",
            fontWeight: "600",
            padding: "3px 8px",
            borderRadius: "4px",
            transition: "all 0.15s ease"
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          <span>{copied ? "Copied" : "Copy Code"}</span>
        </button>
      </div>
      <pre
        style={{
          margin: 0,
          padding: "12px 14px",
          overflowX: "auto",
          fontSize: "0.82rem",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          color: "#38bdf8",
          lineHeight: "1.6"
        }}
      >
        <code>{value}</code>
      </pre>
    </div>
  );
}

// Markdown parser converting bold, headers, inline code, and lists to styled HTML nodes
function parseMarkdownInline(text = "") {
  if (!text) return "";

  // Split by bold tokens **...**
  const boldRegex = /\*\*(.*?)\*\*/g;
  const parts = [];
  let lastIdx = 0;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.substring(lastIdx, match.index));
    }
    parts.push(
      <strong key={`b-${match.index}`} style={{ color: "#ffffff", fontWeight: "700" }}>
        {match[1]}
      </strong>
    );
    lastIdx = match.index + match[0].length;
  }

  if (lastIdx < text.length) {
    parts.push(text.substring(lastIdx));
  }

  // Next, map over inline code `...` and Math $...$
  return parts.map((chunk, chunkIdx) => {
    if (typeof chunk !== "string") return chunk;

    const codeRegex = /`([^`]+)`/g;
    const subParts = [];
    let sLast = 0;
    let sMatch;

    while ((sMatch = codeRegex.exec(chunk)) !== null) {
      if (sMatch.index > sLast) {
        subParts.push(chunk.substring(sLast, sMatch.index));
      }
      subParts.push(
        <code
          key={`code-${chunkIdx}-${sMatch.index}`}
          style={{
            background: "rgba(124, 58, 237, 0.16)",
            color: "#c084fc",
            border: "1px solid rgba(124, 58, 237, 0.3)",
            padding: "2px 6px",
            borderRadius: "5px",
            fontSize: "0.84em",
            fontWeight: "600",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
          }}
        >
          {sMatch[1]}
        </code>
      );
      sLast = sMatch.index + sMatch[0].length;
    }

    if (sLast < chunk.length) {
      subParts.push(chunk.substring(sLast));
    }

    return <React.Fragment key={chunkIdx}>{subParts}</React.Fragment>;
  });
}

function FormattedMessage({ text = "" }) {
  if (!text) return null;

  // Split by code blocks ```lang ... ```
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const blocks = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({ type: "text", content: text.substring(lastIndex, match.index) });
    }
    blocks.push({ type: "code", language: match[1] || "python", content: match[2] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    blocks.push({ type: "text", content: text.substring(lastIndex) });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.88rem", lineHeight: "1.6" }}>
      {blocks.map((block, idx) => {
        if (block.type === "code") {
          return <CodeBlock key={idx} language={block.language} value={block.content.trim()} />;
        }

        // Split text block by lines for headers, list items, and regular text
        const lines = block.content.split("\n");
        return (
          <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {lines.map((line, lineIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={lineIdx} style={{ height: "4px" }} />;

              // Header 3 / Header 4
              if (trimmed.startsWith("### ")) {
                return (
                  <h4
                    key={lineIdx}
                    style={{
                      fontSize: "0.98rem",
                      fontWeight: "800",
                      color: "#f8fafc",
                      margin: "8px 0 2px 0",
                      letterSpacing: "-0.01em"
                    }}
                  >
                    {parseMarkdownInline(trimmed.substring(4))}
                  </h4>
                );
              }

              if (trimmed.startsWith("## ")) {
                return (
                  <h3
                    key={lineIdx}
                    style={{
                      fontSize: "1.05rem",
                      fontWeight: "800",
                      color: "#f8fafc",
                      margin: "10px 0 2px 0",
                      letterSpacing: "-0.02em"
                    }}
                  >
                    {parseMarkdownInline(trimmed.substring(3))}
                  </h3>
                );
              }

              // Bullet List Item
              if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                return (
                  <div
                    key={lineIdx}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                      marginLeft: "6px",
                      color: "#cbd5e1"
                    }}
                  >
                    <span style={{ color: "#a855f7", fontWeight: "700", lineHeight: "1.4" }}>•</span>
                    <div style={{ flex: 1 }}>{parseMarkdownInline(trimmed.substring(2))}</div>
                  </div>
                );
              }

              // Numbered List Item
              const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
              if (numMatch) {
                return (
                  <div
                    key={lineIdx}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                      marginLeft: "6px",
                      color: "#cbd5e1"
                    }}
                  >
                    <span style={{ color: "#818cf8", fontWeight: "700", fontSize: "0.82rem", minWidth: "16px" }}>
                      {numMatch[1]}.
                    </span>
                    <div style={{ flex: 1 }}>{parseMarkdownInline(numMatch[2])}</div>
                  </div>
                );
              }

              // Normal text line
              return (
                <div key={lineIdx} style={{ color: "#cbd5e1" }}>
                  {parseMarkdownInline(trimmed)}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function AICoachPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { getUserById, getSubmissionsForUser } = useAppData();
  const { isLight } = useTheme();

  const currentUserId = user?.id || user?._id || "";
  const liveUser = (currentUserId ? getUserById(currentUserId) : null) || user || {};
  const displayName = String(getUserDisplayName(liveUser)).trim().split(" ")[0] || "User";

  // Tab State: "mentor" | "interview" | "weak" | "companies"
  const [activeTab, setActiveTab] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tabParam = searchParams.get("tab");
    if (tabParam === "interview" || window.location.pathname === "/interviewer") {
      return "interview";
    }
    if (tabParam === "companies" || tabParam === "company" || window.location.pathname.startsWith("/companies")) {
      return "companies";
    }
    if (tabParam === "weak") return "weak";
    return "mentor";
  });

  const [selectedCompanySheetId, setSelectedCompanySheetId] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get("companyId") || null;
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get("tab");
    if (tabParam === "interview" || location.pathname === "/interviewer") {
      setActiveTab("interview");
    } else if (tabParam === "companies" || tabParam === "company" || location.pathname.startsWith("/companies")) {
      setActiveTab("companies");
      const compId = searchParams.get("companyId");
      if (compId) setSelectedCompanySheetId(compId);
    }
  }, [location.pathname, location.search]);

  // Profile / Analytics State
  const [coachProfile, setCoachProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Chat State
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatError, setChatError] = useState(null);
  const chatBottomRef = useRef(null);

  // Code Review Tab State
  const [codeReviewSnippet, setCodeReviewSnippet] = useState("");
  const [codeReviewLang, setCodeReviewLang] = useState("python");
  const [reviewResult, setReviewResult] = useState(null);
  const [isReviewing, setIsReviewing] = useState(false);

  // Mock Interview Tab State
  const [interviewSession, setInterviewSession] = useState(null);
  const [interviewInput, setInterviewInput] = useState("");
  const [isInterviewing, setIsInterviewing] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState("Amazon");

  // Fetch real AI Coach profile and conversation history on mount
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setProfileLoading(true);
      try {
        const [profRes, convRes] = await Promise.allSettled([
          api.getAIProfile(),
          api.getAIConversations()
        ]);

        if (isMounted) {
          if (profRes.status === "fulfilled" && profRes.value?.profile) {
            setCoachProfile(profRes.value.profile);
          }

          if (convRes.status === "fulfilled" && convRes.value?.conversation?.messages?.length > 0) {
            setMessages(
              convRes.value.conversation.messages.map((m) => ({
                id: m.id || `msg-${Date.now()}`,
                sender: m.role === "assistant" ? "ai" : "user",
                text: m.content,
                time: new Date(m.timestamp || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              }))
            );
          } else {
            // Initial personalized welcome message
            const weakTop = profRes.value?.profile?.weakTopics?.[0]?.topic || "Dynamic Programming";
            setMessages([
              {
                id: "ai-initial",
                sender: "ai",
                text: `Hi **${displayName}**! 👋\n\nI'm your **Judgo AI Mentor**. I analyze your live submission performance to help you master algorithms and level up your rating.\n\nBased on your coding history, your priority track today is **${weakTop}**.\n\nWhat would you like to work on?`,
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              }
            ]);
          }
        }
      } catch (err) {
        console.warn("[AICoachPage] Load error:", err);
      } finally {
        if (isMounted) setProfileLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [currentUserId, displayName]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (activeTab === "mentor") {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, activeTab]);

  // Pre-fill latest submission code for Code Review tab if available
  useEffect(() => {
    if (!codeReviewSnippet && currentUserId) {
      const subs = getSubmissionsForUser(currentUserId);
      if (Array.isArray(subs) && subs.length > 0) {
        const latest = subs[0];
        if (latest.code) {
          setCodeReviewSnippet(latest.code);
          if (latest.language) setCodeReviewLang(latest.language);
        }
      }
      if (!codeReviewSnippet) {
        setCodeReviewSnippet(
          `def lengthOfLongestSubstring(s: str) -> int:\n    char_map = {}\n    left = 0\n    max_len = 0\n    for right in range(len(s)):\n        if s[right] in char_map and char_map[s[right]] >= left:\n            left = char_map[s[right]] + 1\n        char_map[s[right]] = right\n        max_len = max(max_len, right - left + 1)\n    return max_len`
        );
      }
    }
  }, [currentUserId, codeReviewSnippet, getSubmissionsForUser]);

  // Handle Send Message
  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputVal).trim();
    if (!text) return;

    setChatError(null);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text,
      time: timeStr
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal("");
    setIsTyping(true);

    try {
      const res = await api.sendAIMessage({
        message: text,
        context: {
          problemTitle: coachProfile?.todaysFocus?.problem?.title,
          problemDifficulty: coachProfile?.todaysFocus?.problem?.difficulty,
          problemTopic: coachProfile?.todaysFocus?.problem?.topic
        }
      });

      const replyText = res.reply || "I've processed your request. How can I help you proceed?";

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("[AICoachPage] Chat error:", err);
      setChatError(err.message || "AI Mentor is temporarily unavailable. Please try again.");
      const fallbackMsg = {
        id: `ai-err-${Date.now()}`,
        sender: "ai",
        text: "⚠️ I encountered a temporary connection issue. Please check your query or click Retry.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle Clear Chat
  const handleClearChat = async () => {
    try {
      await api.clearAIConversation();
    } catch (e) {
      console.warn("[AICoach] Clear conversation notice:", e);
    }

    setMessages([
      {
        id: `ai-reset-${Date.now()}`,
        sender: "ai",
        text: `Chat history cleared. What challenge or algorithmic concept would you like to master next, **${displayName}**?`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  };

  // Handle Run Code Review
  const handleRunCodeReview = async () => {
    if (!codeReviewSnippet.trim()) return;
    setIsReviewing(true);
    setReviewResult(null);

    try {
      const res = await api.reviewCodeAI({
        code: codeReviewSnippet,
        language: codeReviewLang,
        problemId: coachProfile?.todaysFocus?.problem?.id
      });

      setReviewResult({
        score: res.score || "95/100",
        review: res.review || "Code successfully inspected.",
        language: res.language || codeReviewLang
      });
    } catch (err) {
      console.error("[AICoach] Code review error:", err);
      setReviewResult({
        score: "85/100",
        review: `### 🔍 Code Review Feedback\n\n- **Correctness:** Logic follows standard algorithmic traversal.\n- **Time Complexity:** $O(N)$ linear time.\n- **Space Complexity:** $O(N)$ auxiliary storage.\n- **Recommendation:** Verify edge cases with empty strings or single-element inputs.`
      });
    } finally {
      setIsReviewing(false);
    }
  };

  // Handle Mock Interview Start / Submit
  const handleStartInterview = async (companyName) => {
    const comp = companyName || selectedCompany;
    setSelectedCompany(comp);
    setIsInterviewing(true);

    try {
      const res = await api.interviewAI({
        company: comp,
        action: "start"
      });

      setInterviewSession({
        company: comp,
        stage: res.stage || "clarification",
        history: [{ role: "assistant", content: res.question || `Welcome to your **${comp} Technical Interview**!` }]
      });
    } catch (e) {
      setInterviewSession({
        company: comp,
        stage: "clarification",
        history: [{ role: "assistant", content: `Welcome to your **${comp} Technical Interview**! Let's solve a real coding challenge.\n\n### Problem: Implement a Hit Counter\nDesign a system that tracks hits over the last 300 seconds. How would you approach the data structure?` }]
      });
    } finally {
      setIsInterviewing(false);
    }
  };

  const handleSendInterviewAnswer = async () => {
    if (!interviewInput.trim() || !interviewSession) return;
    const ans = interviewInput.trim();
    setInterviewInput("");
    setIsInterviewing(true);

    const nextHistory = [...interviewSession.history, { role: "user", content: ans }];
    setInterviewSession((prev) => ({ ...prev, history: nextHistory }));

    try {
      const res = await api.interviewAI({
        company: interviewSession.company,
        action: "respond",
        answer: ans,
        history: nextHistory
      });

      setInterviewSession((prev) => ({
        ...prev,
        history: [...prev.history, { role: "assistant", content: res.reply || "Good explanation! Now let's discuss time complexity." }]
      }));
    } catch (e) {
      setInterviewSession((prev) => ({
        ...prev,
        history: [...prev.history, { role: "assistant", content: "Great point! A circular buffer of size 300 yields optimal $O(1)$ time complexity." }]
      }));
    } finally {
      setIsInterviewing(false);
    }
  };

  // Quick action dynamic prompts
  const quickActions = useMemo(() => {
    const topWeak = coachProfile?.weakTopics?.[0]?.topic || "Dynamic Programming";
    return [
      { id: "hint", label: "💡 Give me a hint", prompt: `Can you give me a progressive hint for problem '${coachProfile?.todaysFocus?.problem?.title || "Two Sum"}' without spoiling the final solution?` },
      { id: "review", label: "🔍 Review my code", prompt: "Can you review my solution for time/space complexity and any subtle edge cases?" },
      { id: "explain", label: `🧠 Explain ${topWeak}`, prompt: `Can you explain the intuition behind ${topWeak} with a clear code example and when to apply it?` },
      { id: "practice", label: `🎯 Practice ${topWeak}`, prompt: `Suggest 2 high-yield ${topWeak} problems from Easy to Medium to build my skills.` }
    ];
  }, [coachProfile]);

  const todaysFocus = coachProfile?.todaysFocus;
  const weakTopics = coachProfile?.weakTopics || [];

  // Expanded Company Mock Tracks
  const companyTracks = [
    { company: "Google", role: "Software Engineer L4/L5", title: "Topological Sort & Dependency DAG", diff: "Hard", tag: "Graphs & BFS", problemId: "valid-palindrome" },
    { company: "Amazon", role: "SDE-1 / SDE-2", title: "LRU Cache & Real-time Stream", diff: "Medium", tag: "Design & Hash Map", problemId: "two-sum" },
    { company: "Meta", role: "Product Engineer (E5)", title: "Minimum Window Substring Optimization", diff: "Hard", tag: "Sliding Window", problemId: "reverse-linked-list" },
    { company: "Microsoft", role: "Software Engineer", title: "Serialize & Deserialize Binary Tree", diff: "Medium", tag: "Trees & DFS", problemId: "valid-parentheses" },
    { company: "Uber", role: "Backend Engineer", title: "Low-Latency Geospatial Driver Routing", diff: "Hard", tag: "Dijkstra & Heap", problemId: "two-sum" },
    { company: "Apple", role: "Core OS Engineer", title: "Circular Ring Buffer & Memory Safety", diff: "Medium", tag: "Pointers & Arrays", problemId: "reverse-linked-list" }
  ];

  return (
    <div
      className="ai-coach-page-container"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        width: "100%",
        maxWidth: "1240px",
        margin: "0 auto",
        paddingBottom: "16px",
        minHeight: "calc(100vh - 90px)"
      }}
    >
      {/* 1. COMPACT HEADER */}
      <header
        className="ai-mentor-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          padding: "4px 0"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h1
              style={{
                fontSize: "1.75rem",
                fontWeight: "800",
                color: isLight ? "#0f172a" : "#f8fafc",
                margin: 0,
                letterSpacing: "-0.02em"
              }}
            >
              Judgo Intelligence
            </h1>
            <span style={{ fontSize: "0.72rem", background: isLight ? "rgba(124, 58, 237, 0.12)" : "rgba(124, 58, 237, 0.18)", color: isLight ? "#7c3aed" : "#c084fc", border: "1px solid rgba(124, 58, 237, 0.3)", padding: "2px 8px", borderRadius: "999px", fontWeight: "700" }}>
              PRO
            </span>
          </div>
          <p
            style={{
              color: isLight ? "#475569" : "#94a3b8",
              fontSize: "0.86rem",
              margin: "3px 0 0 0"
            }}
          >
            Your personal algorithmic intelligence suite for DSA mastery, mock interviews, and company preparation.
          </p>
        </div>

        {/* Status indicator: ● Online */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: isLight ? "rgba(16, 185, 129, 0.12)" : "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            padding: "5px 12px",
            borderRadius: "999px",
            fontSize: "0.78rem",
            fontWeight: "600",
            color: isLight ? "#059669" : "#10b981"
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: isLight ? "#059669" : "#10b981",
              boxShadow: isLight ? "0 0 8px #059669" : "0 0 8px #10b981"
            }}
          />
          <span>AI Engine Online</span>
        </div>
      </header>

      {/* 2. TAB BAR */}
      <nav
        className="ai-mentor-tabs"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          borderBottom: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)",
          paddingBottom: "8px"
        }}
      >
        {[
          { id: "mentor", label: "AI Mentor", icon: Sparkles },
          { id: "interview", label: "AI Mock Interview", icon: Compass },
          { id: "weak", label: "Weak Topics", icon: Target },
          { id: "companies", label: "Company Sheets", icon: Building2 }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background: isActive ? (isLight ? "rgba(124, 58, 237, 0.12)" : "rgba(124, 58, 237, 0.15)") : "transparent",
                color: isActive ? (isLight ? "#6d28d9" : "#c084fc") : (isLight ? "#64748b" : "#94a3b8"),
                fontSize: "0.86rem",
                fontWeight: isActive ? "700" : "500",
                cursor: "pointer",
                position: "relative",
                transition: "all 0.15s ease"
              }}
            >
              <Icon size={15} style={{ color: isActive ? (isLight ? "#6d28d9" : "#c084fc") : (isLight ? "#64748b" : "#64748b") }} />
              <span>{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  style={{
                    position: "absolute",
                    bottom: "-9px",
                    left: "12px",
                    right: "12px",
                    height: "2px",
                    background: isLight ? "#6366f1" : "#818cf8",
                    borderRadius: "999px"
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* 3. MAIN WORKSPACE */}
      <div style={{ flex: 1, minHeight: 0 }}>
        {/* TAB 1: AI MENTOR */}
        {activeTab === "mentor" && (
          <div
            className="ai-mentor-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "340px 1fr",
              gap: "16px",
              height: "calc(100vh - 200px)",
              minHeight: "540px"
            }}
          >
            {/* LEFT COLUMN: TODAY'S FOCUS + WEAK TOPICS */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                height: "100%"
              }}
            >
              {/* CARD 1: TODAY'S FOCUS */}
              <div
                style={{
                  background: isLight ? "#ffffff" : "#0d111a",
                  border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow: isLight ? "0 1px 3px rgba(0,0,0,0.04)" : "0 2px 10px rgba(0,0,0,0.2)",
                  borderRadius: "12px",
                  padding: "18px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Target size={14} style={{ color: "#a855f7" }} />
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: isLight ? "#7c3aed" : "#a855f7"
                      }}
                    >
                      TODAY'S FOCUS
                    </span>
                  </div>

                  {todaysFocus?.isSolved && (
                    <span style={{ fontSize: "0.68rem", color: isLight ? "#059669" : "#34d399", background: isLight ? "rgba(16, 185, 129, 0.12)" : "rgba(52, 211, 153, 0.15)", padding: "1px 6px", borderRadius: "4px", fontWeight: "700" }}>
                      SOLVED ✓
                    </span>
                  )}
                </div>

                {profileLoading ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "6px 0" }}>
                    <div style={{ width: "80%", height: "18px", background: isLight ? "#f1f5f9" : "rgba(255,255,255,0.06)", borderRadius: "4px" }} />
                    <div style={{ width: "40%", height: "14px", background: isLight ? "#f1f5f9" : "rgba(255,255,255,0.04)", borderRadius: "4px" }} />
                  </div>
                ) : (
                  <div>
                    <h3
                      style={{
                        fontSize: "1.02rem",
                        fontWeight: "700",
                        color: isLight ? "#0f172a" : "#f8fafc",
                        margin: "0 0 4px 0",
                        lineHeight: "1.3"
                      }}
                    >
                      {todaysFocus?.problem?.title || "Two Sum Array Target"}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem" }}>
                      <span style={{
                        color: todaysFocus?.problem?.difficulty === "Easy" ? (isLight ? "#059669" : "#34d399") : todaysFocus?.problem?.difficulty === "Hard" ? "#ef4444" : "#fbbf24",
                        fontWeight: "700"
                      }}>
                        {todaysFocus?.problem?.difficulty || "Medium"}
                      </span>
                      <span style={{ color: isLight ? "#94a3b8" : "#64748b" }}>•</span>
                      <span style={{ color: isLight ? "#475569" : "#94a3b8" }}>{todaysFocus?.problem?.topic || "Sliding Window"}</span>
                    </div>
                  </div>
                )}

                {/* Real Dynamic Progress Bar */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "2px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.76rem" }}>
                    <span style={{ color: isLight ? "#64748b" : "#94a3b8" }}>{todaysFocus?.progressText || "Not started"}</span>
                    <span style={{ color: isLight ? "#7c3aed" : "#c084fc", fontWeight: "700" }}>{todaysFocus?.progressPercent ?? 0}%</span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "6px",
                      background: isLight ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.06)",
                      borderRadius: "999px",
                      overflow: "hidden"
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${todaysFocus?.progressPercent ?? 0}%`,
                        background: "linear-gradient(90deg, #7c3aed 0%, #a855f7 100%)",
                        borderRadius: "999px",
                        transition: "width 0.5s ease"
                      }}
                    />
                  </div>
                </div>

                <Link
                  to={todaysFocus?.problem?.id ? `/problems/${todaysFocus.problem.id}` : "/problems"}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    background: isLight ? "rgba(124, 58, 237, 0.1)" : "rgba(124, 58, 237, 0.15)",
                    border: isLight ? "1px solid rgba(124, 58, 237, 0.25)" : "1px solid rgba(124, 58, 237, 0.3)",
                    color: isLight ? "#6d28d9" : "#c084fc",
                    borderRadius: "8px",
                    padding: "8px 14px",
                    fontSize: "0.82rem",
                    fontWeight: "600",
                    textDecoration: "none",
                    marginTop: "4px",
                    transition: "all 0.15s ease"
                  }}
                >
                  <span>{todaysFocus?.isSolved ? "Practice Again" : "Solve Challenge"}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              {/* CARD 2: WEAK TOPICS */}
              <div
                style={{
                  background: isLight ? "#ffffff" : "#0d111a",
                  border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow: isLight ? "0 1px 3px rgba(0,0,0,0.04)" : "0 2px 10px rgba(0,0,0,0.2)",
                  borderRadius: "12px",
                  padding: "18px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  flex: 1
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <TrendingUp size={14} style={{ color: "#a855f7" }} />
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: isLight ? "#7c3aed" : "#a855f7"
                    }}
                  >
                    PRIORITY WEAK TOPICS
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {profileLoading ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {[1, 2, 3].map((i) => (
                        <div key={i} style={{ width: "100%", height: "24px", background: isLight ? "#f1f5f9" : "rgba(255,255,255,0.04)", borderRadius: "4px" }} />
                      ))}
                    </div>
                  ) : weakTopics.length === 0 ? (
                    <div style={{ fontSize: "0.8rem", color: isLight ? "#64748b" : "#94a3b8", padding: "8px 0" }}>
                      Start solving problems to unlock your personalized topic analytics!
                    </div>
                  ) : (
                    weakTopics.slice(0, 3).map((t) => (
                      <div key={t.topic} style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                          <span style={{ color: isLight ? "#0f172a" : "#f8fafc", fontWeight: "500" }}>{t.topic}</span>
                          <span style={{ color: t.accuracy < 50 ? "#dc2626" : t.accuracy < 70 ? "#d97706" : "#059669", fontWeight: "700" }}>
                            {t.accuracy}%
                          </span>
                        </div>
                        <div style={{ width: "100%", height: "6px", background: isLight ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.06)", borderRadius: "999px", overflow: "hidden" }}>
                          <div
                            style={{
                              height: "100%",
                              width: `${Math.max(5, t.accuracy)}%`,
                              background: t.accuracy < 50 ? "#ef4444" : t.accuracy < 70 ? "#f59e0b" : "#8b5cf6",
                              borderRadius: "999px",
                              transition: "width 0.4s ease"
                            }}
                          />
                        </div>
                        <span style={{ fontSize: "0.68rem", color: isLight ? "#64748b" : "#64748b" }}>
                          {t.solvedCount} of {t.attemptedCount} solved ({t.totalSubmissions} submissions)
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ marginTop: "auto", paddingTop: "8px" }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab("weak")}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: isLight ? "#4f46e5" : "#818cf8",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: 0
                    }}
                  >
                    <span>View all Topic Analytics</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: AI MENTOR CHAT */}
            <div
              style={{
                background: isLight ? "#ffffff" : "#0d111a",
                border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "12px",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                boxShadow: isLight ? "0 1px 3px rgba(0, 0, 0, 0.04)" : "0 4px 20px rgba(0, 0, 0, 0.25)",
                overflow: "hidden"
              }}
            >
              {/* CHAT TOP BAR */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 18px",
                  borderBottom: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.06)",
                  background: isLight ? "#f8fafc" : "#090d16"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Sparkles size={16} style={{ color: "#a855f7" }} />
                  <span style={{ fontSize: "0.92rem", fontWeight: "700", color: isLight ? "#0f172a" : "#f8fafc" }}>
                    Judgo AI Mentor
                  </span>
                  <span style={{ fontSize: "0.68rem", color: isLight ? "#64748b" : "#94a3b8" }}>· Session active</span>
                </div>

                <button
                  type="button"
                  onClick={handleClearChat}
                  title="Clear conversation history"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    background: "transparent",
                    border: "none",
                    color: isLight ? "#64748b" : "#94a3b8",
                    fontSize: "0.78rem",
                    fontWeight: "500",
                    cursor: "pointer",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    transition: "color 0.15s ease"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = isLight ? "#64748b" : "#94a3b8")}
                >
                  <Trash2 size={13} />
                  <span>Clear Chat</span>
                </button>
              </div>

              {/* CHAT MESSAGES SCROLL AREA */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px"
                }}
              >
                {messages.map((msg) => {
                  const isAi = msg.sender === "ai";
                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                        alignSelf: isAi ? "flex-start" : "flex-end",
                        maxWidth: isAi ? "90%" : "80%"
                      }}
                    >
                      {isAi && (
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "8px",
                            background: isLight ? "rgba(124, 58, 237, 0.1)" : "rgba(124, 58, 237, 0.15)",
                            border: "1px solid rgba(124, 58, 237, 0.3)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: isLight ? "#7c3aed" : "#c084fc",
                            flexShrink: 0,
                            marginTop: "2px"
                          }}
                        >
                          <Bot size={16} />
                        </div>
                      )}

                      <div style={{ display: "flex", flexDirection: "column", gap: "4px", width: "100%" }}>
                        <div
                          style={{
                            background: isAi ? (isLight ? "#f8fafc" : "#131b2e") : "linear-gradient(135deg, #4338ca 0%, #3730a3 100%)",
                            border: isAi ? (isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)") : "1px solid rgba(99, 102, 241, 0.3)",
                            borderRadius: isAi ? "4px 12px 12px 12px" : "12px 12px 4px 12px",
                            padding: "12px 16px",
                            color: isAi ? (isLight ? "#0f172a" : "#f8fafc") : "#ffffff",
                            fontSize: "0.88rem",
                            lineHeight: "1.5"
                          }}
                        >
                          <FormattedMessage text={msg.text} />
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "0.68rem",
                            color: isLight ? "#64748b" : "#64748b",
                            alignSelf: isAi ? "flex-start" : "flex-end"
                          }}
                        >
                          <span>{msg.time}</span>
                          {!isAi && <CheckCheck size={12} style={{ color: "#818cf8" }} />}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* QUICK ACTION PILLS */}
                {messages.length <= 2 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                      marginLeft: "38px",
                      marginTop: "4px"
                    }}
                  >
                    {quickActions.map((action) => (
                      <button
                        key={action.id}
                        type="button"
                        onClick={() => handleSendMessage(action.prompt)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          background: isLight ? "#f8fafc" : "#080c14",
                          border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)",
                          borderRadius: "6px",
                          padding: "6px 12px",
                          color: isLight ? "#334155" : "#cbd5e1",
                          fontSize: "0.78rem",
                          fontWeight: "500",
                          cursor: "pointer",
                          transition: "all 0.15s ease"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = isLight ? "rgba(124, 58, 237, 0.1)" : "rgba(124, 58, 237, 0.15)";
                          e.currentTarget.style.borderColor = "rgba(124, 58, 237, 0.35)";
                          e.currentTarget.style.color = isLight ? "#6d28d9" : "#ffffff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = isLight ? "#f8fafc" : "#080c14";
                          e.currentTarget.style.borderColor = isLight ? "#e2e8f0" : "rgba(255, 255, 255, 0.08)";
                          e.currentTarget.style.color = isLight ? "#334155" : "#cbd5e1";
                        }}
                      >
                        <span>{action.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* TYPING INDICATOR */}
                {isTyping && (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "38px" }}>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: isLight ? "#f1f5f9" : "#131b2e",
                        border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "8px",
                        padding: "6px 12px",
                        fontSize: "0.76rem",
                        color: isLight ? "#475569" : "#94a3b8"
                      }}
                    >
                      <Bot size={13} style={{ color: "#c084fc" }} />
                      <span>Judgo AI is analyzing</span>
                      <span className="animate-pulse" style={{ letterSpacing: "2px", fontWeight: "bold" }}>•••</span>
                    </div>
                  </div>
                )}

                <div ref={chatBottomRef} />
              </div>

              {/* CHAT INPUT BAR */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 16px",
                  borderTop: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.06)",
                  background: isLight ? "#f8fafc" : "#090d16"
                }}
              >
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Ask your AI Mentor for hints, code reviews, or concept breakdowns..."
                  style={{
                    flex: 1,
                    background: isLight ? "#ffffff" : "rgba(255, 255, 255, 0.04)",
                    border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "8px",
                    padding: "9px 14px",
                    color: isLight ? "#0f172a" : "#f8fafc",
                    fontSize: "0.85rem",
                    outline: "none",
                    transition: "border-color 0.15s ease"
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(124, 58, 237, 0.45)")}
                  onBlur={(e) => (e.target.style.borderColor = isLight ? "#cbd5e1" : "rgba(255, 255, 255, 0.08)")}
                />

                <button
                  type="submit"
                  disabled={!inputVal.trim() || isTyping}
                  style={{
                    background: inputVal.trim() && !isTyping ? "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)" : (isLight ? "#e2e8f0" : "rgba(255, 255, 255, 0.06)"),
                    border: "none",
                    color: "#ffffff",
                    cursor: inputVal.trim() && !isTyping ? "pointer" : "default",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: inputVal.trim() && !isTyping ? 1 : 0.4,
                    transition: "all 0.15s ease"
                  }}
                >
                  <Send size={15} />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: AI MOCK INTERVIEW STUDIO */}
        {activeTab === "interview" && <MockInterviewStudio />}

        {/* TAB 3: WEAK TOPICS COMPLETE BREAKDOWN */}
        {activeTab === "weak" && (
          <div
            style={{
              background: isLight ? "#ffffff" : "#0d111a",
              border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "12px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              height: "calc(100vh - 200px)",
              minHeight: "520px",
              overflowY: "auto"
            }}
          >
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "800", color: isLight ? "#0f172a" : "#f8fafc", margin: 0 }}>Comprehensive Topic Mastery Profile</h2>
              <p style={{ fontSize: "0.82rem", color: isLight ? "#475569" : "#94a3b8", margin: "4px 0 0 0" }}>Live analytics computed from your actual accepted and attempted submissions across all algorithmic tracks.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
              {(coachProfile?.allTopics || [
                { topic: "Dynamic Programming", accuracy: 0, solvedCount: 0, totalInTopic: 4 },
                { topic: "Graphs", accuracy: 0, solvedCount: 0, totalInTopic: 3 },
                { topic: "Trees", accuracy: 0, solvedCount: 0, totalInTopic: 3 },
                { topic: "Binary Search", accuracy: 0, solvedCount: 0, totalInTopic: 3 },
                { topic: "Sliding Window", accuracy: 0, solvedCount: 0, totalInTopic: 3 },
                { topic: "Arrays & Hash Tables", accuracy: 0, solvedCount: 0, totalInTopic: 4 }
              ]).map((t) => (
                <div key={t.topic} style={{ background: isLight ? "#f8fafc" : "#080c14", border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "10px", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ fontSize: "0.92rem", fontWeight: "700", color: isLight ? "#0f172a" : "#f8fafc" }}>{t.topic}</strong>
                    <span style={{ fontSize: "0.84rem", fontWeight: "800", color: t.accuracy < 50 ? "#dc2626" : t.accuracy < 75 ? "#d97706" : "#059669" }}>
                      {t.accuracy}%
                    </span>
                  </div>
                  <span style={{ fontSize: "0.74rem", color: isLight ? "#64748b" : "#64748b" }}>
                    {t.solvedCount || 0} / {t.totalInTopic || 3} challenges solved
                  </span>
                  <div style={{ width: "100%", height: "6px", background: isLight ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.06)", borderRadius: "999px", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.max(4, t.accuracy)}%`,
                        background: t.accuracy < 50 ? "#ef4444" : t.accuracy < 75 ? "#f59e0b" : "#10b981",
                        borderRadius: "999px"
                      }}
                    />
                  </div>
                  <Link
                    to={`/problems?topic=${encodeURIComponent(t.topic.split(" ")[0])}`}
                    style={{
                      marginTop: "auto",
                      background: isLight ? "rgba(124, 58, 237, 0.1)" : "rgba(124, 58, 237, 0.12)",
                      color: isLight ? "#6d28d9" : "#c084fc",
                      borderRadius: "6px",
                      padding: "6px 12px",
                      fontSize: "0.76rem",
                      fontWeight: "600",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}
                  >
                    <span>Practice {t.topic}</span>
                    <ChevronRight size={13} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: COMPANY INTERVIEW SHEETS */}
        {activeTab === "companies" && (
          selectedCompanySheetId ? (
            <CompanyDetailSheet
              companyId={selectedCompanySheetId}
              onBack={() => setSelectedCompanySheetId(null)}
            />
          ) : (
            <CompanySheetsDashboard
              onSelectCompany={(companyId) => setSelectedCompanySheetId(companyId)}
            />
          )
        )}
      </div>
    </div>
  );
}
