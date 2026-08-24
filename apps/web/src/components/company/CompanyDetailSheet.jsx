import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  Code2,
  Compass,
  FileCode,
  Flame,
  HelpCircle,
  Layers,
  Lightbulb,
  Play,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  Star,
  Target,
  Terminal,
  TrendingUp,
  Zap,
  Check,
  AlertTriangle,
  Lock,
  Unlock
} from "lucide-react";
import { CompanyLogo } from "./CompanyLogos.jsx";
import { api } from "../../api/apiClient.js";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useAppData } from "../../data/AppDataContext.jsx";
import { calculateLocalCompanySheet } from "../../data/appData.js";
import "../../styles/companySheets.css";

export function CompanyDetailSheet({ companyId, onBack }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { database } = useAppData();

  const currentUserId = user?.id || user?._id || "";

  const [sheetData, setSheetData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Table filtering & search state
  const [tableSearch, setTableSearch] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // AI Chat state
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Load complete company sheet with real user progress
  useEffect(() => {
    let isMounted = true;

    async function loadSheet() {
      setLoading(true);
      try {
        const res = await api.getCompanySheet(companyId, currentUserId ? `userId=${currentUserId}` : "");
        if (isMounted && res && res.success && res.sheet) {
          setSheetData(res.sheet);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn("[CompanyDetailSheet] Backend fetch notice, calculating locally:", err.message);
      }

      // Local fallback
      if (isMounted) {
        const localSheet = calculateLocalCompanySheet(database, companyId, currentUserId);
        setSheetData(localSheet);
        setLoading(false);
      }
    }

    loadSheet();
    return () => {
      isMounted = false;
    };
  }, [companyId, currentUserId, database]);

  // Handle AI Company Coach queries
  const handleSendAIMessage = async (customPrompt) => {
    const text = (customPrompt || aiInput).trim();
    if (!text) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setAiMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setAiInput("");
    setAiLoading(true);

    try {
      const res = await api.askCompanyAI(companyId, {
        message: text,
        context: {
          history: aiMessages.slice(-4)
        }
      });

      const replyMsg = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: res.reply || `I've analyzed your progress for ${sheetData?.company?.name || "this company"}.`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setAiMessages((prev) => [...prev, replyMsg]);
    } catch (err) {
      console.warn("[CompanyAI] Chat fallback:", err.message);
      const fallbackReply = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: `### 🎯 ${sheetData?.company?.name || "Company"} Focus Recommendation\n\nBased on your current solved count (**${sheetData?.stats?.solvedCount || 0}/${sheetData?.stats?.totalProblems || 0}**) and accuracy (**${sheetData?.stats?.accuracy || 0}%**):\n\n- Prioritize **${sheetData?.readiness?.weakTopics?.[0] || "High Frequency Topics"}**.\n- Practice $O(N)$ hash map lookups and avoid $O(N^2)$ brute-force implementations.\n- Test your code with empty and edge-case inputs before submitting.`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setAiMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setAiLoading(false);
    }
  };

  const company = sheetData?.company || {};
  const stats = sheetData?.stats || {};
  const readiness = sheetData?.readiness || {};
  const topicBreakdown = sheetData?.topicBreakdown || [];
  const problemList = sheetData?.problemList || [];
  const preparationRoadmap = sheetData?.preparationRoadmap || [];

  // Filter problems table
  const filteredProblems = useMemo(() => {
    return problemList.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(tableSearch.toLowerCase()) ||
        p.topic.toLowerCase().includes(tableSearch.toLowerCase()) ||
        (p.interviewTags || []).some((t) => t.toLowerCase().includes(tableSearch.toLowerCase()));

      const matchesDiff =
        selectedDifficulty === "all" || p.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

      const matchesStatus =
        selectedStatus === "all" || p.status.toLowerCase().replace(/\s+/g, "-") === selectedStatus.toLowerCase();

      return matchesSearch && matchesDiff && matchesStatus;
    });
  }, [problemList, tableSearch, selectedDifficulty, selectedStatus]);

  if (loading || !sheetData) {
    return (
      <div className="company-sheet-page" style={{ padding: "40px 0", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", color: "#c084fc", fontWeight: "700" }}>
          <Sparkles className="animate-spin" size={20} />
          <span>Generating Real-Time {companyId?.toUpperCase()} Preparation Sheet...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="company-sheet-page" data-lenis-prevent="true">
      {/* 1. TOP HERO SECTION */}
      <div className="company-detail-hero">
        <div className="company-detail-top-bar">
          <button type="button" className="company-back-btn" onClick={onBack}>
            <ArrowLeft size={16} />
            <span>← Back to All Companies</span>
          </button>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span className="company-topic-pill" style={{ background: "rgba(124, 58, 237, 0.15)", color: "#c084fc" }}>
              {company.tier || "Tier 1 Tech"}
            </span>
            <span className={`company-diff-badge ${company.difficulty?.toLowerCase().replace(/\s+/g, "-")}`}>
              {company.difficulty} Interview Bar
            </span>
          </div>
        </div>

        <div className="company-detail-brand">
          <div className="company-detail-logo-wrap">
            <CompanyLogo name={company.name} size={38} />
          </div>
          <div className="company-detail-headings">
            <h1>
              {company.name}
              <span style={{ fontSize: "1.05rem", fontWeight: "400", color: "#94a3b8" }}>
                Interview Preparation Sheet
              </span>
            </h1>
            <p>{company.description}</p>
          </div>
        </div>

        {/* Dynamic Top Stats Grid */}
        <div className="company-stats-grid">
          <div className="company-stat-card">
            <span className="stat-label">Total Problems</span>
            <span className="stat-val">{stats.totalProblems}</span>
            <span className="stat-sub">Curated for {company.name}</span>
          </div>
          <div className="company-stat-card">
            <span className="stat-label">Solved by You</span>
            <span className="stat-val" style={{ color: "#34d399" }}>
              {stats.solvedCount}
            </span>
            <span className="stat-sub">{stats.attemptedCount} attempted</span>
          </div>
          <div className="company-stat-card">
            <span className="stat-label">Accuracy Rate</span>
            <span className="stat-val" style={{ color: "#38bdf8" }}>
              {stats.accuracy}%
            </span>
            <span className="stat-sub">On company problems</span>
          </div>
          <div className="company-stat-card">
            <span className="stat-label">Sheet Completion</span>
            <span className="stat-val" style={{ color: "#c084fc" }}>
              {stats.completionPercentage}%
            </span>
            <span className="stat-sub">Real user progress</span>
          </div>
          <div className="company-stat-card">
            <span className="stat-label">Difficulty Depth</span>
            <div style={{ display: "flex", gap: "8px", marginTop: "4px", fontSize: "0.78rem" }}>
              <span style={{ color: "#34d399" }}>E: {stats.difficultyProgress?.easy?.solved}/{stats.difficultyProgress?.easy?.total}</span>
              <span style={{ color: "#fbbf24" }}>M: {stats.difficultyProgress?.medium?.solved}/{stats.difficultyProgress?.medium?.total}</span>
              <span style={{ color: "#f87171" }}>H: {stats.difficultyProgress?.hard?.solved}/{stats.difficultyProgress?.hard?.total}</span>
            </div>
            <span className="stat-sub">Easy / Med / Hard breakdown</span>
          </div>
        </div>
      </div>

      {/* 2. PERSONALIZED COMPANY READINESS */}
      <div className="company-readiness-card">
        <div className="company-readiness-head">
          <div className="company-readiness-score-wrap">
            <div className="company-readiness-circle">
              {readiness.score}
            </div>
            <div>
              <h3 style={{ margin: "0 0 2px 0", fontSize: "1.1rem", color: "#f8fafc" }}>
                Your {company.name} Interview Readiness
              </h3>
              <p style={{ margin: 0, fontSize: "0.84rem", color: "#94a3b8" }}>
                Calculated from your verified solve counts, submission accuracy, and difficulty distribution.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/interviewer?tab=interview")}
            style={{
              background: "rgba(124, 58, 237, 0.2)",
              border: "1px solid rgba(124, 58, 237, 0.4)",
              color: "#c084fc",
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "0.82rem",
              fontWeight: "700",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <Compass size={15} />
            <span>Launch Mock Interview →</span>
          </button>
        </div>

        <div className="company-readiness-cols">
          <div className="company-readiness-box">
            <h4 style={{ color: "#34d399" }}>
              <CheckCircle2 size={15} />
              Strong Areas
            </h4>
            {readiness.strongTopics && readiness.strongTopics.length > 0 ? (
              <ul>
                {readiness.strongTopics.map((topic, i) => (
                  <li key={i}>✓ {topic}</li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: "0.8rem", color: "#64748b", margin: 0 }}>
                Solve more problems in this sheet to establish strong domains.
              </p>
            )}
          </div>

          <div className="company-readiness-box">
            <h4 style={{ color: "#fbbf24" }}>
              <AlertTriangle size={15} />
              Priority Gaps & Needs Work
            </h4>
            {readiness.weakTopics && readiness.weakTopics.length > 0 ? (
              <ul>
                {readiness.weakTopics.map((topic, i) => (
                  <li key={i}>⚠ {topic}</li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: "0.8rem", color: "#34d399", margin: 0 }}>
                No critical topic gaps detected!
              </p>
            )}
          </div>

          <div className="company-readiness-box">
            <h4 style={{ color: "#38bdf8" }}>
              <Target size={15} />
              Recommended Next Action
            </h4>
            <ul>
              {(readiness.recommendedNext || []).map((rec, i) => (
                <li key={i} style={{ color: "#93c5fd" }}>
                  → {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 3. TOPIC BREAKDOWN */}
      <div className="company-topics-section">
        <div className="company-section-title">
          <Layers size={18} color="#a855f7" />
          <span>{company.name} Specific Topic Breakdown</span>
        </div>

        <div className="company-topics-grid">
          {topicBreakdown.map((t, idx) => (
            <div key={idx} className="company-topic-card">
              <div className="company-topic-card-head">
                <strong>{t.topicName}</strong>
                <span className={`company-freq-pill ${t.frequency.toLowerCase().replace(/\s+/g, "-")}`}>
                  {t.frequency} Freq
                </span>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "#94a3b8", marginBottom: "4px" }}>
                  <span>{t.userSolved} / {t.problemsAvailable} solved</span>
                  <span style={{ color: "#c084fc", fontWeight: "700" }}>{t.progressPercent}%</span>
                </div>
                <div className="company-progress-bar-bg" style={{ height: "5px" }}>
                  <div
                    className="company-progress-bar-fill"
                    style={{ width: `${Math.min(100, Math.max(0, t.progressPercent))}%` }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.74rem", color: "#64748b" }}>
                <span>Accuracy: {t.accuracy}%</span>
                <button
                  type="button"
                  className="company-topic-practice-btn"
                  onClick={() => navigate(`/practice?topic=${encodeURIComponent(t.topicName)}`)}
                >
                  <span>Practice Topic →</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. PROBLEM LIST TABLE */}
      <div className="company-problems-table-wrap">
        <div className="company-table-filter-bar">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FileCode size={18} color="#38bdf8" />
            <strong style={{ fontSize: "0.96rem", color: "#f8fafc" }}>
              {company.name} Interview Problem List ({filteredProblems.length})
            </strong>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <div className="company-search-box" style={{ padding: "6px 12px", minWidth: "180px" }}>
              <Search size={14} color="#64748b" />
              <input
                type="text"
                placeholder="Filter problem or tag..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                style={{ fontSize: "0.8rem" }}
              />
            </div>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              style={{
                background: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#cbd5e1",
                padding: "6px 10px",
                borderRadius: "8px",
                fontSize: "0.8rem",
                outline: "none"
              }}
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                background: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#cbd5e1",
                padding: "6px 10px",
                borderRadius: "8px",
                fontSize: "0.8rem",
                outline: "none"
              }}
            >
              <option value="all">All Statuses</option>
              <option value="solved">Solved</option>
              <option value="attempted">Attempted</option>
              <option value="not-started">Not Started</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="company-problems-table">
            <thead>
              <tr>
                <th>Problem</th>
                <th>Topic</th>
                <th>Difficulty</th>
                <th>Company Frequency</th>
                <th>Status</th>
                <th>Last Attempt</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProblems.map((prob) => {
                const diffClass = prob.difficulty.toLowerCase();
                const statusClass = prob.status.toLowerCase().replace(/\s+/g, "-");

                return (
                  <tr key={prob.id}>
                    <td>
                      <Link
                        to={`/problems/${prob.id}`}
                        style={{ color: "#f8fafc", fontWeight: "600", textDecoration: "none" }}
                      >
                        {prob.title}
                      </Link>
                      <div style={{ display: "flex", gap: "4px", marginTop: "3px" }}>
                        {(prob.interviewTags || []).slice(0, 2).map((t, idx) => (
                          <span key={idx} className="company-topic-pill" style={{ fontSize: "0.65rem", padding: "1px 5px" }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span style={{ color: "#94a3b8" }}>{prob.topic}</span>
                    </td>
                    <td>
                      <span className={`company-diff-badge ${diffClass}`}>
                        {prob.difficulty}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "2px", color: "#fbbf24" }}>
                        {Array.from({ length: prob.companyFrequency || 5 }).map((_, i) => (
                          <Star key={i} size={12} fill="#fbbf24" color="#fbbf24" />
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`company-status-badge ${statusClass}`}>
                        {prob.status === "Solved" && <Check size={12} />}
                        {prob.status === "Attempted" && <Clock size={12} />}
                        {prob.status}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.78rem", color: "#64748b" }}>
                      {prob.lastAttempt
                        ? new Date(prob.lastAttempt).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className="company-table-action-btn"
                        onClick={() => navigate(`/problems/${prob.id}`)}
                      >
                        <Play size={12} />
                        <span>{prob.status === "Solved" ? "Practice" : "Solve"}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. COMPANY-WISE PREPARATION ROADMAP */}
      <div className="company-roadmap-section">
        <div className="company-section-title">
          <TrendingUp size={18} color="#34d399" />
          <span>Your {company.name} Preparation Roadmap</span>
        </div>

        <div className="company-roadmap-grid">
          {preparationRoadmap.map((step) => {
            const isMastered = step.status === "Mastered";
            const isInProgress = step.status === "In Progress";
            const isLocked = step.status === "Locked";

            return (
              <div
                key={step.step}
                className={`company-roadmap-card ${step.status.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#c084fc" }}>
                    STEP {step.step}
                  </span>
                  {isMastered && <CheckCircle2 size={16} color="#34d399" />}
                  {isInProgress && <Unlock size={16} color="#c084fc" />}
                  {isLocked && <Lock size={16} color="#64748b" />}
                </div>

                <strong style={{ fontSize: "0.94rem", color: isLocked ? "#64748b" : "#f8fafc" }}>
                  {step.topic}
                </strong>
                <p style={{ fontSize: "0.76rem", color: "#94a3b8", margin: 0 }}>
                  {step.description}
                </p>

                <div style={{ marginTop: "auto", paddingTop: "8px", fontSize: "0.74rem" }}>
                  <span style={{ color: isMastered ? "#34d399" : isInProgress ? "#c084fc" : "#64748b", fontWeight: "600" }}>
                    {isMastered ? "✓ Mastered" : isInProgress ? "→ In Progress" : "🔒 Locked"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. AI COMPANY COACH ("Ask AI about this company") */}
      <div className="company-ai-coach-card">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Sparkles size={20} color="#c084fc" />
          <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#f8fafc" }}>
            Ask Judgo Intelligence about {company.name}
          </h3>
        </div>
        <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.86rem" }}>
          Trained on real {company.name} hiring rubrics, recent interview logs, and your personal algorithmic gaps.
        </p>

        {/* Prompt Chips */}
        <div className="company-ai-chips">
          {[
            `Which topics should I prioritize for ${company.name}?`,
            `Give me a 7-day ${company.name} DSA plan`,
            `What are my weakest ${company.name} topics?`,
            `Am I ${company.name} interview ready?`,
            `What difficulty should I practice next?`
          ].map((prompt, i) => (
            <button
              key={i}
              type="button"
              className="company-ai-chip"
              onClick={() => handleSendAIMessage(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat History */}
        {aiMessages.length > 0 && (
          <div
            style={{
              maxHeight: "340px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              background: "rgba(0, 0, 0, 0.25)",
              borderRadius: "10px",
              padding: "16px"
            }}
          >
            {aiMessages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  background: msg.role === "user" ? "rgba(124, 58, 237, 0.25)" : "rgba(30, 41, 59, 0.6)",
                  border: msg.role === "user" ? "1px solid rgba(124, 58, 237, 0.4)" : "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  fontSize: "0.86rem",
                  color: "#f1f5f9",
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap"
                }}
              >
                {msg.content}
              </div>
            ))}
          </div>
        )}

        {/* Chat Input */}
        <div className="company-ai-chat-input-row">
          <input
            type="text"
            placeholder={`Ask anything about ${company.name} rounds, system design, or problem frequency...`}
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendAIMessage();
              }
            }}
          />
          <button
            type="button"
            onClick={() => handleSendAIMessage()}
            disabled={aiLoading}
          >
            <Send size={15} />
            <span>{aiLoading ? "Thinking..." : "Ask Coach"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CompanyDetailSheet;
