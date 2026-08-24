import { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Binary,
  Brain,
  Calculator,
  Cpu,
  FolderTree,
  Hash,
  Info,
  Layers,
  Network,
  Server,
  Sparkles,
  Type,
  Zap,
  ChevronRight
} from "lucide-react";
import "../../styles/skillTree.css";

// The 10 Core DSA Topics required for the Skill Tree
const CORE_DSA_TOPICS = [
  // TIER 1: Foundations
  {
    id: "arrays",
    name: "Arrays",
    alias: ["Arrays", "Array", "Arrays & Hashing", "Two Pointers"],
    icon: Layers,
    tier: 1,
    tierName: "Foundations",
    description: "Contiguous memory, two pointers, sliding window, and prefix sums"
  },
  {
    id: "strings",
    name: "Strings",
    alias: ["Strings", "String"],
    icon: Type,
    tier: 1,
    tierName: "Foundations",
    description: "Pattern matching, palindromes, anagrams, and string transformations"
  },
  {
    id: "math",
    name: "Math",
    alias: ["Math", "Mathematics"],
    icon: Calculator,
    tier: 1,
    tierName: "Foundations",
    description: "Number theory, modular arithmetic, combinatorics, and geometry"
  },

  // TIER 2: Core Data Structures
  {
    id: "hashing",
    name: "Hashing",
    alias: ["Hashing", "Hash Table", "Hash Map"],
    icon: Hash,
    tier: 2,
    tierName: "Data Structures",
    description: "Hash maps, hash sets, frequency counting, and collision resolution"
  },
  {
    id: "trees",
    name: "Trees",
    alias: ["Trees", "Tree", "Binary Search Tree", "Binary Tree", "Trie"],
    icon: FolderTree,
    tier: 2,
    tierName: "Data Structures",
    description: "Binary search trees, traversals (DFS/BFS), recursion, and tries"
  },
  {
    id: "graphs",
    name: "Graphs",
    alias: ["Graphs", "Graph", "DFS", "BFS", "Topological Sort"],
    icon: Network,
    tier: 2,
    tierName: "Data Structures",
    description: "Adjacency lists, Dijkstra, topological sort, and cycle detection"
  },

  // TIER 3: Advanced Optimization & Algorithms
  {
    id: "dp",
    name: "Dynamic Programming",
    alias: ["Dynamic Programming", "DP"],
    icon: Cpu,
    tier: 3,
    tierName: "Advanced",
    description: "Memoization, tabulation, subproblems, state transitions, and knapsack"
  },
  {
    id: "bit-manipulation",
    name: "Bit Manipulation",
    alias: ["Bit Manipulation", "Bits"],
    icon: Binary,
    tier: 3,
    tierName: "Advanced",
    description: "Bitwise XOR, AND, bit masks, shifts, and low-level arithmetic"
  },

  // TIER 4: Systems & Engineering
  {
    id: "concurrency",
    name: "Concurrency",
    alias: ["Concurrency", "Multithreading"],
    icon: Zap,
    tier: 4,
    tierName: "Systems",
    description: "Locks, semaphores, race conditions, thread synchronization, and deadlocks"
  },
  {
    id: "system-design",
    name: "System Design",
    alias: ["System Design", "Design"],
    icon: Server,
    tier: 4,
    tierName: "Systems",
    description: "Scalability, caching, load balancing, sharding, and fault tolerance"
  }
];

