import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
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
  ChevronRight
} from "lucide-react";
import { useAuth } from "../auth/AuthContext.jsx";
import { useAppData } from "../data/AppDataContext.jsx";

const QUICK_ACTIONS = [
  { id: "hint", label: "Give me a hint", icon: Lightbulb, prompt: "Can you give me a subtle hint for the current daily focus problem without spoiling the full solution?" },
  { id: "review", label: "Review my code", icon: Code2, prompt: "I have a solution in mind. Can you review my time and space complexity and identify any edge cases I might have missed?" },
  { id: "explain", label: "Explain concept", icon: FileCode, prompt: "Can you explain the intuition behind memoization and state transition with a clean code example?" },
  { id: "practice", label: "Practice DP", icon: Target, prompt: "Suggest 3 curated Dynamic Programming problems from Easy to Medium to build my confidence." }
];

export default function AICoachPage() {
  const { user } = useAuth();
  const { getUserById, getProblemsForUser, getSubmissionsForUser } = useAppData();

  const currentUserId = user?.id || user?._id || "";
  const liveUser = (currentUserId ? getUserById(currentUserId) : null) || user || {};
  const displayName = liveUser?.name?.split(" ")[0] || liveUser?.username || "Coder";

  // Tab State: "mentor" | "review" | "weak" | "interview"
  const [activeTab, setActiveTab] = useState("mentor");

  // Chat State
  const [messages, setMessages] = useState([
    {
      id: "ai-initial",
      sender: "ai",
      text: `Hi ${displayName}! 👋\n\nI've reviewed your recent coding activity. You're doing well in Arrays and Sliding Window, but Dynamic Programming and Graph traversal are still areas to focus on.\n\nWhat would you like to work on today?`,
      time: "10:30 AM"
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef(null);

  // Code Review Tab State
  const [codeReviewSnippet, setCodeReviewSnippet] = useState(
    `def lengthOfLongestSubstring(s: str) -> int:\n    char_map = {}\n    left = 0\n    max_len = 0\n    for right in range(len(s)):\n        if s[right] in char_map and char_map[s[right]] >= left:\n            left = char_map[s[right]] + 1\n        char_map[s[right]] = right\n        max_len = max(max_len, right - left + 1)\n    return max_len`
  );
  const [reviewResult, setReviewResult] = useState(null);
  const [isReviewing, setIsReviewing] = useState(false);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (activeTab === "mentor") {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, activeTab]);

  // Handle Send Message
  const handleSendMessage = (textToSend) => {
    const text = (textToSend || inputVal).trim();
    if (!text) return;

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

    // AI Response simulation with smart context
    setTimeout(() => {
      let reply = "";
      const lower = text.toLowerCase();

      if (lower.includes("memoization") || lower.includes("dp") || lower.includes("dynamic programming")) {
        reply = `**Memoization** is top-down Dynamic Programming where you cache the result of recursive subproblems so each unique state is solved exactly once.\n\n### Core Pattern:\n\`\`\`python\nmemo = {}\ndef fib(n):\n    if n <= 1: return n\n    if n in memo: return memo[n]\n    memo[n] = fib(n - 1) + fib(n - 2)\n    return memo[n]\n\`\`\`\n\n**Time Complexity:** Reduces $O(2^N)$ down to $O(N)$ with $O(N)$ auxiliary space. Would you like to try 1D or 2D DP next?`;
      } else if (lower.includes("hint") || lower.includes("longest substring")) {
        reply = `💡 **Hint for Sliding Window:**\nMaintain a hash map storing the *last seen index* of each character. When you encounter a duplicate within the current window \`[left, right]\`, simply jump \`left = last_seen[char] + 1\` instead of shifting by 1 step at a time!`;
      } else if (lower.includes("review") || lower.includes("complexity")) {
        reply = `🔍 **Code Review Summary:**\n- **Time Complexity:** $O(N)$ — Single pass through the string with $O(1)$ dictionary lookups.\n- **Space Complexity:** $O(\\min(N, M))$ where $M$ is the character set size.\n- **Edge Cases Checked:** Empty string \`""\` returns 0, all unique characters return length, and repeated duplicates are handled smoothly. Excellent implementation!`;
      } else {
        reply = `Great question! When approaching this problem, first consider whether a **Sliding Window**, **Hash Map**, or **Two Pointers** approach simplifies the state representation. Would you like a step-by-step breakdown or pseudocode?`;
      }

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 900);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `ai-reset-${Date.now()}`,
        sender: "ai",
        text: `Chat cleared. Ready for your next coding challenge, ${displayName}! What would you like to review?`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  };

  const handleRunCodeReview = () => {
    setIsReviewing(true);
    setTimeout(() => {
      setReviewResult({
        score: "98/100",
        verdict: "Optimal",
        timeComplexity: "O(N) - Linear time traversal",
        spaceComplexity: "O(min(N, Σ)) - Hash Map storage",
        notes: [
          "Optimal sliding window approach with two pointers.",
          "Handles duplicate character skipping in O(1).",
          "Clean variable naming and boundary checks."
        ]
      });
      setIsReviewing(false);
    }, 700);
  };

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
      {/* 1. COMPACT HEADER (60–75px) */}
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
          <p
            style={{
              color: "#94a3b8",
              fontSize: "0.88rem",
              margin: "3px 0 0 0"
            }}
          >
            Your personal coding assistant for DSA, debugging and interview preparation.
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
          <span>Online</span>
        </div>
      </header>

      {/* 2. SIMPLE TAB BAR (44–48px) */}
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

      {/* 3. MAIN WORKSPACE (FITS IN SINGLE VIEWPORT) */}
      <div style={{ flex: 1, minHeight: 0 }}>
        {/* TAB 1: AI MENTOR (MAIN 2-COLUMN VIEW) */}
        {activeTab === "mentor" && (
          <div
            className="ai-mentor-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "35% 65%",
              gap: "16px",
              height: "calc(100vh - 200px)",
              minHeight: "520px"
            }}
          >
            {/* LEFT COLUMN (35%): TODAY'S FOCUS + WEAK TOPICS */}
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

                <div>
                  <h3
                    style={{
                      fontSize: "1.05rem",
                      fontWeight: "700",
                      color: "#f8fafc",
                      margin: "0 0 4px 0",
                      lineHeight: "1.3"
                    }}
                  >
                    Longest Substring Without Repeating Characters
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem" }}>
                    <span style={{ color: "#fbbf24", fontWeight: "600" }}>Medium</span>
                    <span style={{ color: "#64748b" }}>•</span>
                    <span style={{ color: "#94a3b8" }}>Sliding Window</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "2px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.76rem" }}>
                    <span style={{ color: "#94a3b8" }}>Progress</span>
                    <span style={{ color: "#c084fc", fontWeight: "700" }}>65%</span>
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
                        width: "65%",
                        background: "linear-gradient(90deg, #7c3aed 0%, #a855f7 100%)",
                        borderRadius: "999px"
                      }}
                    />
                  </div>
                </div>

                <Link
                  to="/problems/valid-parentheses"
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
                  <span>Continue Challenge</span>
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
                    WEAK TOPICS
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {/* Topic 1: Dynamic Programming */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                      <span style={{ color: "#f8fafc", fontWeight: "500" }}>Dynamic Programming</span>
                      <span style={{ color: "#c084fc", fontWeight: "700" }}>42%</span>
                    </div>
                    <div style={{ width: "100%", height: "6px", background: "rgba(255, 255, 255, 0.06)", borderRadius: "999px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: "42%", background: "#8b5cf6", borderRadius: "999px" }} />
                    </div>
                  </div>

                  {/* Topic 2: Graphs */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                      <span style={{ color: "#f8fafc", fontWeight: "500" }}>Graphs</span>
                      <span style={{ color: "#c084fc", fontWeight: "700" }}>55%</span>
                    </div>
                    <div style={{ width: "100%", height: "6px", background: "rgba(255, 255, 255, 0.06)", borderRadius: "999px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: "55%", background: "#8b5cf6", borderRadius: "999px" }} />
                    </div>
                  </div>

                  {/* Topic 3: Trees */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                      <span style={{ color: "#f8fafc", fontWeight: "500" }}>Trees</span>
                      <span style={{ color: "#c084fc", fontWeight: "700" }}>61%</span>
                    </div>
                    <div style={{ width: "100%", height: "6px", background: "rgba(255, 255, 255, 0.06)", borderRadius: "999px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: "61%", background: "#8b5cf6", borderRadius: "999px" }} />
                    </div>
                  </div>
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
                    <span>View all Weak Topics</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (65%): AI MENTOR CHAT (LARGEST ELEMENT) */}
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
                  padding: "14px 18px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                  background: "#090d16"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Sparkles size={16} style={{ color: "#a855f7" }} />
                  <span style={{ fontSize: "0.95rem", fontWeight: "700", color: "#f8fafc" }}>
                    AI Mentor
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleClearChat}
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
                  padding: "18px",
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
                        maxWidth: isAi ? "88%" : "78%"
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

                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <div
                          style={{
                            background: isAi ? "#131b2e" : "linear-gradient(135deg, #4338ca 0%, #3730a3 100%)",
                            border: isAi ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(99, 102, 241, 0.3)",
                            borderRadius: isAi ? "4px 12px 12px 12px" : "12px 12px 4px 12px",
                            padding: "12px 16px",
                            color: "#f8fafc",
                            fontSize: "0.88rem",
                            lineHeight: "1.5",
                            whiteSpace: "pre-wrap"
                          }}
                        >
                          {msg.text}
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

                {/* 4 COMPACT QUICK ACTION PILLS (UNDER FIRST MESSAGE) */}
                {messages.length === 1 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                      marginLeft: "38px",
                      marginTop: "2px"
                    }}
                  >
                    {QUICK_ACTIONS.map((action) => {
                      const ActionIcon = action.icon;
                      return (
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
                          <ActionIcon size={13} style={{ color: "#a855f7" }} />
                          <span>{action.label}</span>
                        </button>
                      );
                    })}
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
                      <span>AI Mentor is typing</span>
                      <span style={{ letterSpacing: "2px", fontWeight: "bold" }}>•••</span>
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
                  placeholder="Ask your AI Mentor anything..."
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
                  type="button"
                  title="Attach code snippet"
                  onClick={() => handleSendMessage("Can you review this code snippet for edge cases?")}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#94a3b8",
                    cursor: "pointer",
                    padding: "6px",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Paperclip size={18} />
                </button>

                <button
                  type="submit"
                  disabled={!inputVal.trim()}
                  style={{
                    background: inputVal.trim() ? "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)" : "rgba(255, 255, 255, 0.06)",
                    border: "none",
                    color: "#ffffff",
                    cursor: inputVal.trim() ? "pointer" : "default",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: inputVal.trim() ? 1 : 0.4,
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
                <span style={{ fontSize: "0.72rem", color: "#818cf8" }}>Python 3</span>
              </div>

              <textarea
                value={codeReviewSnippet}
                onChange={(e) => setCodeReviewSnippet(e.target.value)}
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
                disabled={isReviewing}
                style={{
                  background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
                  border: "none",
                  color: "#ffffff",
                  padding: "10px",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px"
                }}
              >
                <Code2 size={16} />
                <span>{isReviewing ? "Analyzing Complexity..." : "Analyze Code with AI"}</span>
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
                  AI Complexity & Security Feedback
                </span>
                {reviewResult && (
                  <span style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: "700" }}>
                    Score: {reviewResult.score}
                  </span>
                )}
              </div>

              {reviewResult ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ background: "#080c14", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "8px", padding: "12px" }}>
                    <span style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Time Complexity</span>
                    <p style={{ color: "#34d399", fontSize: "0.86rem", fontWeight: "600", margin: "2px 0 0 0" }}>{reviewResult.timeComplexity}</p>
                  </div>

                  <div style={{ background: "#080c14", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "8px", padding: "12px" }}>
                    <span style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Space Complexity</span>
                    <p style={{ color: "#60a5fa", fontSize: "0.86rem", fontWeight: "600", margin: "2px 0 0 0" }}>{reviewResult.spaceComplexity}</p>
                  </div>

                  <div style={{ background: "#080c14", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "8px", padding: "12px" }}>
                    <span style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Insights</span>
                    <ul style={{ margin: "6px 0 0 0", paddingLeft: "16px", color: "#cbd5e1", fontSize: "0.82rem", lineHeight: "1.6" }}>
                      {reviewResult.notes.map((note, idx) => (
                        <li key={idx}>{note}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#64748b", gap: "8px" }}>
                  <Code2 size={32} style={{ color: "#475569" }} />
                  <p style={{ fontSize: "0.84rem", margin: 0 }}>Click "Analyze Code with AI" to inspect complexity.</p>
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
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#f8fafc", margin: 0 }}>Comprehensive Topic Mastery</h2>
              <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: "4px 0 0 0" }}>Identify specific algorithmic tracks where targeted practice will maximize rating growth.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
              {[
                { name: "Dynamic Programming", accuracy: "42%", solved: "7 / 20", tone: "red" },
                { name: "Graph Traversals (BFS/DFS)", accuracy: "55%", solved: "11 / 20", tone: "orange" },
                { name: "Binary Trees & BST", accuracy: "61%", solved: "14 / 22", tone: "orange" },
                { name: "Binary Search", accuracy: "74%", solved: "15 / 18", tone: "green" },
                { name: "Sliding Window & Two Pointers", accuracy: "88%", solved: "22 / 25", tone: "green" },
                { name: "Arrays & Hash Tables", accuracy: "95%", solved: "28 / 29", tone: "green" }
              ].map((t) => (
                <div key={t.name} style={{ background: "#080c14", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "10px", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ fontSize: "0.9rem", color: "#f8fafc" }}>{t.name}</strong>
                    <span style={{ fontSize: "0.82rem", fontWeight: "700", color: t.tone === "red" ? "#f87171" : t.tone === "orange" ? "#fbbf24" : "#34d399" }}>{t.accuracy}</span>
                  </div>
                  <span style={{ fontSize: "0.74rem", color: "#64748b" }}>{t.solved} challenges solved</span>
                  <Link
                    to={`/problems?topic=${encodeURIComponent(t.name.split(" ")[0])}`}
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
                    Practice {t.name.split(" ")[0]} →
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
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#f8fafc", margin: 0 }}>Company Interview Tracks</h2>
              <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: "4px 0 0 0" }}>Simulate real FAANG technical interview questions with live AI feedback.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
              {[
                { company: "Amazon SDE-1", title: "LRU Cache Implementation", diff: "Medium", tag: "Design & Hash Map" },
                { company: "Google SWE", title: "Alien Dictionary Topological Sort", diff: "Hard", tag: "Graphs" },
                { company: "Meta", title: "Minimum Window Substring", diff: "Hard", tag: "Sliding Window" }
              ].map((q, idx) => (
                <div key={idx} style={{ background: "#080c14", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "10px", padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <span style={{ fontSize: "0.72rem", color: "#818cf8", fontWeight: "700" }}>{q.company}</span>
                  <strong style={{ fontSize: "0.92rem", color: "#f8fafc" }}>{q.title}</strong>
                  <span style={{ fontSize: "0.76rem", color: "#94a3b8" }}>{q.diff} • {q.tag}</span>
                  <Link
                    to="/problems/two-sum"
                    style={{
                      marginTop: "8px",
                      background: "rgba(99, 102, 241, 0.15)",
                      color: "#818cf8",
                      border: "1px solid rgba(99, 102, 241, 0.3)",
                      borderRadius: "6px",
                      padding: "6px 10px",
                      fontSize: "0.78rem",
                      fontWeight: "600",
                      textAlign: "center",
                      textDecoration: "none"
                    }}
                  >
                    Start Mock Session →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
