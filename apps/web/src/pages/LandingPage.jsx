import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2,
  Cpu,
  Brain,
  Award,
  Sparkles,
  Zap,
  ShieldCheck,
  Building2,
  Trophy,
  Flame,
  LineChart,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Terminal,
  Play,
  Share2,
  Star,
  Users,
  Timer,
  Github,
  MessageSquare,
  Globe,
  Lock,
  Compass,
  FileCode2,
  ExternalLink,
  ChevronDown
} from "lucide-react";
import "../styles/landing.css";

// Statistics Data
const stats = [
  { value: "150K+", label: "Problems Solved", icon: CheckCircle2, color: "#10b981" },
  { value: "30K+", label: "Active Developers", icon: Users, color: "#00c3ff" },
  { value: "500+", label: "Contests Hosted", icon: Trophy, color: "#7850ff" },
  { value: "99.9%", label: "Judge Accuracy", icon: ShieldCheck, color: "#ff6b35" }
];

// Feature Cards Data
const features = [
  {
    title: "Secure Code Execution",
    desc: "Isolated multi-language sandbox with sub-second execution, micro-benchmarking, memory limits, and strict I/O validation.",
    icon: ShieldCheck,
    colorClass: "feature-icon-purple"
  },
  {
    title: "AI Code Review",
    desc: "Instant post-submission insights, automated Big-O complexity analysis, and intelligent Socratic hints tailored to your solution.",
    icon: Brain,
    colorClass: "feature-icon-cyan"
  },
  {
    title: "Company Sheets",
    desc: "Curated problem playlists for FAANG and top-tier startups (Google, Meta, Microsoft, Uber) updated with recent interview frequencies.",
    icon: Building2,
    colorClass: "feature-icon-green"
  },
  {
    title: "Coding Contests",
    desc: "Weekly rated algorithm competitions, virtual participation, dynamic Elo rating updates, and cash prize tournaments.",
    icon: Trophy,
    colorClass: "feature-icon-orange"
  },
  {
    title: "Real-Time Leaderboards",
    desc: "Climb global, university, and company rankings in real-time as your submissions pass edge-case test suites.",
    icon: LineChart,
    colorClass: "feature-icon-purple"
  },
  {
    title: "Progress Analytics",
    desc: "Deep-dive into topic mastery radar charts, submission streak heatmaps, and personalized weakness detection.",
    icon: Zap,
    colorClass: "feature-icon-cyan"
  }
];

// Timeline Steps
const steps = [
  {
    num: "01",
    title: "Choose Problem",
    desc: "Pick from 2,000+ curated algorithmic problems categorized by pattern and difficulty."
  },
  {
    num: "02",
    title: "Write Code",
    desc: "Code in Python, JavaScript, C++, or Java with intelligent autocomplete and Vim bindings."
  },
  {
    num: "03",
    title: "Run & Submit",
    desc: "Instant sandboxed execution with visible and hidden test suites evaluated in milliseconds."
  },
  {
    num: "04",
    title: "AI Feedback",
    desc: "Receive actionable breakdown on bottlenecks, time/space limits, and syntax hints."
  },
  {
    num: "05",
    title: "Track Progress",
    desc: "Gain XP, maintain your streak, earn badges, and climb the global developer leaderboard."
  }
];