function getMasteryTier(percentage) {
  if (percentage >= 100) {
    return {
      status: "Mastered",
      color: "#10b981",
      glowColor: "rgba(16, 185, 129, 0.4)",
      badgeBg: "rgba(16, 185, 129, 0.15)",
      badgeBorder: "rgba(16, 185, 129, 0.35)",
      badgeText: "#34d399",
      accentClass: "node-mastered"
    };
  }
  if (percentage >= 70) {
    return {
      status: "Strong",
      color: "#38bdf8",
      glowColor: "rgba(56, 189, 248, 0.35)",
      badgeBg: "rgba(56, 189, 248, 0.15)",
      badgeBorder: "rgba(56, 189, 248, 0.35)",
      badgeText: "#38bdf8",
      accentClass: "node-strong"
    };
  }
  if (percentage >= 35) {
    return {
      status: "Learning",
      color: "#f59e0b",
      glowColor: "rgba(245, 158, 11, 0.3)",
      badgeBg: "rgba(245, 158, 11, 0.15)",
      badgeBorder: "rgba(245, 158, 11, 0.35)",
      badgeText: "#fbbf24",
      accentClass: "node-learning"
    };
  }
  if (percentage > 0) {
    return {
      status: "Weak",
      color: "#f43f5e",
      glowColor: "rgba(244, 63, 94, 0.3)",
      badgeBg: "rgba(244, 63, 94, 0.15)",
      badgeBorder: "rgba(244, 63, 94, 0.35)",
      badgeText: "#fb7185",
      accentClass: "node-weak"
    };
  }
  return {
    status: "Not Started",
    color: "#64748b",
    glowColor: "rgba(100, 116, 139, 0.15)",
    badgeBg: "rgba(255, 255, 255, 0.04)",
    badgeBorder: "rgba(255, 255, 255, 0.08)",
    badgeText: "#94a3b8",
    accentClass: "node-not-started"
  };
}

