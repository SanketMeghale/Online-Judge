import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  Compass,
  FileCheck,
  Flame,
  MessageSquare,
  Play,
  RotateCcw,
  Send,
  Sparkles,
  Terminal,
  Trophy,
  XCircle,
  Zap
} from "lucide-react";
import { api } from "../../api/apiClient.js";
import "../../styles/mockInterview.css";

const COMPANIES = [
  { id: "Google", name: "Google", domain: "google.com", color: "#4285F4" },
  { id: "Meta", name: "Meta", domain: "meta.com", color: "#0668E1" },
  { id: "Amazon", name: "Amazon", domain: "amazon.com", color: "#FF9900" },
  { id: "Microsoft", name: "Microsoft", domain: "microsoft.com", color: "#00A4EF" },
  { id: "Apple", name: "Apple", domain: "apple.com", color: "#A2AAAD" },
  { id: "Netflix", name: "Netflix", domain: "netflix.com", color: "#E50914" },
  { id: "Uber", name: "Uber", domain: "uber.com", color: "#000000" },
  { id: "Stripe", name: "Stripe", domain: "stripe.com", color: "#635BFF" }
];

const TRACKS = [
  {
    id: "dsa",
    title: "Data Structures & Algorithms",
    desc: "Coding round focusing on data structures, Big-O complexity, and optimal patterns."
  },
  {
    id: "system_design",
    title: "Distributed System Design",
    desc: "Architecture round covering microservices, caching, database sharding, and latency."
  },
  {
    id: "behavioral",
    title: "Behavioral & Leadership",
    desc: "STAR method interview evaluating past ownership, conflict, and decision making."
  }
];

const DIFFICULTIES = ["Junior (L3)", "Mid-Level (L4)", "Senior (L5)"];

