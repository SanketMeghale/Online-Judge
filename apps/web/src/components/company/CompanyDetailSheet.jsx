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
  Unlock,
  BarChart3,
  PieChart
} from "lucide-react";
import { CompanyLogo } from "./CompanyLogos.jsx";
import { AIContentRenderer } from "../ai/AIContentRenderer.jsx";
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
      <div className="company-sheet-page" style={{ padding: "30px 0", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#c084fc", fontWeight: "700", fontSize: "0.82rem" }}>
          <Sparkles className="animate-spin" size={16} />
          <span>Generating Real-Time {companyId?.toUpperCase()} Preparation Sheet...</span>
        </div>
      </div>
    );
  }

  const diffClass = (company.difficulty || "Medium").toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="company-sheet-page">
      {/* 1. COMPACT HERO SECTION */}
      <div className="company-detail-hero">
        <div className="company-detail-top-bar">
          <button type="button" className="company-back-btn" onClick={onBack}>
            <ArrowLeft size={13} />
            <span>Back to All Companies</span>
          </button>
          <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
            <span className="company-tier-badge">
              {company.tier || "Tier 1 Tech"}
            </span>
            <span className={`company-diff-badge ${diffClass}`}>
              <Zap size={11} className="diff-icon" />
              <span>{company.difficulty} Interview Bar</span>
            </span>
          </div>
        </div>

        <div className="company-detail-brand">
          <div className="company-detail-logo-wrap">
            <CompanyLogo name={company.name} size={26} />
          </div>
          <div className="company-detail-headings">
            <div className="company-title-row">
              <h1 className="company-heading-name">{company.name}</h1>
              <span className="company-heading-sub">Interview Preparation Sheet</span>
            </div>
            {company.description && (
              <p className="company-desc-clamp">{company.description}</p>
            )}
          </div>
        </div>

        {/* Dynamic Top 5-Stat Row */}
        <div className="company-stats-grid">
          <div className="company-stat-card">
            <div className="stat-head">
              <Layers size={13} className="stat-icon-purple" />
              <span className="stat-label">Total Problems</span>
            </div>
            <span className="stat-val">{stats.totalProblems}</span>
            <span className="stat-sub">Curated for {company.name}</span>
          </div>

          <div className="company-stat-card">
            <div className="stat-head">
              <CheckCircle2 size={13} className="stat-icon-green" />
              <span className="stat-label">Solved by You</span>
            </div>
            <span className="stat-val stat-val-solved">
              {stats.solvedCount}
            </span>
            <span className="stat-sub">{stats.attemptedCount} attempted</span>
          </div>

          <div className="company-stat-card">
            <div className="stat-head">
              <TrendingUp size={13} className="stat-icon-blue" />
              <span className="stat-label">Accuracy Rate</span>
            </div>
            <span className="stat-val stat-val-accuracy">
              {stats.accuracy}%
            </span>
            <span className="stat-sub">On company problems</span>
          </div>

          <div className="company-stat-card">
            <div className="stat-head">
              <PieChart size={13} className="stat-icon-purple" />
              <span className="stat-label">Completion</span>
            </div>
            <span className="stat-val stat-val-completion">
              {stats.completionPercentage}%
            </span>
            <span className="stat-sub">Real user progress</span>
          </div>

          <div className="company-stat-card">
            <div className="stat-head">
              <BarChart3 size={13} className="stat-icon-amber" />
              <span className="stat-label">Difficulty Depth</span>
            </div>
            <div className="stat-diff-depth">
              <span className="diff-e">E: {stats.difficultyProgress?.easy?.solved || 0}/{stats.difficultyProgress?.easy?.total || 0}</span>
              <span className="diff-m">M: {stats.difficultyProgress?.medium?.solved || 0}/{stats.difficultyProgress?.medium?.total || 0}</span>
              <span className="diff-h">H: {stats.difficultyProgress?.hard?.solved || 0}/{stats.difficultyProgress?.hard?.total || 0}</span>
            </div>
            <span className="stat-sub">Easy / Med / Hard</span>
          </div>
        </div>
      </div>

      {/* 2. COMPACT PERSONALIZED COMPANY READINESS */}
      <div className="company-readiness-card">
        <div className="company-readiness-head">
          <div className="company-readiness-score-wrap">
            <div className="company-readiness-circle">
              {readiness.score}
            </div>
            <div>
              <h3 className="readiness-title">
                Your {company.name} Interview Readiness
              </h3>
              <p className="readiness-subtitle">
                Calculated from your verified solve counts, submission accuracy, and difficulty distribution.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="company-launch-mock-btn"
            onClick={() => navigate("/interviewer?tab=interview")}
          >
            <Compass size={13} />
            <span>Launch Mock Interview →</span>
          </button>
        </div>

        <div className="company-readiness-cols">
          <div className="company-readiness-box">
            <h4 className="readiness-box-head strong-head">
              <CheckCircle2 size={13} />
              <span>Strong Areas</span>
            </h4>
            {readiness.strongTopics && readiness.strongTopics.length > 0 ? (
              <ul>
                {readiness.strongTopics.map((topic, i) => (
                  <li key={i}>✓ {topic}</li>
                ))}
              </ul>
            ) : (
              <p className="readiness-empty">
                Solve more problems in this sheet to establish strong domains.
              </p>
            )}
          </div>

          <div className="company-readiness-box">
            <h4 className="readiness-box-head weak-head">
              <AlertTriangle size={13} />
              <span>Priority Gaps & Needs Work</span>
            </h4>
            {readiness.weakTopics && readiness.weakTopics.length > 0 ? (
              <ul>
                {readiness.weakTopics.map((topic, i) => (
                  <li key={i}>⚠ {topic}</li>
                ))}
              </ul>
            ) : (
              <p className="readiness-empty" style={{ color: "#059669" }}>
                No critical topic gaps detected!
              </p>
            )}
          </div>

          <div className="company-readiness-box">
            <h4 className="readiness-box-head action-head">
              <Target size={13} />
              <span>Recommended Next Action</span>
            </h4>
            <ul>
              {(readiness.recommendedNext || []).map((rec, i) => (
                <li key={i} className="readiness-action-item">
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
          <Layers size={15} className="stat-icon-purple" />
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
                <div className="company-topic-stats">
                  <span>{t.userSolved} / {t.problemsAvailable} solved</span>
                  <span className="topic-pct">{t.progressPercent}%</span>
                </div>
                <div className="company-progress-bar-bg" style={{ height: "4px" }}>
                  <div
                    className="company-progress-bar-fill"
                    style={{ width: `${Math.min(100, Math.max(0, t.progressPercent))}%` }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.70rem" }}>
                <span style={{ color: "#64748b" }}>Accuracy: {t.accuracy}%</span>
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
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FileCode size={15} className="stat-icon-blue" />
            <strong className="company-table-title">
              {company.name} Interview Problem List ({filteredProblems.length})
            </strong>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <div className="company-search-box">
              <Search size={13} color="#64748b" />
              <input
                type="text"
                placeholder="Filter problem or tag..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
              />
            </div>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="company-filter-select"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="company-filter-select"
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
                const pDiffClass = prob.difficulty.toLowerCase();
                const statusClass = prob.status.toLowerCase().replace(/\s+/g, "-");

                return (
                  <tr key={prob.id}>
                    <td>
                      <Link
                        to={`/problems/${prob.id}`}
                        className="company-table-prob-link"
                      >
                        {prob.title}
                      </Link>
                      <div style={{ display: "flex", gap: "3px", marginTop: "2px" }}>
                        {(prob.interviewTags || []).slice(0, 2).map((t, idx) => (
                          <span key={idx} className="company-topic-pill" style={{ fontSize: "0.62rem", padding: "1px 4px" }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className="company-table-topic">{prob.topic}</span>
                    </td>
                    <td>
                      <span className={`company-diff-badge ${pDiffClass}`}>
                        {prob.difficulty}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "1px", color: "#fbbf24" }}>
                        {Array.from({ length: prob.companyFrequency || 5 }).map((_, i) => (
                          <Star key={i} size={10} fill="#fbbf24" color="#fbbf24" />
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`company-status-badge ${statusClass}`}>
                        {prob.status === "Solved" && <Check size={11} />}
                        {prob.status === "Attempted" && <Clock size={11} />}
                        <span>{prob.status}</span>
                      </span>
                    </td>
                    <td className="company-table-last-attempt">
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
                        <Play size={11} />
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
          <TrendingUp size={15} className="stat-icon-green" />
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
                  <span className="company-roadmap-step">
                    STEP {step.step}
                  </span>
                  {isMastered && <CheckCircle2 size={13} className="roadmap-icon-mastered" />}
                  {isInProgress && <Unlock size={13} className="roadmap-icon-progress" />}
                  {isLocked && <Lock size={13} className="roadmap-icon-locked" />}
                </div>

                <strong className="company-roadmap-topic">
                  {step.topic}
                </strong>
                <p className="company-roadmap-desc">
                  {step.description}
                </p>

                <div style={{ marginTop: "auto", paddingTop: "4px", fontSize: "0.70rem" }}>
                  <span className={`company-roadmap-status-text ${step.status.toLowerCase().replace(/\s+/g, "-")}`}>
                    {isMastered ? "✓ Mastered" : isInProgress ? "→ In Progress" : "🔒 Locked"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. AI COMPANY COACH */}
      <div className="company-ai-coach-card">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Sparkles size={16} className="stat-icon-purple" />
          <h3 className="company-ai-title">
            Ask Judgo Intelligence about {company.name}
          </h3>
        </div>
        <p className="company-ai-desc">
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
          <div className="company-ai-chat-history">
            {aiMessages.map((msg) => (
              <div
                key={msg.id}
                className={`company-ai-msg ${msg.role}`}
              >
                {msg.role === "assistant" ? (
                  <AIContentRenderer content={msg.content} compact />
                ) : (
                  <div className="company-ai-user-bubble">{msg.content}</div>
                )}
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
            <Send size={13} />
            <span>{aiLoading ? "Thinking..." : "Ask Coach"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CompanyDetailSheet;
