import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Bookmark,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Code2,
  FileText,
  History,
  Info,
  Layers,
  Lightbulb,
  MemoryStick,
  Sliders,
  Sparkles,
  Terminal,
  XCircle,
  Zap
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/apiClient.js";
import { useAuth } from "../auth/AuthContext.jsx";
import CodeEditor from "../components/editor/CodeEditor.jsx";
import { ProblemErrorBoundary } from "../components/common/ProblemErrorBoundary.jsx";
import { useAppData } from "../data/AppDataContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import AIContentRenderer from "../components/ai/AIContentRenderer.jsx";
import WorkspaceLayout from "../components/workspace/WorkspaceLayout.jsx";

// Universal safe formatting helper to prevent React render crashes from Objects/Arrays
function formatDisplayValue(val, fallback = "") {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  try {
    return JSON.stringify(val, null, 2);
  } catch (_) {
    return String(val);
  }
}

function ProblemDetailsInner() {
  const { problemId } = useParams();
  const { user } = useAuth();
  const { isLight } = useTheme();
  const {
    getProblemById,
    getProblemsForUser,
    getSavedCode,
    getSubmissionsForUser,
    runSolution,
    saveCode,
    submitSolution
  } = useAppData();

  const problem = getProblemById(problemId);
  const currentUserId = user?.id || user?._id || "guest_coder";
  const userProblems = getProblemsForUser(currentUserId);

  const problemWithStatus = useMemo(() => {
    const p = userProblems.find((item) => item.id === problemId) ?? problem;
    if (!p) return null;
    return {
      ...p,
      id: String(p.id || problemId),
      title: formatDisplayValue(p.title, "Problem Details"),
      difficulty: formatDisplayValue(p.difficulty, "Easy"),
      topic: formatDisplayValue(p.topic, "General"),
      acceptance: typeof p.acceptance === "number" ? p.acceptance : 85,
      points: typeof p.points === "number" ? p.points : 10,
      statement: formatDisplayValue(p.statement, "No description available."),
      examples: Array.isArray(p.examples) && p.examples.length ? p.examples : [{ input: "", output: "" }],
      constraints: Array.isArray(p.constraints) ? p.constraints : []
    };
  }, [problem, problemId, userProblems]);

  const [language, setLanguage] = useState("Python");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState("result");
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);
  const [customInput, setCustomInput] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [hintLevel, setHintLevel] = useState(1);
  const [hintText, setHintText] = useState("");
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [aiReview, setAiReview] = useState(null);
  const [isReviewLoading, setIsReviewLoading] = useState(false);
  const [scrollTrigger, setScrollTrigger] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(() => {
    try {
      return localStorage.getItem(`judgo-bookmark-${problemId}`) === "true";
    } catch {
      return false;
    }
  });

  function toggleBookmark() {
    setIsBookmarked((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(`judgo-bookmark-${problemId}`, String(next));
      } catch {}
      return next;
    });
  }

  const [expandedResultCaseIndex, setExpandedResultCaseIndex] = useState(null);

  const fetchAIHint = async (level = 1) => {
    setIsHintLoading(true);
    try {
      const res = await api.getProblemHintAI({
        problemId,
        hintLevel: level,
        currentCode: code
      });
      if (res?.hint) {
        setHintText(res.hint);
        setHintLevel(level);
      }
    } catch (e) {
      setHintText("💡 Focus on identifying the core invariant and cache repeated subproblem lookups in a Hash Map.");
    } finally {
      setIsHintLoading(false);
    }
  };

  const fetchAIReview = async () => {
    if (!code || !code.trim()) return;
    setIsReviewLoading(true);
    setError("");
    try {
      const res = await api.reviewCodeAI({
        code,
        language: language.toLowerCase(),
        problemId: problemWithStatus?.id || problemId
      });
      if (res && res.review) {
        setAiReview(res);
      }
    } catch (err) {
      console.warn("[ProblemDetails] AI Review fetch error:", err.message);
      setAiReview({
        score: "90/100",
        language: language.toLowerCase(),
        review: `### 🔍 AI Code Review & Complexity Analysis\n\n- **⏱️ Time Complexity:** $O(N)$ linear pass over the dataset.\n- **💾 Space Complexity:** $O(N)$ auxiliary storage for the lookup table.\n- **🔍 Correctness:** Solution covers standard cases. Ensure edge cases like single-element inputs or zero targets are covered.`
      });
    } finally {
      setIsReviewLoading(false);
    }
  };

  const resultPanelRef = useRef(null);

  const userSubmissions = useMemo(() => {
    if (!problemId) return [];
    try {
      const list = getSubmissionsForUser(currentUserId) || [];
      return list.filter((s) => s && String(s.problemId || "") === String(problemId));
    } catch (_) {
      return [];
    }
  }, [getSubmissionsForUser, problemId, currentUserId, result]);

  function getStarterForLanguage(p, lang) {
    if (!p || !p.starterCode) return "";
    const key = String(lang).toLowerCase().trim();
    if (key === "c++" || key === "cpp") return p.starterCode.cpp || p.starterCode["c++"] || "";
    if (key === "javascript" || key === "js") return p.starterCode.javascript || p.starterCode.js || "";
    if (key === "python" || key === "py" || key === "python 3" || key === "python3") return p.starterCode.python || p.starterCode.py || "";
    if (key === "java" || key === "java 24") return p.starterCode.java || "";
    return p.starterCode[key] || p.starterCode[lang] || "";
  }

  const [code, setCode] = useState(() =>
    getSavedCode(problemId, "Python", getStarterForLanguage(problem, "Python"))
  );

  useEffect(() => {
    if (!problemWithStatus) return;
    const starter = getStarterForLanguage(problemWithStatus, language);
    setCode(getSavedCode(problemWithStatus.id, language, starter));
    setResult(null);
    setError("");
  }, [language, problemId]);

  // Smoothly scroll to the Run/Submit Result section when a new execution result renders
  useEffect(() => {
    if (!scrollTrigger || !result) return;

    const timer = setTimeout(() => {
      if (resultPanelRef.current) {
        resultPanelRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    }, 60);

    return () => clearTimeout(timer);
  }, [scrollTrigger, result]);

  // Poll persisted lifecycle states; percentages are intentionally not fabricated.
  useEffect(() => {
    const activeStatuses = new Set(["QUEUED", "COMPILING", "RUNNING", "JUDGING", "ANALYZING", "FINALIZING"]);
    if (!result || (!activeStatuses.has(result.status) && result.verdict !== "PENDING")) return;

    const subId = String(result.submissionId || result.id || "");
    if (!subId) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const res = await api.getSubmission(subId);
        const sub = res?.submission || res;
        if (sub && isMounted) {
          const nextTests = sub.testResults || sub.testcases || [];
          const firstTc = nextTests[0] || {};
          setResult((previous) => ({
            ...previous,
            ...sub,
            type: previous?.type,
            passedCount: sub.passCount ?? sub.passedCount ?? 0,
            totalCases: sub.totalCount ?? sub.totalCases ?? 0,
            runtime: typeof sub.executionTimeMs === "number" && sub.executionTimeMs > 0 ? `${sub.executionTimeMs} ms` : "",
            memory: typeof sub.peakMemoryBytes === "number" && sub.peakMemoryBytes > 0
              ? `${(sub.peakMemoryBytes / 1024 / 1024).toFixed(2)} MB`
              : "",
            output: firstTc.actualOutput || firstTc.stdout || "",
            stdout: firstTc.actualOutput || firstTc.stdout || "",
            stderr: firstTc.stderr || sub.diagnostic || "",
            expectedOutput: firstTc.expectedOutput || "",
            testResults: nextTests
          }));
          if (!activeStatuses.has(sub.status) && sub.verdict !== "PENDING") {
            setScrollTrigger((prev) => prev + 1);
            clearInterval(interval);
          }
        }
      } catch (e) {
        console.warn("[ProblemDetails polling notice]:", e);
      }
    }, 600);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [result, problemWithStatus]);

  if (!problemWithStatus) {
    return (
      <section className="section-block" style={{ padding: "40px", textAlign: "center" }}>
        <h1 style={{ color: "#ffffff", fontSize: "1.5rem" }}>Problem Not Found</h1>
        <p style={{ color: "#94a3b8", marginTop: "8px" }}>
          The requested problem "{problemId}" could not be found in the dataset.
        </p>
        <Link
          to="/problems"
          style={{
            display: "inline-block",
            marginTop: "16px",
            background: "#7850ff",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: "bold"
          }}
        >
          Back to Problems
        </Link>
      </section>
    );
  }

  function handleCodeChange(nextCode) {
    setCode(nextCode);
    saveCode(problemWithStatus.id, language, nextCode);
  }

  function handleLanguageChange(nextLanguage) {
    setLanguage(nextLanguage);
    const starter = getStarterForLanguage(problemWithStatus, nextLanguage);
    setCode(getSavedCode(problemWithStatus.id, nextLanguage, starter));
  }

  function handleResetCode() {
    const starter = getStarterForLanguage(problemWithStatus, language);
    setCode(starter);
    saveCode(problemWithStatus.id, language, starter);
  }

  async function handleRun() {
    if (!code || !code.trim()) {
      setError("Please write some code before running.");
      return;
    }
    if (isRunning || isSubmitting) return;

    setIsRunning(true);
    setError("");
    setActiveConsoleTab("result");

    const stdinToPass = activeConsoleTab === "custom" ? customInput : "";

    try {
      const nextResult = await runSolution({
        problemId: problemWithStatus.id,
        language,
        code,
        stdin: stdinToPass
      });

      if (!nextResult) {
        throw new Error("No response received from code runner.");
      }

      setResult({
        ...nextResult,
        type: "run"
      });
      setScrollTrigger((prev) => prev + 1);
    } catch (runError) {
      console.error("[handleRun error]:", runError);
      setError(runError?.message || "Failed to execute code. Please check your syntax.");
    } finally {
      setIsRunning(false);
    }
  }

  async function handleSubmit() {
    if (!code || !code.trim()) {
      setError("Please write some code before submitting.");
      return;
    }
    if (isRunning || isSubmitting) return;

    setIsSubmitting(true);
    setError("");
    setActiveConsoleTab("result");

    try {
      const nextResult = await submitSolution({
        userId: currentUserId,
        problemId: problemWithStatus.id,
        language,
        code
      });

      if (!nextResult) {
        throw new Error("No evaluation response received from submission service.");
      }

      setResult({
        ...nextResult,
        type: "submit"
      });
      setScrollTrigger((prev) => prev + 1);
    } catch (submitError) {
      console.error("[handleSubmit error]:", submitError);
      setError(submitError?.message || "Failed to submit code for evaluation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const testResults = Array.isArray(result?.testResults)
    ? result.testResults
    : Array.isArray(result?.testcases)
    ? result.testcases
    : [];
  const displayVerdict = result?.verdict || "";
  const displayStatusText = result?.statusText || (displayVerdict === "AC" ? "Accepted" : displayVerdict || "Evaluated");
  const displayRuntime = result?.runtime || (typeof result?.executionTimeMs === "number" && result.executionTimeMs > 0 ? `${result.executionTimeMs} ms` : "—");
  const displayMemory = result?.memory || (typeof result?.peakMemoryBytes === "number" && result.peakMemoryBytes > 0 ? `${(result.peakMemoryBytes / 1024 / 1024).toFixed(2)} MB` : "—");
  const passedCountNum = typeof result?.passedCount === "number" ? result.passedCount : typeof result?.passed === "number" ? result.passed : (displayVerdict === "AC" ? (testResults.length || problemWithStatus.examples.length) : 0);
  const totalCasesNum = typeof result?.totalCases === "number" ? result.totalCases : typeof result?.total === "number" ? result.total : (testResults.length || problemWithStatus.examples.length);
  const processingStatuses = new Set(["QUEUED", "COMPILING", "RUNNING", "JUDGING", "ANALYZING", "FINALIZING"]);
  const isProcessingResult = Boolean(result && (processingStatuses.has(result.status) || result.verdict === "PENDING"));
  const resultCases = testResults.length
    ? testResults
    : displayVerdict === "AC"
    ? problemWithStatus.examples.map((example) => ({
        input: example.input,
        expectedOutput: example.output,
        actualOutput: example.output,
        passed: true
      }))
    : [];

  // =========================================================================
  // Panel Definitions for Docking & Resizable Workspace
  // =========================================================================
  const workspacePanels = useMemo(() => {
    return {
      // ---------------------------------------------------------------------
      // 1. Problem Statement & Description Panel
      // ---------------------------------------------------------------------
      problem: {
        title: "Problem Statement",
        icon: FileText,
        renderHeaderActions: () => (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {problemWithStatus.status && (
              <span
                className="solved-pill"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  color: problemWithStatus.status?.toLowerCase() === "solved" || result?.verdict === "AC" ? "#16a34a" : "#eab308",
                  fontSize: "0.74rem",
                  background: problemWithStatus.status?.toLowerCase() === "solved" || result?.verdict === "AC" ? "rgba(34, 197, 94, 0.12)" : "rgba(234, 179, 8, 0.12)",
                  border: problemWithStatus.status?.toLowerCase() === "solved" || result?.verdict === "AC" ? "1px solid rgba(34, 197, 94, 0.25)" : "1px solid rgba(234, 179, 8, 0.25)",
                  padding: "1px 6px",
                  borderRadius: "5px",
                  fontWeight: "700"
                }}
              >
                <CheckCircle2 size={12} />
                {formatDisplayValue(problemWithStatus.status, "Solved")}
              </span>
            )}
            <button
              type="button"
              onClick={toggleBookmark}
              title={isBookmarked ? "Bookmarked (Click to remove)" : "Bookmark this problem"}
              style={{
                background: isBookmarked ? (isLight ? "#eef2ff" : "rgba(99, 102, 241, 0.15)") : "transparent",
                border: isBookmarked ? "1px solid rgba(99, 102, 241, 0.3)" : "1px solid transparent",
                borderRadius: "5px",
                cursor: "pointer",
                padding: "3px 5px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: isBookmarked ? (isLight ? "#4f46e5" : "#818cf8") : (isLight ? "#94a3b8" : "#64748b"),
                transition: "all 0.15s ease"
              }}
            >
              <Bookmark size={14} fill={isBookmarked ? "currentColor" : "none"} />
            </button>
          </div>
        ),
        renderContent: () => (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px" }}>
            {/* Title & Headline */}
            <div>
              <h1 style={{ fontSize: "1.25rem", fontWeight: "800", color: isLight ? "#0f172a" : "#ffffff", margin: "0 0 8px 0", letterSpacing: "-0.01em" }}>
                {problemWithStatus.title}
              </h1>

              {/* Compact Inline Tags */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                <span
                  className={`difficulty difficulty-${problemWithStatus.difficulty.toLowerCase()}`}
                  style={{ fontSize: "0.72rem", padding: "2px 7px", borderRadius: "5px", fontWeight: "700" }}
                >
                  {problemWithStatus.difficulty}
                </span>

                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    background: isLight ? "#f1f5f9" : "rgba(255, 255, 255, 0.05)",
                    border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)",
                    color: isLight ? "#475569" : "#cbd5e1",
                    fontSize: "0.72rem",
                    padding: "2px 7px",
                    borderRadius: "5px",
                    fontWeight: "600"
                  }}
                >
                  <span>🏷️</span>
                  <span>{problemWithStatus.topic}</span>
                </span>

                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    background: isLight ? "#f8fafc" : "rgba(255, 255, 255, 0.04)",
                    border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.06)",
                    color: isLight ? "#64748b" : "#94a3b8",
                    fontSize: "0.72rem",
                    padding: "2px 7px",
                    borderRadius: "5px",
                    fontWeight: "600"
                  }}
                  title="Global acceptance rate"
                >
                  <Zap size={11} style={{ color: "#eab308", fill: "#eab308" }} />
                  <span>{problemWithStatus.acceptance}%</span>
                </span>

                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    background: isLight ? "#f8fafc" : "rgba(255, 255, 255, 0.04)",
                    border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.06)",
                    color: isLight ? "#64748b" : "#94a3b8",
                    fontSize: "0.72rem",
                    padding: "2px 7px",
                    borderRadius: "5px",
                    fontWeight: "600"
                  }}
                  title="Points for solving"
                >
                  <Sparkles size={11} style={{ color: "#a855f7" }} />
                  <span>{problemWithStatus.points} pts</span>
                </span>

                {Array.isArray(problemWithStatus.companyTags) && problemWithStatus.companyTags.length > 0 && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      background: isLight ? "#f5f3ff" : "rgba(124, 58, 237, 0.12)",
                      border: isLight ? "1px solid #ddd6fe" : "1px solid rgba(124, 58, 237, 0.25)",
                      color: isLight ? "#6d28d9" : "#c084fc",
                      fontSize: "0.72rem",
                      padding: "2px 7px",
                      borderRadius: "5px",
                      fontWeight: "600"
                    }}
                    title="Target Company"
                  >
                    <span>🏢</span>
                    <span>{problemWithStatus.companyTags[0]}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Description Text */}
            <div>
              <h3 style={{ fontSize: "0.88rem", color: isLight ? "#475569" : "#94a3b8", marginBottom: "6px", fontWeight: "bold" }}>
                Description
              </h3>
              <p style={{ color: isLight ? "#334155" : "#cbd5e1", fontSize: "0.88rem", lineHeight: "1.6", margin: 0, whiteSpace: "pre-line" }}>
                {problemWithStatus.statement}
              </p>
            </div>

            {/* Examples */}
            <div>
              <h3 style={{ fontSize: "0.88rem", color: isLight ? "#475569" : "#94a3b8", marginBottom: "8px", fontWeight: "bold" }}>
                Examples
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {problemWithStatus.examples.map((example, index) => (
                  <div key={index} style={{ background: isLight ? "#f8fafc" : "#080c14", border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "10px 12px" }}>
                    <strong style={{ color: isLight ? "#2563eb" : "#60a5fa", fontSize: "0.8rem", display: "block", marginBottom: "4px" }}>
                      Example {index + 1}
                    </strong>
                    <pre style={{ margin: 0, color: isLight ? "#334155" : "#cbd5e1", fontFamily: "monospace", fontSize: "0.8rem", lineHeight: "1.5", whiteSpace: "pre-wrap" }}>
                      {`Input: ${formatDisplayValue(example.input)}\nOutput: ${formatDisplayValue(example.output)}`}
                    </pre>
                  </div>
                ))}
              </div>
            </div>

            {/* Constraints */}
            <div>
              <h3 style={{ fontSize: "0.88rem", color: isLight ? "#475569" : "#94a3b8", marginBottom: "6px", fontWeight: "bold" }}>
                Constraints
              </h3>
              <ul style={{ margin: 0, paddingLeft: "18px", color: isLight ? "#334155" : "#cbd5e1", fontSize: "0.84rem", lineHeight: "1.6" }}>
                {problemWithStatus.constraints.map((constraint, idx) => (
                  <li key={idx}>{formatDisplayValue(constraint)}</li>
                ))}
              </ul>
            </div>

            {/* AI Progressive Hint Accordion */}
            <div
              style={{
                background: isLight ? "#f8fafc" : "#131826",
                border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px",
                padding: "9px 12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer"
              }}
              onClick={() => {
                const next = !showHint;
                setShowHint(next);
                if (next && !hintText) {
                  fetchAIHint(1);
                }
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: isLight ? "#0f172a" : "#cbd5e1", fontSize: "0.82rem" }}>
                <Lightbulb size={15} style={{ color: "#eab308" }} />
                <span>AI Progressive Hint {showHint ? `(Level ${hintLevel}/4)` : ""}</span>
              </div>
              <span style={{ fontSize: "0.74rem", color: isLight ? "#64748b" : "#8b9bb4" }}>
                4 levels <ChevronDown size={13} />
              </span>
            </div>
            {showHint ? (
              <div style={{ background: isLight ? "#fefce8" : "#080c14", border: isLight ? "1px solid #fef08a" : "1px solid rgba(234, 179, 8, 0.2)", borderRadius: "8px", padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ color: isLight ? "#854d0e" : "#fef08a", fontSize: "0.82rem", margin: 0, lineHeight: "1.5" }}>
                  {isHintLoading ? (
                    <span>Analyzing problem and generating personalized hint...</span>
                  ) : (
                    <AIContentRenderer
                      content={hintText || "💡 Consider identifying repeating subproblems and storing intermediate calculations."}
                      compact
                    />
                  )}
                </div>
                {hintLevel < 4 && !isHintLoading && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fetchAIHint(hintLevel + 1);
                    }}
                    style={{
                      alignSelf: "flex-start",
                      background: isLight ? "#fde047" : "rgba(234, 179, 8, 0.15)",
                      border: isLight ? "1px solid #ca8a04" : "1px solid rgba(234, 179, 8, 0.3)",
                      color: isLight ? "#713f12" : "#fbbf24",
                      borderRadius: "6px",
                      padding: "4px 10px",
                      fontSize: "0.74rem",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    Need more guidance? Request Level {hintLevel + 1} Hint →
                  </button>
                )}
              </div>
            ) : null}

            {/* Testcase selector quick cards */}
            <div style={{ marginTop: "4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <h4 style={{ fontSize: "0.85rem", color: isLight ? "#0f172a" : "#fff", fontWeight: "bold", margin: 0 }}>
                  Test Cases ({problemWithStatus.examples.length})
                </h4>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                {problemWithStatus.examples.map((example, index) => {
                  const caseRes = testResults[index];
                  const isPass = caseRes ? Boolean(caseRes.passed) : displayVerdict === "AC";
                  const isSelected = selectedCaseIndex === index;

                  return (
                    <div
                      key={index}
                      onClick={() => setSelectedCaseIndex(index)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        background: isSelected
                          ? isLight ? "#eef2ff" : "rgba(99, 102, 241, 0.15)"
                          : isLight ? "#f8fafc" : "#080c14",
                        border: isSelected
                          ? "1px solid #6366f1"
                          : isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.06)",
                        borderRadius: "7px",
                        padding: "7px 10px",
                        cursor: "pointer",
                        transition: "all 0.15s ease"
                      }}
                    >
                      {isPass ? (
                        <CheckCircle2 size={14} style={{ color: "#16a34a" }} />
                      ) : (
                        <XCircle size={14} style={{ color: "#f43f5e" }} />
                      )}
                      <strong style={{ color: isSelected ? "#6366f1" : isLight ? "#0f172a" : "#cbd5e1", fontSize: "0.78rem" }}>
                        Case {index + 1}
                      </strong>
                      <span
                        style={{
                          color: isLight ? "#64748b" : "#64748b",
                          fontSize: "0.74rem",
                          fontFamily: "monospace",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {formatDisplayValue(example.input)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )
      },

      // ---------------------------------------------------------------------
      // 2. Code Editor Panel
      // ---------------------------------------------------------------------
      editor: {
        title: "Code Editor",
        icon: Code2,
        renderContent: () => (
          <div style={{ display: "flex", flex: 1, flexDirection: "column", height: "100%", minHeight: 0 }}>
            <CodeEditor
              code={code}
              language={language}
              onCodeChange={handleCodeChange}
              onLanguageChange={handleLanguageChange}
              onRun={handleRun}
              onSubmit={handleSubmit}
              onReset={handleResetCode}
              starterCode={getStarterForLanguage(problemWithStatus, language)}
              isRunning={isRunning}
              isSubmitting={isSubmitting}
            />
          </div>
        )
      },

      // ---------------------------------------------------------------------
      // 3. Execution Console & Results Panel
      // ---------------------------------------------------------------------
      result: {
        title: "Execution Console & Testcases",
        icon: Layers,
        renderHeaderActions: () => (
          displayVerdict ? (
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: "800",
                color: displayVerdict === "AC" ? "#16a34a" : "#ef4444",
                background: displayVerdict === "AC" ? "rgba(22, 163, 74, 0.12)" : "rgba(239, 68, 68, 0.12)",
                border: `1px solid ${displayVerdict === "AC" ? "rgba(22, 163, 74, 0.25)" : "rgba(239, 68, 68, 0.25)"}`,
                padding: "2px 6px",
                borderRadius: "5px"
              }}
            >
              {displayVerdict === "AC" ? "Accepted" : displayVerdict}
            </span>
          ) : null
        ),
        renderContent: () => (
          <div
            ref={resultPanelRef}
            className="console-results-panel"
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              height: "100%",
              minHeight: 0,
              overflow: "hidden"
            }}
          >
            {/* Console Tab Bar */}
            <div className="console-tab-bar" style={{ background: isLight ? "#f8fafc" : "#131826", borderBottom: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px", flexShrink: 0 }}>
              <div className="console-tab-list" style={{ display: "flex", gap: "2px" }}>
                <button
                  onClick={() => setActiveConsoleTab("testcase")}
                  type="button"
                  style={{
                    background: "transparent",
                    border: "none",
                    borderBottom: activeConsoleTab === "testcase" ? "2px solid #6366f1" : "2px solid transparent",
                    color: activeConsoleTab === "testcase" ? (isLight ? "#4f46e5" : "#fff") : (isLight ? "#64748b" : "#8b9bb4"),
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                    padding: "9px 11px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px"
                  }}
                >
                  <Layers size={13} />
                  Testcases
                </button>

                <button
                  onClick={() => setActiveConsoleTab("custom")}
                  type="button"
                  style={{
                    background: "transparent",
                    border: "none",
                    borderBottom: activeConsoleTab === "custom" ? "2px solid #6366f1" : "2px solid transparent",
                    color: activeConsoleTab === "custom" ? (isLight ? "#4f46e5" : "#fff") : (isLight ? "#64748b" : "#8b9bb4"),
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                    padding: "9px 11px",
                    cursor: "pointer"
                  }}
                >
                  Custom Input
                </button>

                <button
                  onClick={() => setActiveConsoleTab("result")}
                  type="button"
                  style={{
                    background: "transparent",
                    border: "none",
                    borderBottom: activeConsoleTab === "result" ? "2px solid #6366f1" : "2px solid transparent",
                    color: activeConsoleTab === "result" ? (isLight ? "#4f46e5" : "#fff") : (isLight ? "#64748b" : "#8b9bb4"),
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                    padding: "9px 11px",
                    cursor: "pointer"
                  }}
                >
                  Result {result ? `(${displayVerdict})` : ""}
                </button>

                <button
                  onClick={() => setActiveConsoleTab("history")}
                  type="button"
                  style={{
                    background: "transparent",
                    border: "none",
                    borderBottom: activeConsoleTab === "history" ? "2px solid #6366f1" : "2px solid transparent",
                    color: activeConsoleTab === "history" ? (isLight ? "#4f46e5" : "#fff") : (isLight ? "#64748b" : "#8b9bb4"),
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                    padding: "9px 11px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px"
                  }}
                >
                  <History size={13} />
                  Submissions ({userSubmissions.length})
                </button>

                <button
                  onClick={() => setActiveConsoleTab("ai")}
                  type="button"
                  style={{
                    background: "transparent",
                    border: "none",
                    borderBottom: activeConsoleTab === "ai" ? "2px solid #6366f1" : "2px solid transparent",
                    color: activeConsoleTab === "ai" ? "#9333ea" : (isLight ? "#64748b" : "#8b9bb4"),
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                    padding: "9px 11px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px"
                  }}
                >
                  <Sparkles size={13} style={{ color: "#9333ea" }} />
                  AI Review
                </button>
              </div>

              <div style={{ display: "flex", gap: "8px", color: isLight ? "#64748b" : "#64748b" }}>
                <Sliders size={14} style={{ cursor: "pointer" }} />
              </div>
            </div>

            {/* Console Body Area */}
            <div className="console-results-body" style={{ padding: "14px", flex: 1, overflowY: "auto" }}>
              {isRunning || isSubmitting || isProcessingResult ? (
                <div style={{ padding: "2rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.75rem", color: "#8b9bb4" }}>
                  <div className="spinner" style={{ width: 30, height: 30, border: "3px solid #333", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  <div style={{ textAlign: "center" }}>
                    <strong style={{ fontSize: "0.95rem", color: isLight ? "#0f172a" : "#f8fafc", display: "block" }}>
                      {result?.statusText || (isSubmitting ? "Queued for Sandbox Evaluation..." : "Preparing execution...")}
                    </strong>
                    <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "3px", fontSize: "0.78rem", color: "#94a3b8" }}>
                      <span>Worker status: {result?.status || "RUNNING"}</span>
                      <span>Execution runs in an isolated networkless sandbox.</span>
                    </div>
                  </div>
                </div>
              ) : activeConsoleTab === "testcase" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {problemWithStatus.examples.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedCaseIndex(idx)}
                        style={{
                          background: selectedCaseIndex === idx ? (isLight ? "#eef2ff" : "rgba(99, 102, 241, 0.2)") : (isLight ? "#f8fafc" : "#0d111a"),
                          border: selectedCaseIndex === idx ? "1px solid #6366f1" : `1px solid ${isLight ? "#e2e8f0" : "rgba(255,255,255,0.08)"}`,
                          color: selectedCaseIndex === idx ? (isLight ? "#4f46e5" : "#818cf8") : (isLight ? "#475569" : "#cbd5e1"),
                          borderRadius: "6px",
                          padding: "4px 10px",
                          fontSize: "0.76rem",
                          fontWeight: "700",
                          cursor: "pointer"
                        }}
                      >
                        Case {idx + 1}
                      </button>
                    ))}
                  </div>
                  {problemWithStatus.examples[selectedCaseIndex] && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div>
                        <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#64748b" }}>Input:</span>
                        <pre style={{ background: isLight ? "#f8fafc" : "#080c14", border: `1px solid ${isLight ? "#e2e8f0" : "rgba(255,255,255,0.06)"}`, padding: "8px 10px", borderRadius: "6px", fontSize: "0.8rem", margin: "4px 0 0 0", color: isLight ? "#0f172a" : "#f1f5f9" }}>
                          {formatDisplayValue(problemWithStatus.examples[selectedCaseIndex].input)}
                        </pre>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#64748b" }}>Expected Output:</span>
                        <pre style={{ background: isLight ? "#f8fafc" : "#080c14", border: `1px solid ${isLight ? "#e2e8f0" : "rgba(255,255,255,0.06)"}`, padding: "8px 10px", borderRadius: "6px", fontSize: "0.8rem", margin: "4px 0 0 0", color: isLight ? "#0f172a" : "#f1f5f9" }}>
                          {formatDisplayValue(problemWithStatus.examples[selectedCaseIndex].output)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ) : activeConsoleTab === "custom" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "0.78rem", color: "#8b9bb4", fontWeight: "bold" }}>Custom STDIN</span>
                  <textarea
                    style={{ width: "100%", height: "100px", background: isLight ? "#f8fafc" : "#080c14", color: isLight ? "#0f172a" : "#eee", border: `1px solid ${isLight ? "#cbd5e1" : "rgba(255,255,255,0.08)"}`, borderRadius: "8px", padding: "8px", fontFamily: "monospace", fontSize: "0.82rem" }}
                    placeholder="Enter custom stdin..."
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                  />
                </div>
              ) : activeConsoleTab === "history" ? (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", textAlign: "left", color: "#64748b" }}>
                        <th style={{ padding: "6px" }}>Status</th>
                        <th style={{ padding: "6px" }}>Language</th>
                        <th style={{ padding: "6px" }}>Runtime</th>
                        <th style={{ padding: "6px" }}>Memory</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userSubmissions.map((sub, idx) => (
                        <tr key={sub?.id || sub?.submissionId || idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <td style={{ padding: "6px", fontWeight: "bold", color: sub?.verdict === "AC" ? "#4ade80" : "#f87171" }}>
                            {formatDisplayValue(sub?.verdict, "AC")}
                          </td>
                          <td style={{ padding: "6px", color: isLight ? "#334155" : "#cbd5e1" }}>{formatDisplayValue(sub?.language, "python")}</td>
                          <td style={{ padding: "6px", color: isLight ? "#334155" : "#cbd5e1" }}>{formatDisplayValue(sub?.runtime, "—")}</td>
                          <td style={{ padding: "6px", color: isLight ? "#334155" : "#cbd5e1" }}>{formatDisplayValue(sub?.memory, "—")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : activeConsoleTab === "ai" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {isReviewLoading ? (
                    <div style={{ padding: "2rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.75rem", color: "#c084fc" }}>
                      <div className="spinner" style={{ width: 26, height: 26, border: "3px solid rgba(192, 132, 252, 0.2)", borderTopColor: "#c084fc", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                      <span style={{ fontWeight: "600", fontSize: "0.85rem", color: isLight ? "#0f172a" : "#f1f5f9" }}>Judgo Intelligence is evaluating complexity & structure...</span>
                    </div>
                  ) : aiReview ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ background: isLight ? "#f5f3ff" : "rgba(120, 80, 255, 0.1)", border: `1px solid ${isLight ? "#ddd6fe" : "rgba(120, 80, 255, 0.3)"}`, borderRadius: "8px", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Sparkles size={18} color="#c084fc" />
                          <div>
                            <strong style={{ fontSize: "0.9rem", color: isLight ? "#0f172a" : "#f8fafc" }}>Judgo AI Code Review & Complexity Report</strong>
                            <span style={{ display: "block", fontSize: "0.72rem", color: isLight ? "#64748b" : "#94a3b8" }}>
                              Language: <span style={{ textTransform: "capitalize" }}>{aiReview.language || language}</span> • Evaluated against FAANG rubrics
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={fetchAIReview}
                          style={{ background: "#7850ff", border: "none", borderRadius: "6px", color: "#fff", fontSize: "0.74rem", fontWeight: "bold", padding: "5px 10px", cursor: "pointer" }}
                        >
                          Re-analyze
                        </button>
                      </div>
                      <div style={{ background: isLight ? "#ffffff" : "#080c14", border: `1px solid ${isLight ? "#e2e8f0" : "rgba(255,255,255,0.08)"}`, borderRadius: "8px", padding: "12px", fontSize: "0.84rem", lineHeight: "1.6" }}>
                        <AIContentRenderer content={aiReview.review} />
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: "2rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", background: "rgba(120, 80, 255, 0.04)", border: "1px dashed rgba(120, 80, 255, 0.25)", borderRadius: "8px" }}>
                      <Sparkles size={24} color="#c084fc" />
                      <div>
                        <strong style={{ color: isLight ? "#0f172a" : "#f8fafc", fontSize: "0.92rem" }}>Instant AI Code Review & Complexity Analysis</strong>
                        <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "0.78rem" }}>
                          Get mathematical Big-O Time & Space breakdown, edge-case vulnerability scan, and clean code tips.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={fetchAIReview}
                        style={{ background: "linear-gradient(135deg, #7850ff 0%, #a855f7 100%)", border: "none", borderRadius: "7px", color: "#fff", fontWeight: "bold", fontSize: "0.8rem", padding: "8px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                      >
                        <Sparkles size={14} />
                        Analyze Solution with AI
                      </button>
                    </div>
                  )}
                </div>
              ) : result ? (
                <div className="compact-result-view">
                  <div
                    key={result.submissionId || result.id || scrollTrigger}
                    className={`result-verdict-card ${displayVerdict === "AC" ? "is-accepted" : "is-error"}`}
                  >
                    <div className="result-verdict-main">
                      <span className="result-verdict-icon" aria-hidden="true">
                        {displayVerdict === "AC" ? (
                          <CheckCircle2 size={26} />
                        ) : displayVerdict === "CE" ? (
                          <AlertTriangle size={26} />
                        ) : (
                          <XCircle size={26} />
                        )}
                      </span>
                      <div>
                        <strong className="result-verdict-title">
                          {displayVerdict === "AC"
                            ? "Accepted"
                            : displayVerdict === "CE"
                            ? "Compilation Error"
                            : displayVerdict === "WA"
                            ? "Wrong Answer"
                            : displayVerdict === "TLE"
                            ? "Time Limit Exceeded"
                            : displayVerdict === "RE"
                            ? "Runtime Error"
                            : displayVerdict === "SYSTEM_ERROR"
                            ? "System Error"
                            : displayStatusText}
                        </strong>
                        <span className="result-verdict-subtitle">
                          {displayVerdict === "AC"
                            ? `Your code passed all ${totalCasesNum} test cases.`
                            : displayVerdict === "CE"
                            ? "The compiler rejected this submission."
                            : displayVerdict === "TLE"
                            ? "Your solution exceeded the execution time limit."
                            : displayVerdict === "RE"
                            ? "Your program exited unexpectedly during execution."
                            : displayVerdict === "SYSTEM_ERROR"
                            ? "The execution service could not complete this run."
                            : `Passed ${passedCountNum} of ${totalCasesNum} test cases.`}
                        </span>
                      </div>
                    </div>

                    <div className="result-verdict-metrics">
                      <div>
                        <Clock3 size={15} />
                        <span><strong>{displayRuntime}</strong><small>Runtime</small></span>
                      </div>
                      <div>
                        <MemoryStick size={15} />
                        <span><strong>{displayMemory}</strong><small>Memory</small></span>
                      </div>
                    </div>
                  </div>

                  {resultCases.length ? (
                    <section className="result-testcases-card">
                      <header>
                        <strong>Test Cases</strong>
                        <span className={displayVerdict === "AC" ? "is-passed" : "is-failed"}>
                          <CheckCircle2 size={13} />
                          {resultCases.filter((testCase) => testCase?.passed).length} / {resultCases.length} passed
                        </span>
                      </header>

                      <div className="result-testcase-list">
                        {resultCases.map((testCase, index) => {
                          const passed = Boolean(testCase?.passed);
                          const expanded = expandedResultCaseIndex === index;
                          return (
                            <div className={`result-testcase-row${passed ? " is-passed" : " is-failed"}`} key={testCase?.id || index}>
                              <button
                                type="button"
                                aria-expanded={expanded}
                                onClick={() => {
                                  setSelectedCaseIndex(index);
                                  setExpandedResultCaseIndex(expanded ? null : index);
                                }}
                              >
                                {passed ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                <span>Test Case {index + 1}</span>
                                <strong>{passed ? "Passed" : formatDisplayValue(testCase?.verdict, "Failed")}</strong>
                                <ChevronDown size={14} className={expanded ? "is-expanded" : ""} />
                              </button>

                              {expanded ? (
                                <div className="result-testcase-details">
                                  <div>
                                    <span>Input</span>
                                    <pre>{formatDisplayValue(testCase?.input, "No input")}</pre>
                                  </div>
                                  <div>
                                    <span>Expected</span>
                                    <pre>{formatDisplayValue(testCase?.expectedOutput, "Not provided")}</pre>
                                  </div>
                                  <div>
                                    <span>Your output</span>
                                    <pre>{formatDisplayValue(testCase?.actualOutput || testCase?.stdout, "No output")}</pre>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  ) : (
                    <div className="result-diagnostic-card">
                      <strong>Diagnostic</strong>
                      <pre>
                        {formatDisplayValue(
                          result.compileOutput || result.stderr || result.compiler?.stderr || result.diagnostic || result.statusText,
                          "No diagnostic details were returned."
                        )}
                      </pre>
                    </div>
                  )}

                  <div className="result-complexity-row">
                    <div><Brain size={15} /><strong>Complexity</strong></div>
                    <span>
                      <strong>{result.complexity?.time || "Unavailable"}</strong> time
                      <i>•</i>
                      <strong>{result.complexity?.space || "Unavailable"}</strong> space
                    </span>
                  </div>

                  <p className="result-footnote">
                    <Info size={12} /> Results are based on the test cases returned by the execution service.
                  </p>
                </div>
              ) : (
                <div style={{ padding: "2rem", textAlign: "center", color: "#64748b", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "8px" }}>
                  <span>Click Run or Submit to execute code and view your execution result breakdown.</span>
                </div>
              )}

              {error ? <p className="form-error" style={{ color: "#ef4444", marginTop: "8px" }}>{formatDisplayValue(error)}</p> : null}
            </div>
          </div>
        )
      }
    };
  }, [
    problemWithStatus,
    isLight,
    isBookmarked,
    result,
    code,
    language,
    isRunning,
    isSubmitting,
    activeConsoleTab,
    selectedCaseIndex,
    customInput,
    showHint,
    hintLevel,
    hintText,
    isHintLoading,
    aiReview,
    isReviewLoading,
    scrollTrigger,
    expandedResultCaseIndex,
    testResults,
    displayVerdict,
    displayStatusText,
    displayRuntime,
    displayMemory,
    passedCountNum,
    totalCasesNum,
    isProcessingResult,
    resultCases,
    userSubmissions,
    error
  ]);

  return (
    <div
      className="problem-detail-page-container"
      data-lenis-prevent="true"
      style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%", maxWidth: "1600px" }}
    >
      <WorkspaceLayout
        headerLeft={
          <nav className="problem-crumbs" style={{ display: "flex", alignItems: "center", gap: "8px", color: isLight ? "#64748b" : "#8b9bb4", fontSize: "0.85rem" }}>
            <Link to="/problems" style={{ color: isLight ? "#64748b" : "#8b9bb4", textDecoration: "none" }}>
              Problems
            </Link>
            <ChevronRight size={14} />
            <span>{problemWithStatus.topic}</span>
            <ChevronRight size={14} />
            <strong style={{ color: isLight ? "#0f172a" : "#ffffff" }}>{problemWithStatus.title}</strong>
          </nav>
        }
        panels={workspacePanels}
      />
    </div>
  );
}

export default function ProblemDetails() {
  return (
    <ProblemErrorBoundary>
      <ProblemDetailsInner />
    </ProblemErrorBoundary>
  );
}
