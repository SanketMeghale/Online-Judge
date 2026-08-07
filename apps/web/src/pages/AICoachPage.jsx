import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Bot,
  BrainCircuit,
  Code2,
  Terminal,
  Target,
  TrendingUp,
  Award,
  BookOpen,
  Building2,
  Mic,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Play,
  Lightbulb,
  Zap,
  BarChart3,
  Flame,
  Clock,
  ArrowRight,
  Search,
  FileText,
  RotateCcw,
  Send,
  Star,
  Layers,
  HelpCircle,
  Cpu,
  ShieldCheck,
  Check,
  ZapOff
} from "lucide-react";
import { useAuth } from "../auth/AuthContext.jsx";

// Mock AI Knowledge & Dataset
const initialChatMessages = [
  {
    id: "m-1",
    sender: "ai",
    text: "Hello Sanket! I'm your Judgo AI Coding Mentor 🤖. I've analyzed your recent 45 submissions. You are excelling in Arrays & Sliding Window, but your accuracy in **Dynamic Programming (42%)** and **Graph BFS/DFS (55%)** has room for improvement. How can I assist you today?",
    timestamp: "10:30 AM",
    chips: [
      "Explain 2D Dynamic Programming",
      "Suggest 3 DP practice problems",
      "How to optimize Two Sum to O(N)?",
      "Mock Interview for Amazon"
    ]
  }
];

const mockRoadmap = [
  {
    id: "r-1",
    topic: "Arrays & Two Pointers",
    status: "MASTERED",
    progress: 100,
    solved: "18 / 18",
    color: "#4ade80",
    desc: "Targeting pairs, partitioning, sliding window technique."
  },
  {
    id: "r-2",
    topic: "Binary Search & Monotonic Stack",
    status: "MASTERED",
    progress: 90,
    solved: "14 / 15",
    color: "#38bdf8",
    desc: "Search space reduction and Next Greater Element pattern."
  },
  {
    id: "r-3",
    topic: "Trees & Graph Traversals (BFS/DFS)",
    status: "IN_PROGRESS",
    progress: 65,
    solved: "13 / 20",
    color: "#facc15",
    desc: "Binary Tree depth, LCA, Graph cycle detection, Topological sort."
  },
  {
    id: "r-4",
    topic: "Dynamic Programming (1D & 2D)",
    status: "RECOMMENDED",
    progress: 35,
    solved: "7 / 20",
    color: "#c084fc",
    desc: "Knapsack, LCS, LIS, Grid paths, and state compression."
  },
  {
    id: "r-5",
    topic: "System Design & Advanced Graphs",
    status: "LOCKED",
    progress: 0,
    solved: "0 / 12",
    color: "#64748b",
    desc: "Dijkstra, Segment Trees, Trie, LRU Cache implementation."
  }
];

const mockWeakTopics = [
  { topic: "Dynamic Programming", accuracy: 42, count: 12, status: "Critical Weakness", icon: "🧠" },
  { topic: "Graph Traversals", accuracy: 55, count: 18, status: "Needs Practice", icon: "🌐" },
  { topic: "Heaps & Priority Queues", accuracy: 68, count: 10, status: "Moderate", icon: "⛰️" },
  { topic: "Binary Search Trees", accuracy: 82, count: 15, status: "Strong", icon: "🌲" },
  { topic: "Sliding Window", accuracy: 94, count: 22, status: "Mastered", icon: "🪟" }
];