// AI Mentor Showcase Tabs
const aiTabs = [
  {
    id: "explain",
    label: "Explain Wrong Answer",
    prompt: "Why did my solution fail on Testcase 4: nums = [3, 3], target = 6?",
    response:
      "💡 Analysis: Your hash map lookup is overwriting index `0` when encountering duplicate value `3`. Store indices in an array or check for matching complement before inserting current element.",
    complexity: "Time: O(N) • Space: O(N)"
  },
  {
    id: "optimize",
    label: "Optimize Solution",
    prompt: "Can we improve the nested loop approach for Two Sum?",
    response:
      "🚀 Optimization: Replacing the nested brute-force loop (O(N²)) with a single-pass Hash Map reduces lookup time to O(1), bringing total time down to O(N).",
    complexity: "From O(N²) ➔ O(N)"
  },
  {
    id: "complexity",
    label: "Complexity Analysis",
    prompt: "Derive the exact Big-O time and auxiliary space for this DFS traversal.",
    response:
      "📊 Derivation: Tree has V vertices and E edges. Each vertex is visited once. Time: O(V + E). Space: O(H) where H is maximum call-stack depth of the recursion tree.",
    complexity: "Time: O(V + E) • Space: O(H)"
  },
  {
    id: "hints",
    label: "Generate Hints",
    prompt: "Give me a hint for Palindrome Partitioning without giving away the answer.",
    response:
      "🔍 Socratic Hint: Notice that a substring s[i..j] is a palindrome if s[i] == s[j] and s[i+1..j-1] is also a palindrome. Can you precompute this with 2D dynamic programming?",
    complexity: "Hint Level 2/3"
  },
  {
    id: "interview",
    label: "Interview Questions",
    prompt: "What follow-up question does Google ask after Two Sum?",
    response:
      "🎯 Follow-up: 'How would you handle streaming data where numbers arrive in real-time, and you must query if two numbers sum to K in O(1) time?'",
    complexity: "FAANG Interview Simulation"
  },
  {
    id: "personalized",
    label: "Personalized Learning",
    prompt: "What topic should I practice next based on my recent WA submissions?",
    response:
      "📈 Recommendation: You scored 100% on Arrays but had 3 Time Limit Exceeded submissions on Dynamic Programming. Let's do 'Coin Change' and 'Climbing Stairs'.",
    complexity: "Mastery Level: 68%"
  }
];

// Company Sheets Data
const companies = [
  { name: "Google", count: "145 Problems", tag: "FAANG", color: "#4285F4" },
  { name: "Microsoft", count: "128 Problems", tag: "Tier 1", color: "#00A4EF" },
  { name: "Amazon", count: "168 Problems", tag: "High Frequency", color: "#FF9900" },
  { name: "Meta", count: "134 Problems", tag: "FAANG", color: "#0668E1" },
  { name: "Netflix", count: "78 Problems", tag: "High Bar", color: "#E50914" },
  { name: "Adobe", count: "92 Problems", tag: "Algorithms", color: "#FF0000" },
  { name: "Uber", count: "104 Problems", tag: "Graphs & DP", color: "#000000" },
  { name: "Atlassian", count: "86 Problems", tag: "System Design", color: "#0052CC" }
];

// Developer Testimonials
const testimonials = [
  {
    quote:
      "Judgo's AI mentor cut my interview prep time in half. The instant complexity breakdown and edge-case feedback helped me crack my dream L5 role at Google!",
    name: "Alex Rivera",
    role: "Senior Software Engineer @ Google",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
  },
  {
    quote:
      "The sub-second compilation and real-time Judge0 sandbox is incredible. No waiting around—you get instant feedback with accurate runtime and memory analytics.",
    name: "Priya Sharma",
    role: "Fullstack Engineer @ Microsoft",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80"
  },
  {
    quote:
      "Weekly algorithm contests on Judgo have the best problem curation and live Elo ratings. It feels just like Codeforces but with modern developer UX.",
    name: "David Chen",
    role: "ICPC Regional Finalist • Meta",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
  }
];

