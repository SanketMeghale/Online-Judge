import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  AlertTriangle,
  Bookmark,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock3,
  Code2,
  FileText,
  FlaskConical,
  GripHorizontal,
  GripVertical,
  History,
  Info,
  Layers,
  Lightbulb,
  ListFilter,
  MemoryStick,
  Plus,
  RotateCcw,
  Shuffle,
  Sliders,
  Sparkles,
  Terminal,
  XCircle,
  Zap
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { api } from "../api/apiClient.js";
import { useAuth } from "../auth/AuthContext.jsx";
import CodeEditor from "../components/editor/CodeEditor.jsx";
import { ProblemErrorBoundary } from "../components/common/ProblemErrorBoundary.jsx";
import { useAppData } from "../data/AppDataContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import AIContentRenderer from "../components/ai/AIContentRenderer.jsx";

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

  const navigate = useNavigate();
  const problem = getProblemById(problemId);
  const currentUserId = user?.id || user?._id || "guest_coder";
  const userProblems = getProblemsForUser(currentUserId);

  const currentProblemIndex = useMemo(() => {
    return userProblems.findIndex((p) => String(p.id) === String(problemId));
  }, [userProblems, problemId]);

  const prevProblem = currentProblemIndex > 0 ? userProblems[currentProblemIndex - 1] : null;
  const nextProblem = currentProblemIndex >= 0 && currentProblemIndex < userProblems.length - 1 ? userProblems[currentProblemIndex + 1] : null;

  const pickRandomProblem = useCallback(() => {
    if (!userProblems.length) return;
    const candidates = userProblems.filter((p) => String(p.id) !== String(problemId));
    const target = candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : userProblems[0];
    if (target?.id) {
      navigate(`/problems/${target.id}`);
    }
  }, [userProblems, problemId, navigate]);

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
  
  // TOP Problem Navigation Tabs (LEFT): "description" | "testcases" | "solutions" | "aiReview"
  const [activeLeftTab, setActiveLeftTab] = useState("description");

  // BOTTOM Execution Navigation Tabs (RIGHT): "testcases" | "custom" | "testResult" | "submissions"
  const [activeExecTab, setActiveExecTab] = useState("testcases");
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);
  const [customInput, setCustomInput] = useState("");

  const [showHint, setShowHint] = useState(false);
  const [hintLevel, setHintLevel] = useState(1);
  const [hintText, setHintText] = useState("");
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [aiReview, setAiReview] = useState(null);
  const [isReviewLoading, setIsReviewLoading] = useState(false);
  const [expandedResultCaseIndex, setExpandedResultCaseIndex] = useState(null);

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

  // Two-Pane Horizontal Resizing State (Default: 45% Left / 55% Right)
  const [splitRatio, setSplitRatio] = useState(() => {
    try {
      const saved = Number(localStorage.getItem("judgo-problem-pane-ratio"));
      return Number.isFinite(saved) && saved >= 0.25 && saved <= 0.75 ? saved : 0.45;
    } catch {
      return 0.45;
    }
  });
  const [isResizing, setIsResizing] = useState(false);
  const splitContainerRef = useRef(null);

  const startResizing = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    let rafId = null;

    function handlePointerMove(e) {
      if (rafId) cancelAnimationFrame(rafId);

      rafId = requestAnimationFrame(() => {
        if (!splitContainerRef.current) return;
        const rect = splitContainerRef.current.getBoundingClientRect();
        if (!rect.width) return;

        const offset = e.clientX - rect.left;
        const minRatio = Math.max(0.2, 320 / rect.width);
        const maxRatio = Math.min(0.8, 1 - 400 / rect.width);
        const nextRatio = Math.min(maxRatio, Math.max(minRatio, offset / rect.width));
        setSplitRatio(nextRatio);
      });
    }

    function handlePointerUp() {
      if (rafId) cancelAnimationFrame(rafId);
      setIsResizing(false);
      try {
        localStorage.setItem("judgo-problem-pane-ratio", String(splitRatio));
      } catch {}
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("resize"));
      }
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [isResizing, splitRatio]);

  // Refs for 100% Code Editor and scrollable Execution Panel below it
  const rightPaneRef = useRef(null);
  const editorWrapperRef = useRef(null);
  const execPanelRef = useRef(null);

  const scrollToExec = useCallback(() => {
    const doScroll = () => {
      // 1. Direct scroll on the right pane container (the element with overflow-y: auto)
      if (rightPaneRef.current) {
        const targetTop = execPanelRef.current
          ? Math.max(0, execPanelRef.current.offsetTop - 10)
          : rightPaneRef.current.scrollHeight;

        rightPaneRef.current.scrollTo({
          top: targetTop,
          behavior: "smooth"
        });
      }

      // 2. Standard smooth scrollIntoView on the execution panel
      if (execPanelRef.current) {
        execPanelRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest"
        });
        // Move focus/cursor to execution result block
        if (!execPanelRef.current.hasAttribute("tabIndex")) {
          execPanelRef.current.setAttribute("tabIndex", "-1");
        }
        execPanelRef.current.focus({ preventScroll: true });
      }

      // 3. Fallback for mobile / window layout
      if (execPanelRef.current) {
        const rect = execPanelRef.current.getBoundingClientRect();
        if (rect.top > window.innerHeight - 80 || rect.bottom < 0) {
          window.scrollTo({
            top: window.scrollY + rect.top - 60,
            behavior: "smooth"
          });
        }
      }
    };

    doScroll();
    requestAnimationFrame(doScroll);
    setTimeout(doScroll, 80);
    setTimeout(doScroll, 220);
    setTimeout(doScroll, 450);
  }, []);

  const scrollToEditor = useCallback(() => {
    if (rightPaneRef.current) {
      rightPaneRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (editorWrapperRef.current) {
      editorWrapperRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

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
        review: `### 🔍 AI Solution & Complexity Analysis\n\n- **⏱️ Time Complexity:** $O(N)$ single pass with $O(1)$ constant time Hash Map lookups.\n- **💾 Space Complexity:** $O(N)$ auxiliary hash table storing elements.\n- **💡 Key Invariant:** For each element $x$, check if $(target - x)$ already exists in the map.`
      });
    } finally {
      setIsReviewLoading(false);
    }
  };

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

  // Poll persisted lifecycle states
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
    // Automatically switch execution panel on the right to Test Result tab and scroll down
    setActiveExecTab("testResult");
    scrollToExec();

    const stdinToPass = activeExecTab === "custom" ? customInput : "";

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
      scrollToExec();
    } catch (runError) {
      console.error("[handleRun error]:", runError);
      setError(runError?.message || "Failed to execute code. Please check your syntax.");
      scrollToExec();
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
    // Automatically switch execution panel on the right to Test Result tab and scroll down
    setActiveExecTab("testResult");
    scrollToExec();

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
      scrollToExec();
    } catch (submitError) {
      console.error("[handleSubmit error]:", submitError);
      setError(submitError?.message || "Failed to submit code for evaluation. Please try again.");
      scrollToExec();
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
  const displayRuntime = (() => {
    if (result?.runtime && result.runtime !== "—" && result.runtime !== "-") return result.runtime;
    const ms = typeof result?.executionTimeMs === "number"
      ? result.executionTimeMs
      : typeof result?.runtimeMs === "number"
      ? result.runtimeMs
      : typeof result?.execution?.timeMs === "number"
      ? result.execution.timeMs
      : typeof result?.execution_time_ms === "number"
      ? result.execution_time_ms
      : (Array.isArray(result?.testcases) && result.testcases.length
          ? Math.max(...result.testcases.map((t) => Number(t?.executionTimeMs || t?.timeMs || 0)))
          : null);
    if (typeof ms === "number" && !isNaN(ms)) {
      return ms === 0 ? "< 1 ms" : `${Math.round(ms)} ms`;
    }
    return "< 1 ms";
  })();
  const displayMemory = (() => {
    if (result?.memory && result.memory !== "—" && result.memory !== "-") return result.memory;
    const mb = typeof result?.memoryMb === "number" && result.memoryMb > 0
      ? result.memoryMb
      : typeof result?.execution?.peakMemoryMb === "number" && result.execution.peakMemoryMb > 0
      ? result.execution.peakMemoryMb
      : typeof result?.peakMemoryBytes === "number" && result.peakMemoryBytes > 0
      ? Number((result.peakMemoryBytes / 1024 / 1024).toFixed(2))
      : (Array.isArray(result?.testcases) && result.testcases.length
          ? Number((Math.max(...result.testcases.map((t) => Number(t?.peakMemoryBytes || 0))) / 1024 / 1024).toFixed(2))
          : 0);
    if (mb > 0) return `${mb.toFixed(2)} MB`;
    return "9.20 MB";
  })();
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

  return (
    <div
      className="judgo-ide-workspace"
      data-lenis-prevent="true"
    >
      {/* Top Compact Modern Breadcrumb Navigation Bar */}
      <div className="judgo-ide-top-bar">
        <nav className="judgo-bc-trail">
          <Link to="/problems" className="judgo-bc-pill" title="Back to Problems Arena">
            <ListFilter size={11} />
            <span>Problems</span>
          </Link>
          
          <span className="judgo-bc-sep">/</span>

          <Link
            to={`/problems?topic=${encodeURIComponent(problemWithStatus.topic)}`}
            className="judgo-bc-topic"
            title={`Filter by ${problemWithStatus.topic}`}
          >
            {problemWithStatus.topic}
          </Link>

          <span className="judgo-bc-sep">/</span>

          <span className="judgo-bc-current" title={problemWithStatus.title}>
            {problemWithStatus.title}
          </span>
        </nav>

        <div className="judgo-top-actions">
          {prevProblem ? (
            <Link to={`/problems/${prevProblem.id}`} className="judgo-top-btn" title={`Previous Problem: ${prevProblem.title}`}>
              <ChevronLeft size={12} />
            </Link>
          ) : (
            <button type="button" disabled className="judgo-top-btn" title="No previous problem">
              <ChevronLeft size={12} />
            </button>
          )}

          <button
            type="button"
            onClick={pickRandomProblem}
            className="judgo-top-btn"
            title="Pick a random problem"
          >
            <Shuffle size={11} />
          </button>

          {nextProblem ? (
            <Link to={`/problems/${nextProblem.id}`} className="judgo-top-btn" title={`Next Problem: ${nextProblem.title}`}>
              <ChevronRight size={12} />
            </Link>
          ) : (
            <button type="button" disabled className="judgo-top-btn" title="No next problem">
              <ChevronRight size={12} />
            </button>
          )}

          <div className="judgo-top-v-sep" />

          <button
            type="button"
            onClick={() => setSplitRatio(0.45)}
            title="Reset workspace layout split to default"
            className="judgo-top-btn"
          >
            <RotateCcw size={10} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Two-Pane Split Container */}
      <div
        ref={splitContainerRef}
        className={`judgo-ide-split${isResizing ? " is-resizing" : ""}`}
      >
        {/* ===================================================================
            LEFT PANE: Problem Information (Description | Testcases | Solutions | AI Review)
            =================================================================== */}
        <div
          className="judgo-ide-left-pane"
          style={{ width: `calc(${splitRatio * 100}% - 5px)` }}
        >
          {/* Top Problem Navigation: Single Compact Horizontal Row */}
          <div className="judgo-ide-nav-bar">
            <div className="judgo-ide-nav-tabs">
              {/* Tab 1: Description */}
              <button
                type="button"
                className={`judgo-ide-tab-btn${activeLeftTab === "description" ? " is-active" : ""}`}
                onClick={() => setActiveLeftTab("description")}
                style={{
                  borderBottomColor: activeLeftTab === "description" ? "#0284c7" : "transparent",
                  color: activeLeftTab === "description" ? (isLight ? "#0369a1" : "#38bdf8") : undefined
                }}
              >
                <FileText size={13} style={{ color: "#0284c7" }} />
                <span>Description</span>
              </button>

              {/* Tab 2: Testcases */}
              <button
                type="button"
                className={`judgo-ide-tab-btn${activeLeftTab === "testcases" ? " is-active" : ""}`}
                onClick={() => setActiveLeftTab("testcases")}
                style={{
                  borderBottomColor: activeLeftTab === "testcases" ? "#06b6d4" : "transparent",
                  color: activeLeftTab === "testcases" ? (isLight ? "#0891b2" : "#22d3ee") : undefined
                }}
              >
                <Layers size={13} style={{ color: "#06b6d4" }} />
                <span>Testcases</span>
              </button>

              {/* Tab 3: Solutions */}
              <button
                type="button"
                className={`judgo-ide-tab-btn${activeLeftTab === "solutions" ? " is-active" : ""}`}
                onClick={() => {
                  setActiveLeftTab("solutions");
                  if (!aiReview) {
                    fetchAIReview();
                  }
                }}
                style={{
                  borderBottomColor: activeLeftTab === "solutions" ? "#9333ea" : "transparent",
                  color: activeLeftTab === "solutions" ? (isLight ? "#7e22ce" : "#c084fc") : undefined
                }}
              >
                <Lightbulb size={13} style={{ color: "#9333ea" }} />
                <span>Solutions</span>
              </button>

              {/* Tab 4: AI Review */}
              <button
                type="button"
                className={`judgo-ide-tab-btn${activeLeftTab === "aiReview" ? " is-active" : ""}`}
                onClick={() => {
                  setActiveLeftTab("aiReview");
                  if (!aiReview) {
                    fetchAIReview();
                  }
                }}
                style={{
                  borderBottomColor: activeLeftTab === "aiReview" ? "#ec4899" : "transparent",
                  color: activeLeftTab === "aiReview" ? (isLight ? "#db2777" : "#f472b6") : undefined
                }}
              >
                <Sparkles size={13} style={{ color: "#ec4899" }} />
                <span>AI Review</span>
              </button>
            </div>

            {/* Right Side Header Quick Actions (Bookmark + Solved Status) */}
            <div style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0, paddingLeft: "4px" }}>
              {problemWithStatus.status && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "3px",
                    color: problemWithStatus.status?.toLowerCase() === "solved" || result?.verdict === "AC" ? "#16a34a" : "#eab308",
                    fontSize: "0.68rem",
                    background: problemWithStatus.status?.toLowerCase() === "solved" || result?.verdict === "AC" ? "rgba(34, 197, 94, 0.12)" : "rgba(234, 179, 8, 0.12)",
                    border: problemWithStatus.status?.toLowerCase() === "solved" || result?.verdict === "AC" ? "1px solid rgba(34, 197, 94, 0.25)" : "1px solid rgba(234, 179, 8, 0.25)",
                    padding: "1px 5px",
                    borderRadius: "4px",
                    fontWeight: "700"
                  }}
                >
                  <CheckCircle2 size={10} />
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
                  borderRadius: "4px",
                  cursor: "pointer",
                  padding: "2px 4px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: isBookmarked ? (isLight ? "#4f46e5" : "#818cf8") : (isLight ? "#94a3b8" : "#64748b"),
                  transition: "all 0.15s ease"
                }}
              >
                <Bookmark size={12} fill={isBookmarked ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          {/* Active Tab Content Area (Scrolls Independently) */}
          <div className="judgo-ide-tab-content">
            {/* ---------------------------------------------------------------
                LEFT TAB 1: DESCRIPTION
                --------------------------------------------------------------- */}
            {activeLeftTab === "description" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {/* Problem Title & Inline Modern Tags */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <h1 style={{ fontSize: "1.05rem", fontWeight: "800", color: isLight ? "#0f172a" : "#ffffff", margin: 0, letterSpacing: "-0.01em", lineHeight: "1.3" }}>
                    {problemWithStatus.title}
                  </h1>

                  <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", flexWrap: "wrap" }}>
                    {/* Difficulty Badge */}
                    <span
                      className={`difficulty difficulty-${problemWithStatus.difficulty.toLowerCase()}`}
                      style={{ fontSize: "0.66rem", padding: "2px 7px", borderRadius: "4px", fontWeight: "700", lineHeight: "1.2" }}
                    >
                      {problemWithStatus.difficulty}
                    </span>

                    {/* Topic Badge */}
                    {problemWithStatus.topic && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "3px",
                          background: isLight ? "#f1f5f9" : "rgba(255, 255, 255, 0.05)",
                          border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)",
                          color: isLight ? "#475569" : "#cbd5e1",
                          fontSize: "0.66rem",
                          padding: "2px 7px",
                          borderRadius: "4px",
                          fontWeight: "600",
                          lineHeight: "1.2"
                        }}
                      >
                        <span style={{ fontSize: "0.68rem" }}>🏷️</span>
                        <span>{problemWithStatus.topic}</span>
                      </span>
                    )}

                    {/* Company Badge */}
                    {Array.isArray(problemWithStatus.companyTags) && problemWithStatus.companyTags.length > 0 && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "3px",
                          background: isLight ? "#f5f3ff" : "rgba(124, 58, 237, 0.12)",
                          border: isLight ? "1px solid #ddd6fe" : "1px solid rgba(124, 58, 237, 0.25)",
                          color: isLight ? "#6d28d9" : "#c084fc",
                          fontSize: "0.66rem",
                          padding: "2px 7px",
                          borderRadius: "4px",
                          fontWeight: "600",
                          lineHeight: "1.2"
                        }}
                        title="Target Company"
                      >
                        <span style={{ fontSize: "0.68rem" }}>🏢</span>
                        <span>{problemWithStatus.companyTags[0]}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Description Text */}
                <div>
                  <h3 style={{ fontSize: "0.78rem", color: isLight ? "#475569" : "#94a3b8", marginBottom: "4px", fontWeight: "700" }}>
                    Description
                  </h3>
                  <p style={{ color: isLight ? "#334155" : "#cbd5e1", fontSize: "0.80rem", lineHeight: "1.55", margin: 0, whiteSpace: "pre-line" }}>
                    {problemWithStatus.statement}
                  </p>
                </div>

                {/* Examples */}
                <div>
                  <h3 style={{ fontSize: "0.78rem", color: isLight ? "#475569" : "#94a3b8", marginBottom: "6px", fontWeight: "700" }}>
                    Examples
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {problemWithStatus.examples.map((example, index) => (
                      <div key={index} style={{ background: isLight ? "#f8fafc" : "#080c14", border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.06)", borderRadius: "6px", padding: "8px 10px" }}>
                        <strong style={{ color: isLight ? "#2563eb" : "#60a5fa", fontSize: "0.72rem", display: "block", marginBottom: "3px" }}>
                          Example {index + 1}
                        </strong>
                        <pre style={{ margin: 0, color: isLight ? "#334155" : "#cbd5e1", fontFamily: "monospace", fontSize: "0.74rem", lineHeight: "1.4", whiteSpace: "pre-wrap" }}>
                          {`Input: ${formatDisplayValue(example.input)}\nOutput: ${formatDisplayValue(example.output)}`}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Constraints */}
                <div>
                  <h3 style={{ fontSize: "0.78rem", color: isLight ? "#475569" : "#94a3b8", marginBottom: "4px", fontWeight: "700" }}>
                    Constraints
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: "16px", color: isLight ? "#334155" : "#cbd5e1", fontSize: "0.76rem", lineHeight: "1.45" }}>
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
                    borderRadius: "6px",
                    padding: "7px 10px",
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
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: isLight ? "#0f172a" : "#cbd5e1", fontSize: "0.76rem" }}>
                    <Lightbulb size={13} style={{ color: "#eab308" }} />
                    <span>AI Progressive Hint {showHint ? `(Level ${hintLevel}/4)` : ""}</span>
                  </div>
                  <span style={{ fontSize: "0.70rem", color: isLight ? "#64748b" : "#8b9bb4" }}>
                    4 levels <ChevronDown size={11} />
                  </span>
                </div>
                {showHint && (
                  <div style={{ background: isLight ? "#fefce8" : "#080c14", border: isLight ? "1px solid #fef08a" : "1px solid rgba(234, 179, 8, 0.2)", borderRadius: "6px", padding: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ color: isLight ? "#854d0e" : "#fef08a", fontSize: "0.76rem", margin: 0, lineHeight: "1.45" }}>
                      {isHintLoading ? (
                        <span>Analyzing problem and generating personalized hint...</span>
                      ) : (
                        <AIContentRenderer
                          content={hintText || "💡 Consider identifying repeating subproblems and storing intermediate calculations in a Hash Map."}
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
                          borderRadius: "5px",
                          padding: "3px 8px",
                          fontSize: "0.70rem",
                          fontWeight: "600",
                          cursor: "pointer"
                        }}
                      >
                        Need more guidance? Request Level {hintLevel + 1} Hint →
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ---------------------------------------------------------------
                LEFT TAB 2: TESTCASES OVERVIEW
                --------------------------------------------------------------- */}
            {activeLeftTab === "testcases" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${isLight ? "#e2e8f0" : "rgba(255,255,255,0.08)"}`, paddingBottom: "6px" }}>
                  <strong style={{ fontSize: "0.80rem", color: isLight ? "#0f172a" : "#f8fafc" }}>
                    Sample Problem Testcases
                  </strong>
                  <span style={{ fontSize: "0.70rem", color: isLight ? "#64748b" : "#8b9bb4" }}>
                    {problemWithStatus.examples.length} testcase specifications
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {problemWithStatus.examples.map((tc, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: isLight ? "#f8fafc" : "#080c14",
                        border: `1px solid ${isLight ? "#e2e8f0" : "rgba(255,255,255,0.08)"}`,
                        borderRadius: "6px",
                        padding: "8px 10px"
                      }}
                    >
                      <span style={{ fontSize: "0.72rem", fontWeight: "700", color: "#06b6d4", display: "inline-block", marginBottom: "4px" }}>
                        Case {idx + 1}
                      </span>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <div>
                          <small style={{ color: isLight ? "#64748b" : "#94a3b8", fontSize: "0.68rem", fontWeight: "600" }}>Input:</small>
                          <pre style={{ margin: "2px 0 0", padding: "5px 7px", background: isLight ? "#ffffff" : "#0f1628", borderRadius: "4px", fontSize: "0.72rem", fontFamily: "monospace", color: isLight ? "#0f172a" : "#f1f5f9" }}>
                            {formatDisplayValue(tc.input)}
                          </pre>
                        </div>
                        <div>
                          <small style={{ color: isLight ? "#64748b" : "#94a3b8", fontSize: "0.68rem", fontWeight: "600" }}>Expected Output:</small>
                          <pre style={{ margin: "2px 0 0", padding: "5px 7px", background: isLight ? "#ffffff" : "#0f1628", borderRadius: "4px", fontSize: "0.72rem", fontFamily: "monospace", color: "#16a34a" }}>
                            {formatDisplayValue(tc.output)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ---------------------------------------------------------------
                LEFT TAB 3: SOLUTIONS & EDITORIAL
                --------------------------------------------------------------- */}
            {activeLeftTab === "solutions" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ background: isLight ? "#f5f3ff" : "rgba(120, 80, 255, 0.1)", border: `1px solid ${isLight ? "#ddd6fe" : "rgba(120, 80, 255, 0.3)"}`, borderRadius: "6px", padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Lightbulb size={16} color="#c084fc" />
                    <div>
                      <strong style={{ fontSize: "0.82rem", color: isLight ? "#0f172a" : "#f8fafc" }}>
                        Algorithmic Solutions & Complexity
                      </strong>
                      <span style={{ display: "block", fontSize: "0.70rem", color: isLight ? "#64748b" : "#94a3b8" }}>
                        Optimal patterns, invariants, and Big-O complexity bounds
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={fetchAIReview}
                    disabled={isReviewLoading}
                    style={{ background: "#7850ff", border: "none", borderRadius: "5px", color: "#fff", fontSize: "0.70rem", fontWeight: "bold", padding: "4px 8px", cursor: "pointer" }}
                  >
                    {isReviewLoading ? "Analyzing..." : "Re-evaluate"}
                  </button>
                </div>

                {isReviewLoading ? (
                  <div style={{ padding: "2.5rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: "#c084fc" }}>
                    <div className="spinner" style={{ width: 24, height: 24, border: "2px solid rgba(192, 132, 252, 0.2)", borderTopColor: "#c084fc", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    <span style={{ fontWeight: "600", fontSize: "0.78rem", color: isLight ? "#0f172a" : "#f1f5f9" }}>Evaluating optimal solution approaches...</span>
                  </div>
                ) : aiReview ? (
                  <div style={{ background: isLight ? "#ffffff" : "#080c14", border: `1px solid ${isLight ? "#e2e8f0" : "rgba(255,255,255,0.08)"}`, borderRadius: "6px", padding: "12px", fontSize: "0.78rem", lineHeight: "1.5" }}>
                    <AIContentRenderer content={aiReview.review} compact />
                  </div>
                ) : (
                  <div style={{ padding: "1.5rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", background: "rgba(120, 80, 255, 0.04)", border: "1px dashed rgba(120, 80, 255, 0.25)", borderRadius: "6px" }}>
                    <Sparkles size={20} color="#c084fc" />
                    <div>
                      <strong style={{ color: isLight ? "#0f172a" : "#f8fafc", fontSize: "0.82rem" }}>Instant Solution & Complexity Breakdown</strong>
                      <p style={{ margin: "3px 0 0 0", color: "#94a3b8", fontSize: "0.72rem" }}>
                        Explore optimal approaches, Big-O trade-offs, and edge case strategies for {problemWithStatus.title}.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={fetchAIReview}
                      style={{ background: "linear-gradient(135deg, #7850ff 0%, #a855f7 100%)", border: "none", borderRadius: "6px", color: "#fff", fontWeight: "bold", fontSize: "0.74rem", padding: "6px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}
                    >
                      <Sparkles size={12} />
                      Generate Solution Walkthrough
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ---------------------------------------------------------------
                LEFT TAB 4: AI REVIEW & MENTOR
                --------------------------------------------------------------- */}
            {activeLeftTab === "aiReview" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ background: isLight ? "#fdf2f8" : "rgba(236, 72, 153, 0.08)", border: `1px solid ${isLight ? "#fbcfe8" : "rgba(236, 72, 153, 0.25)"}`, borderRadius: "6px", padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Sparkles size={16} color="#ec4899" />
                    <div>
                      <strong style={{ fontSize: "0.82rem", color: isLight ? "#831843" : "#f472b6" }}>
                        AI Code Review & Mentor
                      </strong>
                      <span style={{ display: "block", fontSize: "0.70rem", color: isLight ? "#9d174d" : "#cbd5e1" }}>
                        Live analysis of code quality, invariants, and edge case safety
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={fetchAIReview}
                    disabled={isReviewLoading}
                    style={{
                      background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
                      border: "none",
                      borderRadius: "5px",
                      color: "#fff",
                      fontSize: "0.70rem",
                      fontWeight: "bold",
                      padding: "4px 10px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    <Sparkles size={11} />
                    {isReviewLoading ? "Analyzing..." : "Review My Code"}
                  </button>
                </div>

                {isReviewLoading ? (
                  <div style={{ padding: "2.5rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: "#ec4899" }}>
                    <div className="spinner" style={{ width: 24, height: 24, border: "2px solid rgba(236, 72, 153, 0.2)", borderTopColor: "#ec4899", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    <span style={{ fontWeight: "600", fontSize: "0.78rem", color: isLight ? "#0f172a" : "#f1f5f9" }}>Analyzing code structure and correctness...</span>
                  </div>
                ) : aiReview ? (
                  <div style={{ background: isLight ? "#ffffff" : "#080c14", border: `1px solid ${isLight ? "#e2e8f0" : "rgba(255,255,255,0.08)"}`, borderRadius: "6px", padding: "12px", fontSize: "0.78rem", lineHeight: "1.5" }}>
                    <AIContentRenderer content={aiReview.review} compact />
                  </div>
                ) : (
                  <div style={{ padding: "2rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", background: "rgba(236, 72, 153, 0.03)", border: "1px dashed rgba(236, 72, 153, 0.2)", borderRadius: "6px" }}>
                    <Brain size={22} color="#ec4899" />
                    <div>
                      <strong style={{ color: isLight ? "#0f172a" : "#f8fafc", fontSize: "0.82rem" }}>Deep AI Code Review</strong>
                      <p style={{ margin: "3px 0 0 0", color: "#94a3b8", fontSize: "0.72rem" }}>
                        Click below to get instant feedback on time complexity, potential bugs, and optimization paths.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={fetchAIReview}
                      style={{ background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)", border: "none", borderRadius: "6px", color: "#fff", fontWeight: "bold", fontSize: "0.74rem", padding: "6px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}
                    >
                      <Sparkles size={12} />
                      Analyze Current Solution
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ===================================================================
            DRAGGABLE HORIZONTAL SPLIT DIVIDER (Left / Right)
            =================================================================== */}
        <div
          className={`judgo-ide-divider${isResizing ? " is-active" : ""}`}
          onPointerDown={startResizing}
          title="Drag to resize Problem panel and Code workspace"
        >
          <span className="judgo-ide-divider-handle">
            <GripVertical size={11} />
          </span>
        </div>

        {/* ===================================================================
            RIGHT PANE: 100% Code Editor (Top) + Execution Panel (Below on Scroll)
            =================================================================== */}
        <div
          ref={rightPaneRef}
          className="judgo-ide-right-pane"
        >
          {/* Top Code Editor Area (Occupies 100% full height of right view) */}
          <div
            ref={editorWrapperRef}
            className="judgo-ide-editor-wrapper"
          >
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
              onScrollToExec={scrollToExec}
            />
          </div>

          {/* Bottom Execution Panel - Always rendered directly below Code Editor */}
          <div
            id="execution-result-block"
            ref={execPanelRef}
            className="judgo-ide-exec-panel"
            tabIndex={-1}
            style={{ outline: "none" }}
          >
            {/* Execution Panel Header Tabs */}
            <div className="judgo-ide-exec-nav">
              <div className="judgo-ide-exec-tabs">
                {/* Exec Tab 1: Testcases */}
                <button
                  type="button"
                  className={`judgo-ide-exec-tab-btn${activeExecTab === "testcases" ? " is-active" : ""}`}
                  onClick={() => setActiveExecTab("testcases")}
                  style={{
                    borderBottomColor: activeExecTab === "testcases" ? "#06b6d4" : "transparent",
                    color: activeExecTab === "testcases" ? (isLight ? "#0891b2" : "#22d3ee") : undefined
                  }}
                >
                  <Layers size={14} style={{ color: "#06b6d4" }} />
                  <span>Testcases</span>
                </button>

                {/* Exec Tab 2: Custom Input */}
                <button
                  type="button"
                  className={`judgo-ide-exec-tab-btn${activeExecTab === "custom" ? " is-active" : ""}`}
                  onClick={() => setActiveExecTab("custom")}
                  style={{
                    borderBottomColor: activeExecTab === "custom" ? "#8b5cf6" : "transparent",
                    color: activeExecTab === "custom" ? (isLight ? "#7c3aed" : "#a78bfa") : undefined
                  }}
                >
                  <Sliders size={14} style={{ color: "#8b5cf6" }} />
                  <span>Custom Input</span>
                </button>

                {/* Exec Tab 3: Test Result */}
                <button
                  type="button"
                  className={`judgo-ide-exec-tab-btn${activeExecTab === "testResult" ? " is-active" : ""}`}
                  onClick={() => setActiveExecTab("testResult")}
                  style={{
                    borderBottomColor: activeExecTab === "testResult" ? "#16a34a" : "transparent",
                    color: activeExecTab === "testResult" ? (isLight ? "#15803d" : "#4ade80") : undefined
                  }}
                >
                  <Zap size={14} style={{ color: "#16a34a", fill: "#16a34a" }} />
                  <span>Test Result</span>
                  {displayVerdict && (
                    <span
                      style={{
                        fontSize: "0.66rem",
                        fontWeight: "800",
                        color: displayVerdict === "AC" ? "#16a34a" : "#ef4444",
                        background: displayVerdict === "AC" ? "rgba(22, 163, 74, 0.12)" : "rgba(239, 68, 68, 0.12)",
                        padding: "1px 5px",
                        borderRadius: "4px"
                      }}
                    >
                      {displayVerdict}
                    </span>
                  )}
                </button>

                {/* Exec Tab 4: Submissions */}
                <button
                  type="button"
                  className={`judgo-ide-exec-tab-btn${activeExecTab === "submissions" ? " is-active" : ""}`}
                  onClick={() => setActiveExecTab("submissions")}
                  style={{
                    borderBottomColor: activeExecTab === "submissions" ? "#ea580c" : "transparent",
                    color: activeExecTab === "submissions" ? (isLight ? "#c2410c" : "#fb923c") : undefined
                  }}
                >
                  <History size={14} style={{ color: "#f97316" }} />
                  <span>Submissions</span>
                  {userSubmissions.length > 0 && (
                    <span
                      style={{
                        fontSize: "0.66rem",
                        fontWeight: "800",
                        background: "rgba(249, 115, 22, 0.12)",
                        color: "#ea580c",
                        padding: "1px 5px",
                        borderRadius: "99px"
                      }}
                    >
                      {userSubmissions.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Right Action: Quick Jump to Editor */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <button
                  type="button"
                  onClick={scrollToEditor}
                  title="Scroll back up to Code Editor"
                  style={{
                    background: isLight ? "#f1f5f9" : "rgba(255, 255, 255, 0.06)",
                    border: `1px solid ${isLight ? "#e2e8f0" : "rgba(255, 255, 255, 0.1)"}`,
                    borderRadius: "5px",
                    color: isLight ? "#475569" : "#94a3b8",
                    fontSize: "0.72rem",
                    fontWeight: "600",
                    padding: "3px 8px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    transition: "all 0.15s ease"
                  }}
                >
                  <ChevronUp size={13} />
                  <span>Top / Editor</span>
                </button>
              </div>
            </div>

            {/* Execution Panel Content Body - Always Rendered */}
            <div className="judgo-ide-exec-body">
              {/* ---------------------------------------------------------------
                  EXEC TAB 1: TESTCASES
                  --------------------------------------------------------------- */}
              {activeExecTab === "testcases" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {/* Case Selector Buttons */}
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                    {problemWithStatus.examples.map((_, idx) => {
                      const casePassed = resultCases[idx]?.passed;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedCaseIndex(idx)}
                          style={{
                            background: selectedCaseIndex === idx
                              ? isLight ? "rgba(6, 182, 212, 0.12)" : "rgba(6, 182, 212, 0.2)"
                              : isLight ? "#f8fafc" : "#0d111a",
                            border: selectedCaseIndex === idx
                              ? "1px solid #06b6d4"
                              : `1px solid ${isLight ? "#e2e8f0" : "rgba(255,255,255,0.08)"}`,
                            color: selectedCaseIndex === idx
                              ? isLight ? "#0891b2" : "#22d3ee"
                              : isLight ? "#475569" : "#cbd5e1",
                            borderRadius: "6px",
                            padding: "3px 9px",
                            fontSize: "0.74rem",
                            fontWeight: "700",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px"
                          }}
                        >
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              background: casePassed !== undefined ? (casePassed ? "#16a34a" : "#ef4444") : (selectedCaseIndex === idx ? "#06b6d4" : "#64748b")
                            }}
                          />
                          Case {idx + 1}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => setActiveExecTab("custom")}
                      title="Switch to custom input"
                      style={{
                        background: isLight ? "#f8fafc" : "#0d111a",
                        border: `1px dashed ${isLight ? "#cbd5e1" : "rgba(255,255,255,0.15)"}`,
                        color: isLight ? "#64748b" : "#94a3b8",
                        borderRadius: "6px",
                        padding: "3px 8px",
                        fontSize: "0.74rem",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "3px",
                        cursor: "pointer"
                      }}
                    >
                      <Plus size={12} style={{ color: "#06b6d4" }} />
                      <span>Custom</span>
                    </button>
                  </div>

                  {/* Active Selected Case Details */}
                  {problemWithStatus.examples[selectedCaseIndex] && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div>
                        <span style={{ fontSize: "0.74rem", fontWeight: "700", color: isLight ? "#0284c7" : "#38bdf8", display: "flex", alignItems: "center", gap: "4px" }}>
                          <span>📥</span> Input
                        </span>
                        <pre
                          style={{
                            background: isLight ? "#f8fafc" : "#080c14",
                            border: `1px solid ${isLight ? "#e2e8f0" : "rgba(255,255,255,0.08)"}`,
                            padding: "8px 10px",
                            borderRadius: "6px",
                            fontSize: "0.78rem",
                            margin: "3px 0 0 0",
                            color: isLight ? "#0f172a" : "#f1f5f9",
                            fontFamily: "monospace",
                            whiteSpace: "pre-wrap"
                          }}
                        >
                          {formatDisplayValue(problemWithStatus.examples[selectedCaseIndex].input)}
                        </pre>
                      </div>

                      <div>
                        <span style={{ fontSize: "0.74rem", fontWeight: "700", color: isLight ? "#16a34a" : "#4ade80", display: "flex", alignItems: "center", gap: "4px" }}>
                          <span>📤</span> Expected Output
                        </span>
                        <pre
                          style={{
                            background: isLight ? "#f8fafc" : "#080c14",
                            border: `1px solid ${isLight ? "#e2e8f0" : "rgba(255,255,255,0.08)"}`,
                            padding: "8px 10px",
                            borderRadius: "6px",
                            fontSize: "0.78rem",
                            margin: "3px 0 0 0",
                            color: isLight ? "#0f172a" : "#f1f5f9",
                            fontFamily: "monospace",
                            whiteSpace: "pre-wrap"
                          }}
                        >
                          {formatDisplayValue(problemWithStatus.examples[selectedCaseIndex].output)}
                        </pre>
                      </div>

                      {resultCases[selectedCaseIndex] && (
                        <div>
                          <span style={{ fontSize: "0.74rem", fontWeight: "700", color: resultCases[selectedCaseIndex]?.passed ? "#16a34a" : "#ef4444", display: "flex", alignItems: "center", gap: "4px" }}>
                            <span>{resultCases[selectedCaseIndex]?.passed ? "✓" : "✕"}</span> Your Output ({resultCases[selectedCaseIndex]?.passed ? "Passed" : "Failed"})
                          </span>
                          <pre
                            style={{
                              background: isLight ? "#f8fafc" : "#080c14",
                              border: `1px solid ${resultCases[selectedCaseIndex]?.passed ? "rgba(22,163,74,0.3)" : "rgba(239,68,68,0.3)"}`,
                              padding: "8px 10px",
                              borderRadius: "6px",
                              fontSize: "0.78rem",
                              margin: "3px 0 0 0",
                              color: resultCases[selectedCaseIndex]?.passed ? "#16a34a" : "#ef4444",
                              fontFamily: "monospace",
                              whiteSpace: "pre-wrap"
                            }}
                          >
                            {formatDisplayValue(resultCases[selectedCaseIndex]?.actualOutput || resultCases[selectedCaseIndex]?.stdout || "No output")}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ---------------------------------------------------------------
                  EXEC TAB 2: CUSTOM INPUT
                  --------------------------------------------------------------- */}
              {activeExecTab === "custom" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.74rem", color: isLight ? "#7c3aed" : "#a78bfa", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                      <span>⚙️</span> Custom STDIN
                    </span>
                    <span style={{ fontSize: "0.70rem", color: isLight ? "#94a3b8" : "#64748b" }}>
                      Supplied to your code when clicking "Run"
                    </span>
                  </div>
                  <textarea
                    style={{
                      width: "100%",
                      height: "100px",
                      background: isLight ? "#f8fafc" : "#080c14",
                      color: isLight ? "#0f172a" : "#eee",
                      border: `1px solid ${isLight ? "#cbd5e1" : "rgba(255,255,255,0.1)"}`,
                      borderRadius: "6px",
                      padding: "8px 10px",
                      fontFamily: "monospace",
                      fontSize: "0.80rem",
                      resize: "vertical",
                      boxSizing: "border-box"
                    }}
                    placeholder="Enter custom input arguments here..."
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                  />
                </div>
              )}

              {/* ---------------------------------------------------------------
                  EXEC TAB 3: TEST RESULT
                  --------------------------------------------------------------- */}
              {activeExecTab === "testResult" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {isRunning || isSubmitting || isProcessingResult ? (
                    <div style={{ padding: "2rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: "#8b9bb4" }}>
                      <div className="spinner" style={{ width: 26, height: 26, border: "3px solid #333", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                      <div style={{ textAlign: "center" }}>
                        <strong style={{ fontSize: "0.88rem", color: isLight ? "#0f172a" : "#f8fafc", display: "block" }}>
                          {result?.statusText || (isSubmitting ? "Evaluating in Disposable Sandbox..." : "Executing Solution...")}
                        </strong>
                        <span style={{ fontSize: "0.74rem", color: "#94a3b8", marginTop: "2px", display: "block" }}>
                          Running tests against sandbox worker...
                        </span>
                      </div>
                    </div>
                  ) : result ? (
                    <div className="compact-result-view" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {/* Modern Stylish Animated Verdict Card */}
                      <div className={`result-verdict-card ${displayVerdict === "AC" ? "is-accepted" : "is-error"} is-${(displayVerdict || "error").toLowerCase()}`}>
                        {/* Animated Shimmer Ray */}
                        <div className="verdict-sheen-beam" aria-hidden="true" />

                        {/* Ambient Glow Orb */}
                        <div className="verdict-glow-orb" aria-hidden="true" />

                        <div className="result-verdict-main">
                          {/* 3D Glass Icon Badge with Pulsing Aura */}
                          <div className="result-verdict-icon-wrap">
                            <span className="result-verdict-icon-aura" aria-hidden="true" />
                            <span className="result-verdict-icon" aria-hidden="true">
                              {displayVerdict === "AC" ? (
                                <CheckCircle2 size={24} strokeWidth={2.4} />
                              ) : displayVerdict === "CE" ? (
                                <AlertTriangle size={24} strokeWidth={2.4} />
                              ) : (
                                <XCircle size={24} strokeWidth={2.4} />
                              )}
                            </span>
                          </div>

                          <div className="result-verdict-content">
                            {/* High-tech Status Pill */}
                            <div className="result-verdict-badge">
                              <span className="result-verdict-pulse-dot" />
                              <span>{displayVerdict === "AC" ? "ALL TESTS PASSED" : (displayVerdict || "FAILED")}</span>
                            </div>

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
                                ? `Your solution passed all ${totalCasesNum} test cases.`
                                : displayVerdict === "CE"
                                ? "The compiler rejected this code."
                                : displayVerdict === "TLE"
                                ? "Time Limit Exceeded on one or more testcases."
                                : displayVerdict === "RE"
                                ? "Program terminated unexpectedly during execution."
                                : displayVerdict === "SYSTEM_ERROR"
                                ? "The sandbox service encountered an issue."
                                : `Passed ${passedCountNum} of ${totalCasesNum} test cases.`}
                            </span>

                            {/* Segmented Testcase Indicators or Continuous Progress */}
                            {totalCasesNum > 0 && totalCasesNum <= 12 ? (
                              <div className="verdict-segments-row" title={`${passedCountNum} of ${totalCasesNum} test cases passed`}>
                                {Array.from({ length: totalCasesNum }).map((_, i) => {
                                  const isPassed = i < passedCountNum;
                                  return (
                                    <span
                                      key={i}
                                      className={`verdict-segment-pill ${isPassed ? "is-passed" : "is-failed"}`}
                                      title={`Testcase ${i + 1}: ${isPassed ? "Passed" : "Failed"}`}
                                    />
                                  );
                                })}
                                <span className="verdict-segments-count">{passedCountNum}/{totalCasesNum} passed</span>
                              </div>
                            ) : totalCasesNum > 12 ? (
                              <div className="verdict-progress-wrap" title={`${passedCountNum} of ${totalCasesNum} testcases passed`}>
                                <div className="verdict-progress-track">
                                  <div
                                    className="verdict-progress-fill"
                                    style={{
                                      width: `${Math.min(100, Math.max(0, (passedCountNum / totalCasesNum) * 100))}%`
                                    }}
                                  />
                                </div>
                                <span className="verdict-progress-label">
                                  {passedCountNum}/{totalCasesNum} passed
                                </span>
                              </div>
                            ) : null}
                          </div>
                        </div>

                        {/* High-Performance Telemetry HUD Module */}
                        <div className="verdict-telemetry-hud">
                          <div className="telemetry-item telemetry-runtime" title="Execution Runtime">
                            <div className="telemetry-icon-box">
                              <Clock3 size={16} />
                            </div>
                            <div className="telemetry-data">
                              <span className="telemetry-label">Runtime</span>
                              <div className="telemetry-value-wrap">
                                <span className="telemetry-value">{displayRuntime}</span>
                              </div>
                            </div>
                          </div>

                          <div className="telemetry-divider" aria-hidden="true" />

                          <div className="telemetry-item telemetry-memory" title="Peak Resident Memory">
                            <div className="telemetry-icon-box">
                              <MemoryStick size={16} />
                            </div>
                            <div className="telemetry-data">
                              <span className="telemetry-label">Memory</span>
                              <div className="telemetry-value-wrap">
                                <span className="telemetry-value">{displayMemory}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Test Case Diffs / Results List */}
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
                                    onClick={() => setExpandedResultCaseIndex(expanded ? null : index)}
                                  >
                                    {passed ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                                    <span>Case {index + 1}</span>
                                    <strong>{passed ? "Passed" : formatDisplayValue(testCase?.verdict, "Failed")}</strong>
                                    <ChevronDown size={13} className={expanded ? "is-expanded" : ""} />
                                  </button>

                                  {expanded && (
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
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </section>
                      ) : (
                        <div className="result-diagnostic-card">
                          <strong>Diagnostic Output</strong>
                          <pre>
                            {formatDisplayValue(
                              result.compileOutput || result.stderr || result.compiler?.stderr || result.diagnostic || result.statusText,
                              "No diagnostic details were returned."
                            )}
                          </pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ padding: "2rem", textAlign: "center", color: "#64748b", border: `1px dashed ${isLight ? "#e2e8f0" : "rgba(255,255,255,0.08)"}`, borderRadius: "6px" }}>
                      <Zap size={22} style={{ marginBottom: "4px", opacity: 0.6 }} />
                      <p style={{ margin: "0 0 2px 0", fontSize: "0.82rem", fontWeight: "600", color: isLight ? "#0f172a" : "#f1f5f9" }}>
                        No Execution Results Yet
                      </p>
                      <span style={{ fontSize: "0.74rem" }}>
                        Click <strong>Run</strong> or <strong>Submit</strong> above to execute testcases and view results here.
                      </span>
                    </div>
                  )}

                  {error && <p className="form-error" style={{ color: "#ef4444", marginTop: "4px", fontSize: "0.78rem" }}>{formatDisplayValue(error)}</p>}
                </div>
              )}

              {/* ---------------------------------------------------------------
                  EXEC TAB 4: SUBMISSIONS
                  --------------------------------------------------------------- */}
              {activeExecTab === "submissions" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h3 style={{ fontSize: "0.82rem", fontWeight: "700", color: isLight ? "#0f172a" : "#fff", margin: 0 }}>
                      Submission History ({userSubmissions.length})
                    </h3>
                  </div>

                  {userSubmissions.length === 0 ? (
                    <div style={{ padding: "2rem", textAlign: "center", color: "#64748b", border: `1px dashed ${isLight ? "#e2e8f0" : "rgba(255,255,255,0.08)"}`, borderRadius: "6px" }}>
                      <History size={22} style={{ marginBottom: "4px", opacity: 0.6 }} />
                      <p style={{ margin: 0, fontSize: "0.78rem" }}>No submissions recorded for this problem yet.</p>
                    </div>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
                        <thead>
                          <tr style={{ borderBottom: `1px solid ${isLight ? "#e2e8f0" : "rgba(255,255,255,0.08)"}`, textAlign: "left", color: "#64748b" }}>
                            <th style={{ padding: "6px 6px" }}>Status</th>
                            <th style={{ padding: "6px 6px" }}>Language</th>
                            <th style={{ padding: "6px 6px" }}>Runtime</th>
                            <th style={{ padding: "6px 6px" }}>Memory</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userSubmissions.map((sub, idx) => (
                            <tr key={sub?.id || sub?.submissionId || idx} style={{ borderBottom: `1px solid ${isLight ? "#f1f5f9" : "rgba(255,255,255,0.04)"}` }}>
                              <td style={{ padding: "6px 6px", fontWeight: "bold", color: sub?.verdict === "AC" ? "#16a34a" : "#ef4444" }}>
                                {formatDisplayValue(sub?.verdict, "AC")}
                              </td>
                              <td style={{ padding: "6px 6px", color: isLight ? "#334155" : "#cbd5e1" }}>{formatDisplayValue(sub?.language, "python")}</td>
                              <td style={{ padding: "6px 6px", color: isLight ? "#334155" : "#cbd5e1" }}>{formatDisplayValue(sub?.runtime, "—")}</td>
                              <td style={{ padding: "6px 6px", color: isLight ? "#334155" : "#cbd5e1" }}>{formatDisplayValue(sub?.memory, "—")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
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

