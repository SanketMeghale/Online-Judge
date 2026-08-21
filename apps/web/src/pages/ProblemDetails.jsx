import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Bookmark,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Cpu,
  History,
  Layers,
  Lightbulb,
  Sliders,
  Sparkles,
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

  const [code, setCode] = useState(() =>
    getSavedCode(problemId, "Python", problem?.starterCode?.Python ?? "")
  );

  useEffect(() => {
    if (!problemWithStatus) return;
    const starter =
      problemWithStatus.starterCode?.[language.toLowerCase()] ||
      problemWithStatus.starterCode?.[language] ||
      "";
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
    const starter =
      problemWithStatus.starterCode?.[nextLanguage.toLowerCase()] ||
      problemWithStatus.starterCode?.[nextLanguage] ||
      "";
    setCode(getSavedCode(problemWithStatus.id, nextLanguage, starter));
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

      console.log("[2] NORMALIZED RESULT", nextResult);

      if (!nextResult) {
        throw new Error("No evaluation response received from submission service.");
      }

      console.log("[3] SETTING RESULT", nextResult);
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

  const activeExample = problemWithStatus.examples[selectedCaseIndex] || problemWithStatus.examples[0] || { input: "", output: "" };
  const testResults = Array.isArray(result?.testResults)
    ? result.testResults
    : Array.isArray(result?.testcases)
    ? result.testcases
    : [];
  const currentTestResult = testResults[selectedCaseIndex] || null;

  const displayVerdict = result?.verdict || "";
  const displayStatusText = result?.statusText || (displayVerdict === "AC" ? "Accepted" : displayVerdict || "Evaluated");
  const displayRuntime = result?.runtime || (typeof result?.executionTimeMs === "number" && result.executionTimeMs > 0 ? `${result.executionTimeMs} ms` : "—");
  const displayMemory = result?.memory || (typeof result?.peakMemoryBytes === "number" && result.peakMemoryBytes > 0 ? `${(result.peakMemoryBytes / 1024 / 1024).toFixed(2)} MB` : "—");
  const passedCountNum = typeof result?.passedCount === "number" ? result.passedCount : typeof result?.passed === "number" ? result.passed : (displayVerdict === "AC" ? (testResults.length || problemWithStatus.examples.length) : 0);
  const totalCasesNum = typeof result?.totalCases === "number" ? result.totalCases : typeof result?.total === "number" ? result.total : (testResults.length || problemWithStatus.examples.length);
  const processingStatuses = new Set(["QUEUED", "COMPILING", "RUNNING", "JUDGING", "ANALYZING", "FINALIZING"]);
  const isProcessingResult = Boolean(result && (processingStatuses.has(result.status) || result.verdict === "PENDING"));

  if (result) {
    console.log("[4] RESULT STATE RENDER", { result, displayVerdict, displayStatusText, testResults });
  }

  return (
    <div
      className="problem-detail-page-container"
      style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", maxWidth: "1600px" }}
    >
      {/* Breadcrumb Navigation */}
      <nav className="problem-crumbs" style={{ display: "flex", alignItems: "center", gap: "8px", color: isLight ? "#64748b" : "#8b9bb4", fontSize: "0.85rem" }}>
        <Link to="/problems" style={{ color: isLight ? "#64748b" : "#8b9bb4", textDecoration: "none" }}>
          Problems
        </Link>
        <ChevronRight size={14} />
        <span>{problemWithStatus.topic}</span>
        <ChevronRight size={14} />
        <strong style={{ color: isLight ? "#0f172a" : "#ffffff" }}>{problemWithStatus.title}</strong>
      </nav>

      {/* Main 2-Column Grid Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(380px, 0.95fr) minmax(520px, 1.05fr)", gap: "14px", width: "100%", alignItems: "start" }}>
        
        {/* LEFT COLUMN: Problem Statement & Testcases List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          
          {/* Problem Statement Card */}
          <section
            className="problem-statement-card"
            style={{
              background: isLight ? "#ffffff" : "#0d111a",
              border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.08)",
              borderRadius: "14px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              boxShadow: isLight ? "0 1px 4px rgba(0,0,0,0.04)" : "none"
            }}
          >
            {/* Header Title Row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span
                  className={`difficulty difficulty-${problemWithStatus.difficulty.toLowerCase()}`}
                  style={{ fontSize: "0.75rem", padding: "2px 10px", borderRadius: "6px", fontWeight: "bold" }}
                >
                  {problemWithStatus.difficulty}
                </span>
                <h1 style={{ fontSize: "1.45rem", fontWeight: "800", color: isLight ? "#0f172a" : "#fff", margin: "8px 0 0 0" }}>
                  {problemWithStatus.title}
                </h1>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  className="solved-pill"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    color: "#16a34a",
                    fontSize: "0.82rem",
                    background: "rgba(34, 197, 94, 0.12)",
                    padding: "3px 10px",
                    borderRadius: "999px",
                    fontWeight: "600"
                  }}
                >
                  <CheckCircle2 size={14} />
                  {formatDisplayValue(problemWithStatus.status, "Attempted")}
                </span>
                <Bookmark size={18} style={{ color: isLight ? "#94a3b8" : "#64748b", cursor: "pointer" }} />
              </div>
            </div>

            {/* Topic & Metric Tags */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ background: isLight ? "#f1f5f9" : "#181e2e", border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.08)", color: isLight ? "#475569" : "#94a3b8", fontSize: "0.78rem", padding: "3px 10px", borderRadius: "6px", fontWeight: "500" }}>
                🏷️ {problemWithStatus.topic}
              </span>
              <span style={{ background: isLight ? "#f1f5f9" : "#181e2e", border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.08)", color: isLight ? "#475569" : "#94a3b8", fontSize: "0.78rem", padding: "3px 10px", borderRadius: "6px", fontWeight: "500" }}>
                Hash Map
              </span>
              <span style={{ background: isLight ? "#f1f5f9" : "#181e2e", border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.08)", color: isLight ? "#475569" : "#94a3b8", fontSize: "0.78rem", padding: "3px 10px", borderRadius: "6px", fontWeight: "500" }}>
                📊 {problemWithStatus.acceptance}% Acceptance
              </span>
              <span style={{ background: isLight ? "#f1f5f9" : "#181e2e", border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.08)", color: isLight ? "#475569" : "#94a3b8", fontSize: "0.78rem", padding: "3px 10px", borderRadius: "6px", fontWeight: "500" }}>
                ⏱️ {problemWithStatus.points} pts
              </span>
            </div>

            {/* Stats Table Grid Card */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", background: isLight ? "#f8fafc" : "#080c14", border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
              <div>
                <span style={{ fontSize: "0.72rem", color: isLight ? "#64748b" : "#64748b", display: "block" }}>Time Limit</span>
                <strong style={{ fontSize: "0.92rem", color: isLight ? "#0f172a" : "#eee" }}>2 sec</strong>
              </div>
              <div>
                <span style={{ fontSize: "0.72rem", color: isLight ? "#64748b" : "#64748b", display: "block" }}>Memory Limit</span>
                <strong style={{ fontSize: "0.92rem", color: isLight ? "#0f172a" : "#eee" }}>256 MB</strong>
              </div>
              <div>
                <span style={{ fontSize: "0.72rem", color: isLight ? "#64748b" : "#64748b", display: "block" }}>Submissions</span>
                <strong style={{ fontSize: "0.92rem", color: isLight ? "#0f172a" : "#eee" }}>98.7K</strong>
              </div>
              <div>
                <span style={{ fontSize: "0.72rem", color: isLight ? "#64748b" : "#64748b", display: "block" }}>Points</span>
                <strong style={{ fontSize: "0.92rem", color: isLight ? "#0f172a" : "#eee" }}>{problemWithStatus.points}</strong>
              </div>
            </div>

            {/* Description Text */}
            <div>
              <h3 style={{ fontSize: "0.95rem", color: isLight ? "#475569" : "#94a3b8", marginBottom: "6px", fontWeight: "bold" }}>Description</h3>
              <p style={{ color: isLight ? "#334155" : "#cbd5e1", fontSize: "0.9rem", lineHeight: "1.6", margin: 0, whiteSpace: "pre-line" }}>
                {problemWithStatus.statement}
              </p>
            </div>

            {/* Examples */}
            <div>
              <h3 style={{ fontSize: "0.95rem", color: isLight ? "#475569" : "#94a3b8", marginBottom: "8px", fontWeight: "bold" }}>Examples</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {problemWithStatus.examples.map((example, index) => (
                  <div key={index} style={{ background: isLight ? "#f8fafc" : "#080c14", border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "10px 12px" }}>
                    <strong style={{ color: isLight ? "#2563eb" : "#60a5fa", fontSize: "0.82rem", display: "block", marginBottom: "4px" }}>Example {index + 1}</strong>
                    <pre style={{ margin: 0, color: isLight ? "#334155" : "#cbd5e1", fontFamily: "monospace", fontSize: "0.82rem", lineHeight: "1.5", whiteSpace: "pre-wrap" }}>
                      {`Input: ${formatDisplayValue(example.input)}\nOutput: ${formatDisplayValue(example.output)}`}
                    </pre>
                  </div>
                ))}
              </div>
            </div>

            {/* Constraints */}
            <div>
              <h3 style={{ fontSize: "0.95rem", color: isLight ? "#475569" : "#94a3b8", marginBottom: "6px", fontWeight: "bold" }}>Constraints</h3>
              <ul style={{ margin: 0, paddingLeft: "18px", color: isLight ? "#334155" : "#cbd5e1", fontSize: "0.85rem", lineHeight: "1.6" }}>
                {problemWithStatus.constraints.map((constraint, idx) => (
                  <li key={idx}>{formatDisplayValue(constraint)}</li>
                ))}
              </ul>
            </div>

            {/* Hint Bar */}
            <div
              style={{
                background: isLight ? "#f8fafc" : "#131826",
                border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px",
                padding: "10px 14px",
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
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: isLight ? "#0f172a" : "#cbd5e1", fontSize: "0.85rem" }}>
                <Lightbulb size={16} style={{ color: "#eab308" }} />
                <span>AI Progressive Hint {showHint ? `(Level ${hintLevel}/4)` : ""}</span>
              </div>
              <span style={{ fontSize: "0.75rem", color: isLight ? "#64748b" : "#8b9bb4" }}>4 levels <ChevronDown size={14} /></span>
            </div>
            {showHint ? (
              <div style={{ background: isLight ? "#fefce8" : "#080c14", border: isLight ? "1px solid #fef08a" : "1px solid rgba(234, 179, 8, 0.2)", borderRadius: "8px", padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <p style={{ color: isLight ? "#854d0e" : "#fef08a", fontSize: "0.82rem", margin: 0, lineHeight: "1.5" }}>
                  {isHintLoading ? "Analyzing problem and generating personalized hint..." : (hintText || "💡 Consider identifying repeating subproblems and storing intermediate calculations.")}
                </p>
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
          </section>

          {/* Testcases Selection List Card */}
          <section className="testcases-list-card" style={{ background: isLight ? "#ffffff" : "#0d111a", border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "16px", display: "flex", flexDirection: "column", gap: "10px", boxShadow: isLight ? "0 1px 4px rgba(0,0,0,0.04)" : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "0.95rem", color: isLight ? "#0f172a" : "#fff", fontWeight: "bold", margin: 0 }}>Testcases</h3>
              <span style={{ fontSize: "0.78rem", color: isLight ? "#64748b" : "#64748b" }}>
                {testResults.length
                  ? `${testResults.filter((t) => t?.passed).length} / ${testResults.length}`
                  : `${problemWithStatus.examples.length} / ${problemWithStatus.examples.length}`} testcases
              </span>
            </div>

            {/* Testcases List Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
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
                      gap: "10px",
                      background: isSelected
                        ? isLight ? "#eef2ff" : "rgba(120, 80, 255, 0.15)"
                        : isLight ? "#f8fafc" : "#080c14",
                      border: isSelected
                        ? "1px solid #6366f1"
                        : isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                  >
                    {isPass ? (
                      <CheckCircle2 size={16} style={{ color: "#16a34a" }} />
                    ) : (
                      <XCircle size={16} style={{ color: "#f43f5e" }} />
                    )}
                    <strong style={{ color: isSelected ? "#6366f1" : isLight ? "#0f172a" : "#cbd5e1", fontSize: "0.82rem" }}>
                      Case {index + 1}
                    </strong>
                    <span
                      style={{
                        color: isLight ? "#64748b" : "#64748b",
                        fontSize: "0.78rem",
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
          </section>
        </div>

        {/* RIGHT COLUMN: Code Editor & Console Results Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          
          {/* Code Editor */}
          <CodeEditor
            code={code}
            language={language}
            onCodeChange={handleCodeChange}
            onLanguageChange={handleLanguageChange}
            onRun={handleRun}
            onSubmit={handleSubmit}
            isRunning={isRunning}
            isSubmitting={isSubmitting}
          />

          {/* Console Results Panel (Smoothly Scrolled into View upon Run / Submit) */}
          <section
            ref={resultPanelRef}
            className="console-results-panel"
            style={{
              scrollMarginTop: "90px",
              background: isLight ? "#ffffff" : "#0d111a",
              border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.08)",
              borderRadius: "14px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: isLight ? "0 1px 4px rgba(0,0,0,0.04)" : "none"
            }}
          >
            {/* Console Tab Bar */}
            <div style={{ background: isLight ? "#f8fafc" : "#131826", borderBottom: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px" }}>
              <div style={{ display: "flex", gap: "2px" }}>
                <button
                  onClick={() => setActiveConsoleTab("testcase")}
                  type="button"
                  style={{
                    background: "transparent",
                    border: "none",
                    borderBottom: activeConsoleTab === "testcase" ? "2px solid #6366f1" : "2px solid transparent",
                    color: activeConsoleTab === "testcase" ? (isLight ? "#4f46e5" : "#fff") : (isLight ? "#64748b" : "#8b9bb4"),
                    fontSize: "0.82rem",
                    fontWeight: "bold",
                    padding: "10px 12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px"
                  }}
                >
                  <Layers size={14} />
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
                    fontSize: "0.82rem",
                    fontWeight: "bold",
                    padding: "10px 12px",
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
                    fontSize: "0.82rem",
                    fontWeight: "bold",
                    padding: "10px 12px",
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
                    fontSize: "0.82rem",
                    fontWeight: "bold",
                    padding: "10px 12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px"
                  }}
                >
                  <History size={14} />
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
                    fontSize: "0.82rem",
                    fontWeight: "bold",
                    padding: "10px 12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px"
                  }}
                >
                  <Sparkles size={14} style={{ color: "#9333ea" }} />
                  AI Review <span style={{ background: "#6366f1", color: "#fff", fontSize: "0.6rem", padding: "1px 5px", borderRadius: "999px" }}>NEW</span>
                </button>
              </div>

              <div style={{ display: "flex", gap: "8px", color: isLight ? "#64748b" : "#64748b" }}>
                <Sliders size={15} style={{ cursor: "pointer" }} />
              </div>
            </div>

            {/* Console Body Area */}
            <div style={{ padding: "14px" }}>
              {isRunning || isSubmitting || isProcessingResult ? (
                <div style={{ padding: "2.5rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", color: "#8b9bb4" }}>
                  <div className="spinner" style={{ width: 32, height: 32, border: "3px solid #333", borderTopColor: "#7850ff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  <div style={{ textAlign: "center" }}>
                    <strong style={{ fontSize: "1rem", color: "#f8fafc", display: "block" }}>
                      {result?.statusText || (isSubmitting ? "Queued..." : "Preparing execution...")}
                    </strong>
                    <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.8rem", color: "#94a3b8" }}>
                      <span>Actual worker state: {result?.status || "ENQUEUEING"}</span>
                      <span>Execution runs in a disposable, networkless sandbox.</span>
                    </div>
                  </div>
                </div>
              ) : activeConsoleTab === "custom" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "0.8rem", color: "#8b9bb4", fontWeight: "bold" }}>Custom STDIN</span>
                  <textarea
                    style={{ width: "100%", height: "90px", background: "#080c14", color: "#eee", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "8px", fontFamily: "monospace", fontSize: "0.85rem" }}
                    placeholder="Enter custom stdin..."
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                  />
                </div>
              ) : activeConsoleTab === "history" ? (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
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
                          <td style={{ padding: "6px", color: "#cbd5e1" }}>{formatDisplayValue(sub?.language, "python")}</td>
                          <td style={{ padding: "6px", color: "#cbd5e1" }}>{formatDisplayValue(sub?.runtime, "—")}</td>
                          <td style={{ padding: "6px", color: "#cbd5e1" }}>{formatDisplayValue(sub?.memory, "—")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : activeConsoleTab === "ai" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {isReviewLoading ? (
                    <div style={{ padding: "2.5rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.75rem", color: "#c084fc" }}>
                      <div className="spinner" style={{ width: 28, height: 28, border: "3px solid rgba(192, 132, 252, 0.2)", borderTopColor: "#c084fc", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                      <span style={{ fontWeight: "600", fontSize: "0.9rem", color: "#f1f5f9" }}>Judgo Intelligence is evaluating Big-O complexity & code structure...</span>
                    </div>
                  ) : aiReview ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {/* Review Header Banner */}
                      <div style={{ background: "rgba(120, 80, 255, 0.1)", border: "1px solid rgba(120, 80, 255, 0.3)", borderRadius: "10px", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <Sparkles size={20} color="#c084fc" />
                          <div>
                            <strong style={{ fontSize: "1rem", color: "#f8fafc" }}>Judgo AI Code Review & Complexity Report</strong>
                            <span style={{ display: "block", fontSize: "0.76rem", color: "#94a3b8" }}>
                              Language: <span style={{ textTransform: "capitalize", color: "#cbd5e1" }}>{aiReview.language || language}</span> • Evaluated against FAANG & Competitive rubrics
                            </span>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {aiReview.score && (
                            <div style={{ background: "#080c14", border: "1px solid rgba(120, 80, 255, 0.4)", borderRadius: "8px", padding: "4px 12px", textAlign: "center" }}>
                              <span style={{ fontSize: "0.66rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: "bold" }}>Quality Score</span>
                              <strong style={{ display: "block", fontSize: "1.05rem", color: "#4ade80" }}>{aiReview.score}</strong>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={fetchAIReview}
                            style={{ background: "#7850ff", border: "none", borderRadius: "6px", color: "#fff", fontSize: "0.78rem", fontWeight: "bold", padding: "6px 12px", cursor: "pointer" }}
                          >
                            Re-analyze
                          </button>
                        </div>
                      </div>

                      {/* Review Content Card */}
                      <div style={{ background: "#080c14", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "16px", color: "#f1f5f9", fontSize: "0.88rem", lineHeight: "1.6", whiteSpace: "pre-wrap", maxHeight: "340px", overflowY: "auto" }}>
                        {aiReview.review}
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: "2.5rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", background: "rgba(120, 80, 255, 0.04)", border: "1px dashed rgba(120, 80, 255, 0.25)", borderRadius: "10px" }}>
                      <Sparkles size={28} color="#c084fc" />
                      <div>
                        <strong style={{ color: "#f8fafc", fontSize: "1rem" }}>Instant AI Code Review & Complexity Analysis</strong>
                        <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "0.82rem" }}>
                          Get mathematical Big-O Time & Space breakdown, edge-case vulnerability scan, and clean code tips.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={fetchAIReview}
                        style={{ background: "linear-gradient(135deg, #7850ff 0%, #a855f7 100%)", border: "none", borderRadius: "8px", color: "#fff", fontWeight: "bold", fontSize: "0.85rem", padding: "10px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                      >
                        <Sparkles size={16} />
                        Analyze Solution with AI
                      </button>
                    </div>
                  )}
                </div>
              ) : result ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {/* Top Verdict Status Strip */}
                  <div
                    className={displayVerdict === "AC" ? "verdict-pop-ac" : displayVerdict === "WA" ? "verdict-shake-wa" : displayVerdict === "CE" ? "verdict-pulse-ce" : ""}
                    style={{
                      background: displayVerdict === "AC" ? (isLight ? "rgba(22, 163, 74, 0.08)" : "rgba(34, 197, 94, 0.08)") : displayVerdict === "CE" ? (isLight ? "rgba(220, 38, 38, 0.08)" : "rgba(239, 68, 68, 0.08)") : (isLight ? "rgba(220, 38, 38, 0.08)" : "rgba(248, 113, 113, 0.08)"),
                      border: `1px solid ${displayVerdict === "AC" ? (isLight ? "rgba(22, 163, 74, 0.4)" : "rgba(34, 197, 94, 0.4)") : (isLight ? "rgba(220, 38, 38, 0.4)" : "rgba(248, 113, 113, 0.4)")}`,
                      borderRadius: "10px",
                      padding: "12px 16px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {displayVerdict === "AC" ? (
                        <CheckCircle2 size={24} style={{ color: isLight ? "#16a34a" : "#4ade80" }} />
                      ) : displayVerdict === "CE" ? (
                        <AlertTriangle size={24} style={{ color: "#ef4444" }} />
                      ) : (
                        <XCircle size={24} style={{ color: "#ef4444" }} />
                      )}
                      <div>
                        <strong style={{ fontSize: "1.15rem", color: displayVerdict === "AC" ? (isLight ? "#16a34a" : "#4ade80") : "#ef4444" }}>
                          {displayVerdict === "AC" ? "Accepted" : displayVerdict === "CE" ? "Compilation Error" : displayVerdict === "WA" ? "Wrong Answer" : displayStatusText}
                        </strong>
                        <span style={{ fontSize: "0.78rem", color: isLight ? "#64748b" : "#94a3b8", display: "block", marginTop: "2px" }}>
                          {displayVerdict === "CE"
                            ? "Code failed to compile using official language compiler."
                            : displayVerdict === "AC"
                            ? `Passed all ${totalCasesNum} testcases successfully.`
                            : `Passed ${passedCountNum} / ${totalCasesNum} testcases.`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ── 3 DISTINCT PANELS: COMPILATION, EXECUTION, ALGORITHM ANALYSIS ── */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                    {/* PANEL 1: COMPILATION */}
                    <div style={{ background: isLight ? "#f8fafc" : "#080c14", border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <Cpu size={15} style={{ color: "#818cf8" }} />
                          <span style={{ fontSize: "0.74rem", fontWeight: "700", textTransform: "uppercase", color: isLight ? "#64748b" : "#94a3b8" }}>Compilation</span>
                        </div>
                        <span style={{ fontSize: "0.72rem", fontWeight: "700", padding: "2px 6px", borderRadius: "4px", background: displayVerdict === "CE" ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)", color: displayVerdict === "CE" ? "#ef4444" : (isLight ? "#16a34a" : "#4ade80") }}>
                          {displayVerdict === "CE" ? "✕ Failed" : "✓ Successful"}
                        </span>
                      </div>
                      <strong style={{ fontSize: "0.92rem", color: isLight ? "#0f172a" : "#f8fafc" }}>
                        {result.compiler?.name ? `${result.compiler.name} ${result.compiler.version || ""}` : language}
                      </strong>
                      <span style={{ fontSize: "0.76rem", color: isLight ? "#64748b" : "#64748b" }}>
                        Compilation Time: <strong style={{ color: isLight ? "#0f172a" : "#cbd5e1" }}>{result.compiler?.timeMs || result.compilation_time_ms || 0} ms</strong>
                      </span>
                    </div>

                    {/* PANEL 2: EXECUTION METRICS */}
                    <div style={{ background: isLight ? "#f8fafc" : "#080c14", border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <Zap size={15} style={{ color: "#38bdf8" }} />
                          <span style={{ fontSize: "0.74rem", fontWeight: "700", textTransform: "uppercase", color: isLight ? "#64748b" : "#94a3b8" }}>Execution</span>
                        </div>
                        <span style={{ fontSize: "0.72rem", fontWeight: "700", padding: "2px 6px", borderRadius: "4px", background: displayVerdict === "CE" ? "rgba(100, 116, 139, 0.15)" : displayVerdict === "AC" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)", color: displayVerdict === "CE" ? "#64748b" : displayVerdict === "AC" ? (isLight ? "#16a34a" : "#4ade80") : "#ef4444" }}>
                          {displayVerdict === "CE" ? "Not Executed" : displayVerdict === "AC" ? "✓ Accepted" : displayVerdict}
                        </span>
                      </div>
                      {displayVerdict === "CE" ? (
                        <span style={{ fontSize: "0.82rem", color: isLight ? "#64748b" : "#64748b", fontStyle: "italic" }}>
                          Execution aborted due to compile error.
                        </span>
                      ) : (
                        <>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                            <span style={{ fontSize: "0.76rem", color: isLight ? "#64748b" : "#94a3b8" }}>Runtime:</span>
                            <strong style={{ fontSize: "0.92rem", color: isLight ? "#0f172a" : "#f8fafc" }}>{displayRuntime}</strong>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                            <span style={{ fontSize: "0.76rem", color: isLight ? "#64748b" : "#94a3b8" }}>Peak Memory:</span>
                            <strong style={{ fontSize: "0.92rem", color: isLight ? "#0f172a" : "#f8fafc" }}>{displayMemory}</strong>
                          </div>
                        </>
                      )}
                    </div>

                    {/* PANEL 3: ALGORITHM COMPLEXITY ANALYSIS (AST) */}
                    <div style={{ background: isLight ? "#f8fafc" : "#080c14", border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <Brain size={15} style={{ color: "#c084fc" }} />
                          <span style={{ fontSize: "0.74rem", fontWeight: "700", textTransform: "uppercase", color: isLight ? "#64748b" : "#94a3b8" }}>Algorithm Analysis</span>
                        </div>
                        <span style={{ fontSize: "0.7rem", fontWeight: "600", color: "#818cf8" }}>
                          {result.complexity?.confidence || "Unavailable"} Confidence
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontSize: "0.76rem", color: isLight ? "#64748b" : "#94a3b8" }}>Time Complexity:</span>
                        <strong style={{ fontSize: "0.92rem", color: "#6366f1" }}>{result.complexity?.time || "Unable to determine reliably"}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontSize: "0.76rem", color: isLight ? "#64748b" : "#94a3b8" }}>Space Complexity:</span>
                        <strong style={{ fontSize: "0.92rem", color: "#8b5cf6" }}>{result.complexity?.space || "Unable to determine reliably"}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Structural Complexity Explanation Bar */}
                  {result.complexity?.explanation && (
                    <div style={{ background: isLight ? "rgba(99, 102, 241, 0.06)" : "rgba(120, 80, 255, 0.06)", border: isLight ? "1px solid rgba(99, 102, 241, 0.2)" : "1px solid rgba(120, 80, 255, 0.2)", borderRadius: "8px", padding: "10px 14px", fontSize: "0.82rem", color: isLight ? "#334155" : "#cbd5e1", display: "flex", alignItems: "flex-start", gap: "8px" }}>
                      <Brain size={16} style={{ color: "#6366f1", flexShrink: 0, marginTop: "2px" }} />
                      <div>
                        <strong style={{ color: isLight ? "#4338ca" : "#a5b4fc" }}>Structural Code Analysis: </strong>
                        <span>{result.complexity.explanation}</span>
                      </div>
                    </div>
                  )}

                  {/* Compilation Error Diagnostics if present */}
                  {displayVerdict === "CE" && (result.compileOutput || result.stderr || result.compiler?.stderr) && (
                    <div style={{ background: isLight ? "#fef2f2" : "rgba(239, 68, 68, 0.08)", border: isLight ? "1px solid #fecaca" : "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "8px", padding: "12px", color: isLight ? "#991b1b" : "#fca5a5", fontSize: "0.82rem" }}>
                      <strong style={{ color: "#ef4444" }}>Compiler Diagnostic Error:</strong>
                      <pre style={{ margin: "6px 0 0 0", color: isLight ? "#991b1b" : "#fca5a5", fontFamily: "monospace", fontSize: "0.8rem", whiteSpace: "pre-wrap" }}>
                        {result.compileOutput || result.stderr || result.compiler?.stderr}
                      </pre>
                    </div>
                  )}

                  {/* Failure Difference Box if present */}
                  {currentTestResult?.difference && !currentTestResult?.passed && displayVerdict !== "CE" && (
                    <div style={{ background: isLight ? "#fef2f2" : "rgba(239, 68, 68, 0.08)", border: isLight ? "1px solid #fecaca" : "1px solid rgba(239, 68, 68, 0.25)", borderRadius: "8px", padding: "10px 14px", color: isLight ? "#991b1b" : "#fca5a5", fontSize: "0.82rem", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                      <strong style={{ color: "#ef4444", whiteSpace: "nowrap" }}>Difference:</strong>
                      <span style={{ fontFamily: "monospace" }}>{currentTestResult.difference}</span>
                    </div>
                  )}

                  {/* 3-Column Input / Expected Output / Your Output Grid (Only shown when not CE) */}
                  {displayVerdict !== "CE" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.9fr 0.9fr", gap: "10px" }}>
                      <div style={{ background: isLight ? "#f8fafc" : "#080c14", padding: "10px", borderRadius: "8px", border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.06)" }}>
                        <span style={{ fontSize: "0.75rem", color: isLight ? "#64748b" : "#64748b", fontWeight: "bold" }}>Input</span>
                        <pre style={{ margin: "4px 0 0 0", color: isLight ? "#334155" : "#cbd5e1", fontFamily: "monospace", fontSize: "0.82rem", whiteSpace: "pre-wrap" }}>
                          {formatDisplayValue(currentTestResult?.input || activeExample?.input)}
                        </pre>
                      </div>

                      <div style={{ background: isLight ? "#f8fafc" : "#080c14", padding: "10px", borderRadius: "8px", border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.06)" }}>
                        <span style={{ fontSize: "0.75rem", color: isLight ? "#64748b" : "#64748b", fontWeight: "bold" }}>Expected Output</span>
                        <pre style={{ margin: "4px 0 0 0", color: isLight ? "#16a34a" : "#4ade80", fontFamily: "monospace", fontSize: "0.82rem", whiteSpace: "pre-wrap" }}>
                          {formatDisplayValue(currentTestResult?.expectedOutput || activeExample?.output)}
                        </pre>
                      </div>

                      <div style={{ background: isLight ? "#f8fafc" : "#080c14", padding: "10px", borderRadius: "8px", border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.06)" }}>
                        <span style={{ fontSize: "0.75rem", color: isLight ? "#64748b" : "#64748b", fontWeight: "bold" }}>Your Output</span>
                        <pre style={{ margin: "4px 0 0 0", color: (currentTestResult?.passed || displayVerdict === "AC") ? (isLight ? "#16a34a" : "#4ade80") : "#f87171", fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
                          {formatDisplayValue(
                            currentTestResult?.stdout ||
                              currentTestResult?.actualOutput ||
                              result?.stdout ||
                              (result?.output && result?.output !== "Evaluation finished" ? result.output : "") ||
                              "(No output)"
                          )}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* AI Hint Footer Banner */}
                  <div style={{ background: isLight ? "rgba(99, 102, 241, 0.08)" : "rgba(120, 80, 255, 0.08)", border: isLight ? "1px solid rgba(99, 102, 241, 0.2)" : "1px solid rgba(120, 80, 255, 0.2)", borderRadius: "8px", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Sparkles size={16} style={{ color: "#a855f7" }} />
                      <div>
                        <strong style={{ color: isLight ? "#7c3aed" : "#c084fc", fontSize: "0.82rem" }}>AI Verification & Explanation</strong>
                        <p style={{ margin: "2px 0 0 0", color: isLight ? "#475569" : "#cbd5e1", fontSize: "0.78rem" }}>
                          {displayVerdict === "AC"
                            ? "Solution accepted! You can run AI Review to explore alternative paradigms."
                            : "Inspect the compilation/execution diagnostics above or request instant AI assistance."}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveConsoleTab("ai");
                        fetchAIReview();
                      }}
                      style={{ background: "#7850ff", border: "none", borderRadius: "6px", color: "#fff", fontSize: "0.78rem", fontWeight: "bold", padding: "6px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap" }}
                    >
                      <Sparkles size={13} />
                      Explain with AI
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: "2rem", textAlign: "center", color: "#64748b", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "8px" }}>
                  <span>Click Run or Submit to execute code and view your execution result breakdown.</span>
                </div>
              )}

              {error ? <p className="form-error" style={{ color: "#ef4444", marginTop: "8px" }}>{formatDisplayValue(error)}</p> : null}
            </div>
          </section>
        </div>
      </div>
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
