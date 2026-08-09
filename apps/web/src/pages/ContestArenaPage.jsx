import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Code2,
  FileText,
  Lock,
  Play,
  Radio,
  Send,
  Shield,
  Sparkles,
  Trophy,
  XCircle,
  Zap
} from "lucide-react";
import { api } from "../api/apiClient.js";
import { useAuth } from "../auth/AuthContext.jsx";
import CodeEditor from "../components/editor/CodeEditor.jsx";
import { useAppData } from "../data/AppDataContext.jsx";

export default function ContestArenaPage() {
  const { contestId, problemId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { runSolution, submitSolution } = useAppData();

  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeProblemIndex, setActiveProblemIndex] = useState(0);

  const [language, setLanguage] = useState("Python");
  const [code, setCode] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [consoleTab, setConsoleTab] = useState("result");

  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isEnded, setIsEnded] = useState(false);
  const [score, setScore] = useState(0);
  const [solvedProblemIds, setSolvedProblemIds] = useState(new Set());

  // Fetch Contest & Problem details
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError("");

    api
      .getContestById(contestId)
      .then((res) => {
        if (!isMounted) return;
        const c = res?.contest;
        if (!c) {
          setError("Contest not found.");
          setLoading(false);
          return;
        }

        setContest(c);

        // Calculate remaining seconds to end
        const endTs = new Date(c.endTime).getTime();
        const now = Date.now();
        const rem = Math.max(0, Math.floor((endTs - now) / 1000));
        setRemainingSeconds(rem);
        setIsEnded(rem <= 0 || c.status === "ENDED");

        // Set active problem if problemId specified in URL
        if (problemId && Array.isArray(c.problems)) {
          const idx = c.problems.findIndex((p) => p.id === problemId);
          if (idx !== -1) setActiveProblemIndex(idx);
        }

        setLoading(false);
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Failed to load contest arena.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [contestId, problemId]);

  // Real-time countdown ticker (updates every second)
  useEffect(() => {
    if (remainingSeconds <= 0 || isEnded) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsEnded(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingSeconds, isEnded]);

  const currentProblem = useMemo(() => {
    if (!contest || !Array.isArray(contest.problems) || contest.problems.length === 0) return null;
    return contest.problems[activeProblemIndex] || contest.problems[0];
  }, [contest, activeProblemIndex]);

  // Set default starter code when problem or language changes
  useEffect(() => {
    if (!currentProblem) return;

    const langKey = language.toLowerCase();
    let starter = "";

    if (currentProblem.starterCode) {
      starter =
        currentProblem.starterCode[langKey] ||
        currentProblem.starterCode[language] ||
        currentProblem.starterCode.python ||
        "";
    }

    if (!starter) {
      if (language === "Python") {
        starter = `# Write your solution for ${currentProblem.name}\ndef solve():\n    pass\n`;
      } else if (language === "JavaScript") {
        starter = `// Write your solution for ${currentProblem.name}\nfunction solve() {\n  return 0;\n}\n`;
      } else if (language === "C++") {
        starter = `#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}\n`;
      } else {
        starter = `public class Solution {\n    public static void main(String[] args) {\n    }\n}\n`;
      }
    }

    setCode(starter);
    setTestResult(null);
  }, [currentProblem, language]);

  function formatTime(secs) {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  async function handleRunCode() {
    if (!currentProblem || isRunning) return;
    setIsRunning(true);
    setTestResult(null);
    setConsoleTab("result");

    try {
      const res = await runSolution(currentProblem.id, code, language, "");
      setTestResult({
        verdict: res.verdict || "OK",
        statusText: res.verdict === "AC" || res.verdict === "OK" ? "Run Completed" : res.statusText || "Execution Error",
        runtime: res.runtime || "18 ms",
        memory: res.memory || "12.4 MB",
        output: res.output || res.stdout || "Execution finished cleanly.",
        passedCount: res.passedCount || 1,
        totalCases: res.totalCases || 1
      });
    } catch (err) {
      setTestResult({
        verdict: "RE",
        statusText: "Execution Failed",
        runtime: "0 ms",
        memory: "0 MB",
        output: err.message || "Runtime error occurred during execution."
      });
    } finally {
      setIsRunning(false);
    }
  }

  async function handleSubmit() {
    if (!currentProblem || isSubmitting || isEnded) return;
    setIsSubmitting(true);
    setTestResult(null);
    setConsoleTab("result");

    try {
      const res = await submitSolution(currentProblem.id, code, language);
      const isAc = res.verdict === "AC";

      setTestResult({
        verdict: res.verdict,
        statusText: res.statusText || (isAc ? "Accepted" : "Wrong Answer"),
        runtime: res.runtime || "24 ms",
        memory: res.memory || "14.1 MB",
        output: res.output || res.message || (isAc ? "Accepted! Passed all contest testcases." : "Wrong Answer on testcase 1."),
        passedCount: res.passedCount || (isAc ? 4 : 0),
        totalCases: res.totalCases || 4
      });

      if (isAc && !solvedProblemIds.has(currentProblem.id)) {
        setSolvedProblemIds((prev) => new Set([...prev, currentProblem.id]));
        setScore((prev) => prev + (currentProblem.points || 250));
      }
    } catch (err) {
      setTestResult({
        verdict: "WA",
        statusText: "Submission Failed",
        output: err.message || "Failed to process submission."
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "12px" }}>
        <Sparkles size={28} className="animate-spin" style={{ color: "#818cf8" }} />
        <span style={{ fontSize: "0.9rem", color: "#94a3b8", fontWeight: "600" }}>Entering Contest Arena...</span>
      </div>
    );
  }

  if (error || !contest) {
    return (
      <div style={{ maxWidth: "600px", margin: "60px auto", textAlign: "center", padding: "32px", background: "#0d111a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px" }}>
        <XCircle size={36} style={{ color: "#ef4444", marginBottom: "12px" }} />
        <h2 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#f8fafc", margin: "0 0 8px 0" }}>{error || "Contest Arena Unavailable"}</h2>
        <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0 0 20px 0" }}>You cannot enter this contest arena at this time.</p>
        <Link to="/contests" style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", color: "#fff", padding: "8px 20px", borderRadius: "8px", textDecoration: "none", fontSize: "0.84rem", fontWeight: "700" }}>
          Back to Contests
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "calc(100vh - 80px)", gap: "12px", maxWidth: "1400px", margin: "0 auto" }}>

      {/* ── ARENA TOP HEADER BAR ─────────────────────────────────────── */}
      <header style={{
        background: "#0d111a", border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "10px", padding: "10px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px"
      }}>
        {/* Left: Title & Live indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => navigate("/contests")}
            type="button"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", color: "#94a3b8", padding: "5px 10px", fontSize: "0.78rem", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
          >
            <ArrowLeft size={14} /> Exit
          </button>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "0.65rem", background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", padding: "1px 6px", borderRadius: "4px", fontWeight: "800", display: "flex", alignItems: "center", gap: "3px" }}>
                <Radio size={10} /> ARENA
              </span>
              <span style={{ fontSize: "0.72rem", color: "#64748b" }}>{contest.organizer}</span>
            </div>
            <strong style={{ fontSize: "1rem", color: "#f8fafc", lineHeight: "1.2" }}>{contest.title}</strong>
          </div>
        </div>

        {/* Center: Live Timer Clock */}
        <div style={{
          background: "#080c14", border: isEnded ? "1px solid rgba(239, 68, 68, 0.4)" : "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "8px", padding: "6px 14px",
          display: "flex", alignItems: "center", gap: "8px"
        }}>
          <Clock size={16} style={{ color: isEnded ? "#ef4444" : "#fbbf24" }} />
          <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>
            {isEnded ? "Ended" : "Time Left"}
          </span>
          <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "1.05rem", fontWeight: "800", color: isEnded ? "#ef4444" : "#f8fafc" }}>
            {formatTime(remainingSeconds)}
          </span>
        </div>

        {/* Right: Score Widget */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.25)", borderRadius: "8px", padding: "5px 12px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Trophy size={15} style={{ color: "#34d399" }} />
            <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: "600" }}>Score</span>
            <strong style={{ fontSize: "0.95rem", color: "#34d399" }}>{score} pts</strong>
          </div>

          <Link
            to={`/contests/${contest.id}/leaderboard`}
            style={{ background: "rgba(99, 102, 241, 0.15)", border: "1px solid rgba(99, 102, 241, 0.3)", borderRadius: "8px", color: "#818cf8", padding: "6px 12px", fontSize: "0.76rem", fontWeight: "700", textDecoration: "none" }}
          >
            Live Standings
          </Link>
        </div>
      </header>

      {/* ── PROBLEM SWITCHER TABS ───────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#0d111a", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px", padding: "4px 8px" }}>
        <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase", paddingRight: "6px" }}>Problems:</span>
        {(contest.problems || []).map((p, idx) => {
          const isActive = idx === activeProblemIndex;
          const isSolved = solvedProblemIds.has(p.id);
          const letter = String.fromCharCode(65 + idx);

          return (
            <button
              key={p.id}
              onClick={() => setActiveProblemIndex(idx)}
              type="button"
              style={{
                background: isActive ? "rgba(99, 102, 241, 0.2)" : isSolved ? "rgba(16, 185, 129, 0.15)" : "transparent",
                border: isActive ? "1px solid rgba(99, 102, 241, 0.4)" : isSolved ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid transparent",
                color: isActive ? "#ffffff" : isSolved ? "#34d399" : "#94a3b8",
                borderRadius: "6px", padding: "5px 12px",
                fontSize: "0.78rem", fontWeight: isActive ? "700" : "500",
                cursor: "pointer", display: "flex", alignItems: "center", gap: "5px",
                transition: "all 0.15s ease"
              }}
            >
              <span>{letter}. {p.name}</span>
              {isSolved && <CheckCircle2 size={13} style={{ color: "#34d399" }} />}
              <span style={{ fontSize: "0.68rem", opacity: 0.8, color: p.diff === "Easy" ? "#34d399" : p.diff === "Medium" ? "#fbbf24" : "#f87171" }}>
                ({p.points}pts)
              </span>
            </button>
          );
        })}
      </div>

      {/* ── ARENA MAIN WORKSPACE: 2 COLUMNS ─────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", flex: 1, minHeight: "500px" }}>

        {/* LEFT COLUMN: PROBLEM STATEMENT & DETAILS */}
        <div style={{ background: "#0d111a", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "10px", padding: "18px", display: "flex", flexDirection: "column", gap: "14px", overflowY: "auto" }}>
          {currentProblem ? (
            <>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "0.72rem", fontWeight: "700", padding: "2px 8px", borderRadius: "4px", background: currentProblem.diff === "Easy" ? "rgba(16, 185, 129, 0.15)" : currentProblem.diff === "Medium" ? "rgba(245, 158, 11, 0.15)" : "rgba(239, 68, 68, 0.15)", color: currentProblem.diff === "Easy" ? "#34d399" : currentProblem.diff === "Medium" ? "#fbbf24" : "#f87171" }}>
                    {currentProblem.diff}
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "#818cf8", fontWeight: "700" }}>{currentProblem.points} Points</span>
                </div>
                <h2 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#f8fafc", margin: 0 }}>
                  {currentProblem.name}
                </h2>
              </div>

              <div style={{ fontSize: "0.88rem", color: "#cbd5e1", lineHeight: "1.6" }}>
                <p style={{ margin: "0 0 12px 0" }}>{currentProblem.statement}</p>
              </div>

              {/* Contest Rules Banner */}
              <div style={{ background: "#080c14", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "10px 12px", fontSize: "0.76rem", color: "#94a3b8" }}>
                <strong>Contest Rule:</strong> Submissions are evaluated against hidden test cases. 5-minute penalty per wrong answer.
              </div>
            </>
          ) : (
            <div style={{ color: "#64748b", textAlign: "center", padding: "40px" }}>No problem selected.</div>
          )}
        </div>

        {/* RIGHT COLUMN: CODE EDITOR & CONSOLE WORKSPACE */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* Editor Header Bar */}
          <div style={{ background: "#0d111a", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "10px 10px 0 0", padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Code2 size={16} style={{ color: "#818cf8" }} />
              <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#f8fafc" }}>Code Workspace</span>
            </div>

            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{ background: "#080c14", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "6px", padding: "4px 8px", color: "#cbd5e1", fontSize: "0.78rem", cursor: "pointer", outline: "none" }}
            >
              <option value="Python">Python 3</option>
              <option value="JavaScript">JavaScript</option>
              <option value="C++">C++ 20</option>
              <option value="Java">Java 24</option>
            </select>
          </div>

          {/* Editor Body */}
          <div style={{ border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "0 0 10px 10px", overflow: "hidden", minHeight: "340px", flex: 1 }}>
            <CodeEditor
              value={code}
              onChange={setCode}
              language={language.toLowerCase() === "c++" ? "cpp" : language.toLowerCase()}
              height="360px"
            />
          </div>

          {/* Console / Output Panel */}
          {testResult && (
            <div style={{ background: "#0d111a", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px", padding: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                {testResult.verdict === "AC" || testResult.verdict === "OK" ? (
                  <CheckCircle2 size={16} style={{ color: "#34d399" }} />
                ) : (
                  <XCircle size={16} style={{ color: "#ef4444" }} />
                )}
                <strong style={{ fontSize: "0.85rem", color: testResult.verdict === "AC" || testResult.verdict === "OK" ? "#34d399" : "#ef4444" }}>
                  {testResult.statusText}
                </strong>
                <span style={{ fontSize: "0.72rem", color: "#64748b", marginLeft: "auto" }}>
                  Runtime: {testResult.runtime} | Memory: {testResult.memory}
                </span>
              </div>
              <pre style={{ background: "#080c14", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "6px", padding: "8px 10px", fontSize: "0.78rem", color: "#cbd5e1", margin: 0, fontFamily: "monospace" }}>
                {testResult.output}
              </pre>
            </div>
          )}

          {/* Bottom Action Footer Bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
              {isEnded ? "⚠️ Contest ended. Submissions disabled." : "Press Submit to evaluate against contest testcases."}
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                onClick={handleRunCode}
                disabled={isRunning}
                type="button"
                style={{ background: "rgba(255, 255, 255, 0.06)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "6px", color: "#e2e8f0", padding: "7px 14px", fontSize: "0.78rem", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}
              >
                <Play size={13} /> {isRunning ? "Running..." : "Run Code"}
              </button>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || isEnded}
                type="button"
                style={{ background: isEnded ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "#ffffff", border: "none", borderRadius: "6px", padding: "7px 18px", fontSize: "0.78rem", fontWeight: "700", cursor: isEnded ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "5px" }}
              >
                {isEnded ? <Lock size={13} /> : <Send size={13} />}
                <span>{isSubmitting ? "Submitting..." : isEnded ? "Submissions Closed" : "Submit Solution"}</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