export default function MockInterviewStudio() {
  // Setup State
  const [selectedCompany, setSelectedCompany] = useState("Google");
  const [selectedTrack, setSelectedTrack] = useState("dsa");
  const [selectedDiff, setSelectedDiff] = useState("Mid-Level (L4)");
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);

  // Active Session State
  const [sessionData, setSessionData] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [candidateInput, setCandidateInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Code Workspace State
  const [language, setLanguage] = useState("python");
  const [sourceCode, setSourceCode] = useState("");
  const [evaluatingCode, setEvaluatingCode] = useState(false);
  const [codeEvaluation, setCodeEvaluation] = useState(null);

  // Timer State (45 mins countdown)
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  // Scorecard State
  const [scorecard, setScorecard] = useState(null);
  const [finishingSession, setFinishingSession] = useState(false);

  const chatScrollRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory, isSending]);

  // Timer tick
  useEffect(() => {
    let interval = null;
    if (sessionActive && timerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    }
    return () => clearInterval(interval);
  }, [sessionActive, timerRunning, timeLeft]);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // 1. Launch Interview Session
  const handleStartInterview = async () => {
    setSessionLoading(true);
    try {
      const res = await api.interviewAI({
        company: selectedCompany,
        track: selectedTrack,
        difficulty: selectedDiff,
        action: "start"
      });

      if (res && res.success) {
        setSessionData(res);
        setChatHistory([
          {
            role: "assistant",
            author: `${selectedCompany} Interviewer`,
            content: res.initialMessage || res.question || "Welcome to your interview!"
          }
        ]);
        const starter = res.problem?.starterCode?.[language] || res.problem?.starterCode?.python || "# Write your solution here\n";
        setSourceCode(starter);
        setTimeLeft(45 * 60);
        setTimerRunning(true);
        setSessionActive(true);
        setScorecard(null);
      }
    } catch (err) {
      console.error("[MockInterview] Start error:", err);
    } finally {
      setSessionLoading(false);
    }
  };

  // 2. Candidate Sends Dialogue Message
  const handleSendMessage = async (textToSend) => {
    const msg = textToSend || candidateInput;
    if (!msg || !msg.trim() || isSending) return;

    const newHistory = [...chatHistory, { role: "user", author: "Candidate", content: msg.trim() }];
    setChatHistory(newHistory);
    setCandidateInput("");
    setIsSending(true);

    try {
      const res = await api.interviewAI({
        company: selectedCompany,
        track: selectedTrack,
        difficulty: selectedDiff,
        action: "message",
        answer: msg.trim(),
        history: newHistory
      });

      if (res && res.success && res.reply) {
        setChatHistory([
          ...newHistory,
          { role: "assistant", author: `${selectedCompany} Interviewer`, content: res.reply }
        ]);
      }
    } catch (err) {
      console.error("[MockInterview] Message error:", err);
      setChatHistory([
        ...newHistory,
        {
          role: "assistant",
          author: `${selectedCompany} Interviewer`,
          content: "I understood your point. How does this impact your time and space complexity?"
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  // 3. Submit Code Implementation to Interviewer
  const handleSubmitCode = async () => {
    if (!sourceCode.trim() || evaluatingCode) return;
    setEvaluatingCode(true);

    const codeMsg = `Submitted Code (${language}):\n\`\`\`${language}\n${sourceCode}\n\`\`\``;
    const updatedHistory = [...chatHistory, { role: "user", author: "Candidate", content: codeMsg }];
    setChatHistory(updatedHistory);

    try {
      const res = await api.interviewAI({
        company: selectedCompany,
        track: selectedTrack,
        difficulty: selectedDiff,
        action: "submit_code",
        code: sourceCode,
        language,
        history: updatedHistory
      });

      if (res && res.success && res.evaluation) {
        setCodeEvaluation(res.evaluation);
        setChatHistory([
          ...updatedHistory,
          {
            role: "assistant",
            author: `${selectedCompany} Lead Interviewer`,
            content: res.evaluation
          }
        ]);
      }
    } catch (err) {
      console.error("[MockInterview] Code submission error:", err);
    } finally {
      setEvaluatingCode(false);
    }
  };

  // 4. Finish Interview & Generate Scorecard
  const handleFinishInterview = async () => {
    setFinishingSession(true);
    setTimerRunning(false);

    try {
      const res = await api.interviewAI({
        company: selectedCompany,
        track: selectedTrack,
        difficulty: selectedDiff,
        action: "finish",
        code: sourceCode,
        history: chatHistory
      });

      if (res && res.success && res.scorecard) {
        setScorecard(res.scorecard);
      }
    } catch (err) {
      console.error("[MockInterview] Finish error:", err);
    } finally {
      setFinishingSession(false);
    }
  };

  // 5. Exit Session
  const handleExitSession = () => {
    setSessionActive(false);
    setSessionData(null);
    setChatHistory([]);
    setScorecard(null);
  };

  // ──────────────────────────────────────────────────────────────────────────
  // VIEW 1: SCORECARD REPORT (If Interview Finished)
  // ──────────────────────────────────────────────────────────────────────────
  if (scorecard) {
    const decisionClass =
      scorecard.decision?.toLowerCase().includes("strong")
        ? "strong-hire"
        : scorecard.decision?.toLowerCase().includes("hire")
        ? "hire"
        : scorecard.decision?.toLowerCase().includes("lean")
        ? "lean-hire"
        : "no-hire";

    return (
      <div className="mock-studio-root">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mock-scorecard-card"
        >
          {/* Header */}
          <div className="mock-scorecard-hero">
            <div className="mock-scorecard-badge-wrap">
              <Trophy size={28} style={{ color: "#fbbf24" }} />
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#ffffff", margin: 0 }}>
                  {selectedCompany} Hiring Committee Scorecard
                </h2>
                <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                  {selectedTrack.toUpperCase()} Round • {selectedDiff}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div className={`mock-decision-pill ${decisionClass}`}>
                {scorecard.decision || "Hire"} ({scorecard.overallScore || 88}/100)
              </div>
              <button
                type="button"
                onClick={handleExitSession}
                style={{
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#cbd5e1",
                  borderRadius: "8px",
                  padding: "8px 14px",
                  fontSize: "0.8rem",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                Back to Launcher
              </button>
            </div>
          </div>

          {/* 4 Dimension Category Scores */}
          <div className="mock-scorecard-bars">
            <div className="mock-scorecard-bar-card">
              <div className="mock-bar-head">
                <span>🧠 Problem Solving</span>
                <strong>{scorecard.breakdown?.problemSolving || 90}%</strong>
              </div>
              <div className="mock-bar-track">
                <div
                  className="mock-bar-fill"
                  style={{ width: `${scorecard.breakdown?.problemSolving || 90}%` }}
                />
              </div>
            </div>

            <div className="mock-scorecard-bar-card">
              <div className="mock-bar-head">
                <span>💻 Code Quality</span>
                <strong>{scorecard.breakdown?.codeQuality || 85}%</strong>
              </div>
              <div className="mock-bar-track">
                <div
                  className="mock-bar-fill"
                  style={{ width: `${scorecard.breakdown?.codeQuality || 85}%` }}
                />
              </div>
            </div>

            <div className="mock-scorecard-bar-card">
              <div className="mock-bar-head">
                <span>⏱️ Complexity (Big-O)</span>
                <strong>{scorecard.breakdown?.efficiency || 88}%</strong>
              </div>
              <div className="mock-bar-track">
                <div
                  className="mock-bar-fill"
                  style={{ width: `${scorecard.breakdown?.efficiency || 88}%` }}
                />
              </div>
            </div>

            <div className="mock-scorecard-bar-card">
              <div className="mock-bar-head">
                <span>🗣️ Technical Communication</span>
                <strong>{scorecard.breakdown?.communication || 88}%</strong>
              </div>
              <div className="mock-bar-track">
                <div
                  className="mock-bar-fill"
                  style={{ width: `${scorecard.breakdown?.communication || 88}%` }}
                />
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              borderRadius: "8px",
              padding: "14px 16px",
              fontSize: "0.84rem",
              lineHeight: 1.45,
              color: "#e2e8f0"
            }}
          >
            <strong style={{ color: "#38bdf8", display: "block", marginBottom: "4px" }}>
              Committee Evaluation Summary:
            </strong>
            {scorecard.summary}
          </div>

          {/* Strengths & Growth Areas */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div
              style={{
                background: "rgba(16, 185, 129, 0.04)",
                border: "1px solid rgba(16, 185, 129, 0.15)",
                borderRadius: "8px",
                padding: "14px"
              }}
            >
              <h4
                style={{
                  fontSize: "0.82rem",
                  fontWeight: "700",
                  color: "#34d399",
                  margin: "0 0 8px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <CheckCircle2 size={15} /> Key Strengths Identified
              </h4>
              <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "0.78rem", color: "#cbd5e1", display: "flex", flexDirection: "column", gap: "4px" }}>
                {(scorecard.strengths || []).map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div
              style={{
                background: "rgba(245, 158, 11, 0.04)",
                border: "1px solid rgba(245, 158, 11, 0.15)",
                borderRadius: "8px",
                padding: "14px"
              }}
            >
              <h4
                style={{
                  fontSize: "0.82rem",
                  fontWeight: "700",
                  color: "#fbbf24",
                  margin: "0 0 8px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <Sparkles size={15} /> Targeted Growth Areas
              </h4>
              <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "0.78rem", color: "#cbd5e1", display: "flex", flexDirection: "column", gap: "4px" }}>
                {(scorecard.improvements || []).map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // VIEW 2: ACTIVE LIVE INTERVIEW WORKSPACE
  // ──────────────────────────────────────────────────────────────────────────
  if (sessionActive) {
    return (
      <div className="mock-studio-root">
        <div className="mock-live-studio">
          {/* Top Control Bar */}
          <div className="mock-studio-topbar">
            <div className="mock-topbar-info">
              <span className="mock-topbar-company-badge">
                <Building2 size={16} style={{ color: "#a78bfa" }} />
                <span>{selectedCompany} Technical Interview</span>
              </span>
              <span className="mock-topbar-role-tag">{sessionData?.problem?.title || "Coding Round"}</span>
            </div>

            {/* Countdown Clock */}
            <div className="mock-timer-box" style={{ color: timeLeft < 300 ? "#f87171" : "#38bdf8" }}>
              <Clock size={14} />
              <span>{formatTimer(timeLeft)}</span>
            </div>

            {/* Actions */}
            <div className="mock-topbar-actions">
              <button
                type="button"
                className="mock-finish-btn"
                onClick={handleFinishInterview}
                disabled={finishingSession}
              >
                <FileCheck size={14} />
                <span>{finishingSession ? "Evaluating..." : "Finish & Scorecard"}</span>
              </button>
              <button type="button" className="mock-exit-btn" onClick={handleExitSession}>
                Exit
              </button>
            </div>
          </div>

          {/* 2-Column Split Workspace */}
          <div className="mock-studio-split">
            {/* Left: Interviewer Dialogue & Chat */}
            <div className="mock-dialogue-pane">
              <div className="mock-chat-scroll" ref={chatScrollRef}>
                {chatHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`mock-msg-bubble ${msg.role === "assistant" ? "interviewer" : "candidate"}`}
                  >
                    <div className="mock-msg-meta">
                      <span>{msg.author || (msg.role === "assistant" ? "Interviewer" : "Candidate")}</span>
                    </div>
                    <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
                  </div>
                ))}

                {isSending && (
                  <div className="mock-msg-bubble interviewer" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div
                      className="spinner"
                      style={{
                        width: 14,
                        height: 14,
                        border: "2px solid rgba(255,255,255,0.2)",
                        borderTopColor: "#7850ff",
                        borderRadius: "50%",
                        animation: "spin 0.6s linear infinite"
                      }}
                    />
                    <span style={{ fontSize: "0.76rem", color: "#94a3b8" }}>
                      {selectedCompany} interviewer is thinking...
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Action Prompt Pills */}
              <div className="mock-quick-prompts-row">
                <button
                  type="button"
                  className="mock-prompt-pill"
                  onClick={() => handleSendMessage("Could you clarify the input constraints and expected time complexity?")}
                >
                  💬 Clarify Constraints
                </button>
                <button
                  type="button"
                  className="mock-prompt-pill"
                  onClick={() => handleSendMessage("My proposed approach uses a Hash Map and Two Pointers. Would you like me to walk through a test case first?")}
                >
                  ⚡ Explain Approach
                </button>
                <button
                  type="button"
                  className="mock-prompt-pill"
                  onClick={() => handleSendMessage("Could you give me a progressive hint on the optimal data structure?")}
                >
                  💡 Request Hint
                </button>
              </div>

              {/* Message Input Box */}
              <div className="mock-input-row">
                <input
                  type="text"
                  className="mock-chat-input"
                  placeholder="Type your explanation, question, or thought process..."
                  value={candidateInput}
                  onChange={(e) => setCandidateInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendMessage();
                  }}
                />
                <button
                  type="button"
                  className="mock-send-btn"
                  onClick={() => handleSendMessage()}
                  disabled={isSending || !candidateInput.trim()}
                >
                  <Send size={14} />
                </button>
              </div>
            </div>

            {/* Right: Code Workspace */}
            <div className="mock-code-pane">
              <div className="mock-code-topbar">
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Code2 size={15} style={{ color: "#38bdf8" }} />
                  <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#e2e8f0" }}>
                    Solution Workspace
                  </span>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="mock-lang-select"
                  >
                    <option value="python">Python 3</option>
                    <option value="javascript">JavaScript (Node)</option>
                    <option value="cpp">C++ 20</option>
                  </select>
                </div>

                <button
                  type="button"
                  className="mock-code-action-btn"
                  onClick={handleSubmitCode}
                  disabled={evaluatingCode}
                >
                  <Play size={13} />
                  <span>{evaluatingCode ? "Evaluating..." : "Submit Solution"}</span>
                </button>
              </div>

              {/* Code Textarea Editor */}
              <textarea
                className="mock-code-editor-area"
                value={sourceCode}
                onChange={(e) => setSourceCode(e.target.value)}
                placeholder="// Write your algorithmic implementation here..."
                spellCheck={false}
              />

              {/* Evaluation Console if available */}
              {codeEvaluation && (
                <div className="mock-code-eval-box">
                  <strong style={{ color: "#34d399", display: "block", marginBottom: "4px" }}>
                    ✓ Interviewer Evaluation:
                  </strong>
                  <div style={{ whiteSpace: "pre-wrap", color: "#cbd5e1", fontSize: "0.76rem" }}>
                    {codeEvaluation}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // VIEW 3: SETUP / LAUNCHER SCREEN (DEFAULT)
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="mock-studio-root">
      <div className="mock-launcher-card">
        <div className="mock-launcher-mesh" />

        <div className="mock-launcher-head">
          <div className="mock-launcher-title-group">
            <h2>AI Technical Mock Interview Studio</h2>
            <p>
              Simulate realistic high-stakes FAANG technical rounds with live interviewer interaction, automated code evaluation, and hiring committee scorecards.
            </p>
          </div>
        </div>

        {/* 1. Target Company Selection */}
        <div className="mock-setup-section">
          <span className="mock-setup-label">
            <Building2 size={14} style={{ color: "#a78bfa" }} />
            1. Select Target Company
          </span>
          <div className="mock-company-grid">
            {COMPANIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`mock-company-btn ${selectedCompany === c.id ? "selected" : ""}`}
                onClick={() => setSelectedCompany(c.id)}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "6px",
                    background: "rgba(255, 255, 255, 0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "800",
                    color: c.color
                  }}
                >
                  {c.name.slice(0, 1)}
                </div>
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Track Selection */}
        <div className="mock-setup-section">
          <span className="mock-setup-label">
            <Compass size={14} style={{ color: "#38bdf8" }} />
            2. Choose Interview Track
          </span>
          <div className="mock-track-row">
            {TRACKS.map((t) => (
              <div
                key={t.id}
                className={`mock-track-card ${selectedTrack === t.id ? "selected" : ""}`}
                onClick={() => setSelectedTrack(t.id)}
              >
                <strong>{t.title}</strong>
                <span>{t.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Difficulty Level */}
        <div className="mock-setup-section">
          <span className="mock-setup-label">
            <Zap size={14} style={{ color: "#fbbf24" }} />
            3. Experience Level
          </span>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDiff(d)}
                style={{
                  background: selectedDiff === d ? "rgba(120, 80, 255, 0.15)" : "rgba(255, 255, 255, 0.03)",
                  border: selectedDiff === d ? "1px solid rgba(120, 80, 255, 0.4)" : "1px solid rgba(255, 255, 255, 0.08)",
                  color: selectedDiff === d ? "#c4b5fd" : "#94a3b8",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Launch CTA */}
        <button
          type="button"
          className="mock-start-btn"
          onClick={handleStartInterview}
          disabled={sessionLoading}
        >
          <Play size={16} />
          <span>{sessionLoading ? "Initializing Mock Studio..." : `Start ${selectedCompany} Technical Interview →`}</span>
        </button>
      </div>
    </div>
  );
}
