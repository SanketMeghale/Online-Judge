import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Terminal
} from "lucide-react";
import { api } from "../api/apiClient.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { useAppData } from "../data/AppDataContext.jsx";

// Helper component to render code block with copy button
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
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "8px",
        margin: "8px 0",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "5px 12px",
          background: "rgba(255, 255, 255, 0.03)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          fontSize: "0.72rem",
          color: "#94a3b8"
        }}
      >
        <span style={{ fontWeight: "600", textTransform: "uppercase" }}>{language}</span>
        <button
          type="button"
          onClick={handleCopy}
          style={{
            background: "transparent",
            border: "none",
            color: copied ? "#34d399" : "#94a3b8",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "0.7rem",
            padding: "2px 6px",
            borderRadius: "4px"
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre
        style={{
          margin: 0,
          padding: "12px",
          overflowX: "auto",
          fontSize: "0.82rem",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          color: "#38bdf8",
          lineHeight: "1.5"
        }}
      >
        <code>{value}</code>
      </pre>
    </div>
  );
}

// Simple Markdown parser for AI messages
function FormattedMessage({ text = "" }) {
  if (!text) return null;

  // Split by code blocks ```lang ... ```
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: text.substring(lastIndex, match.index) });
    }
    parts.push({ type: "code", language: match[1] || "code", content: match[2] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", content: text.substring(lastIndex) });
  }

  return (
    <div>
      {parts.map((p, idx) => {
        if (p.type === "code") {
          return <CodeBlock key={idx} language={p.language} value={p.content.trim()} />;
        }
        return (
          <div key={idx} style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {p.content}
          </div>
        );
      })}
    </div>
  );
}