const mockCompanyPrep = [
  {
    id: "c-google",
    company: "Google",
    logo: "🌐",
    tagline: "Graphs, Hard DP, Segment Trees & Complex Data Structures",
    match: "78% Match",
    color: "#ea4335",
    problemsCount: 45,
    freqTopics: ["Dynamic Programming", "Graph BFS", "Trie", "Monotonic Queue"]
  },
  {
    id: "c-amazon",
    company: "Amazon",
    logo: "📦",
    tagline: "Arrays, Hash Maps, Strings, Trees, and Leadership Principles",
    match: "92% Match",
    color: "#ff9900",
    problemsCount: 60,
    freqTopics: ["Sliding Window", "Heap / Priority Queue", "Tree DFS", "System Design"]
  },
  {
    id: "c-microsoft",
    company: "Microsoft",
    logo: "🪟",
    tagline: "Linked Lists, Stack, Strings, Recursion & Tree Traversals",
    match: "88% Match",
    color: "#00a4ef",
    problemsCount: 50,
    freqTopics: ["Matrix Traversal", "Binary Search", "Two Pointers", "Hash Set"]
  },
  {
    id: "c-meta",
    company: "Meta (Facebook)",
    logo: "♾️",
    tagline: "High-Speed Coding, Arrays, Interval Merging & Subsets",
    match: "85% Match",
    color: "#0668e1",
    problemsCount: 40,
    freqTopics: ["Subsets / Backtracking", "Valid Parentheses", "LCA", "Binary Tree"]
  }
];

const mockCheatSheets = [
  {
    id: "cs-1",
    title: "Top 14 LeetCode Patterns",
    category: "Algorithms",
    reads: "14.2k",
    desc: "Master Two Pointers, Fast & Slow Pointers, Sliding Window, Merge Intervals, and K-Way Merge."
  },
  {
    id: "cs-2",
    title: "Dynamic Programming Cheat Sheet",
    category: "DP Patterns",
    reads: "19.8k",
    desc: "Comprehensive breakdown of 0/1 Knapsack, Unbounded Knapsack, LCS, LIS, and Palindromic DP."
  },
  {
    id: "cs-3",
    title: "Big-O Cheat Sheet & Complexities",
    category: "Fundamentals",
    reads: "22.5k",
    desc: "Time and Space complexity cheat sheet for Arrays, Hash Maps, Heaps, Sorting, and Graphs."
  },
  {
    id: "cs-4",
    title: "SQL Querying & Window Functions",
    category: "Database",
    reads: "11.4k",
    desc: "RANK(), DENSE_RANK(), PARTITION BY, CTEs, self-joins, and query performance indexing."
  }
];