// Interactive Code Snippets for Hero IDE
const codeSnippets = {
  python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        seen = {}
        for i, num in enumerate(nums):
            diff = target - num
            if diff in seen:
                return [seen[diff], i]
            seen[num] = i
        return []`,
  javascript: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
  cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> map;
        for (int i = 0; i < nums.size(); i++) {
            int diff = target - nums[i];
            if (map.count(diff)) {
                return {map[diff], i};
            }
            map[nums[i]] = i;
        }
        return {};
    }
};`
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [selectedLang, setSelectedLang] = useState("python");
  const [activeAiTab, setActiveAiTab] = useState(aiTabs[0]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionPassed, setExecutionPassed] = useState(true);

  // Contest Countdown State
  const [countdown, setCountdown] = useState({ days: 2, hours: 14, mins: 32, secs: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: 59, secs: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, mins: 59, secs: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, mins: 59, secs: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  function handleRunMockCode() {
    setIsExecuting(true);
    setExecutionPassed(false);
    setTimeout(() => {
      setIsExecuting(false);
      setExecutionPassed(true);
    }, 900);
  }

  return (
    <div className="landing-container">
      {/* Background Glowing Mesh Gradients */}
      <div className="landing-mesh-bg">
        <div className="mesh-orb mesh-orb-1" />
        <div className="mesh-orb mesh-orb-2" />
        <div className="mesh-orb mesh-orb-3" />
      </div>

      <div className="landing-content">
        {/* ==========================================================
            1. STICKY NAVBAR
            ========================================================== */}
        <header className="lp-navbar">
          <div className="lp-nav-inner">
            <Link to="/" className="lp-brand">
              <span className="lp-brand-logo">
                <img src="/logo.png" alt="Judgo Logo" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
              </span>
              <span>Judgo</span>
            </Link>

            <nav className="lp-nav-links">
              <a href="#features" className="lp-nav-link">Features</a>
              <a href="#problems" className="lp-nav-link">Problems</a>
              <a href="#contests" className="lp-nav-link">Contests</a>
              <a href="#ai-coach" className="lp-nav-link">AI Coach</a>
              <a href="#companies" className="lp-nav-link">Company Sheets</a>
              <a href="#stats" className="lp-nav-link">Leaderboard</a>
            </nav>

            <div className="lp-nav-actions">
              <Link to="/login" className="btn-ghost-outline">
                Login
              </Link>
              <Link to="/register" className="btn-gradient-primary">
                <span>Sign Up</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </header>

        {/* ==========================================================
            2. HERO SECTION
            ========================================================== */}
        <section className="lp-hero-section">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="hero-badge-pill">
              <span className="pulsing-dot" />
              <span>Next-Gen Competitive Programming & AI Mentorship</span>
            </div>

            <h1 className="lp-hero-title">
              Master <span className="gradient-text-purple-cyan">Coding</span>.
              <br />
              Ace Interviews.
              <br />
              Become <span className="gradient-text-purple-cyan">Industry Ready</span>.
            </h1>

            <p className="lp-hero-subtitle">
              Judgo is an AI-powered Online Judge where developers solve coding problems,
              participate in contests, receive AI feedback, and prepare for technical interviews.
            </p>

            <div className="lp-hero-ctas">
              <Link to="/register" className="btn-hero-primary">
                <span>Start Coding Free</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn-hero-secondary">
                <Terminal size={17} />
                <span>Login to Arena</span>
              </Link>
            </div>

            <div className="hero-social-proof">
              <div className="avatar-stack">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80" alt="Dev 1" />
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&auto=format&fit=crop&q=80" alt="Dev 2" />
                <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=60&auto=format&fit=crop&q=80" alt="Dev 3" />
                <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=60&auto=format&fit=crop&q=80" alt="Dev 4" />
              </div>
              <span className="social-proof-text">
                Joined by <strong>30,000+ developers</strong> from Google, Meta, and Microsoft
              </span>
            </div>
          </motion.div>

          {/* Right Side Interactive IDE Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="hero-mockup-wrapper"
          >
            {/* Top Floating Badge: Leaderboard Trophy */}
            <div className="floating-hero-card rank-trophy-card">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ background: "rgba(120, 80, 255, 0.2)", padding: "6px", borderRadius: "8px" }}>
                  <Trophy size={18} color="#a78bfa" />
                </div>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "#c4b5fd", fontWeight: 700, display: "block" }}>
                    Global Rank #14
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Top 1% Algorithmic Master</span>
                </div>
              </div>
            </div>

            {/* Main IDE Container */}
            <div className="hero-ide-card">
              <div className="ide-header-bar">
                <div className="ide-window-dots">
                  <span className="ide-dot red" />
                  <span className="ide-dot yellow" />
                  <span className="ide-dot green" />
                </div>

                <div className="ide-lang-tabs">
                  <button
                    className={`ide-tab ${selectedLang === "python" ? "active" : ""}`}
                    onClick={() => setSelectedLang("python")}
                  >
                    Python 3
                  </button>
                  <button
                    className={`ide-tab ${selectedLang === "javascript" ? "active" : ""}`}
                    onClick={() => setSelectedLang("javascript")}
                  >
                    JavaScript
                  </button>
                  <button
                    className={`ide-tab ${selectedLang === "cpp" ? "active" : ""}`}
                    onClick={() => setSelectedLang("cpp")}
                  >
                    C++ 20
                  </button>
                </div>

                <button
                  onClick={handleRunMockCode}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "linear-gradient(135deg, #7850ff, #00c3ff)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "4px 12px",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  <Play size={12} fill="#fff" />
                  {isExecuting ? "Executing..." : "Run Solution"}
                </button>
              </div>

              {/* Code Area */}
              <pre className="ide-code-body">
                <code>
                  {codeSnippets[selectedLang]}
                </code>
              </pre>

              {/* Footer Evaluation Bar */}
              <div className="ide-footer-bar">
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {executionPassed ? (
                    <span className="ide-verdict-pill">
                      <CheckCircle2 size={14} />
                      Accepted (AC)
                    </span>
                  ) : (
                    <span className="ide-verdict-pill" style={{ background: "rgba(255, 107, 53, 0.15)", color: "#ff6b35", borderColor: "#ff6b35" }}>
                      <Zap size={14} />
                      Running Sandbox...
                    </span>
                  )}
                  <span style={{ fontSize: "0.78rem", color: "#64748b" }}>Testcases: 42/42 Passed</span>
                </div>

                <div className="ide-metrics">
                  <span>⚡ 24 ms</span>
                  <span>💾 14.2 MB</span>
                </div>
              </div>
            </div>

            {/* Bottom Floating Card: AI Mentor Review */}
            <div className="floating-hero-card ai-review-card">
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <Sparkles size={16} color="#00c3ff" />
                <strong style={{ fontSize: "0.82rem", color: "#38bdf8" }}>AI Code Review</strong>
              </div>
              <p style={{ fontSize: "0.75rem", color: "#cbd5e1", margin: 0, lineHeight: 1.4 }}>
                Optimal O(N) time with Hash Map lookup. Solution avoids redundant nested loops.
              </p>
            </div>
          </motion.div>
        </section>

        {/* ==========================================================
            3. STATISTICS SECTION
            ========================================================== */}
        <section id="stats" className="lp-stats-section">
          <div className="stats-grid">
            {stats.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="stat-box"
                >
                  <div style={{ display: "inline-flex", padding: "8px", borderRadius: "10px", background: "rgba(255,255,255,0.04)", marginBottom: "12px" }}>
                    <Icon size={22} color={item.color} />
                  </div>
                  <div className="stat-box-number">{item.value}</div>
                  <div className="stat-box-label">{item.label}</div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ==========================================================
            4. FEATURE CARDS (GRID OF 6)
            ========================================================== */}
        <section id="features" className="lp-features-section">
          <div className="section-head">
            <span className="section-kicker">Engineered for Excellence</span>
            <h2 className="section-title">Everything you need to master algorithms</h2>
            <p className="section-desc">
              From low-latency sandboxed execution to AI-powered interview coaching,
              Judgo is built for developers targeting top tech roles.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="feature-card"
                >
                  <div>
                    <div className={`feature-icon-wrapper ${feat.colorClass}`}>
                      <Icon size={24} />
                    </div>
                    <h3 className="feature-card-title">{feat.title}</h3>
                    <p className="feature-card-desc">{feat.desc}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "20px", color: "#00c3ff", fontSize: "0.85rem", fontWeight: 600 }}>
                    <span>Learn more</span>
                    <ChevronRight size={14} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ==========================================================
            5. HOW JUDGO WORKS (TIMELINE)
            ========================================================== */}
        <section className="lp-timeline-section">
          <div className="section-head">
            <span className="section-kicker">Interactive Workflow</span>
            <h2 className="section-title">How Judgo works</h2>
            <p className="section-desc">
              A seamless loop designed to turn algorithmic theory into muscle memory.
            </p>
          </div>

          <div className="timeline-steps-grid">
            {steps.map((step, idx) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="timeline-step-card"
              >
                <div className="step-num-badge">{step.num}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ==========================================================
            6. AI MENTOR SECTION
            ========================================================== */}
        <section id="ai-coach" className="lp-ai-section">
          <div className="section-head">
            <span className="section-kicker">Your 24/7 Coding Copilot</span>
            <h2 className="section-title">Meet the Judgo AI Mentor</h2>
            <p className="section-desc">
              Never stay stuck on a testcase again. Get instant hints, complexity derivations, and FAANG interview simulations.
            </p>
          </div>

          <div className="ai-mentor-showcase">
            {/* Left: AI Feature Selector */}
            <div className="ai-features-list">
              <span className="ai-badge">
                <Brain size={14} />
                Intelligent Diagnostics
              </span>
              <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", marginBottom: "8px" }}>
                Actionable Feedback, Not Spoilers
              </h3>
              <p style={{ fontSize: "0.9rem", color: "#94a3b8", marginBottom: "16px", lineHeight: 1.5 }}>
                Click below to see how Judgo AI diagnoses solutions in real-time:
              </p>

              {aiTabs.map((tab) => (
                <div
                  key={tab.id}
                  className={`ai-pill-item ${activeAiTab.id === tab.id ? "active" : ""}`}
                  onClick={() => setActiveAiTab(tab)}
                >
                  <Sparkles size={16} color={activeAiTab.id === tab.id ? "#7850ff" : "#94a3b8"} />
                  <span>{tab.label}</span>
                </div>
              ))}
            </div>

            {/* Right: AI Terminal Window */}
            <div className="ai-terminal-display">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "10px", marginBottom: "14px" }}>
                <span style={{ fontSize: "0.8rem", color: "#7850ff", fontWeight: 700 }}>
                  🤖 Judgo AI Assistant
                </span>
                <span style={{ fontSize: "0.75rem", color: "#10b981", background: "rgba(16, 185, 129, 0.1)", padding: "2px 8px", borderRadius: "4px" }}>
                  {activeAiTab.complexity}
                </span>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <span style={{ color: "#64748b", fontSize: "0.78rem" }}>&gt; User Query:</span>
                <p style={{ color: "#f8fafc", margin: "4px 0 0", fontSize: "0.88rem" }}>
                  "{activeAiTab.prompt}"
                </p>
              </div>

              <div style={{ background: "rgba(120, 80, 255, 0.06)", border: "1px solid rgba(120, 80, 255, 0.2)", borderRadius: "8px", padding: "14px" }}>
                <span style={{ color: "#a78bfa", fontSize: "0.78rem", fontWeight: 700 }}>&gt; AI Feedback:</span>
                <p style={{ color: "#e2e8f0", margin: "6px 0 0", fontSize: "0.85rem", lineHeight: 1.6 }}>
                  {activeAiTab.response}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================================
            7. CONTEST PREVIEW SECTION
            ========================================================== */}
        <section id="contests" className="lp-contest-section">
          <div className="contest-live-card">
            <div>
              <span className="ide-verdict-pill" style={{ background: "rgba(255, 107, 53, 0.15)", color: "#ff6b35", borderColor: "#ff6b35", marginBottom: "12px" }}>
                <Flame size={14} />
                Live Upcoming Contest
              </span>
              <h3 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", margin: "8px 0" }}>
                Judgo Weekly Grand Prix #42
              </h3>
              <p style={{ color: "#94a3b8", fontSize: "0.95rem", lineHeight: 1.6, maxWidth: "520px" }}>
                Compete against 1,500+ top algorithmic engineers across 4 problems. Rated for all divisions with global Elo scoring.
              </p>

              <div className="contest-timer-grid">
                <div className="timer-box">
                  <span className="timer-digit">{String(countdown.days).padStart(2, "0")}</span>
                  <span className="timer-unit">Days</span>
                </div>
                <div className="timer-box">
                  <span className="timer-digit">{String(countdown.hours).padStart(2, "0")}</span>
                  <span className="timer-unit">Hours</span>
                </div>
                <div className="timer-box">
                  <span className="timer-digit">{String(countdown.mins).padStart(2, "0")}</span>
                  <span className="timer-unit">Mins</span>
                </div>
                <div className="timer-box">
                  <span className="timer-digit">{String(countdown.secs).padStart(2, "0")}</span>
                  <span className="timer-unit">Secs</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "24px" }}>
                <Link to="/register" className="btn-hero-primary" style={{ padding: "10px 22px", fontSize: "0.95rem" }}>
                  <span>Register for Contest</span>
                  <ArrowRight size={16} />
                </Link>
                <span style={{ color: "#64748b", fontSize: "0.85rem" }}>Prize Pool: $5,000+</span>
              </div>
            </div>

            <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "20px" }}>
              <h4 style={{ fontSize: "0.95rem", color: "#fff", marginBottom: "14px" }}>Contest Breakdown</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#94a3b8" }}>
                  <span>Problem 1 (Easy)</span>
                  <span style={{ color: "#10b981", fontWeight: 600 }}>100 Pts</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#94a3b8" }}>
                  <span>Problem 2 (Medium)</span>
                  <span style={{ color: "#ffa940", fontWeight: 600 }}>250 Pts</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#94a3b8" }}>
                  <span>Problem 3 (Medium)</span>
                  <span style={{ color: "#ffa940", fontWeight: 600 }}>300 Pts</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#94a3b8" }}>
                  <span>Problem 4 (Hard)</span>
                  <span style={{ color: "#ff4d4f", fontWeight: 600 }}>500 Pts</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================================
            8. COMPANY PREPARATION SHEETS
            ========================================================== */}
        <section id="companies" className="lp-companies-section">
          <div className="section-head">
            <span className="section-kicker">Targeted Interview Prep</span>
            <h2 className="section-title">Practice by Top Tech Companies</h2>
            <p className="section-desc">
              Solve the exact problems asked in technical screens at FAANG and top startups.
            </p>
          </div>

          <div className="companies-grid">
            {companies.map((comp) => (
              <Link
                key={comp.name}
                to="/register"
                className="company-card"
              >
                <div>
                  <div className="company-top">
                    <span className="company-name">{comp.name}</span>
                    <span className="company-count">{comp.tag}</span>
                  </div>
                  <p style={{ color: "#94a3b8", fontSize: "0.88rem", margin: 0 }}>
                    {comp.count}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#00c3ff", fontSize: "0.82rem", fontWeight: 600, marginTop: "16px" }}>
                  <span>Explore Problems</span>
                  <ArrowRight size={13} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ==========================================================
            9. TESTIMONIALS
            ========================================================== */}
        <section className="lp-testimonials-section">
          <div className="section-head">
            <span className="section-kicker">Loved by Engineers</span>
            <h2 className="section-title">What developers are saying</h2>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((t, idx) => (
              <div key={idx} className="testimonial-card">
                <div style={{ display: "flex", gap: "4px", marginBottom: "14px" }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} fill="#ffa940" color="#ffa940" />
                  ))}
                </div>
                <p className="testimonial-quote">"{t.quote}"</p>
                <div className="testimonial-user">
                  <img src={t.avatar} alt={t.name} className="testimonial-avatar" />
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ==========================================================
            10. FINAL CTA BANNER
            ========================================================== */}
        <section className="lp-final-cta-section">
          <div className="final-cta-box">
            <h2 className="final-cta-title">
              Ready to become a better programmer?
            </h2>
            <p className="final-cta-desc">
              Join 30,000+ developers solving algorithmic challenges, earning streaks,
              and preparing for top technical interviews on Judgo.
            </p>
            <div className="final-cta-buttons">
              <Link to="/register" className="btn-hero-primary" style={{ padding: "14px 32px" }}>
                <span>Create Free Account</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn-hero-secondary" style={{ padding: "14px 28px" }}>
                <Terminal size={17} />
                <span>Log In</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ==========================================================
            11. FOOTER
            ========================================================== */}
        <footer className="lp-footer">
          <div className="footer-inner">
            <div>
              <Link to="/" className="lp-brand" style={{ marginBottom: "12px", display: "inline-flex" }}>
                <span className="lp-brand-logo">
                  <img src="/logo.png" alt="Judgo Logo" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
                </span>
                <span>Judgo</span>
              </Link>
              <p className="footer-brand-p">
                The next-generation AI-powered online judge and competitive programming arena for ambitious developers.
              </p>
            </div>

            <div>
              <div className="footer-col-title">Product</div>
              <div className="footer-links">
                <a href="#problems" className="footer-link">Problem Archive</a>
                <a href="#contests" className="footer-link">Contest Arena</a>
                <a href="#ai-coach" className="footer-link">AI Coach</a>
                <a href="#companies" className="footer-link">Company Sheets</a>
              </div>
            </div>

            <div>
              <div className="footer-col-title">Resources</div>
              <div className="footer-links">
                <a href="#features" className="footer-link">Documentation</a>
                <a href="https://github.com/SanketMeghale/Online-Judge" target="_blank" rel="noreferrer" className="footer-link">GitHub Repository</a>
                <a href="#features" className="footer-link">API & Webhooks</a>
                <a href="#features" className="footer-link">System Architecture</a>
              </div>
            </div>

            <div>
              <div className="footer-col-title">Community & Legal</div>
              <div className="footer-links">
                <a href="#features" className="footer-link">Discord Server</a>
                <a href="#features" className="footer-link">Privacy Policy</a>
                <a href="#features" className="footer-link">Terms of Service</a>
                <a href="#features" className="footer-link">Security Guidelines</a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div>
              © {new Date().getFullYear()} Judgo Inc. All rights reserved. Built with precision for developers.
            </div>
            <div className="system-status-pill">
              <span className="pulsing-dot" style={{ width: "6px", height: "6px" }} />
              <span>All Systems Operational • Judge Latency &lt; 45ms</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
