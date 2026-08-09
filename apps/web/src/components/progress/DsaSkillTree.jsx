import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Binary,
  Brain,
  Calculator,
  Cpu,
  FolderTree,
  GitBranch,
  Hash,
  Info,
  Layers,
  Network,
  Server,
  Sparkles,
  Type,
  Zap,
  ArrowRight,
  ChevronRight,
  GraduationCap
} from "lucide-react";
import "../../styles/skillTree.css";

// The 10 Core DSA Topics required for the Skill Tree
const CORE_DSA_TOPICS = [
  {
    id: "arrays",
    name: "Arrays",
    alias: ["Arrays", "Array", "Arrays & Hashing", "Two Pointers"],
    icon: Layers,
    tier: 1, // Tier 1: Fundamentals
    description: "Contiguous memory, two pointers, sliding window, and prefix sums"
  },
  {
    id: "strings",
    name: "Strings",
    alias: ["Strings", "String"],
    icon: Type,
    tier: 1,
    description: "Pattern matching, palindromes, anagrams, and string transformations"
  },
  {
    id: "math",
    name: "Math",
    alias: ["Math", "Mathematics", "Bit Manipulation"],
    icon: Calculator,
    tier: 1,
    description: "Number theory, modular arithmetic, combinatorics, and geometry"
  },
  {
    id: "hashing",
    name: "Hashing",
    alias: ["Hashing", "Hash Table", "Hash Map"],
    icon: Hash,
    tier: 2, // Tier 2: Core Data Structures
    description: "Hash maps, hash sets, frequency counting, and collision resolution"
  },
  {
    id: "trees",
    name: "Trees",
    alias: ["Trees", "Tree", "Binary Search Tree", "Binary Tree", "Trie"],
    icon: FolderTree,
    tier: 2,
    description: "Binary search trees, traversals (DFS/BFS), recursion, and tries"
  },
  {
    id: "graphs",
    name: "Graphs",
    alias: ["Graphs", "Graph", "DFS", "BFS", "Topological Sort"],
    icon: Network,
    tier: 2,
    description: "Adjacency lists, Dijkstra, topological sort, and cycle detection"
  },
  {
    id: "dp",
    name: "Dynamic Programming",
    alias: ["Dynamic Programming", "DP"],
    icon: Cpu,
    tier: 3, // Tier 3: Advanced Optimization
    description: "Memoization, tabulation, subproblems, state transitions, and knapsack"
  },
  {
    id: "bit-manipulation",
    name: "Bit Manipulation",
    alias: ["Bit Manipulation", "Bits"],
    icon: Binary,
    tier: 3,
    description: "Bitwise XOR, AND, bit masks, shifts, and low-level arithmetic"
  },
  {
    id: "concurrency",
    name: "Concurrency",
    alias: ["Concurrency", "Multithreading"],
    icon: Zap,
    tier: 4, // Tier 4: Engineering & Systems
    description: "Locks, semaphores, race conditions, thread synchronization, and deadlocks"
  },
  {
    id: "system-design",
    name: "System Design",
    alias: ["System Design", "Design"],
    icon: Server,
    tier: 4,
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
      // Find matching items from existing topicProficiency
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
        // Fallback default target count if topic has no problems in database
        totalProblems = 3;
        solvedCount = 0;
      }

      // Ensure minimum target problem baseline
      if (totalProblems === 0) totalProblems = 3;

      const accuracy =
        totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : solvedCount > 0 ? 100 : 0;

      // Realistic mastery formula: 60% coverage + 40% accuracy
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

  // Overall DSA Mastery percentage calculated as the average of topic masteries
  const overallMastery = useMemo(() => {
    if (processedTopics.length === 0) return 0;
    const sum = processedTopics.reduce((acc, t) => acc + t.masteryPct, 0);
    return Math.round(sum / processedTopics.length);
  }, [processedTopics]);

  // SVG Circular progress math for central mastery node
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallMastery / 100) * circumference;

  const masteredCount = processedTopics.filter((t) => t.masteryPct >= 100).length;
  const strongCount = processedTopics.filter((t) => t.masteryPct >= 70 && t.masteryPct < 100).length;
  const learningCount = processedTopics.filter((t) => t.masteryPct >= 35 && t.masteryPct < 70).length;
  const weakCount = processedTopics.filter((t) => t.masteryPct > 0 && t.masteryPct < 35).length;
  const notStartedCount = processedTopics.filter((t) => t.masteryPct === 0).length;

  return (
    <div className="dsa-tree-container" ref={containerRef}>
      {/* 1. Header */}
      <div className="dsa-tree-header">
        <div className="dsa-tree-title-group">
          <div className="dsa-tree-title-row">
            <div className="dsa-tree-spark-icon">
              <Sparkles size={16} />
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

      {/* 2. Visual Skill Tree Canvas */}
      <div className="dsa-tree-canvas">
        {/* Central Root Node */}
        <div className="dsa-central-node-wrapper">
          <motion.div
            className="dsa-central-node"
            whileHover={{ scale: 1.04 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
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
            <svg className="dsa-central-svg" viewBox="0 0 120 120">
              <circle
                className="dsa-ring-bg"
                cx="60"
                cy="60"
                r={radius}
                strokeWidth="7"
                fill="none"
              />
              <circle
                className="dsa-ring-fill"
                cx="60"
                cy="60"
                r={radius}
                strokeWidth="7"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
              />
            </svg>

            {/* Inner Content */}
            <div className="dsa-central-content">
              <div className="dsa-central-icon-box">
                <Brain size={22} className="dsa-brain-pulse" />
              </div>
              <span className="dsa-central-pct">{overallMastery}%</span>
              <span className="dsa-central-label">DSA Mastery</span>
              <span className="dsa-central-sublabel">Overall Mastery</span>
            </div>
          </motion.div>

          {/* Central Stem Line */}
          <div className="dsa-central-stem" />
        </div>

        {/* 3. Responsive Hierarchical Topic Grid */}
        <div className="dsa-topics-grid">
          {processedTopics.map((topic, idx) => {
            const Icon = topic.icon;
            const { tierInfo } = topic;
            const isHovered = hoveredTopic?.id === topic.id;

            return (
              <motion.div
                key={topic.id}
                className={`dsa-topic-node ${tierInfo.accentClass} ${isHovered ? "is-hovered" : ""}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.04 }}
                whileHover={{ y: -4, scale: 1.02 }}
                onClick={() => navigate(`/problems?topic=${encodeURIComponent(topic.name)}`)}
                onMouseEnter={() => setHoveredTopic(topic)}
                onMouseLeave={() => setHoveredTopic(null)}
              >
                {/* Node Connector Point */}
                <div
                  className="dsa-node-connector-dot"
                  style={{ background: tierInfo.color, boxShadow: `0 0 8px ${tierInfo.glowColor}` }}
                />

                {/* Node Header: Icon + Name + Badge */}
                <div className="dsa-node-top">
                  <div
                    className="dsa-node-icon-wrap"
                    style={{
                      background: tierInfo.badgeBg,
                      borderColor: tierInfo.badgeBorder,
                      color: tierInfo.color
                    }}
                  >
                    <Icon size={16} />
                  </div>

                  <div className="dsa-node-name-wrap">
                    <h4 className="dsa-node-name">{topic.name}</h4>
                    <span className="dsa-node-tier-tag">Tier {topic.tier}</span>
                  </div>

                  <span
                    className="dsa-node-status-badge"
                    style={{
                      background: tierInfo.badgeBg,
                      borderColor: tierInfo.badgeBorder,
                      color: tierInfo.badgeText
                    }}
                  >
                    {tierInfo.status}
                  </span>
                </div>

                {/* Progress Metric Line */}
                <div className="dsa-node-metric-row">
                  <span className="dsa-node-solved-count">
                    <strong>{topic.solvedCount}</strong> / {topic.totalProblems} solved
                  </span>
                  <span className="dsa-node-pct" style={{ color: tierInfo.color }}>
                    {topic.masteryPct}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="dsa-node-progress-track">
                  <motion.div
                    className="dsa-node-progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, topic.masteryPct)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{
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

                {/* Node Footer / Call to Action */}
                <div className="dsa-node-footer">
                  <span className="dsa-node-accuracy">
                    {topic.accuracy > 0 ? `${topic.accuracy}% Accuracy` : "Unattempted"}
                  </span>
                  <div className="dsa-node-practice-btn">
                    <span>Practice</span>
                    <ChevronRight size={13} />
                  </div>
                </div>

                {/* Interactive Tooltip on Hover */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      className="dsa-node-tooltip"
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="dsa-tooltip-head">
                        <span className="dsa-tooltip-title">{topic.name}</span>
                        <span
                          className="dsa-tooltip-status"
                          style={{ color: tierInfo.badgeText }}
                        >
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
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 4. Legend at the Bottom */}
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