export default function DsaSkillTree({ topicProficiency = [] }) {
  const navigate = useNavigate();
  const [hoveredTopic, setHoveredTopic] = useState(null);
  const containerRef = useRef(null);

  // Map real topic proficiency data to the 10 Core DSA topics
  const processedTopics = useMemo(() => {
    return CORE_DSA_TOPICS.map((core) => {
      const matches = topicProficiency.filter((tp) => {
        const tName = (tp.topic || "").trim().toLowerCase();
        return (
          tName === core.name.toLowerCase() ||
          core.alias.some((a) => a.toLowerCase() === tName || tName.includes(a.toLowerCase()))
        );
      });

      let totalProblems = 0;
      let solvedCount = 0;
      let totalSubmissions = 0;
      let acceptedSubmissions = 0;

      if (matches.length > 0) {
        matches.forEach((m) => {
          totalProblems += m.totalProblems || 0;
          solvedCount += m.solvedCount || 0;
          totalSubmissions += m.totalSubmissions || 0;
          acceptedSubmissions += m.acceptedSubmissions || 0;
        });
      } else {
        totalProblems = 3;
        solvedCount = 0;
      }

      if (totalProblems === 0) totalProblems = 3;

      const accuracy =
        totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : solvedCount > 0 ? 100 : 0;

      const coverage = totalProblems > 0 ? Math.min(1, solvedCount / totalProblems) : 0;
      const calculatedMastery =
        solvedCount === 0
          ? 0
          : solvedCount >= totalProblems && accuracy >= 80
          ? 100
          : Math.round(coverage * 60 + (accuracy / 100) * 40);

      const masteryPct = Math.min(100, Math.max(0, calculatedMastery));
      const tierInfo = getMasteryTier(masteryPct);

      let nextAction = "Start your first problem in this topic";
      if (masteryPct >= 100) nextAction = "Mastery reached! Keep solving hard problems to retain";
      else if (masteryPct >= 70) nextAction = `Solve ${Math.max(1, totalProblems - solvedCount)} more to reach Mastered`;
      else if (masteryPct >= 35) nextAction = "Solve 2 more medium problems to reach Strong";
      else if (masteryPct > 0) nextAction = "Practice core edge cases and optimize time complexity";

      return {
        ...core,
        totalProblems,
        solvedCount,
        accuracy,
        masteryPct,
        tierInfo,
        nextAction
      };
    });
  }, [topicProficiency]);

  // Overall DSA Mastery percentage
  const overallMastery = useMemo(() => {
    if (processedTopics.length === 0) return 0;
    const sum = processedTopics.reduce((acc, t) => acc + t.masteryPct, 0);
    return Math.round(sum / processedTopics.length);
  }, [processedTopics]);

  // Group by Tiers
  const tier1Topics = processedTopics.filter((t) => t.tier === 1);
  const tier2Topics = processedTopics.filter((t) => t.tier === 2);
  const tier3Topics = processedTopics.filter((t) => t.tier === 3);
  const tier4Topics = processedTopics.filter((t) => t.tier === 4);

  // SVG Circular progress math for central mastery node (compact radius 36)
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallMastery / 100) * circumference;

  const masteredCount = processedTopics.filter((t) => t.masteryPct >= 100).length;
  const strongCount = processedTopics.filter((t) => t.masteryPct >= 70 && t.masteryPct < 100).length;

  return (
    <div className="dsa-tree-container" ref={containerRef}>
      {/* 1. Section Header */}
      <div className="dsa-tree-header">
        <div className="dsa-tree-title-group">
          <div className="dsa-tree-title-row">
            <div className="dsa-tree-spark-icon">
              <Sparkles size={15} />
            </div>
            <h3 className="dsa-tree-title">DSA Skill Tree</h3>
            <span className="dsa-tree-badge-pill">
              {masteredCount + strongCount} / {processedTopics.length} Proficient
            </span>
          </div>
          <p className="dsa-tree-subtitle">Your algorithmic mastery mapped by topic</p>
        </div>
        <div className="dsa-tree-info-tag">
          <Info size={13} />
          <span>Calculated from problem coverage, accuracy &amp; consistency</span>
        </div>
      </div>

      {/* 2. Visual Skill Tree Canvas with Branch Connectors */}
      <div className="dsa-tree-canvas">
        {/* Curved SVG Connection Lines */}
        <div className="dsa-branch-svg-overlay">
          <svg className="dsa-branch-svg" viewBox="0 0 1000 600" preserveAspectRatio="none">
            <defs>
              <linearGradient id="tree-branch-active" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#7850ff" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#00c3ff" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="tree-branch-dim" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
              </linearGradient>
            </defs>

            {/* Central Root Split Lines to Tier 1 */}
            <path
              d="M 500,85 C 500,120 180,110 180,150"
              fill="none"
              stroke="url(#tree-branch-active)"
              strokeWidth="2"
              className="dsa-svg-branch"
            />
            <path
              d="M 500,85 C 500,125 500,125 500,150"
              fill="none"
              stroke="url(#tree-branch-active)"
              strokeWidth="2"
              className="dsa-svg-branch"
            />
            <path
              d="M 500,85 C 500,120 820,110 820,150"
              fill="none"
              stroke="url(#tree-branch-active)"
              strokeWidth="2"
              className="dsa-svg-branch"
            />

            {/* Inter-Tier Connector Lines: Tier 1 to Tier 2 */}
            <path
              d="M 180,215 C 180,245 180,245 180,275"
              fill="none"
              stroke="url(#tree-branch-dim)"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            <path
              d="M 500,215 C 500,245 500,245 500,275"
              fill="none"
              stroke="url(#tree-branch-dim)"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            <path
              d="M 820,215 C 820,245 820,245 820,275"
              fill="none"
              stroke="url(#tree-branch-dim)"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />

            {/* Inter-Tier Connector Lines: Tier 2 to Tier 3 & 4 */}
            <path
              d="M 180,340 C 180,380 340,380 340,410"
              fill="none"
              stroke="url(#tree-branch-dim)"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            <path
              d="M 500,340 C 500,380 500,380 500,410"
              fill="none"
              stroke="url(#tree-branch-dim)"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            <path
              d="M 820,340 C 820,380 660,380 660,410"
              fill="none"
              stroke="url(#tree-branch-dim)"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
          </svg>
        </div>

        {/* Central Master Node (Compact & Radiant) */}
        <div className="dsa-central-node-wrapper">
          <div className="dsa-central-node">
            {/* Ambient Background Glow */}
            <div
              className="dsa-central-glow"
              style={{
                background:
                  overallMastery >= 70
                    ? "radial-gradient(circle, rgba(56, 189, 248, 0.35) 0%, rgba(120, 80, 255, 0.15) 50%, transparent 70%)"
                    : "radial-gradient(circle, rgba(120, 80, 255, 0.35) 0%, rgba(0, 195, 255, 0.15) 50%, transparent 70%)"
              }}
            />

            {/* Circular Progress Ring */}
            <svg className="dsa-central-svg" viewBox="0 0 90 90">
              <circle
                className="dsa-ring-bg"
                cx="45"
                cy="45"
                r={radius}
                strokeWidth="5"
                fill="none"
              />
              <circle
                className="dsa-ring-fill"
                cx="45"
                cy="45"
                r={radius}
                strokeWidth="5"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 45 45)"
              />
            </svg>

            {/* Inner Content */}
            <div className="dsa-central-content">
              <div className="dsa-central-icon-box">
                <Brain size={18} className="dsa-brain-pulse" />
              </div>
              <span className="dsa-central-pct">{overallMastery}%</span>
              <span className="dsa-central-label">DSA Mastery</span>
              <span className="dsa-central-sublabel">Overall</span>
            </div>
          </div>
        </div>

        {/* 3. Multi-Tier Hierarchical Tree Structure */}
        <div className="dsa-tree-tiers-container">
          {/* TIER 1: Foundations (Arrays, Strings, Math) */}
          <div className="dsa-tier-section">
            <div className="dsa-tier-header-pill">
              <span className="dsa-tier-num">Tier 1</span>
              <span>Foundations &amp; Basics</span>
            </div>
            <div className="dsa-tier-nodes-row">
              {tier1Topics.map((topic) => renderCompactTopicNode(topic, hoveredTopic, setHoveredTopic, navigate))}
            </div>
          </div>

          {/* TIER 2: Core Data Structures (Hashing, Trees, Graphs) */}
          <div className="dsa-tier-section">
            <div className="dsa-tier-header-pill">
              <span className="dsa-tier-num">Tier 2</span>
              <span>Core Data Structures</span>
            </div>
            <div className="dsa-tier-nodes-row">
              {tier2Topics.map((topic) => renderCompactTopicNode(topic, hoveredTopic, setHoveredTopic, navigate))}
            </div>
          </div>

          {/* TIER 3 & 4: Advanced Algorithms & Systems */}
          <div className="dsa-tier-section">
            <div className="dsa-tier-header-pill">
              <span className="dsa-tier-num">Tier 3 &amp; 4</span>
              <span>Advanced Optimization &amp; Systems</span>
            </div>
            <div className="dsa-tier-nodes-row grid-4-col">
              {[...tier3Topics, ...tier4Topics].map((topic) =>
                renderCompactTopicNode(topic, hoveredTopic, setHoveredTopic, navigate)
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Legend at Bottom */}
      <div className="dsa-tree-legend">
        <div className="dsa-legend-label">Mastery Levels:</div>
        <div className="dsa-legend-items">
          <div className="dsa-legend-item">
            <span className="dsa-legend-dot mastered" />
            <span>Mastered (100%)</span>
          </div>
          <div className="dsa-legend-item">
            <span className="dsa-legend-dot strong" />
            <span>Strong (70–99%)</span>
          </div>
          <div className="dsa-legend-item">
            <span className="dsa-legend-dot learning" />
            <span>Learning (35–69%)</span>
          </div>
          <div className="dsa-legend-item">
            <span className="dsa-legend-dot weak" />
            <span>Weak (1–34%)</span>
          </div>
          <div className="dsa-legend-item">
            <span className="dsa-legend-dot not-started" />
            <span>Not Started (0%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact Topic Node Renderer
function renderCompactTopicNode(topic, hoveredTopic, setHoveredTopic, navigate) {
  const Icon = topic.icon;
  const { tierInfo } = topic;
  const isHovered = hoveredTopic?.id === topic.id;

  return (
    <div
      key={topic.id}
      className={`dsa-compact-topic-node ${tierInfo.accentClass} ${isHovered ? "is-hovered" : ""}`}
      onClick={() => navigate(`/problems?topic=${encodeURIComponent(topic.name)}`)}
      onMouseEnter={() => setHoveredTopic(topic)}
      onMouseLeave={() => setHoveredTopic(null)}
    >
      {/* Top Connector Pip */}
      <div
        className="dsa-node-pip"
        style={{ background: tierInfo.color, boxShadow: `0 0 6px ${tierInfo.glowColor}` }}
      />

      {/* Left Icon + Middle Info */}
      <div className="dsa-node-main-body">
        <div
          className="dsa-compact-icon-box"
          style={{
            background: tierInfo.badgeBg,
            borderColor: tierInfo.badgeBorder,
            color: tierInfo.color
          }}
        >
          <Icon size={14} />
        </div>

        <div className="dsa-compact-text">
          <div className="dsa-compact-name-row">
            <span className="dsa-compact-name">{topic.name}</span>
            <span
              className="dsa-compact-status-badge"
              style={{
                background: tierInfo.badgeBg,
                color: tierInfo.badgeText,
                borderColor: tierInfo.badgeBorder
              }}
            >
              {tierInfo.status}
            </span>
          </div>

          <div className="dsa-compact-bar-row">
            <div className="dsa-compact-bar-track">
              <div
                className="dsa-compact-bar-fill"
                style={{
                  width: `${Math.min(100, topic.masteryPct)}%`,
                  background:
                    topic.masteryPct >= 100
                      ? "linear-gradient(90deg, #10b981, #34d399)"
                      : topic.masteryPct >= 70
                      ? "linear-gradient(90deg, #0284c7, #38bdf8)"
                      : topic.masteryPct >= 35
                      ? "linear-gradient(90deg, #d97706, #fbbf24)"
                      : topic.masteryPct > 0
                      ? "linear-gradient(90deg, #e11d48, #fb7185)"
                      : "rgba(255, 255, 255, 0.1)"
                }}
              />
            </div>
            <span className="dsa-compact-pct" style={{ color: tierInfo.color }}>
              {topic.masteryPct}%
            </span>
          </div>

          <div className="dsa-compact-footer-row">
            <span>
              {topic.solvedCount} / {topic.totalProblems} solved
            </span>
            <span className="dsa-compact-practice-tag">
              Practice <ChevronRight size={11} />
            </span>
          </div>
        </div>
      </div>

      {/* Rich Tooltip on Hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="dsa-node-tooltip"
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 3, scale: 0.96 }}
            transition={{ duration: 0.12 }}
          >
            <div className="dsa-tooltip-head">
              <span className="dsa-tooltip-title">{topic.name}</span>
              <span className="dsa-tooltip-status" style={{ color: tierInfo.badgeText }}>
                ● {tierInfo.status}
              </span>
            </div>
            <p className="dsa-tooltip-desc">{topic.description}</p>
            <div className="dsa-tooltip-stats">
              <div className="dsa-tooltip-stat-item">
                <span>Mastery</span>
                <strong>{topic.masteryPct}%</strong>
              </div>
              <div className="dsa-tooltip-stat-item">
                <span>Solved</span>
                <strong>
                  {topic.solvedCount} / {topic.totalProblems}
                </strong>
              </div>
              <div className="dsa-tooltip-stat-item">
                <span>Accuracy</span>
                <strong>{topic.accuracy}%</strong>
              </div>
            </div>
            <div className="dsa-tooltip-action">
              <span>💡 Next:</span> {topic.nextAction}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
