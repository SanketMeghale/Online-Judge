import { useMemo, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Target,
  Zap,
  ShieldCheck,
  Activity,
  Terminal as TerminalIcon,
  Play,
  RotateCcw,
  Sparkles,
  Cpu
} from "lucide-react";
import { getUserDisplayName } from "../../auth/displayName.js";

const SNIPPETS = [
  {
    id: "cpp",
    label: "C++20",
    filename: "judgo_engine.cpp",
    runtime: "< 1ms",
    memory: "14.2 MB",
    complexity: "O(1) Space",
    testcases: ["TC #1", "TC #2", "TC #3", "TC #4", "TC #5"],
    lines: [
      { num: 1, content: <><span className="syn-kw">template</span> &lt;<span className="syn-kw">typename</span> <span className="syn-type">T</span>&gt;</> },
      { num: 2, content: <><span className="syn-kw">class</span> <span className="syn-fn">JudgoArena</span> &#123;</> },
      { num: 3, indent: 1, content: <><span className="syn-kw">public</span>:</> },
      { num: 4, indent: 2, content: <><span className="syn-kw">auto</span> <span className="syn-fn">evaluate</span>(<span className="syn-type">T</span>&amp; sol) &#123;</> },
      { num: 5, indent: 2, content: <><span className="syn-kw">return</span> sol.<span className="syn-fn">solve</span>();</> },
      { num: 6, indent: 1, content: <>&#125;</> },
      { num: 7, content: <>&#125;;</> }
    ]
  },
  {
    id: "python",
    label: "Python 3",
    filename: "two_sum.py",
    runtime: "12ms",
    memory: "15.1 MB",
    complexity: "O(N) Hash",
    testcases: ["TC #1", "TC #2", "TC #3", "TC #4", "TC #5"],
    lines: [
      { num: 1, content: <><span className="syn-kw">def</span> <span className="syn-fn">twoSum</span>(nums: <span className="syn-type">list</span>[<span className="syn-type">int</span>], target: <span className="syn-type">int</span>):</> },
      { num: 2, indent: 1, content: <><span className="syn-var">seen</span> = &#123;&#125;</> },
      { num: 3, indent: 1, content: <><span className="syn-kw">for</span> i, n <span className="syn-kw">in</span> <span className="syn-fn">enumerate</span>(nums):</> },
      { num: 4, indent: 2, content: <><span className="syn-kw">if</span> target - n <span className="syn-kw">in</span> seen:</> },
      { num: 5, indent: 3, content: <><span className="syn-kw">return</span> [seen[target - n], i]</> },
      { num: 6, indent: 2, content: <>seen[n] = i</> },
      { num: 7, indent: 1, content: <><span className="syn-kw">return</span> []</> }
    ]
  },
  {
    id: "ts",
    label: "TypeScript",
    filename: "binary_search.ts",
    runtime: "4ms",
    memory: "14.8 MB",
    complexity: "O(log N)",
    testcases: ["TC #1", "TC #2", "TC #3", "TC #4", "TC #5"],
    lines: [
      { num: 1, content: <><span className="syn-kw">function</span> <span className="syn-fn">binarySearch</span>(arr: <span className="syn-type">number[]</span>, x: <span className="syn-type">number</span>) &#123;</> },
      { num: 2, indent: 1, content: <><span className="syn-kw">let</span> [l, r] = [<span className="syn-num">0</span>, arr.length - <span className="syn-num">1</span>];</> },
      { num: 3, indent: 1, content: <><span className="syn-kw">while</span> (l &lt;= r) &#123;</> },
      { num: 4, indent: 2, content: <><span className="syn-kw">const</span> m = (l + r) &gt;&gt; <span className="syn-num">1</span>;</> },
      { num: 5, indent: 2, content: <><span className="syn-kw">if</span> (arr[m] === x) <span className="syn-kw">return</span> m;</> },
      { num: 6, indent: 2, content: <>arr[m] &lt; x ? (l = m + <span className="syn-num">1</span>) : (r = m - <span className="syn-num">1</span>);</> },
      { num: 7, indent: 1, content: <>&#125; <span className="syn-kw">return</span> -<span className="syn-num">1</span>;</> }
    ]
  }
];

function CyberMatrixTerminal({ prefersReducedMotion }) {
  const [activeSnippetIdx, setActiveSnippetIdx] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [passedCount, setPassedCount] = useState(5);
  const [evalPhase, setEvalPhase] = useState("ready"); // "ready" | "compiling" | "testing" | "accepted"
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  const snippet = SNIPPETS[activeSnippetIdx];

  // Auto-run evaluation sequence
  const runEvaluation = () => {
    if (isRunning) return;
    setIsRunning(true);
    setEvalPhase("compiling");
    setPassedCount(0);

    setTimeout(() => {
      setEvalPhase("testing");
      // Cascade testcases 1 by 1
      let count = 0;
      const tcInterval = setInterval(() => {
        count += 1;
        setPassedCount(count);
        if (count >= 5) {
          clearInterval(tcInterval);
          setEvalPhase("accepted");
          setIsRunning(false);
        }
      }, 240);
    }, 500);
  };

  // Cycle snippets automatically every 7 seconds
  useEffect(() => {
    if (isHovered || isRunning || prefersReducedMotion) return;
    const interval = setInterval(() => {
      setActiveSnippetIdx((prev) => {
        const next = (prev + 1) % SNIPPETS.length;
        return next;
      });
      runEvaluation();
    }, 6500);
    return () => clearInterval(interval);
  }, [isHovered, isRunning, prefersReducedMotion]);

  // Initial trigger
  useEffect(() => {
    runEvaluation();
  }, [activeSnippetIdx]);

  // 3D Parallax Mouse Move Handler
  const handleMouseMove = (e) => {
    if (prefersReducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateY = (x / (rect.width / 2)) * 8;
    const rotateX = -(y / (rect.height / 2)) * 8;
    setTilt({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  return (
    <div
      className="dash-hero-right"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {/* Background Cyber Glow */}
      <div className="dash-editor-glow" aria-hidden="true" />

      {/* Floating Top-Right Badge: Runtime Performance */}
      <motion.div
        animate={
          prefersReducedMotion
            ? { opacity: 1 }
            : { y: [0, -5, 0], opacity: [0.95, 1, 0.95] }
        }
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        className="dash-floating-chip chip-top-right"
      >
        <Zap size={13} style={{ color: "#38bdf8" }} />
        <span>Runtime {snippet.runtime} (Top 99.8%)</span>
      </motion.div>

      {/* Floating Bottom-Left Badge: Memory & Complexity */}
      <motion.div
        animate={
          prefersReducedMotion
            ? { opacity: 1 }
            : { y: [0, 5, 0], opacity: [0.95, 1, 0.95] }
        }
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        className="dash-floating-chip chip-bottom-left"
      >
        <ShieldCheck size={13} style={{ color: "#34d399" }} />
        <span>{snippet.complexity} • 45/45 Passed</span>
      </motion.div>

      {/* 3D Code Window Frame */}
      <motion.div
        ref={cardRef}
        animate={{
          rotateX: tilt.rotateX,
          rotateY: tilt.rotateY,
          scale: isHovered ? 1.02 : 1
        }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        className="dash-code-window"
      >
        {/* Terminal Header */}
        <div className="dash-code-header">
          <div className="dash-code-dots">
            <span className="dash-dot dot-close" />
            <span className="dash-dot dot-minimize" />
            <span className="dash-dot dot-maximize" />
          </div>

          <div className="dash-code-filename">
            <TerminalIcon size={12} style={{ color: "#818cf8" }} />
            <span>{snippet.filename}</span>
          </div>

          {/* Interactive Run / Trigger Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              runEvaluation();
            }}
            className="dash-run-code-btn"
            title="Simulate Real-time Evaluation"
          >
            {isRunning ? (
              <>
                <RotateCcw size={10} className="animate-spin" />
                <span>EVAL</span>
              </>
            ) : (
              <>
                <Play size={10} fill="#10b981" />
                <span>RUN</span>
              </>
            )}
          </button>
        </div>

        {/* Code Body with Animated Laser Scan Beam */}
        <div className="dash-code-body-wrapper">
          <div className="dash-laser-scanline" />

          <div className="dash-code-body">
            <AnimatePresence mode="wait">
              <motion.div
                key={snippet.id}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.18 }}
                style={{ display: "flex", flexDirection: "column", gap: "2px" }}
              >
                {snippet.lines.map((line, lIdx) => (
                  <div
                    key={lIdx}
                    className={`code-line ${
                      line.indent === 1
                        ? "indent"
                        : line.indent === 2
                        ? "indent-2"
                        : line.indent === 3
                        ? "indent-3"
                        : ""
                    } ${evalPhase === "testing" && lIdx === (passedCount % snippet.lines.length) ? "active-eval" : ""}`}
                  >
                    <span className="code-ln">{line.num}</span>
                    <span>{line.content}</span>
                    {lIdx === snippet.lines.length - 1 && <span className="syn-cursor">|</span>}
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Live Testcase Matrix Cascade */}
        <div className="dash-testcase-matrix">
          {snippet.testcases.map((tc, idx) => {
            const isPassed = idx < passedCount;
            const isRunningThis = evalPhase === "testing" && idx === passedCount;
            return (
              <div
                key={idx}
                className={`dash-tc-node ${isPassed ? "passed" : ""} ${isRunningThis ? "running" : ""}`}
              >
                {isPassed ? (
                  <CheckCircle2 size={10} style={{ color: "#34d399" }} />
                ) : (
                  <Cpu size={10} />
                )}
                <span>TC{idx + 1}</span>
              </div>
            );
          })}
        </div>

        {/* Terminal Footer with Live Ping Status */}
        <div className="dash-code-footer">
          <div className="dash-code-status">
            <span className="status-ping-dot" />
            <span>
              {evalPhase === "compiling"
                ? "COMPILING C++20..."
                : evalPhase === "testing"
                ? `EVALUATING (${passedCount}/5)...`
                : "ALL 45/45 ACCEPTED"}
            </span>
          </div>

          <div className="dash-latency-badge">
            <Activity size={10} />
            <span>{evalPhase === "accepted" ? snippet.runtime : "evaluating"}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function DashboardHero({
  user,
  liveUser,
  continueProblem = null,
  dailyChallenge = null
}) {
  const prefersReducedMotion = useReducedMotion();
  const navigate = useNavigate();

  // Local time greeting
  const currentHour = new Date().getHours();
  const timeGreeting = useMemo(() => {
    if (currentHour < 12) return "Good morning";
    if (currentHour < 18) return "Good afternoon";
    return "Good evening";
  }, [currentHour]);

  // Authentic user display name
  const displayName = useMemo(() => {
    const raw = getUserDisplayName(liveUser || user);
    return String(raw).trim().split(" ")[0] || "User";
  }, [liveUser, user]);

  // Dynamic continue problem URL
  const continueUrl = continueProblem?.id ? `/problems/${continueProblem.id}` : "/problems";
  const continueTitle = continueProblem?.title || "Continue Solving";

  // Dynamic daily challenge URL
  const dailyUrl = dailyChallenge?.id ? `/problems/${dailyChallenge.id}` : "/problems";
  const isDailySolved = dailyChallenge?.solved || false;

  // Keyboard shortcut listener: Cmd/Ctrl + Enter to trigger Daily Challenge
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        navigate(dailyUrl);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dailyUrl, navigate]);

  return (
    <motion.section
      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="dash-hero"
      aria-label="Welcome section"
    >
      {/* Background Subtle Gradient & Grid */}
      <div className="dash-hero-bg" aria-hidden="true">
        <div className="dash-hero-grid" />
        <div className="dash-hero-radial" />

        <span className="dash-hero-glyph glyph-tag">&lt;/&gt;</span>
        <span className="dash-hero-glyph glyph-bracket">&#123; &#125;</span>
        <span className="dash-hero-glyph glyph-arrow">=&gt;</span>
        <span className="dash-hero-glyph glyph-underscore">_</span>
      </div>

      {/* Main 2-Column Hero Content */}
      <div className="dash-hero-layout">
        {/* LEFT COLUMN: Personalized Welcome & Actions */}
        <div className="dash-hero-left">
          {/* Eyebrow */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="dash-hero-badge"
          >
            <span className="dash-badge-dot" aria-hidden="true" />
            <span>YOUR CODING ARENA</span>
          </motion.div>

          {/* Heading Greeting */}
          <motion.h1
            initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="dash-hero-title"
          >
            <span>{timeGreeting}, </span>
            <span className="dash-user-name">{displayName}.</span>
            <span className="dash-wave"> 👋</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.18 }}
            className="dash-hero-sub"
          >
            Ready to level up your algorithmic skills today?
            <br />
            Keep your streak alive and tackle today's curated challenges.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.25 }}
            className="dash-hero-actions"
          >
            <Link
              to={continueUrl}
              className="dash-btn-primary"
              aria-label={`Continue solving ${continueTitle}`}
            >
              <span>Continue: {continueProblem?.title ? continueProblem.title : "Solving"}</span>
              <ArrowRight size={15} className="arrow-icon" aria-hidden="true" />
            </Link>

            <Link
              to={dailyUrl}
              className="dash-btn-secondary"
              aria-label="View daily challenge"
              style={{
                borderColor: isDailySolved ? "rgba(16, 185, 129, 0.4)" : undefined,
                color: isDailySolved ? "#34d399" : undefined
              }}
            >
              {isDailySolved ? (
                <CheckCircle2 size={15} style={{ color: "#34d399" }} aria-hidden="true" />
              ) : (
                <Target size={15} style={{ color: "#60a5fa" }} aria-hidden="true" />
              )}
              <span>{isDailySolved ? "Daily Challenge (Solved)" : "Daily Challenge"}</span>
              <span className="dash-kbd" aria-hidden="true">⌘ Enter</span>
            </Link>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Cyber Matrix Live Code Evaluator with Laser Scan */}
        <CyberMatrixTerminal prefersReducedMotion={prefersReducedMotion} />
      </div>
    </motion.section>
  );
}