export default function AICoachPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getUserById, getSubmissionsForUser } = useAppData();

  const currentUserId = user?.id || user?._id || "";
  const liveUser = (currentUserId ? getUserById(currentUserId) : null) || user || {};
  const displayName = String(liveUser?.name || liveUser?.username || "Coder").trim().split(" ")[0] || "Coder";

  // Tab State: "mentor" | "review" | "weak" | "interview"
  const [activeTab, setActiveTab] = useState("mentor");

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
                text: `Hi ${displayName}! 👋\n\nI'm your **Judgo AI Mentor**. I analyze your live submission performance to help you master algorithms and level up your rating.\n\nBased on your coding history, your priority track today is **${weakTop}**.\n\nWhat would you like to work on?`,
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
        text: `Chat history cleared. What challenge or algorithmic concept would you like to master next, ${displayName}?`,
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
        history: [{ role: "assistant", content: res.question || `Welcome to your ${comp} interview session!` }]
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

  return (
    <div
      className="ai-coach-page-container"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        width: "100%",
        maxWidth: "1220px",
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
                color: "#f8fafc",
                margin: 0,
                letterSpacing: "-0.02em"
              }}
            >
              AI Mentor
            </h1>
            <span style={{ fontSize: "0.72rem", background: "rgba(124, 58, 237, 0.18)", color: "#c084fc", border: "1px solid rgba(124, 58, 237, 0.3)", padding: "2px 8px", borderRadius: "999px", fontWeight: "700" }}>
              PRO
            </span>
          </div>
          <p
            style={{
              color: "#94a3b8",
              fontSize: "0.86rem",
              margin: "3px 0 0 0"
            }}
          >
            Your personal algorithmic coach for DSA mastery, complexity review, and FAANG interviews.
          </p>
        </div>

        {/* Status indicator: ● Online */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            padding: "5px 12px",
            borderRadius: "999px",
            fontSize: "0.78rem",
            fontWeight: "600",
            color: "#10b981"
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#10b981",
              boxShadow: "0 0 8px #10b981"
            }}
          />
          <span>AI Engine Active</span>
        </div>
      </header>

      {/* 2. TAB BAR */}
      <nav
        className="ai-mentor-tabs"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          paddingBottom: "8px"
        }}
      >
        {[
          { id: "mentor", label: "AI Mentor", icon: Sparkles },
          { id: "review", label: "Code Review", icon: Code2 },
          { id: "weak", label: "Weak Topics", icon: Target },
          { id: "interview", label: "Interview Prep", icon: Compass }
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
                background: isActive ? "rgba(124, 58, 237, 0.15)" : "transparent",
                color: isActive ? "#c084fc" : "#94a3b8",
                fontSize: "0.86rem",
                fontWeight: isActive ? "700" : "500",
                cursor: "pointer",
                position: "relative",
                transition: "all 0.15s ease"
              }}
            >
              <Icon size={15} style={{ color: isActive ? "#c084fc" : "#64748b" }} />
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
                    background: "#818cf8",
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
                  background: "#0d111a",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "12px",
                  padding: "18px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
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
                        color: "#a855f7"
                      }}
                    >
                      TODAY'S FOCUS
                    </span>
                  </div>

                  {todaysFocus?.isSolved && (
                    <span style={{ fontSize: "0.68rem", color: "#34d399", background: "rgba(52, 211, 153, 0.15)", padding: "1px 6px", borderRadius: "4px", fontWeight: "700" }}>
                      SOLVED ✓
                    </span>
                  )}
                </div>

                {profileLoading ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "6px 0" }}>
                    <div style={{ width: "80%", height: "18px", background: "rgba(255,255,255,0.06)", borderRadius: "4px" }} />
                    <div style={{ width: "40%", height: "14px", background: "rgba(255,255,255,0.04)", borderRadius: "4px" }} />
                  </div>
                ) : (
                  <div>
                    <h3
                      style={{
                        fontSize: "1.02rem",
                        fontWeight: "700",
                        color: "#f8fafc",
                        margin: "0 0 4px 0",
                        lineHeight: "1.3"
                      }}
                    >
                      {todaysFocus?.problem?.title || "Two Sum Array Target"}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem" }}>
                      <span style={{
                        color: todaysFocus?.problem?.difficulty === "Easy" ? "#34d399" : todaysFocus?.problem?.difficulty === "Hard" ? "#ef4444" : "#fbbf24",
                        fontWeight: "700"
                      }}>
                        {todaysFocus?.problem?.difficulty || "Medium"}
                      </span>
                      <span style={{ color: "#64748b" }}>•</span>
                      <span style={{ color: "#94a3b8" }}>{todaysFocus?.problem?.topic || "Sliding Window"}</span>
                    </div>
                  </div>
                )}

                {/* Real Dynamic Progress Bar */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "2px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.76rem" }}>
                    <span style={{ color: "#94a3b8" }}>{todaysFocus?.progressText || "Not started"}</span>
                    <span style={{ color: "#c084fc", fontWeight: "700" }}>{todaysFocus?.progressPercent ?? 0}%</span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "6px",
                      background: "rgba(255, 255, 255, 0.06)",
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
                    background: "rgba(124, 58, 237, 0.15)",
                    border: "1px solid rgba(124, 58, 237, 0.3)",
                    color: "#c084fc",
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
                  background: "#0d111a",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "12px",
                  padding: "18px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  flex: 1,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
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
                      color: "#a855f7"
                    }}
                  >
                    PRIORITY WEAK TOPICS
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {profileLoading ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {[1, 2, 3].map((i) => (
                        <div key={i} style={{ width: "100%", height: "24px", background: "rgba(255,255,255,0.04)", borderRadius: "4px" }} />
                      ))}
                    </div>
                  ) : weakTopics.length === 0 ? (
                    <div style={{ fontSize: "0.8rem", color: "#94a3b8", padding: "8px 0" }}>
                      Start solving problems to unlock your personalized topic analytics!
                    </div>
                  ) : (
                    weakTopics.slice(0, 3).map((t) => (
                      <div key={t.topic} style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                          <span style={{ color: "#f8fafc", fontWeight: "500" }}>{t.topic}</span>
                          <span style={{ color: t.accuracy < 50 ? "#f87171" : t.accuracy < 70 ? "#fbbf24" : "#34d399", fontWeight: "700" }}>
                            {t.accuracy}%
                          </span>
                        </div>
                        <div style={{ width: "100%", height: "6px", background: "rgba(255, 255, 255, 0.06)", borderRadius: "999px", overflow: "hidden" }}>
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
                        <span style={{ fontSize: "0.68rem", color: "#64748b" }}>
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
                      color: "#818cf8",
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
                background: "#0d111a",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "12px",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
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
                  borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                  background: "#090d16"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Sparkles size={16} style={{ color: "#a855f7" }} />
                  <span style={{ fontSize: "0.92rem", fontWeight: "700", color: "#f8fafc" }}>
                    Judgo AI Mentor
                  </span>
                  <span style={{ fontSize: "0.68rem", color: "#94a3b8" }}>· Session active</span>
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
                    color: "#94a3b8",
                    fontSize: "0.78rem",
                    fontWeight: "500",
                    cursor: "pointer",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    transition: "color 0.15s ease"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
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
                            background: "rgba(124, 58, 237, 0.15)",
                            border: "1px solid rgba(124, 58, 237, 0.3)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#c084fc",
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
                            background: isAi ? "#131b2e" : "linear-gradient(135deg, #4338ca 0%, #3730a3 100%)",
                            border: isAi ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(99, 102, 241, 0.3)",
                            borderRadius: isAi ? "4px 12px 12px 12px" : "12px 12px 4px 12px",
                            padding: "12px 16px",
                            color: "#f8fafc",
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
                            color: "#64748b",
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
                          background: "#080c14",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          borderRadius: "6px",
                          padding: "6px 12px",
                          color: "#cbd5e1",
                          fontSize: "0.78rem",
                          fontWeight: "500",
                          cursor: "pointer",
                          transition: "all 0.15s ease"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(124, 58, 237, 0.15)";
                          e.currentTarget.style.borderColor = "rgba(124, 58, 237, 0.35)";
                          e.currentTarget.style.color = "#ffffff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#080c14";
                          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                          e.currentTarget.style.color = "#cbd5e1";
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
                        background: "#131b2e",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "8px",
                        padding: "6px 12px",
                        fontSize: "0.76rem",
                        color: "#94a3b8"
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
                  borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                  background: "#090d16"
                }}
              >
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Ask your AI Mentor for hints, code reviews, or concept breakdowns..."
                  style={{
                    flex: 1,
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "8px",
                    padding: "9px 14px",
                    color: "#f8fafc",
                    fontSize: "0.85rem",
                    outline: "none",
                    transition: "border-color 0.15s ease"
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(124, 58, 237, 0.45)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255, 255, 255, 0.08)")}
                />

                <button
                  type="submit"
                  disabled={!inputVal.trim() || isTyping}
                  style={{
                    background: inputVal.trim() && !isTyping ? "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)" : "rgba(255, 255, 255, 0.06)",
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

        {/* TAB 2: CODE REVIEW WORKSPACE */}
        {activeTab === "review" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              height: "calc(100vh - 200px)",
              minHeight: "520px"
            }}
          >
            {/* Left: Code Input */}
            <div
              style={{
                background: "#0d111a",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "12px",
                padding: "18px",
                display: "flex",
                flexDirection: "column",
                gap: "12px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#f8fafc" }}>
                  Source Code for Review
                </span>
                <select
                  value={codeReviewLang}
                  onChange={(e) => setCodeReviewLang(e.target.value)}
                  style={{
                    background: "#080c14",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#c084fc",
                    borderRadius: "6px",
                    padding: "3px 8px",
                    fontSize: "0.76rem",
                    outline: "none"
                  }}
                >
                  <option value="python">Python 3</option>
                  <option value="cpp">C++ 20</option>
                  <option value="javascript">JavaScript</option>
                  <option value="java">Java</option>
                </select>
              </div>

              <textarea
                value={codeReviewSnippet}
                onChange={(e) => setCodeReviewSnippet(e.target.value)}
                placeholder="Paste code or submit a solution to inspect complexity..."
                style={{
                  flex: 1,
                  background: "#080c14",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: "8px",
                  padding: "14px",
                  color: "#38bdf8",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  fontSize: "0.84rem",
                  lineHeight: "1.5",
                  resize: "none",
                  outline: "none"
                }}
              />

              <button
                type="button"
                onClick={handleRunCodeReview}
                disabled={isReviewing || !codeReviewSnippet.trim()}
                style={{
                  background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
                  border: "none",
                  color: "#ffffff",
                  padding: "10px",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  cursor: isReviewing ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  opacity: isReviewing ? 0.7 : 1
                }}
              >
                <Code2 size={16} />
                <span>{isReviewing ? "Evaluating Complexity..." : "Inspect Code with AI"}</span>
              </button>
            </div>

            {/* Right: Review Results */}
            <div
              style={{
                background: "#0d111a",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "12px",
                padding: "18px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                overflowY: "auto"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#f8fafc" }}>
                  AI Complexity &amp; Optimization Feedback
                </span>
                {reviewResult && (
                  <span style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: "700" }}>
                    Score: {reviewResult.score}
                  </span>
                )}
              </div>

              {reviewResult ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ background: "#080c14", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "8px", padding: "14px" }}>
                    <FormattedMessage text={reviewResult.review} />
                  </div>
                </div>
              ) : (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#64748b", gap: "8px" }}>
                  <Code2 size={32} style={{ color: "#475569" }} />
                  <p style={{ fontSize: "0.84rem", margin: 0 }}>Click "Inspect Code with AI" to evaluate runtime complexity and edge cases.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: WEAK TOPICS COMPLETE BREAKDOWN */}
        {activeTab === "weak" && (
          <div
            style={{
              background: "#0d111a",
              border: "1px solid rgba(255, 255, 255, 0.08)",
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
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#f8fafc", margin: 0 }}>Comprehensive Topic Mastery Profile</h2>
              <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: "4px 0 0 0" }}>Live analytics computed from your actual accepted and attempted submissions across all algorithmic tracks.</p>
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
                <div key={t.topic} style={{ background: "#080c14", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "10px", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ fontSize: "0.9rem", color: "#f8fafc" }}>{t.topic}</strong>
                    <span style={{ fontSize: "0.82rem", fontWeight: "700", color: t.accuracy < 50 ? "#f87171" : t.accuracy < 75 ? "#fbbf24" : "#34d399" }}>
                      {t.accuracy}%
                    </span>
                  </div>
                  <span style={{ fontSize: "0.74rem", color: "#64748b" }}>
                    {t.solvedCount || 0} / {t.totalInTopic || 3} challenges solved
                  </span>
                  <div style={{ width: "100%", height: "5px", background: "rgba(255, 255, 255, 0.06)", borderRadius: "999px", overflow: "hidden" }}>
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
                      background: "rgba(124, 58, 237, 0.12)",
                      color: "#c084fc",
                      border: "1px solid rgba(124, 58, 237, 0.25)",
                      borderRadius: "6px",
                      padding: "6px 10px",
                      fontSize: "0.76rem",
                      fontWeight: "600",
                      textAlign: "center",
                      textDecoration: "none"
                    }}
                  >
                    Practice {t.topic.split(" ")[0]} →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: INTERVIEW PREP MOCK TRACK */}
        {activeTab === "interview" && (
          <div
            style={{
              background: "#0d111a",
              border: "1px solid rgba(255, 255, 255, 0.08)",
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
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#f8fafc", margin: 0 }}>FAANG Mock Technical Interview Track</h2>
              <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: "4px 0 0 0" }}>Simulate live technical interview rounds with personalized AI evaluation and feedback.</p>
            </div>

            {!interviewSession ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
                {[
                  { company: "Amazon SDE-1", title: "LRU Cache & Stream Analytics", diff: "Medium", tag: "Design & Hash Map" },
                  { company: "Google Software Engineer", title: "Topological Sort & Dependency Resolution", diff: "Hard", tag: "Graphs" },
                  { company: "Meta Product Engineer", title: "Minimum Window Substring Optimization", diff: "Hard", tag: "Sliding Window" }
                ].map((q, idx) => (
                  <div key={idx} style={{ background: "#080c14", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "10px", padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <span style={{ fontSize: "0.72rem", color: "#818cf8", fontWeight: "700" }}>{q.company}</span>
                    <strong style={{ fontSize: "0.92rem", color: "#f8fafc" }}>{q.title}</strong>
                    <span style={{ fontSize: "0.76rem", color: "#94a3b8" }}>{q.diff} • {q.tag}</span>
                    <button
                      type="button"
                      onClick={() => handleStartInterview(q.company)}
                      style={{
                        marginTop: "8px",
                        background: "rgba(99, 102, 241, 0.15)",
                        color: "#818cf8",
                        border: "1px solid rgba(99, 102, 241, 0.3)",
                        borderRadius: "6px",
                        padding: "8px 12px",
                        fontSize: "0.78rem",
                        fontWeight: "600",
                        cursor: "pointer"
                      }}
                    >
                      Start Mock Interview →
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "#a855f7" }}>
                    {interviewSession.company} Interview in Progress
                  </span>
                  <button
                    type="button"
                    onClick={() => setInterviewSession(null)}
                    style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "0.76rem", cursor: "pointer" }}
                  >
                    Exit Session
                  </button>
                </div>

                <div style={{ flex: 1, background: "#080c14", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
                  {interviewSession.history.map((h, i) => (
                    <div key={i} style={{ background: h.role === "assistant" ? "#131b2e" : "rgba(99,102,241,0.15)", padding: "12px", borderRadius: "8px", color: "#f8fafc", fontSize: "0.86rem" }}>
                      <FormattedMessage text={h.content} />
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="text"
                    value={interviewInput}
                    onChange={(e) => setInterviewInput(e.target.value)}
                    placeholder="Type your clarification or code solution..."
                    style={{ flex: 1, background: "#080c14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px 14px", color: "#f8fafc", fontSize: "0.85rem", outline: "none" }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendInterviewAnswer();
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSendInterviewAnswer}
                    disabled={isInterviewing || !interviewInput.trim()}
                    style={{ background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)", border: "none", color: "#fff", padding: "10px 16px", borderRadius: "8px", fontSize: "0.82rem", fontWeight: "700", cursor: "pointer" }}
                  >
                    {isInterviewing ? "Interviewer Thinking..." : "Submit Answer"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
