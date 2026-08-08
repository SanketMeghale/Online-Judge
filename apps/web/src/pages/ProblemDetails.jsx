import { useEffect, useMemo, useState } from "react";
import { Bookmark, CheckCircle2, ChevronDown, ChevronRight, History, Layers, Lightbulb, Sliders, Sparkles, XCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/apiClient.js";
import { useAuth } from "../auth/AuthContext.jsx";
import CodeEditor from "../components/editor/CodeEditor.jsx";
import { useAppData } from "../data/AppDataContext.jsx";

export default function ProblemDetails() {
  const { problemId } = useParams();
  const { user } = useAuth();
  const { getProblemById, getProblemsForUser, getSavedCode, getSubmissionsForUser, runSolution, saveCode, submitSolution } = useAppData();
  const problem = getProblemById(problemId);
  const currentUserId = user?.id || user?._id || "guest_coder";
  const userProblems = getProblemsForUser(currentUserId);
  const problemWithStatus = useMemo(
    () => userProblems.find((item) => item.id === problemId) ?? problem,
    [problem, problemId, userProblems]
  );

  const [language, setLanguage] = useState("Python");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState("result"); // 'testcase' | 'custom' | 'result' | 'history' | 'ai'
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);
  const [customInput, setCustomInput] = useState("");
  const [showHint, setShowHint] = useState(false);

  const userSubmissions = useMemo(
    () => getSubmissionsForUser(currentUserId).filter((s) => s.problemId === problemId),
    [getSubmissionsForUser, problemId, currentUserId, result]
  );

  const [code, setCode] = useState(() => getSavedCode(problemId, "Python", problem?.starterCode?.Python ?? ""));

  useEffect(() => {
    if (!problemWithStatus) return;
    setCode(getSavedCode(problemWithStatus.id, language, problemWithStatus.starterCode?.[language.toLowerCase()] || problemWithStatus.starterCode?.[language] || ""));
    setResult(null);
  }, [language, problemId]);

  // Polling fallback to update PENDING / QUEUED submission result in real time
  useEffect(() => {
    if (!result || (result.verdict !== "PENDING" && result.status !== "QUEUED")) return;

    const subId = result.submissionId || result.id;
    if (!subId) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const res = await api.getSubmission(subId);
        const sub = res?.submission || res;
        if (sub && sub.verdict && sub.verdict !== "PENDING" && sub.status !== "QUEUED" && isMounted) {
          const firstTc = (sub.testcases || [])[0] || {};
          setResult((prev) => ({
            ...prev,
            verdict: sub.verdict,
            statusText: sub.statusText || (sub.verdict === "AC" ? "Accepted" : "Submission evaluated"),
            runtime: `${sub.runtimeMs || 25} ms`,
            runtimeMs: sub.runtimeMs || 25,
            memory: `${sub.memoryMb || 14.2} MB`,
            memoryMb: sub.memoryMb || 14.2,
            passedCount: sub.passCount ?? sub.passedCount ?? 0,
            totalCases: sub.totalCount ?? sub.totalCases ?? problemWithStatus?.examples?.length ?? 2,
            output: firstTc.stdout || sub.stdout || sub.output || "",
            stdout: firstTc.stdout || sub.stdout || "",
            stderr: firstTc.stderr || sub.stderr || "",
            expectedOutput: firstTc.expectedOutput || sub.expectedOutput || problemWithStatus?.examples?.[0]?.output || "",
            testResults: sub.testcases || []
          }));
          clearInterval(interval);
        }
      } catch (e) {}
    }, 500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [result, problemWithStatus]);

  if (!problemWithStatus) {
    return (
      <section className="section-block">
        <h1>Problem not found</h1>
        <p>The requested problem does not exist in the platform dataset.</p>
      </section>
    );
  }

  function handleCodeChange(nextCode) {
    setCode(nextCode);
    saveCode(problemWithStatus.id, language, nextCode);
  }

  function handleLanguageChange(nextLanguage) {
    setLanguage(nextLanguage);
    const starter = problemWithStatus.starterCode?.[nextLanguage.toLowerCase()] || problemWithStatus.starterCode?.[nextLanguage] || "";
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
      setResult({
        ...nextResult,
        type: "run"
      });
    } catch (runError) {
      setError(runError.message || "Failed to execute code");
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
      setResult({
        ...nextResult,
        type: "submit"
      });
    } catch (submitError) {
      setError(submitError.message || "Failed to submit code");
    } finally {
      setIsSubmitting(false);
    }
  }

  const activeExample = problemWithStatus.examples[selectedCaseIndex] || problemWithStatus.examples[0];
  const testResults = result?.testResults || [];
  const currentTestResult = testResults[selectedCaseIndex] || null;

  return (
    <div className="problem-detail-page-container" style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", maxWidth: "1600px" }}>
      {/* Breadcrumb Navigation */}
      <nav className="problem-crumbs" style={{ display: "flex", alignItems: "center", gap: "8px", color: "#8b9bb4", fontSize: "0.85rem" }}>
        <Link to="/problems" style={{ color: "#8b9bb4", textDecoration: "none" }}>Problems</Link>
        <ChevronRight size={14} />
        <span>{problemWithStatus.topic || "Arrays"}</span>
        <ChevronRight size={14} />
        <strong style={{ color: "#ffffff" }}>{problemWithStatus.title}</strong>
      </nav>

      {/* Main 2-Column Grid Layout matching Reference UI */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(380px, 0.95fr) minmax(520px, 1.05fr)", gap: "14px", width: "100%", alignItems: "start" }}>
        
        {/* LEFT COLUMN: Problem Statement & Testcases List Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          
          {/* Problem Statement Card */}
          <section className="problem-statement-card" style={{ background: "#0d111a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Header Title Row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span className={`difficulty difficulty-${problemWithStatus.difficulty.toLowerCase()}`} style={{ fontSize: "0.75rem", padding: "2px 10px", borderRadius: "6px", fontWeight: "bold" }}>
                  {problemWithStatus.difficulty}
                </span>
                <h1 style={{ fontSize: "1.45rem", fontWeight: "800", color: "#fff", margin: "8px 0 0 0" }}>
                  {problemWithStatus.title}
                </h1>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span className="solved-pill" style={{ display: "flex", alignItems: "center", gap: "5px", color: "#4ade80", fontSize: "0.82rem", background: "rgba(74, 222, 128, 0.1)", padding: "3px 10px", borderRadius: "999px", fontWeight: "600" }}>
                  <CheckCircle2 size={14} />
                  {problemWithStatus.status || "Attempted"}
                </span>
                <Bookmark size={18} style={{ color: "#64748b", cursor: "pointer" }} />
              </div>
            </div>

            {/* Topic & Metric Tags */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ background: "#181e2e", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8", fontSize: "0.78rem", padding: "3px 10px", borderRadius: "6px", fontWeight: "500" }}>
                🏷️ {problemWithStatus.topic}
              </span>
              <span style={{ background: "#181e2e", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8", fontSize: "0.78rem", padding: "3px 10px", borderRadius: "6px", fontWeight: "500" }}>
                Hash Map
              </span>
              <span style={{ background: "#181e2e", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8", fontSize: "0.78rem", padding: "3px 10px", borderRadius: "6px", fontWeight: "500" }}>
                📊 {problemWithStatus.acceptance}% Acceptance
              </span>
              <span style={{ background: "#181e2e", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8", fontSize: "0.78rem", padding: "3px 10px", borderRadius: "6px", fontWeight: "500" }}>
                ⏱️ {problemWithStatus.points} pts
              </span>
            </div>

            {/* Stats Table Grid Card */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", background: "#080c14", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
              <div>
                <span style={{ fontSize: "0.72rem", color: "#64748b", display: "block" }}>Time Limit</span>
                <strong style={{ fontSize: "0.92rem", color: "#eee" }}>2 sec</strong>
              </div>
              <div>
                <span style={{ fontSize: "0.72rem", color: "#64748b", display: "block" }}>Memory Limit</span>
                <strong style={{ fontSize: "0.92rem", color: "#eee" }}>256 MB</strong>
              </div>
              <div>
                <span style={{ fontSize: "0.72rem", color: "#64748b", display: "block" }}>Submissions</span>
                <strong style={{ fontSize: "0.92rem", color: "#eee" }}>98.7K</strong>
              </div>
              <div>
                <span style={{ fontSize: "0.72rem", color: "#64748b", display: "block" }}>Points</span>
                <strong style={{ fontSize: "0.92rem", color: "#eee" }}>{problemWithStatus.points}</strong>
              </div>
            </div>

            {/* Description Text */}
            <div>
              <h3 style={{ fontSize: "0.95rem", color: "#94a3b8", marginBottom: "6px", fontWeight: "bold" }}>Description</h3>
              <p style={{ color: "#cbd5e1", fontSize: "0.9rem", lineHeight: "1.6", margin: 0 }}>
                {problemWithStatus.statement}
              </p>
            </div>

            {/* Examples */}
            <div>
              <h3 style={{ fontSize: "0.95rem", color: "#94a3b8", marginBottom: "8px", fontWeight: "bold" }}>Examples</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {problemWithStatus.examples.map((example, index) => (
                  <div key={index} style={{ background: "#080c14", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "10px 12px" }}>
                    <strong style={{ color: "#60a5fa", fontSize: "0.82rem", display: "block", marginBottom: "4px" }}>Example {index + 1}</strong>
                    <pre style={{ margin: 0, color: "#cbd5e1", fontFamily: "monospace", fontSize: "0.82rem", lineHeight: "1.5", whiteSpace: "pre-wrap" }}>
                      {`Input: ${example.input}\nOutput: ${example.output}`}
                    </pre>
                  </div>
                ))}
              </div>
            </div>

            {/* Constraints */}
            <div>
              <h3 style={{ fontSize: "0.95rem", color: "#94a3b8", marginBottom: "6px", fontWeight: "bold" }}>Constraints</h3>
              <ul style={{ margin: 0, paddingLeft: "18px", color: "#cbd5e1", fontSize: "0.85rem", lineHeight: "1.6" }}>
                {problemWithStatus.constraints.map((constraint) => (
                  <li key={constraint}>{constraint}</li>
                ))}
              </ul>
            </div>

            {/* Hint Bar */}
            <div style={{ background: "#131826", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => setShowHint(!showHint)}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#cbd5e1", fontSize: "0.85rem" }}>
                <Lightbulb size={16} style={{ color: "#eab308" }} />
                <span>Hint</span>
              </div>
              <span style={{ fontSize: "0.75rem", color: "#8b9bb4" }}>1 available <ChevronDown size={14} /></span>
            </div>
            {showHint ? (
              <p style={{ background: "#080c14", border: "1px solid rgba(234, 179, 8, 0.2)", color: "#fef08a", padding: "10px", borderRadius: "8px", fontSize: "0.82rem", margin: 0 }}>
                💡 Consider storing seen values in a Hash Map to look up complementary targets in O(1) time.
              </p>
            ) : null}
          </section>

          {/* Testcases Selection List Card (Left Bottom) */}
          <section className="testcases-list-card" style={{ background: "#0d111a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "0.95rem", color: "#fff", fontWeight: "bold", margin: 0 }}>Testcases</h3>
              <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                {testResults.length ? `${testResults.filter(t=>t.passed).length} / ${testResults.length}` : `${problemWithStatus.examples.length} / ${problemWithStatus.examples.length}`} testcases
              </span>
            </div>

            {/* Testcases List Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {problemWithStatus.examples.map((example, index) => {
                const caseRes = testResults[index];
                const isPass = caseRes ? caseRes.passed : (result?.verdict === "AC");
                const isSelected = selectedCaseIndex === index;

                return (
                  <div
                    key={index}
                    onClick={() => setSelectedCaseIndex(index)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      background: isSelected ? "rgba(120, 80, 255, 0.15)" : "#080c14",
                      border: isSelected ? "1px solid #7850ff" : "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                  >
                    {isPass ? <CheckCircle2 size={16} style={{ color: "#4ade80" }} /> : <XCircle size={16} style={{ color: "#f87171" }} />}
                    <strong style={{ color: isSelected ? "#fff" : "#cbd5e1", fontSize: "0.82rem" }}>Case {index + 1}</strong>
                    <span style={{ color: "#64748b", fontSize: "0.78rem", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {example.input}
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

          {/* Console Results Panel (Right Column Bottom) */}
          <section className="console-results-panel" style={{ background: "#0d111a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            
            {/* Console Tab Bar */}
            <div style={{ background: "#131826", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px" }}>
              <div style={{ display: "flex", gap: "2px" }}>
                <button
                  onClick={() => setActiveConsoleTab("testcase")}
                  type="button"
                  style={{
                    background: "transparent",
                    border: "none",
                    borderBottom: activeConsoleTab === "testcase" ? "2px solid #7850ff" : "2px solid transparent",
                    color: activeConsoleTab === "testcase" ? "#fff" : "#8b9bb4",
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
                    borderBottom: activeConsoleTab === "custom" ? "2px solid #7850ff" : "2px solid transparent",
                    color: activeConsoleTab === "custom" ? "#fff" : "#8b9bb4",
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
                    borderBottom: activeConsoleTab === "result" ? "2px solid #7850ff" : "2px solid transparent",
                    color: activeConsoleTab === "result" ? "#fff" : "#8b9bb4",
                    fontSize: "0.82rem",
                    fontWeight: "bold",
                    padding: "10px 12px",
                    cursor: "pointer"
                  }}
                >
                  Result {result ? `(${result.verdict})` : ""}
                </button>

                <button
                  onClick={() => setActiveConsoleTab("history")}
                  type="button"
                  style={{
                    background: "transparent",
                    border: "none",
                    borderBottom: activeConsoleTab === "history" ? "2px solid #7850ff" : "2px solid transparent",
                    color: activeConsoleTab === "history" ? "#fff" : "#8b9bb4",
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
                    borderBottom: activeConsoleTab === "ai" ? "2px solid #7850ff" : "2px solid transparent",
                    color: activeConsoleTab === "ai" ? "#c084fc" : "#8b9bb4",
                    fontSize: "0.82rem",
                    fontWeight: "bold",
                    padding: "10px 12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px"
                  }}
                >
                  <Sparkles size={14} style={{ color: "#c084fc" }} />
                  AI Review <span style={{ background: "#7850ff", color: "#fff", fontSize: "0.6rem", padding: "1px 5px", borderRadius: "999px" }}>NEW</span>
                </button>
              </div>

              <div style={{ display: "flex", gap: "8px", color: "#64748b" }}>
                <Sliders size={15} style={{ cursor: "pointer" }} />
              </div>
            </div>

            {/* Console Body Area */}
            <div style={{ padding: "14px" }}>
              {isRunning || isSubmitting ? (
                <div style={{ padding: "2rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.75rem", color: "#8b9bb4" }}>
                  <div className="spinner" style={{ width: 28, height: 28, border: "3px solid #333", borderTopColor: "#7850ff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  <span>{isRunning ? "Running code on testcase..." : "Judging submission against testsuite..."}</span>
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
                      {userSubmissions.map((sub) => (
                        <tr key={sub.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <td style={{ padding: "6px", fontWeight: "bold", color: sub.verdict === "AC" ? "#4ade80" : "#f87171" }}>{sub.verdict}</td>
                          <td style={{ padding: "6px", color: "#cbd5e1" }}>{sub.language}</td>
                          <td style={{ padding: "6px", color: "#cbd5e1" }}>{sub.runtime}</td>
                          <td style={{ padding: "6px", color: "#cbd5e1" }}>{sub.memory}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : result ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {/* Result Banner Box with GPU Verdict Animations */}
                  <div
                    className={result.verdict === "AC" ? "verdict-pop-ac" : result.verdict === "WA" ? "verdict-shake-wa" : result.verdict === "CE" ? "verdict-pulse-ce" : ""}
                    style={{
                      background: result.verdict === "AC" ? "rgba(34, 197, 94, 0.08)" : "rgba(248, 113, 113, 0.08)",
                      border: `1px solid ${result.verdict === "AC" ? "rgba(34, 197, 94, 0.4)" : "rgba(248, 113, 113, 0.4)"}`,
                      borderRadius: "10px",
                      padding: "12px 16px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "1.2rem", fontWeight: "bold", color: result.verdict === "AC" ? "#4ade80" : "#f87171" }}>
                        {result.verdict === "AC" ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
                        {result.verdict === "AC" ? "Accepted" : result.verdict === "WA" ? "Wrong Answer" : result.statusText || result.verdict}
                      </div>
                      <span style={{ fontSize: "0.8rem", color: "#8b9bb4", marginTop: "2px", display: "block" }}>
                        {result.verdict === "AC" ? `Passed all ${result.totalCases || problemWithStatus.examples.length} testcases` : `Passed ${result.passedCount || 1} / ${result.totalCases || 5} testcases`}
                      </span>
                    </div>

                    {/* Runtime & Memory Stat Cards */}
                    <div style={{ display: "flex", gap: "10px" }}>
                      <div style={{ background: "#080c14", border: "1px solid rgba(255,255,255,0.06)", padding: "4px 12px", borderRadius: "8px", textAlign: "center", minWidth: "90px" }}>
                        <span style={{ fontSize: "0.68rem", color: "#64748b", textTransform: "uppercase", fontWeight: "bold" }}>Runtime</span>
                        <strong style={{ fontSize: "1rem", color: "#fff", display: "block" }}>{result.runtime || "238 ms"}</strong>
                        <span style={{ fontSize: "0.7rem", color: "#4ade80" }}>Beats {result.runtimePercentile || 99.9}%</span>
                      </div>
                      <div style={{ background: "#080c14", border: "1px solid rgba(255,255,255,0.06)", padding: "4px 12px", borderRadius: "8px", textAlign: "center", minWidth: "90px" }}>
                        <span style={{ fontSize: "0.68rem", color: "#64748b", textTransform: "uppercase", fontWeight: "bold" }}>Memory</span>
                        <strong style={{ fontSize: "1rem", color: "#fff", display: "block" }}>{result.memory || "14 MB"}</strong>
                        <span style={{ fontSize: "0.7rem", color: "#4ade80" }}>Beats {result.memoryPercentile || 28.4}%</span>
                      </div>
                    </div>
                  </div>

                  {/* 3-Column Input / Expected Output / Your Output Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.9fr 0.9fr", gap: "10px" }}>
                    <div style={{ background: "#080c14", padding: "10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "bold" }}>Input</span>
                      <pre style={{ margin: "4px 0 0 0", color: "#cbd5e1", fontFamily: "monospace", fontSize: "0.82rem" }}>
                        {currentTestResult?.input || activeExample?.input}
                      </pre>
                    </div>

                    <div style={{ background: "#080c14", padding: "10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "bold" }}>Expected Output</span>
                      <pre style={{ margin: "4px 0 0 0", color: "#4ade80", fontFamily: "monospace", fontSize: "0.82rem" }}>
                        {currentTestResult?.expectedOutput || activeExample?.output}
                      </pre>
                    </div>

                    <div style={{ background: "#080c14", padding: "10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "bold" }}>Your Output</span>
                      <pre style={{ margin: "4px 0 0 0", color: (currentTestResult?.passed || result.verdict === "AC") ? "#4ade80" : "#f87171", fontFamily: "monospace" }}>
                        {currentTestResult?.stdout || currentTestResult?.actualOutput || result.stdout || (result.output && result.output !== "Evaluation finished" ? result.output : "") || "(No output)"}
                      </pre>
                    </div>
                  </div>

                  {/* AI Hint Footer Banner */}
                  <div style={{ background: "rgba(120, 80, 255, 0.08)", border: "1px solid rgba(120, 80, 255, 0.2)", borderRadius: "8px", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Sparkles size={16} style={{ color: "#c084fc" }} />
                      <div>
                        <strong style={{ color: "#c084fc", fontSize: "0.82rem" }}>AI Hint</strong>
                        <p style={{ margin: "2px 0 0 0", color: "#cbd5e1", fontSize: "0.78rem" }}>
                          {result.verdict === "AC" ? "Great solution! You can optimize memory by using in-place pointers." : "Looks like your solution returned mismatched values. Try iterating carefully and returning the first valid pair."}
                        </p>
                      </div>
                    </div>
                    <button style={{ background: "#7850ff", border: "none", borderRadius: "6px", color: "#fff", fontSize: "0.78rem", fontWeight: "bold", padding: "6px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap" }}>
                      + Explain with AI
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: "2rem", textAlign: "center", color: "#64748b", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "8px" }}>
                  <span>Click Run or Submit to execute code and view your execution result breakdown.</span>
                </div>
              )}

              {error ? <p className="form-error" style={{ color: "#ef4444", marginTop: "8px" }}>{error}</p> : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
