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
  Sparkles
} from "lucide-react";
import { getUserDisplayName } from "../../auth/displayName.js";

const SNIPPETS = [
  {
    id: "cpp",
    label: "C++20",
    filename: "judgo_engine.cpp",
    runtime: "< 1ms",
    verdict: "ALL 45/45 ACCEPTED",
    beats: "99.8%",
    lines: [
      { num: 1, content: <><span className="syn-kw">template</span> &lt;<span className="syn-kw">typename</span> <span className="syn-type">T</span>&gt;</> },
      { num: 2, content: <><span className="syn-kw">class</span> <span className="syn-fn">JudgoArena</span> &#123;</> },
      { num: 3, indent: 1, content: <><span className="syn-kw">public</span>:</> },
      { num: 4, indent: 2, content: <><span className="syn-kw">auto</span> <span className="syn-fn">evaluate</span>(<span className="syn-type">T</span>&amp; sol) &#123;</> },
      { num: 5, indent: 2, content: <><span className="syn-kw">return</span> sol.<span className="syn-fn">optimalSolve</span>();</> },
      { num: 6, indent: 1, content: <>&#125;</> },
      { num: 7, content: <>&#125;;</> }
    ]
  },
  {
    id: "python",
    label: "Python 3",
    filename: "two_sum.py",
    runtime: "12ms",
    verdict: "O(N) OPTIMAL ACCEPTED",
    beats: "99.4%",
    lines: [
      { num: 1, content: <><span className="syn-kw">def</span> <span className="syn-fn">twoSum</span>(nums: <span className="syn-type">list</span>[<span className="syn-type">int</span>], target: <span className="syn-type">int</span>):</> },
      { num: 2, indent: 1, content: <><span className="syn-var">seen</span> = &#123;&#125;</> },
      { num: 3, indent: 1, content: <><span className="syn-kw">for</span> i, n <span className="syn-kw">in</span> <span className="syn-fn">enumerate</span>(nums):</> },
      { num: 4, indent: 2, content: <><span className="syn-kw">if</span> target - n <span className="syn-kw">in</span> seen:</> },
      { num: 5, indent: 3, content: <><span className="syn-kw">return</span> [seen[target - n], i]</> },
      { num: 6, indent: 2, content: <>seen[n] = i</> }
    ]
  },
  {
    id: "ts",
    label: "TypeScript",
    filename: "binary_search.ts",
    runtime: "4ms",
    verdict: "LOG(N) SEARCH PASSED",
    beats: "100%",
    lines: [
      { num: 1, content: <><span className="syn-kw">function</span> <span className="syn-fn">binarySearch</span>(arr: <span className="syn-type">number[]</span>, x: <span className="syn-type">number</span>): <span className="syn-type">number</span> &#123;</> },
      { num: 2, indent: 1, content: <><span className="syn-kw">let</span> [l, r] = [<span className="syn-num">0</span>, arr.length - <span className="syn-num">1</span>];</> },
      { num: 3, indent: 1, content: <><span className="syn-kw">while</span> (l &lt;= r) &#123;</> },
      { num: 4, indent: 2, content: <><span className="syn-kw">const</span> m = (l + r) &gt;&gt; <span className="syn-num">1</span>;</> },
      { num: 5, indent: 2, content: <><span className="syn-kw">if</span> (arr[m] === x) <span className="syn-kw">return</span> m;</> },
      { num: 6, indent: 2, content: <>arr[m] &lt; x ? (l = m + <span className="syn-num">1</span>) : (r = m - <span className="syn-num">1</span>);</> },
      { num: 7, indent: 1, content: <>&#125; <span className="syn-kw">return</span> -<span className="syn-num">1</span>;</> },
      { num: 8, content: <>&#125;</> }
    ]
  }
];

function AnimatedCodeTerminal({ prefersReducedMotion }) {
  const [activeSnippetIdx, setActiveSnippetIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const cardRef = useRef(null);

  const snippet = SNIPPETS[activeSnippetIdx];

  // Auto-cycle languages every 6 seconds when not hovered
  useEffect(() => {
    if (isHovered || prefersReducedMotion) return;
    const interval = setInterval(() => {
      setActiveSnippetIdx((prev) => (prev + 1) % SNIPPETS.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isHovered, prefersReducedMotion]);

  // Simulated test evaluation progress animation
  useEffect(() => {
    setProgress(0);
    const t1 = setTimeout(() => setProgress(35), 400);
    const t2 = setTimeout(() => setProgress(75), 1100);
    const t3 = setTimeout(() => setProgress(100), 1800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [activeSnippetIdx]);

  // 3D Mouse Tilt Handler
  const handleMouseMove = (e) => {
    if (prefersReducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Map to rotation angles
    const rotateY = (x / (rect.width / 2)) * 9;
    const rotateX = -(y / (rect.height / 2)) * 9;
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
      {/* Background Radial Glow */}
      <div className="dash-editor-glow" aria-hidden="true" />

      {/* Floating Top-Right Badge: Runtime Performance */}
      <motion.div
        animate={
          prefersReducedMotion
            ? { opacity: 1 }
            : { y: [0, -6, 0], opacity: [0.95, 1, 0.95] }
        }
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="dash-floating-chip chip-top-right"
      >
        <Zap size={13} style={{ color: "#38bdf8" }} />
        <span>0ms Runtime (Top {snippet.beats})</span>
      </motion.div>

      {/* Floating Bottom-Left Badge: Test Case Verification */}
      <motion.div
        animate={
          prefersReducedMotion
            ? { opacity: 1 }
            : { y: [0, 6, 0], opacity: [0.95, 1, 0.95] }
        }
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="dash-floating-chip chip-bottom-left"
      >
        <CheckCircle2 size={13} style={{ color: "#34d399" }} />
        <span>All 45/45 Passed • O(1) Memory</span>
      </motion.div>

      {/* Main 3D Tilted Code Window */}
      <motion.div
        ref={cardRef}
        animate={{
          rotateX: tilt.rotateX,
          rotateY: tilt.rotateY,
          scale: isHovered ? 1.02 : 1
        }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="dash-code-window"
      >
        {/* Terminal Header */}
        <div className="dash-code-header">
          <div className="dash-code-dots">
            <span className="dash-dot dot-close" />
            <span className="dash-dot dot-minimize" />
            <span className="dash-dot dot-maximize" />
          </div>

          {/* Filename with terminal icon */}
          <div className="dash-code-filename">
            <TerminalIcon size={12} style={{ color: "#818cf8" }} />
            <span>{snippet.filename}</span>
          </div>

          {/* Interactive Language Selector Tabs */}
          <div className="dash-lang-tabs">
            {SNIPPETS.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                className={`dash-lang-tab ${idx === activeSnippetIdx ? "active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSnippetIdx(idx);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Evaluation Progress Bar */}
        <div className="dash-eval-progress-track">
          <div
            className="dash-eval-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Code Body with Smooth Cross-fade */}
        <div className="dash-code-body">
          <AnimatePresence mode="wait">
            <motion.div
              key={snippet.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", flexDirection: "column", gap: "2px" }}
            >
              {snippet.lines.map((line, lIdx) => (
                <div
                  key={lIdx}
                  className={`code-line ${line.indent === 1 ? "indent" : line.indent === 2 ? "indent-2" : line.indent === 3 ? "indent-2" : ""}`}
                >
                  <span className="code-ln">{line.num}</span>
                  <span>{line.content}</span>
                  {lIdx === snippet.lines.length - 1 && <span className="syn-cursor">|</span>}
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Terminal Footer with Live Status Ticker */}
        <div className="dash-code-footer">
          <div className="dash-code-status">
            <span className="status-ping-dot" />
            <span>
              {progress < 100 ? "EVALUATING..." : snippet.verdict}
            </span>
          </div>
          <div className="dash-latency-badge">
            <Activity size={11} />
            <span>{snippet.runtime}</span>
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

        {/* RIGHT COLUMN: 3D Interactive Animated Code Terminal Visual */}
        <AnimatedCodeTerminal prefersReducedMotion={prefersReducedMotion} />
      </div>
    </motion.section>
  );
}