export default function AICoachPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("hub"); // hub, review, topics, company, interview, revision
  const [chatMessages, setChatMessages] = useState(initialChatMessages);
  const [inputMsg, setInputMsg] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // AI Code Reviewer State
  const [reviewCode, setReviewCode] = useState(
    `def twoSum(nums, target):\n    for i in range(len(nums)):\n        for j in range(i + 1, len(nums)):\n            if nums[i] + nums[j] == target:\n                return [i, j]\n    return []`
  );
  const [reviewLang, setReviewLang] = useState("python");
  const [reviewResult, setReviewResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // AI Debugger State
  const [debugCode, setDebugCode] = useState(
    `function maxSubArray(nums) {\n  let maxSoFar = nums[0];\n  let curr = 0;\n  for (let i = 0; i <= nums.length; i++) {\n    curr += nums[i];\n    if (curr > maxSoFar) maxSoFar = curr;\n    if (curr < 0) curr = 0;\n  }\n  return maxSoFar;\n}`
  );
  const [debugResult, setDebugResult] = useState(null);
  const [isDebugRunning, setIsDebugRunning] = useState(false);

  // Hints State
  const [activeHintLevel, setActiveHintLevel] = useState(0);

  // Mock Interview State
  const [interviewRole, setInterviewRole] = useState("Software Engineer (SDE-1)");
  const [interviewCompany, setInterviewCompany] = useState("Amazon");
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [interviewStep, setInterviewStep] = useState(1);
  const [interviewAns, setInterviewAns] = useState("");

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTyping]);

  function handleSendChat(textToSend = null) {
    const text = textToSend || inputMsg;
    if (!text || !text.trim()) return;

    const userMsg = {
      id: `m-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMsg("");
    setIsTyping(true);

    setTimeout(() => {
      let responseText = `Great question regarding "${text}"! Here is a structured breakdown:\n\n1. **Core Pattern**: Focus on reducing nested iterations into O(N) using a Hash Map or Two-Pointer approach.\n2. **Time Complexity**: Optimal O(N) time with O(N) space.\n3. **Edge Cases**: Empty input arrays, duplicate elements, negative numbers.\n\nWould you like me to generate a clean solution template in Python or C++?`;

      if (text.toLowerCase().includes("dp") || text.toLowerCase().includes("dynamic programming")) {
        responseText = `🤖 **Dynamic Programming Masterclass**:\n\nDP is built on two key properties:\n1. **Overlapping Subproblems**\n2. **Optimal Substructure**\n\n**3-Step Framework**:\n- **Step 1**: Define DP state, e.g., \`dp[i]\` = max profit at day \`i\`.\n- **Step 2**: Write recurrence relation: \`dp[i] = max(dp[i-1], dp[i-2] + val)\`.\n- **Step 3**: Identify base cases and memory optimization (space compression).`;
      } else if (text.toLowerCase().includes("amazon") || text.toLowerCase().includes("interview")) {
        responseText = `📦 **Amazon Coding Interview Focus**:\n\nAmazon heavily tests:\n- **Sliding Window** (e.g., Longest Substring Without Repeating Characters)\n- **Heap / Top K Frequent Elements**\n- **Graph BFS / Island count**\n\nPlus: Be ready to explain your code with Amazon's **Customer Obsession & Ownership** principles!`;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `m-ai-${Date.now()}`,
          sender: "ai",
          text: responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
      setIsTyping(false);
    }, 1000);
  }

  function handleRunCodeReview() {
    setIsAnalyzing(true);
    setTimeout(() => {
      setReviewResult({
        timeComplexity: "O(N²)",
        spaceComplexity: "O(1)",
        optimalTime: "O(N)",
        optimalSpace: "O(N)",
        score: 68,
        summary: "Brute-force nested loop detected. Time complexity can be optimized from O(N²) to O(N) using a Hash Map.",
        suggestions: [
          "Replace nested loop with single pass using dictionary lookup.",
          "Check for empty input array early (guard clause).",
          "Use type hinting `nums: List[int], target: int -> List[int]` for Pythonic best practices."
        ],
        optimizedCode: `def twoSum(nums: list[int], target: int) -> list[int]:\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []`
      });
      setIsAnalyzing(false);
    }, 1200);
  }

  function handleRunDebugger() {
    setIsDebugRunning(true);
    setTimeout(() => {
      setDebugResult({
        hasErrors: true,
        errorType: "Off-by-One Indexing & Logic Bug",
        line: 4,
        buggedSnippet: "for (let i = 0; i <= nums.length; i++)",
        fixSnippet: "for (let i = 0; i < nums.length; i++)",
        explanation: "Loop index condition `i <= nums.length` accesses `nums[nums.length]` which yields `undefined`. Adding `undefined` to `curr` results in `NaN` runtime failure.",
        edgeCases: ["Array with all negative numbers `[-2, -1, -3]`", "Single element array `[5]`"],
        fixedCode: `function maxSubArray(nums) {\n  let maxSoFar = nums[0];\n  let curr = 0;\n  for (let i = 0; i < nums.length; i++) {\n    curr += nums[i];\n    if (curr > maxSoFar) maxSoFar = curr;\n    if (curr < 0) curr = 0;\n  }\n  return maxSoFar;\n}`
      });
      setIsDebugRunning(false);
    }, 1100);
  }

  return (
    <div className="ai-coach-container" style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "1600px", width: "100%", margin: "0 auto", paddingBottom: "40px" }}>
      
      {/* Top Banner Hero Card */}
      <section style={{ background: "linear-gradient(135deg, rgba(120, 80, 255, 0.25), rgba(15, 23, 42, 0.95))", border: "1px solid rgba(120, 80, 255, 0.4)", borderRadius: "18px", padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div style={{ width: "58px", height: "58px", borderRadius: "16px", background: "linear-gradient(135deg, #7850ff, #c084fc)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(120, 80, 255, 0.6)" }}>
            <Bot size={34} style={{ color: "#fff" }} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h1 style={{ fontSize: "1.6rem", fontWeight: "800", color: "#fff", margin: 0 }}>Judgo AI Mentor & Learning Hub</h1>
              <span style={{ background: "rgba(34, 197, 94, 0.2)", border: "1px solid rgba(34, 197, 94, 0.4)", color: "#4ade80", fontSize: "0.75rem", padding: "2px 8px", borderRadius: "999px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} /> Online & Ready
              </span>
            </div>
            <p style={{ color: "#cbd5e1", fontSize: "0.9rem", margin: "4px 0 0 0" }}>
              Personalized AI guidance powered by your submission history, weak topic detection, and company interview patterns.
            </p>
          </div>
        </div>

        {/* Header Key Metrics Stats */}
        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
          <div style={{ background: "#080c14", border: "1px solid rgba(255,255,255,0.08)", padding: "10px 16px", borderRadius: "12px", textAlign: "center" }}>
            <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: "bold", textTransform: "uppercase" }}>Skill Rating</span>
            <strong style={{ display: "block", fontSize: "1.1rem", color: "#c084fc", fontWeight: "900" }}>Knight (1,842)</strong>
          </div>

          <div style={{ background: "#080c14", border: "1px solid rgba(255,255,255,0.08)", padding: "10px 16px", borderRadius: "12px", textAlign: "center" }}>
            <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: "bold", textTransform: "uppercase" }}>Learning Streak</span>
            <strong style={{ display: "block", fontSize: "1.1rem", color: "#f59e0b", fontWeight: "900" }}>14 Days 🔥</strong>
          </div>

          <div style={{ background: "#080c14", border: "1px solid rgba(255,255,255,0.08)", padding: "10px 16px", borderRadius: "12px", textAlign: "center" }}>
            <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: "bold", textTransform: "uppercase" }}>Daily Goal</span>
            <strong style={{ display: "block", fontSize: "1.1rem", color: "#4ade80", fontWeight: "900" }}>3 / 4 Solved</strong>
          </div>
        </div>
      </section>

      {/* Tabs Header Navigation */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "4px", overflowX: "auto" }}>
        {[
          { id: "hub", label: "💡 AI Mentor Hub", icon: BrainCircuit },
          { id: "review", label: "🔍 AI Code Review & Debugger", icon: Code2 },
          { id: "topics", label: "🎯 Weak Topic Analysis", icon: Target },
          { id: "company", label: "🏢 Company Prep", icon: Building2 },
          { id: "interview", label: "🎙️ Mock Interview", icon: Mic },
          { id: "revision", label: "📚 Revision & Cheat Sheets", icon: BookOpen }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              type="button"
              style={{
                background: isActive ? "rgba(120, 80, 255, 0.2)" : "transparent",
                border: "none",
                borderBottom: isActive ? "2px solid #7850ff" : "2px solid transparent",
                color: isActive ? "#fff" : "#8b9bb4",
                padding: "10px 16px",
                borderRadius: "8px 8px 0 0",
                fontWeight: "bold",
                fontSize: "0.88rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease"
              }}
            >
              <Icon size={16} style={{ color: isActive ? "#c084fc" : "#8b9bb4" }} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: AI MENTOR HUB (Dashboard + Chat Assistant + Roadmap) */}
      {activeTab === "hub" && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(340px, 1fr) minmax(420px, 1.2fr)", gap: "18px" }}>
          
          {/* Left Column: Roadmap & Daily Goals */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* Daily Challenge Card */}
            <div style={{ background: "linear-gradient(145deg, rgba(13, 22, 55, 0.95), rgba(8, 15, 38, 0.95))", border: "1px solid #1f2d59", borderRadius: "16px", padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "0.75rem", background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", padding: "3px 10px", borderRadius: "6px", fontWeight: "bold" }}>⚡ Today's Challenge</span>
                <span style={{ fontSize: "0.78rem", color: "#64748b" }}>+50 XP</span>
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#fff", margin: "0 0 6px 0" }}>Longest Substring Without Repeating Characters</h3>
              <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: "0 0 14px 0" }}>Given a string s, find the length of the longest substring without repeating characters.</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.75rem", color: "#facc15", fontWeight: "bold" }}>Medium • Sliding Window</span>
                <Link to="/problems/longest-substring-without-repeating-characters" style={{ background: "#7850ff", color: "#fff", textDecoration: "none", padding: "6px 14px", borderRadius: "8px", fontSize: "0.82rem", fontWeight: "bold" }}>
                  Solve Challenge
                </Link>
              </div>
            </div>

            {/* Personalized Learning Roadmap */}
            <div style={{ background: "linear-gradient(145deg, rgba(13, 22, 55, 0.95), rgba(8, 15, 38, 0.95))", border: "1px solid #1f2d59", borderRadius: "16px", padding: "20px" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: "bold", color: "#fff", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                <BrainCircuit size={18} style={{ color: "#c084fc" }} /> Recommended Learning Path
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {mockRoadmap.map((item, idx) => (
                  <div key={item.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "12px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <strong style={{ fontSize: "0.88rem", color: "#fff" }}>{idx + 1}. {item.topic}</strong>
                      <span style={{ fontSize: "0.72rem", color: item.color, fontWeight: "bold", background: "rgba(255,255,255,0.04)", padding: "2px 8px", borderRadius: "4px" }}>
                        {item.status}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.78rem", color: "#94a3b8", margin: "0 0 8px 0" }}>{item.desc}</p>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ flex: 1, height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "999px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${item.progress}%`, background: item.color, borderRadius: "999px" }} />
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "bold" }}>{item.solved}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: AI Chat Assistant */}
          <div style={{ background: "linear-gradient(145deg, rgba(13, 22, 55, 0.95), rgba(8, 15, 38, 0.95))", border: "1px solid #1f2d59", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", height: "680px" }}>
            <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "12px", marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Sparkles size={18} style={{ color: "#c084fc" }} />
                <h3 style={{ fontSize: "1.05rem", fontWeight: "bold", color: "#fff", margin: 0 }}>AI Coding Assistant</h3>
              </div>
              <button onClick={() => setChatMessages(initialChatMessages)} type="button" style={{ background: "transparent", border: "none", color: "#64748b", fontSize: "0.78rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                <RotateCcw size={12} /> Clear Chat
              </button>
            </div>

            {/* Chat Messages Log */}
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "14px", paddingRight: "6px" }}>
              {chatMessages.map((msg) => (
                <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: msg.sender === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: "bold" }}>{msg.sender === "user" ? "You" : "Judgo AI Mentor"}</span>
                    <span style={{ fontSize: "0.68rem", color: "#475569" }}>{msg.timestamp}</span>
                  </div>
                  <div
                    style={{
                      maxWidth: "85%",
                      background: msg.sender === "user" ? "#7850ff" : "rgba(255, 255, 255, 0.05)",
                      border: msg.sender === "user" ? "none" : "1px solid rgba(255, 255, 255, 0.08)",
                      color: "#fff",
                      padding: "12px 16px",
                      borderRadius: msg.sender === "user" ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                      fontSize: "0.88rem",
                      lineHeight: "1.5",
                      whiteSpace: "pre-wrap"
                    }}
                  >
                    {msg.text}
                  </div>

                  {/* Optional Quick Prompt Chips */}
                  {msg.chips && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
                      {msg.chips.map((chip) => (
                        <button
                          key={chip}
                          onClick={() => handleSendChat(chip)}
                          type="button"
                          style={{
                            background: "rgba(120, 80, 255, 0.15)",
                            border: "1px solid rgba(120, 80, 255, 0.3)",
                            color: "#c084fc",
                            padding: "4px 10px",
                            borderRadius: "999px",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                            cursor: "pointer"
                          }}
                        >
                          💬 {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#94a3b8", fontSize: "0.82rem" }}>
                  <Bot size={16} style={{ color: "#c084fc" }} /> AI is analyzing and generating explanation...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input Bar */}
            <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
              <input
                type="text"
                placeholder="Ask AI about DSA patterns, code errors, or interview tips..."
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                style={{
                  flex: 1,
                  background: "#080c14",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  color: "#fff",
                  fontSize: "0.88rem",
                  outline: "none"
                }}
              />
              <button
                onClick={() => handleSendChat()}
                type="button"
                style={{
                  background: "#7850ff",
                  border: "none",
                  borderRadius: "10px",
                  color: "#fff",
                  padding: "0 18px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: AI CODE REVIEW & DEBUGGER */}
      {activeTab === "review" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
          
          {/* Left Column: Code Review Input & Results */}
          <div style={{ background: "linear-gradient(145deg, rgba(13, 22, 55, 0.95), rgba(8, 15, 38, 0.95))", border: "1px solid #1f2d59", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: "bold", color: "#fff", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <Code2 size={18} style={{ color: "#38bdf8" }} /> AI Code Reviewer & Complexity Analyzer
              </h3>
              <select value={reviewLang} onChange={(e) => setReviewLang(e.target.value)} style={{ background: "#080c14", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "4px 10px", borderRadius: "6px", fontSize: "0.8rem" }}>
                <option value="python">Python 3</option>
                <option value="javascript">JavaScript</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
              </select>
            </div>

            <textarea
              value={reviewCode}
              onChange={(e) => setReviewCode(e.target.value)}
              rows={8}
              style={{ width: "100%", background: "#080c14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px", color: "#4ade80", fontFamily: "monospace", fontSize: "0.85rem", resize: "vertical" }}
            />

            <button
              onClick={handleRunCodeReview}
              disabled={isAnalyzing}
              type="button"
              style={{ background: "#7850ff", border: "none", borderRadius: "10px", color: "#fff", padding: "10px", fontWeight: "bold", fontSize: "0.88rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            >
              {isAnalyzing ? <div className="spinner" style={{ width: 16, height: 16, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> : <Sparkles size={16} />}
              {isAnalyzing ? "Analyzing Complexity & Clean Code..." : "Run AI Code Review"}
            </button>

            {reviewResult && (
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(120, 80, 255, 0.3)", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: "bold" }}>Quality Score: <strong style={{ color: "#4ade80", fontSize: "1.1rem" }}>{reviewResult.score} / 100</strong></span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <span style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", padding: "2px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "bold" }}>Current: {reviewResult.timeComplexity}</span>
                    <span style={{ background: "rgba(74,222,128,0.15)", color: "#4ade80", padding: "2px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "bold" }}>Optimal: {reviewResult.optimalTime}</span>
                  </div>
                </div>
                <p style={{ fontSize: "0.82rem", color: "#cbd5e1", margin: 0 }}>{reviewResult.summary}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <strong style={{ fontSize: "0.78rem", color: "#c084fc" }}>Optimization Tips:</strong>
                  {reviewResult.suggestions.map((s, idx) => (
                    <div key={idx} style={{ fontSize: "0.78rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: "6px" }}>
                      <CheckCircle2 size={12} style={{ color: "#4ade80" }} /> {s}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: AI Debugger */}
          <div style={{ background: "linear-gradient(145deg, rgba(13, 22, 55, 0.95), rgba(8, 15, 38, 0.95))", border: "1px solid #1f2d59", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: "bold", color: "#fff", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <Terminal size={18} style={{ color: "#f43f5e" }} /> AI Instant Bug & Edge-case Detector
            </h3>

            <textarea
              value={debugCode}
              onChange={(e) => setDebugCode(e.target.value)}
              rows={8}
              style={{ width: "100%", background: "#080c14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px", color: "#fca5a5", fontFamily: "monospace", fontSize: "0.85rem", resize: "vertical" }}
            />

            <button
              onClick={handleRunDebugger}
              disabled={isDebugRunning}
              type="button"
              style={{ background: "#f43f5e", border: "none", borderRadius: "10px", color: "#fff", padding: "10px", fontWeight: "bold", fontSize: "0.88rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            >
              {isDebugRunning ? <div className="spinner" style={{ width: 16, height: 16, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> : <AlertTriangle size={16} />}
              {isDebugRunning ? "Scanning for Logic & Boundary Bugs..." : "Scan & Fix Code"}
            </button>

            {debugResult && (
              <div style={{ background: "rgba(244, 63, 94, 0.08)", border: "1px solid rgba(244, 63, 94, 0.3)", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.85rem", color: "#f43f5e", fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px" }}>
                    <AlertTriangle size={16} /> Bug Detected: {debugResult.errorType}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Line {debugResult.line}</span>
                </div>
                <p style={{ fontSize: "0.82rem", color: "#cbd5e1", margin: 0 }}>{debugResult.explanation}</p>
                <div style={{ background: "#080c14", padding: "8px 12px", borderRadius: "8px", fontFamily: "monospace", fontSize: "0.8rem" }}>
                  <div style={{ color: "#f87171" }}>- {debugResult.buggedSnippet}</div>
                  <div style={{ color: "#4ade80" }}>+ {debugResult.fixSnippet}</div>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 3: WEAK TOPIC ANALYSIS */}
      {activeTab === "topics" && (
        <div style={{ background: "linear-gradient(145deg, rgba(13, 22, 55, 0.95), rgba(8, 15, 38, 0.95))", border: "1px solid #1f2d59", borderRadius: "16px", padding: "24px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#fff", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Target size={20} style={{ color: "#f59e0b" }} /> Topic Accuracy & Weakness Radar
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            {mockWeakTopics.map((item) => (
              <div key={item.topic} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", padding: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "1.3rem" }}>{item.icon}</span>
                    <strong style={{ fontSize: "0.95rem", color: "#fff" }}>{item.topic}</strong>
                  </div>
                  <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: item.accuracy < 60 ? "#f87171" : item.accuracy < 80 ? "#facc15" : "#4ade80" }}>
                    {item.status}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "12px" }}>
                  <div style={{ flex: 1, height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${item.accuracy}%`, background: item.accuracy < 60 ? "#f87171" : item.accuracy < 80 ? "#facc15" : "#4ade80", borderRadius: "999px" }} />
                  </div>
                  <span style={{ fontSize: "0.9rem", fontWeight: "900", color: "#fff", fontFamily: "monospace" }}>{item.accuracy}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: COMPANY PREPARATION */}
      {activeTab === "company" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "18px" }}>
          {mockCompanyPrep.map((comp) => (
            <div key={comp.id} style={{ background: "linear-gradient(145deg, rgba(13, 22, 55, 0.95), rgba(8, 15, 38, 0.95))", border: `1px solid ${comp.color}44`, borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "1.8rem" }}>{comp.logo}</span>
                  <div>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#fff", margin: 0 }}>{comp.company}</h3>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{comp.problemsCount} Curated Problems</span>
                  </div>
                </div>
                <span style={{ background: "rgba(120, 80, 255, 0.2)", color: "#c084fc", fontSize: "0.75rem", padding: "3px 10px", borderRadius: "999px", fontWeight: "bold" }}>
                  {comp.match}
                </span>
              </div>

              <p style={{ fontSize: "0.82rem", color: "#cbd5e1", margin: 0 }}>{comp.tagline}</p>

              <div>
                <strong style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Most Frequently Asked Topics</strong>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {comp.freqTopics.map((t) => (
                    <span key={t} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#eee", fontSize: "0.74rem", padding: "3px 8px", borderRadius: "6px" }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <button type="button" style={{ marginTop: "6px", background: "rgba(255,255,255,0.06)", border: "none", color: "#fff", padding: "8px", borderRadius: "8px", fontWeight: "bold", fontSize: "0.82rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                Start {comp.company} Track <ChevronRight size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: MOCK INTERVIEW SIMULATOR */}
      {activeTab === "interview" && (
        <div style={{ background: "linear-gradient(145deg, rgba(13, 22, 55, 0.95), rgba(8, 15, 38, 0.95))", border: "1px solid #1f2d59", borderRadius: "16px", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#fff", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <Mic size={22} style={{ color: "#a855f7" }} /> Interactive AI Mock Interview Simulator
              </h3>
              <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: "4px 0 0 0" }}>Simulate live technical rounds with real-time follow-ups and behavioral scoring.</p>
            </div>
          </div>

          {!isInterviewActive ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "600px", margin: "0 auto", textAlign: "center", padding: "30px 0" }}>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <select value={interviewCompany} onChange={(e) => setInterviewCompany(e.target.value)} style={{ background: "#080c14", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "10px 14px", borderRadius: "8px", fontSize: "0.9rem" }}>
                  <option value="Amazon">Amazon Mock Round</option>
                  <option value="Google">Google Mock Round</option>
                  <option value="Meta">Meta Mock Round</option>
                </select>
                <select value={interviewRole} onChange={(e) => setInterviewRole(e.target.value)} style={{ background: "#080c14", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "10px 14px", borderRadius: "8px", fontSize: "0.9rem" }}>
                  <option value="SDE-1">SDE-1 (0-2 YOE)</option>
                  <option value="SDE-2">SDE-2 (2-5 YOE)</option>
                </select>
              </div>

              <button onClick={() => setIsInterviewActive(true)} type="button" style={{ background: "#7850ff", border: "none", color: "#fff", padding: "12px 24px", borderRadius: "10px", fontWeight: "bold", fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <Play size={18} /> Begin Mock Interview Session
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ background: "#080c14", border: "1px solid rgba(120, 80, 255, 0.3)", borderRadius: "12px", padding: "18px" }}>
                <span style={{ fontSize: "0.75rem", color: "#c084fc", fontWeight: "bold" }}>AI Interviewer (Amazon SDE-1)</span>
                <p style={{ fontSize: "0.95rem", color: "#fff", fontWeight: "600", marginTop: "6px" }}>
                  "Welcome Sanket! Let's start with a coding challenge. Can you explain how you would design a data structure that supports insert, delete, and getRandom in O(1) time complexity?"
                </p>
              </div>

              <textarea
                value={interviewAns}
                onChange={(e) => setInterviewAns(e.target.value)}
                placeholder="Type your explanation or pseudocode here..."
                rows={4}
                style={{ width: "100%", background: "#080c14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px", color: "#fff", fontSize: "0.88rem" }}
              />

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button onClick={() => setIsInterviewActive(false)} type="button" style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#fff", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }}>End Interview</button>
                <button onClick={() => alert("AI Evaluation Score: 92/100! Excellent explanation of Hash Map + Dynamic Array swapping.")} type="button" style={{ background: "#7850ff", border: "none", color: "#fff", padding: "8px 16px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>Submit Answer</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: REVISION HUB & CHEAT SHEETS */}
      {activeTab === "revision" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "18px" }}>
          {mockCheatSheets.map((cs) => (
            <div key={cs.id} style={{ background: "linear-gradient(145deg, rgba(13, 22, 55, 0.95), rgba(8, 15, 38, 0.95))", border: "1px solid #1f2d59", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ background: "rgba(120, 80, 255, 0.15)", color: "#c084fc", fontSize: "0.74rem", padding: "2px 8px", borderRadius: "4px", fontWeight: "bold" }}>{cs.category}</span>
                <span style={{ fontSize: "0.74rem", color: "#64748b" }}>👀 {cs.reads} reads</span>
              </div>

              <h3 style={{ fontSize: "1.05rem", fontWeight: "bold", color: "#fff", margin: 0 }}>{cs.title}</h3>
              <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: 0 }}>{cs.desc}</p>

              <button type="button" style={{ marginTop: "6px", background: "rgba(255,255,255,0.06)", border: "none", color: "#38bdf8", padding: "8px", borderRadius: "8px", fontWeight: "bold", fontSize: "0.82rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                <FileText size={14} /> Open Revision Notes
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
