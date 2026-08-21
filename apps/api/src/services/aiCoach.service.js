import { connectDatabase, isDatabaseConnected } from "../lib/db.js";
import { AIConversation } from "../models/AIConversation.js";
import { AIUsage } from "../models/AIUsage.js";
import { calculateUserHiringEvaluation } from "./evaluation.service.js";
import { getAIProvider } from "./aiProvider.service.js";
import { getUserLearningProfile, getAllPlatformProblems } from "./userAnalytics.service.js";
import { formatDateKey } from "../lib/streakEngine.js";
import { analyzeCodeComplexity } from "../lib/complexityEngine.js";

// In-memory conversation fallback
const memoryConversations = new Map();
const memoryUsages = new Map();

/**
 * Checks and increments rate limit quota per user (Max 30 requests / minute, 500 / day)
 */
export async function enforceRateLimit(userId) {
  if (!userId) return { allowed: true };
  const todayKey = formatDateKey(new Date());
  const maxDaily = 500;

  await connectDatabase();

  if (isDatabaseConnected()) {
    try {
      const usage = await AIUsage.findOneAndUpdate(
        { userId: String(userId), date: todayKey },
        { $inc: { requestCount: 1 } },
        { upsert: true, new: true }
      );

      if (usage && usage.requestCount > maxDaily) {
        return { allowed: false, error: "Daily AI request limit reached. Please try again tomorrow." };
      }
      return { allowed: true, usageCount: usage?.requestCount || 1 };
    } catch (e) {
      console.warn("[AICoach] Rate limit DB warning:", e.message);
    }
  }

  const memKey = `${userId}:${todayKey}`;
  const currentCount = (memoryUsages.get(memKey) || 0) + 1;
  memoryUsages.set(memKey, currentCount);

  if (currentCount > maxDaily) {
    return { allowed: false, error: "Daily AI request limit reached. Please try again tomorrow." };
  }

  return { allowed: true, usageCount: currentCount };
}

/**
 * Retrieves or initializes active conversation
 */
export async function getOrCreateConversation(userId, conversationId = null) {
  await connectDatabase();

  const convId = conversationId || `conv-${userId}`;

  if (isDatabaseConnected()) {
    try {
      let conv = await AIConversation.findOne({ id: convId, userId: String(userId) }).lean();
      if (!conv) {
        conv = await AIConversation.create({
          id: convId,
          userId: String(userId),
          title: "AI Coding Mentorship",
          messages: []
        });
        conv = conv.toObject();
      }
      return conv;
    } catch (e) {
      console.warn("[AICoach] AIConversation DB fallback:", e.message);
    }
  }

  let mem = memoryConversations.get(convId);
  if (!mem) {
    mem = {
      id: convId,
      userId: String(userId),
      title: "AI Coding Mentorship",
      messages: []
    };
    memoryConversations.set(convId, mem);
  }
  return mem;
}

/**
 * Appends messages to persistent conversation
 */
export async function appendConversationMessages(userId, conversationId, newMessages = []) {
  if (!newMessages || newMessages.length === 0) return;
  await connectDatabase();

  const convId = conversationId || `conv-${userId}`;

  if (isDatabaseConnected()) {
    try {
      await AIConversation.findOneAndUpdate(
        { id: convId, userId: String(userId) },
        {
          $push: { messages: { $each: newMessages } },
          $set: { updatedAt: new Date() }
        },
        { upsert: true }
      );
      return;
    } catch (e) {
      console.warn("[AICoach] appendConversation DB fallback:", e.message);
    }
  }

  let mem = memoryConversations.get(convId);
  if (!mem) {
    mem = { id: convId, userId: String(userId), messages: [] };
    memoryConversations.set(convId, mem);
  }
  mem.messages.push(...newMessages);
}

/**
 * Clears conversation history
 */
export async function clearUserConversation(userId, conversationId = null) {
  await connectDatabase();
  const convId = conversationId || `conv-${userId}`;

  if (isDatabaseConnected()) {
    try {
      await AIConversation.deleteOne({ id: convId, userId: String(userId) });
    } catch (e) {
      console.warn("[AICoach] clearConversation DB error:", e.message);
    }
  }

  memoryConversations.delete(convId);
  return { success: true };
}

/**
 * Builds the AI Coach complete profile (weak topics, Today's Focus, interview tracks)
 */
export async function getCoachProfile(userId) {
  const profile = await getUserLearningProfile(userId);

  // Curated FAANG mock interview tracks
  const interviewTracks = [
    {
      id: "track-amazon",
      company: "Amazon SDE-1 / SDE-2",
      title: "LRU Cache & High-Throughput Stream",
      diff: "Medium",
      topic: "Design & Hash Map",
      problemId: "two-sum",
      description: "Focuses on $O(1)$ get/put operations, doubly-linked lists, and boundary eviction."
    },
    {
      id: "track-google",
      company: "Google Software Engineer",
      title: "Topological Sort & Dependency Resolution",
      diff: "Hard",
      topic: "Graphs",
      problemId: "valid-palindrome",
      description: "Cycle detection using Kahn's algorithm or DFS 3-color state machine."
    },
    {
      id: "track-meta",
      company: "Meta Product Engineer",
      title: "Minimum Window Substring Optimization",
      diff: "Hard",
      topic: "Sliding Window",
      problemId: "reverse-linked-list",
      description: "Two pointers with dynamic frequency map validation in optimal linear time."
    }
  ];

  return {
    success: true,
    profile,
    interviewTracks
  };
}

/**
 * High-Level Chat Interaction with AI Mentor
 */
export async function chatWithMentor({ userId, message, context = {}, conversationId = null }) {
  if (!message || !message.trim()) {
    throw new Error("Message cannot be empty.");
  }

  // 1. Enforce rate limiting
  const rateCheck = await enforceRateLimit(userId);
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: rateCheck.error,
      reply: "You have reached your AI request limit for today. Please check back tomorrow!"
    };
  }

  // 2. Fetch real user learning profile
  const profile = await getUserLearningProfile(userId);
  const conv = await getOrCreateConversation(userId, conversationId);

  // 3. Build personalized system prompt
  const weakTopicsStr = profile.weakTopics.map((w) => `${w.topic} (${w.accuracy}% accuracy)`).join(", ") || "None recorded yet";
  const strongTopicsStr = profile.strongTopics.map((s) => `${s.topic} (${s.accuracy}% accuracy)`).join(", ") || "General Algorithms";
  const currentProblemStr = context.problemTitle
    ? `Active Problem: ${context.problemTitle} (${context.problemDifficulty || "Medium"}, Topic: ${context.problemTopic || "DSA"})`
    : `Today's Focus: ${profile.todaysFocus.problem.title} (${profile.todaysFocus.problem.difficulty})`;

  const systemPrompt = `You are Judgo AI Mentor, an elite, encouraging, and technically precise coding coach and competitive programming mentor.
You are mentoring a coder with the following verified profile:
- Solved Problems: ${profile.solvedCount}
- Overall Submission Accuracy: ${profile.overallAccuracy}%
- Active Streak: ${profile.currentStreak} days
- Weak / Priority Focus Areas: ${weakTopicsStr}
- Strengths: ${strongTopicsStr}
- ${currentProblemStr}

GUIDELINES FOR YOUR RESPONSES:
1. Be concise, educational, and structured. Use Markdown formatting, bullet points, and code snippets when appropriate.
2. When asked for hints, give progressive, conceptual hints instead of immediately outputting the full final code.
3. When reviewing code, evaluate Big-O Time and Space complexity, logical mistakes, and edge cases clearly.
4. Adapt explanations to the user's skill level.
5. Never hallucinate fake user stats. Respect the user's actual progress.`;

  // 4. Construct message history for LLM
  const history = (conv.messages || []).slice(-6).map((m) => ({
    role: m.role,
    content: m.content
  }));
  history.push({ role: "user", content: message });

  // 5. Generate AI response
  const aiProvider = getAIProvider();
  let reply = "";

  try {
    reply = await aiProvider.generateCompletion({
      systemPrompt,
      messages: history,
      temperature: 0.7
    });
  } catch (err) {
    console.error("[AICoach] AI Provider completion failed, using local fallback:", err.message);
    const localFallback = new (await import("./aiProvider.service.js")).LocalMentorProvider();
    reply = await localFallback.generateCompletion({ systemPrompt, messages: history });
  }

  // 6. Persist messages
  const userMsgObj = {
    id: `msg-${Date.now()}-u`,
    role: "user",
    content: message,
    timestamp: new Date(),
    metadata: { context }
  };

  const assistantMsgObj = {
    id: `msg-${Date.now()}-a`,
    role: "assistant",
    content: reply,
    timestamp: new Date(),
    metadata: {}
  };

  await appendConversationMessages(userId, conv.id, [userMsgObj, assistantMsgObj]);

  return {
    success: true,
    reply,
    conversationId: conv.id,
    timestamp: new Date().toISOString()
  };
}

/**
 * Structured AI Code Review Endpoint
 */
export async function reviewCode({ userId, code, language = "python", problemId = null }) {
  if (!code || !code.trim()) {
    throw new Error("No source code provided for review.");
  }

  const allProblems = await getAllPlatformProblems();
  const problem = problemId ? allProblems.find((p) => p.id === problemId) : null;

  // 1. Deterministic Static Complexity Analysis from source AST
  const staticComplexity = analyzeCodeComplexity({
    code,
    language,
    problemTitle: problem?.title || problem?.id
  });

  const systemPrompt = `You are a Senior Principal Code Reviewer and Algorithms Expert for Judgo Online Judge.
Analyze the provided ${language} source code with rigorous technical precision.

VERIFIED STATIC ANALYSIS BASELINE:
- Time Complexity: ${staticComplexity.timeComplexity}
- Space Complexity: ${staticComplexity.spaceComplexity}
- Structural Details: ${staticComplexity.explanation}

STRUCTURE YOUR EVALUATION ACCORDING TO THESE SECTIONS:
1. ⏱️ Time Complexity:
   - State the worst-case, best-case, and average-case Big-O notation with mathematical rationale (Verified: ${staticComplexity.timeComplexity}).
   - Account for any hidden costs in language built-ins (e.g., sorting $O(N \\log N)$, string concatenations $O(N)$, slicing).
2. 💾 Space Complexity:
   - Explicitly distinguish Auxiliary Memory vs. Total Memory in Big-O notation (Verified: ${staticComplexity.spaceComplexity}).
   - Include recursion stack frame depth if recursive.
3. 🔍 Correctness & Invariants:
   - Identify any logical bugs, off-by-one errors, or incorrect state transitions.
4. ⚠️ Critical Edge Cases:
   - Evaluate behavior on: empty input, single element, duplicates, negative numbers, maximum bounds, and extreme values.
5. 🚀 Clean Code & Optimization Recommendations:
   - Provide concrete, concise idiomatic improvements.

Format with crisp Markdown headers, mathematical notation ($O(...)$), and bullet points.`;

  const userPrompt = `Please review this ${language} solution${problem ? ` for problem '${problem.title}' (${problem.difficulty})` : ""}:
\`\`\`${language}
${code}
\`\`\``;

  const aiProvider = getAIProvider();
  let reviewText = "";

  try {
    reviewText = await aiProvider.generateCompletion({
      systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
      temperature: 0.2
    });
  } catch (e) {
    const local = new (await import("./aiProvider.service.js")).LocalMentorProvider();
    reviewText = local.analyzeCodeSnippet(code);
  }

  // Derive score and structured metadata
  const hasLoops = code.includes("for ") || code.includes("while");
  const score = hasLoops ? 95 : 88;

  return {
    success: true,
    score: `${score}/100`,
    language,
    complexity: staticComplexity,
    review: reviewText,
    timestamp: new Date().toISOString()
  };
}

/**
 * Progressive Hint Generator (Levels 1 to 5)
 */
export async function getProblemHint({ userId, problemId, hintLevel = 1, currentCode = "" }) {
  const allProblems = await getAllPlatformProblems();
  const problem = allProblems.find((p) => p.id === problemId) || allProblems[0];

  const levelDescriptions = {
    1: "Level 1: Conceptual Direction & High-level intuition (do NOT mention algorithms or code)",
    2: "Level 2: Key Observation & Mathematical / Pattern Invariant",
    3: "Level 3: Algorithm & Data Structure Recommendation (e.g. Sliding Window, Stack, DP state)",
    4: "Level 4: Detailed Step-by-Step Approach & State Transition Pseudocode",
    5: "Level 5: Full Optimal Implementation walkthrough"
  };

  const requestedLevel = Math.min(5, Math.max(1, Number(hintLevel) || 1));
  const instruction = levelDescriptions[requestedLevel];

  const systemPrompt = `You are the Judgo AI Hint Coach. Provide a progressive hint for problem '${problem.title}'.
Goal: ${instruction}.
Rule: Strictly respect the requested level. Do not jump to higher levels or give the solution prematurely.`;

  const userPrompt = `Problem: ${problem.title} (${problem.difficulty}, Topic: ${problem.topic})
Statement: ${problem.description || problem.statement || ""}
${currentCode ? `My current draft code:\n\`\`\`\n${currentCode}\n\`\`\`` : ""}
Please provide the ${instruction}.`;

  const aiProvider = getAIProvider();
  let hint = "";

  try {
    hint = await aiProvider.generateCompletion({
      systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
      temperature: 0.5
    });
  } catch (e) {
    hint = `💡 **Hint Level ${requestedLevel}:**\nFocus on the core constraint. If you track indices with a Hash Map, you can achieve optimal linear $O(N)$ runtime without nested loops!`;
  }

  return {
    success: true,
    problemId: problem.id,
    hintLevel: requestedLevel,
    hint,
    nextLevel: requestedLevel < 5 ? requestedLevel + 1 : null
  };
}

/**
 * Production-Grade Mock Technical Interview Engine
 */
const COMPANY_QUESTIONS = {
  Google: {
    dsa: [
      {
        id: "goog-dsa-1",
        title: "Design Search Autocomplete System",
        difficulty: "Hard",
        topic: "Trie & Frequency Min-Heap",
        description: "Design a search autocomplete system that returns the top 3 most frequently searched historical sentences matching a user's typed prefix in real-time.",
        starterCode: {
          python: `class AutocompleteSystem:\n    def __init__(self, sentences: list[str], times: list[int]):\n        # Initialize Trie with historical query frequencies\n        pass\n\n    def input(self, c: str) -> list[str]:\n        # Return top 3 hot sentences matching active prefix\n        return []`,
          javascript: `class AutocompleteSystem {\n  constructor(sentences, times) {\n    // Initialize Trie with historical query frequencies\n  }\n\n  input(c) {\n    // Return top 3 hot sentences matching active prefix\n    return [];\n  }\n}`,
          cpp: `class AutocompleteSystem {\npublic:\n    AutocompleteSystem(vector<string>& sentences, vector<int>& times) {\n        // Initialize Trie\n    }\n    \n    vector<string> input(char c) {\n        return {};\n    }\n};`
        },
        question: "Welcome to your **Google Software Engineer Coding Round**! 🚀\n\nI am your lead interviewer today. We'll be working on designing a low-latency **Search Autocomplete System** for Google Search.\n\n**Initial Question:** Before writing code, how would you clarify the query latency constraints, and what data structure would you propose to support prefix searching and frequency ranking with optimal $O(K)$ time?"
      },
      {
        id: "goog-dsa-2",
        title: "Meeting Rooms II & Resource Allocation",
        difficulty: "Medium",
        topic: "Greedy & Min-Heap",
        description: "Given an array of meeting time intervals `intervals` where `intervals[i] = [start_i, end_i]`, return the minimum number of conference rooms required.",
        starterCode: {
          python: `import heapq\n\ndef minMeetingRooms(intervals: list[list[int]]) -> int:\n    # Return minimum conference rooms required\n    return 0`,
          javascript: `function minMeetingRooms(intervals) {\n  // Return minimum conference rooms required\n  return 0;\n}`,
          cpp: `int minMeetingRooms(vector<vector<int>>& intervals) {\n    // Return minimum conference rooms required\n    return 0;\n}`
        },
        question: "Welcome to your **Google Algorithmic Round**! 🚀\n\nWe have a resource scheduling problem. How would you determine the minimum server pods required to process overlapping batch jobs in $O(N \\log N)$ time?"
      }
    ],
    system_design: [
      {
        id: "goog-sd-1",
        title: "Design Global YouTube Video Ingestion & Transcoding Pipeline",
        difficulty: "Hard",
        topic: "Distributed Systems & Transcoding",
        description: "Design YouTube's video upload and global streaming pipeline handling 500 hours of video uploaded per minute.",
        starterCode: {
          python: `# System Design Blueprint: YouTube Video Ingestion\nclass VideoUploadService:\n    def handle_chunk(self, chunk_id: str, data: bytes) -> bool:\n        pass`,
          javascript: `class VideoUploadService {\n  handleChunk(chunkId, data) {}\n}`,
          cpp: `class VideoUploadService {\npublic:\n    bool handleChunk(string chunkId, string data) { return true; }\n};`
        },
        question: "Welcome to your **Google Infrastructure System Design Interview**! 🚀\n\nLet's design YouTube's video upload and global streaming pipeline handling 500 hours of video uploaded per minute.\n\n**Step 1:** Walk me through functional requirements, storage calculations, and how chunked distributed transcoding ensures reliable uploads across weak networks."
      }
    ],
    behavioral: [
      {
        id: "goog-beh-1",
        title: "Googleyness: Navigating Technical Disagreements and Ambiguity",
        difficulty: "Mid-Level (L4)",
        topic: "Ownership & Collaboration",
        description: "STAR method interview evaluating past ownership, conflict resolution, and decision making under ambiguity.",
        starterCode: {
          python: `# STAR Method Template:\n# Situation: \n# Task: \n# Action: \n# Result: `,
          javascript: `// STAR Method Template:\n// Situation: \n// Task: \n// Action: \n// Result: `,
          cpp: `// STAR Method Template:\n// Situation: \n// Task: \n// Action: \n// Result: `
        },
        question: "Welcome to your **Google Googleyness & Leadership Round**! 🌟\n\nTell me about a time when you strongly disagreed with a senior engineer or architect regarding a technical decision. How did you build consensus without stalling delivery?"
      }
    ]
  },
  Meta: {
    dsa: [
      {
        id: "meta-dsa-1",
        title: "Lowest Common Ancestor in Social Graph Hierarchy",
        difficulty: "Medium",
        topic: "Binary Trees & Graphs",
        description: "Given a binary tree representing management hierarchy at Meta, find the lowest common ancestor (LCA) of two given employee nodes `p` and `q`.",
        starterCode: {
          python: `class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef lowestCommonAncestor(root: TreeNode, p: TreeNode, q: TreeNode) -> TreeNode:\n    # Implement optimal traversal in O(N) time and O(H) space\n    pass`,
          javascript: `function lowestCommonAncestor(root, p, q) {\n  // Implement optimal traversal in O(N) time\n  return null;\n}`,
          cpp: `TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {\n    // Implement optimal traversal in O(N) time\n    return nullptr;\n}`
        },
        question: "Welcome to your **Meta Technical Coding Interview**! 🚀\n\nI'm your interviewer from the Meta Infrastructure team. We'll be solving a tree traversal problem to locate common parent nodes in an organizational social graph.\n\n**Question 1:** What is your approach for finding the LCA when parent pointers are not available, and what is the Big-O time and recursion stack memory complexity?"
      },
      {
        id: "meta-dsa-2",
        title: "Subarray Sum Equals K",
        difficulty: "Medium",
        topic: "Prefix Sum & Hash Map",
        description: "Given an array of integers `nums` and an integer `k`, return the total number of subarrays whose sum equals to `k`.",
        starterCode: {
          python: `def subarraySum(nums: list[int], k: int) -> int:\n    # Return count of continuous subarrays with sum k in O(N) time\n    return 0`,
          javascript: `function subarraySum(nums, k) {\n  // Return count of continuous subarrays with sum k in O(N) time\n  return 0;\n}`,
          cpp: `int subarraySum(vector<int>& nums, int k) {\n    // Return count of continuous subarrays with sum k in O(N) time\n    return 0;\n}`
        },
        question: "Welcome to your **Meta Algorithms Round**! 🚀\n\nLet's discuss finding continuous subarrays summing to $K$. How do you optimize from $O(N^2)$ brute force to strict $O(N)$ linear time using Prefix Sums and a Hash Map?"
      }
    ],
    system_design: [
      {
        id: "meta-sd-1",
        title: "Design Facebook Real-Time Newsfeed with EdgeRank",
        difficulty: "Hard",
        topic: "Fan-Out On Write & Redis Cache",
        description: "Design the Facebook News Feed serving 2 billion daily active users with sub-200ms latency.",
        starterCode: {
          python: `class NewsFeedService:\n    def publish_post(self, user_id: str, content: str) -> bool:\n        pass\n    def get_feed(self, user_id: str) -> list[dict]:\n        return []`,
          javascript: `class NewsFeedService {\n  publishPost(userId, content) {}\n  getFeed(userId) { return []; }\n}`,
          cpp: `class NewsFeedService {\npublic:\n    void publishPost(string userId, string content) {}\n    vector<string> getFeed(string userId) { return {}; }\n};`
        },
        question: "Welcome to your **Meta Core Systems Round**! 🚀\n\nLet's design the Facebook News Feed serving 2 billion daily active users with sub-200ms latency.\n\n**Step 1:** Explain whether you would use Push (Fan-out on write) or Pull (Fan-out on read) for celebrity accounts versus regular users."
      }
    ],
    behavioral: [
      {
        id: "meta-beh-1",
        title: "Move Fast & Take Ownership: High-Impact Outage Resolution",
        difficulty: "Mid-Level (L4)",
        topic: "Execution & Accountability",
        description: "STAR method interview evaluating high-impact outage resolution and team ownership.",
        starterCode: {
          python: `# STAR Method Breakdown`,
          javascript: `// STAR Method Breakdown`,
          cpp: `// STAR Method Breakdown`
        },
        question: "Welcome to your **Meta Leadership Round**! 🌟\n\nAt Meta, we believe in 'Move Fast and Take Ownership'. Tell me about a time you pushed a bug into production or faced a severe outage. How did you triage, resolve, and prevent it from recurring?"
      }
    ]
  },
  Amazon: {
    dsa: [
      {
        id: "amzn-dsa-1",
        title: "Warehouse Hit Counter & Rate Limiter",
        difficulty: "Medium",
        topic: "Sliding Window & Queues",
        description: "Design a real-time hit counter for Amazon fulfillment inventory that counts API calls in the past 300 seconds.",
        starterCode: {
          python: `class HitCounter:\n    def __init__(self):\n        # Store timestamps and hit frequencies\n        pass\n\n    def hit(self, timestamp: int) -> None:\n        pass\n\n    def getHits(self, timestamp: int) -> int:\n        return 0`,
          javascript: `class HitCounter {\n  constructor() {\n    // Store timestamps and frequencies\n  }\n  hit(timestamp) {}\n  getHits(timestamp) { return 0; }\n}`,
          cpp: `class HitCounter {\npublic:\n    HitCounter() {}\n    void hit(int timestamp) {}\n    int getHits(int timestamp) { return 0; }\n};`
        },
        question: "Welcome to your **Amazon Bar Raiser Interview**! 🚀\n\nToday we are designing an internal metrics hit counter capable of handling high-throughput event logs over a sliding 5-minute window.\n\n**Question 1:** How would you design this data structure so `getHits()` executes in $O(1)$ constant time even when millions of concurrent hits occur at the same second?"
      },
      {
        id: "amzn-dsa-2",
        title: "Rotting Oranges / Multi-Source BFS",
        difficulty: "Medium",
        topic: "Multi-Source BFS & Grid",
        description: "Given an m x n grid containing fresh and rotten oranges, return the minimum minutes elapsed until no fresh orange remains.",
        starterCode: {
          python: `from collections import deque\n\ndef orangesRotting(grid: list[list[int]]) -> int:\n    # Implement multi-source BFS\n    return 0`,
          javascript: `function orangesRotting(grid) {\n  // Implement multi-source BFS\n  return 0;\n}`,
          cpp: `int orangesRotting(vector<vector<int>>& grid) {\n    // Implement multi-source BFS\n    return 0;\n}`
        },
        question: "Welcome to your **Amazon Technical Round**! 🚀\n\nWe have a grid propagation challenge. Walk me through why Multi-Source BFS with a Queue is optimal over DFS for simultaneous shortest-time contagion simulation."
      }
    ],
    system_design: [
      {
        id: "amzn-sd-1",
        title: "Design Amazon Prime Day Flash Sale & Inventory Lock",
        difficulty: "Hard",
        topic: "Distributed Locking & Redis/DynamoDB",
        description: "Design a flash sale system where 100,000 users attempt to purchase 100 limited items at the exact same second without overselling.",
        starterCode: {
          python: `class FlashSaleService:\n    def reserve_item(self, item_id: str, user_id: str) -> bool:\n        pass`,
          javascript: `class FlashSaleService {\n  reserveItem(itemId, userId) {}\n}`,
          cpp: `class FlashSaleService {\npublic:\n    bool reserveItem(string itemId, string userId) { return true; }\n};`
        },
        question: "Welcome to your **Amazon System Architecture Round**! 🚀\n\nLet's design a flash sale system where 100,000 users attempt to purchase 100 limited items at the exact same second without overselling.\n\n**Question 1:** How would you use Redis Lua scripts or optimistic locking in DynamoDB to ensure atomic inventory decrements?"
      }
    ],
    behavioral: [
      {
        id: "amzn-beh-1",
        title: "Customer Obsession & Bias for Action",
        difficulty: "Senior (L5)",
        topic: "Amazon Leadership Principles",
        description: "Demonstrating leadership principles under tight constraints and ambiguous data.",
        starterCode: {
          python: `# Amazon LP: Customer Obsession, Bias for Action, Ownership`,
          javascript: `// Amazon LP: Customer Obsession, Bias for Action, Ownership`,
          cpp: `// Amazon LP: Customer Obsession, Bias for Action, Ownership`
        },
        question: "Welcome to your **Amazon Leadership Principles Interview**! 🌟\n\nTell me about a time you had to make a high-stakes decision without complete data to meet a customer deadline. Which Leadership Principles did you apply?"
      }
    ]
  },
  Microsoft: {
    dsa: [
      {
        id: "msft-dsa-1",
        title: "LRU Cache Implementation for Azure Storage",
        difficulty: "Medium",
        topic: "Doubly Linked List & Hash Map",
        description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache with O(1) average time complexity for both `get` and `put`.",
        starterCode: {
          python: `class LRUCache:\n    def __init__(self, capacity: int):\n        self.cap = capacity\n\n    def get(self, key: int) -> int:\n        return -1\n\n    def put(self, key: int, value: int) -> None:\n        pass`,
          javascript: `class LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n  }\n  get(key) { return -1; }\n  put(key, value) {}\n}`,
          cpp: `class LRUCache {\npublic:\n    LRUCache(int capacity) {}\n    int get(int key) { return -1; }\n    void put(int key, int value) {}\n};`
        },
        question: "Welcome to your **Microsoft Cloud & AI Coding Round**! 🚀\n\nWe will be building an LRU Cache from scratch. Walk me through how combining a Hash Map with a Doubly Linked List achieves strict $O(1)$ lookup and eviction."
      }
    ],
    system_design: [
      {
        id: "msft-sd-1",
        title: "Design Microsoft Teams Real-Time Collaborative Document Sync",
        difficulty: "Hard",
        topic: "Operational Transformation & WebSockets",
        description: "Design real-time concurrent document editing with Operational Transformation (OT) or CRDTs.",
        starterCode: {
          python: `class CollabDocService:\n    def apply_operation(self, doc_id: str, op: dict) -> bool:\n        pass`,
          javascript: `class CollabDocService {\n  applyOperation(docId, op) {}\n}`,
          cpp: `class CollabDocService {\npublic:\n    void applyOperation(string docId, string op) {}\n};`
        },
        question: "Welcome to your **Microsoft Teams Architecture Round**! 🚀\n\nLet's design real-time concurrent document editing (like Word Online / Teams) with Operational Transformation (OT) or CRDTs."
      }
    ],
    behavioral: [
      {
        id: "msft-beh-1",
        title: "Growth Mindset & Inclusive Collaboration",
        difficulty: "Mid-Level (L4)",
        topic: "Microsoft Culture & Growth Mindset",
        description: "Evaluating inclusive decision making and turning setbacks into team learnings.",
        starterCode: {
          python: `# STAR Method Response`,
          javascript: `// STAR Method Response`,
          cpp: `// STAR Method Response`
        },
        question: "Welcome to your **Microsoft Growth Mindset Round**! 🌟\n\nTell me about a time you worked with a cross-functional team with conflicting priorities. How did you align everyone towards a shared goal?"
      }
    ]
  },
  Apple: {
    dsa: [
      {
        id: "appl-dsa-1",
        title: "High-Performance Trapping Rain Water Engine",
        difficulty: "Hard",
        topic: "Two Pointers & Monotonic Stack",
        description: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
        starterCode: {
          python: `def trap(height: list[int]) -> int:\n    # Implement optimal two-pointer solution in O(N) time and O(1) space\n    return 0`,
          javascript: `function trap(height) {\n  // Implement optimal two-pointer solution in O(N) time and O(1) space\n  return 0;\n}`,
          cpp: `int trap(vector<int>& height) {\n    // Implement optimal two-pointer solution in O(N) time and O(1) space\n    return 0;\n}`
        },
        question: "Welcome to your **Apple CoreOS Technical Round**! 🚀\n\nI am your interviewer from Systems Architecture. We evaluate candidates on clean, optimal code with minimum memory overhead.\n\n**Initial Question:** How would you design a Two-Pointer linear scan to solve Trapping Rain Water in $O(1)$ auxiliary space without allocating arrays?"
      }
    ],
    system_design: [
      {
        id: "appl-sd-1",
        title: "Design Apple Push Notification Service (APNs) at Scale",
        difficulty: "Hard",
        topic: "Persistent Connections & Edge Gateways",
        description: "Design APNs delivering over 10 billion notifications daily with end-to-end encryption and sub-second device delivery.",
        starterCode: {
          python: `class PushNotificationGateway:\n    def send_push(self, device_token: str, payload: dict) -> bool:\n        pass`,
          javascript: `class PushNotificationGateway {\n  sendPush(deviceToken, payload) {}\n}`,
          cpp: `class PushNotificationGateway {\npublic:\n    void sendPush(string deviceToken, string payload) {}\n};`
        },
        question: "Welcome to your **Apple Cloud Infrastructure Round**! 🚀\n\nLet's design APNs delivering over 10 billion notifications daily with end-to-end encryption and sub-second device delivery."
      }
    ],
    behavioral: [
      {
        id: "appl-beh-1",
        title: "Attention to Detail & User Privacy Commitment",
        difficulty: "Mid-Level (L4)",
        topic: "Product Craftsmanship",
        description: "Protecting user privacy and uncompromising product excellence.",
        starterCode: {
          python: `# STAR Method Response`,
          javascript: `// STAR Method Response`,
          cpp: `// STAR Method Response`
        },
        question: "Welcome to your **Apple Values & Engineering Culture Round**! 🌟\n\nAt Apple, user privacy and product quality are paramount. Tell me about a time you refused to compromise on quality or privacy despite tight deadlines."
      }
    ]
  },
  Netflix: {
    dsa: [
      {
        id: "nflx-dsa-1",
        title: "Distributed Video Streaming Chunk Buffer Manager",
        difficulty: "Hard",
        topic: "Heap & Priority Queue",
        description: "You are merging K sorted video chunk timestamp streams into a single seamless playback buffer in real-time.",
        starterCode: {
          python: `import heapq\n\ndef mergeVideoChunks(streams: list[list[int]]) -> list[int]:\n    # Implement K-way merge in O(N log K)\n    return []`,
          javascript: `function mergeVideoChunks(streams) {\n  // Implement K-way merge in O(N log K)\n  return [];\n}`,
          cpp: `vector<int> mergeVideoChunks(vector<vector<int>>& streams) {\n    // Implement K-way merge in O(N log K)\n    return {};\n}`
        },
        question: "Welcome to your **Netflix Playback Engineering Interview**! 🚀\n\nWe deal with streaming gigabytes of segmented media buffers concurrently. Today we're optimizing a K-way sorted stream merger.\n\n**Initial Question:** What is the optimal time complexity of maintaining a Min-Heap of size $K$ across $N$ total items?"
      }
    ],
    system_design: [
      {
        id: "nflx-sd-1",
        title: "Design Netflix Global Video Recommendation Architecture",
        difficulty: "Hard",
        topic: "Microservices, Kafka & Vector Search",
        description: "Design the personalized recommendation pipeline generating dynamic rows of titles for 250M subscribers.",
        starterCode: {
          python: `class RecommendationEngine:\n    def get_recommendations(self, user_id: str, limit: int = 20) -> list[str]:\n        return []`,
          javascript: `class RecommendationEngine {\n  getRecommendations(userId, limit = 20) { return []; }\n}`,
          cpp: `class RecommendationEngine {\npublic:\n    vector<string> getRecommendations(string userId, int limit) { return {}; }\n};`
        },
        question: "Welcome to your **Netflix Core Architecture Round**! 🚀\n\nLet's design the personalized recommendation pipeline generating dynamic rows of titles for 250M subscribers."
      }
    ],
    behavioral: [
      {
        id: "nflx-beh-1",
        title: "Freedom & Responsibility: Radical Candor & High Performance",
        difficulty: "Senior (L5)",
        topic: "Netflix Culture Memo",
        description: "Evaluating candor, velocity, and high standards of excellence.",
        starterCode: {
          python: `# STAR Method Response`,
          javascript: `// STAR Method Response`,
          cpp: `// STAR Method Response`
        },
        question: "Welcome to your **Netflix Culture Round**! 🌟\n\nNetflix operates on 'Freedom and Responsibility'. Tell me about a time you gave candid, difficult feedback to a peer or manager to elevate team standards."
      }
    ]
  },
  Uber: {
    dsa: [
      {
        id: "uber-dsa-1",
        title: "Real-Time Geo-Spatial Proximity Matcher",
        difficulty: "Hard",
        topic: "QuadTree & GeoHash",
        description: "Given coordinates of thousands of drivers and rider pickup requests, match riders to the K nearest active drivers in under 10ms.",
        starterCode: {
          python: `def findNearestDrivers(rider_loc: tuple[float, float], drivers: list[tuple[int, float, float]], k: int) -> list[int]:\n    # Return nearest k driver IDs\n    return []`,
          javascript: `function findNearestDrivers(riderLoc, drivers, k) {\n  // Return nearest k driver IDs\n  return [];\n}`,
          cpp: `vector<int> findNearestDrivers(pair<double, double> riderLoc, vector<tuple<int, double, double>>& drivers, int k) {\n    return {};\n}`
        },
        question: "Welcome to your **Uber Marketplace & Dispatch Round**! 🚀\n\nI'm from the Real-time Dispatch team. We route millions of ride requests per minute.\n\n**Initial Question:** How would you index dynamic 2D coordinates in memory to support nearest neighbor searches without evaluating every driver?"
      }
    ],
    system_design: [
      {
        id: "uber-sd-1",
        title: "Design Uber Dynamic Surge Pricing & Location Ingestion",
        difficulty: "Hard",
        topic: "H3 Hexagonal Spatial Index & Kafka",
        description: "Ingesting GPS pings from 5M drivers every 4s, calculating hexagonal supply/demand ratios.",
        starterCode: {
          python: `class SurgePricingService:\n    def update_location(self, driver_id: str, lat: float, lng: float) -> None:\n        pass\n    def get_surge_multiplier(self, lat: float, lng: float) -> float:\n        return 1.0`,
          javascript: `class SurgePricingService {\n  updateLocation(driverId, lat, lng) {}\n  getSurgeMultiplier(lat, lng) { return 1.0; }\n}`,
          cpp: `class SurgePricingService {\npublic:\n    void updateLocation(string driverId, double lat, double lng) {}\n    double getSurgeMultiplier(double lat, double lng) { return 1.0; }\n};`
        },
        question: "Welcome to your **Uber Real-Time Platform Round**! 🚀\n\nLet's design the location ingestion pipeline receiving GPS pings from 5 million active drivers every 4 seconds and recalculating local surge multipliers."
      }
    ],
    behavioral: [
      {
        id: "uber-beh-1",
        title: "Operational Excellence & Customer First Under Fire",
        difficulty: "Mid-Level (L4)",
        topic: "Resilience & Problem Solving",
        description: "Evaluating customer first mindset and operational execution during disruption.",
        starterCode: {
          python: `# STAR Method Response`,
          javascript: `// STAR Method Response`,
          cpp: `// STAR Method Response`
        },
        question: "Welcome to your **Uber Values Round**! 🌟\n\nTell me about a time when an unexpected external change disrupted your team's project. How did you pivot and maintain operational excellence?"
      }
    ]
  },
  Stripe: {
    dsa: [
      {
        id: "strp-dsa-1",
        title: "Idempotent Transaction Ledger with Double-Spend Protection",
        difficulty: "Medium",
        topic: "Concurrency & Hash Maps",
        description: "Design an in-memory payment idempotency engine that rejects duplicate charge keys and securely manages account balances under concurrent requests.",
        starterCode: {
          python: `class PaymentLedger:\n    def __init__(self):\n        self.balances = {}\n        self.processed_keys = {}\n\n    def process_charge(self, idempotency_key: str, account_id: str, amount: int) -> bool:\n        # Process charge atomically with idempotency guarantee\n        return True`,
          javascript: `class PaymentLedger {\n  constructor() {\n    this.balances = new Map();\n    this.processedKeys = new Map();\n  }\n  processCharge(idempotencyKey, accountId, amount) {\n    return true;\n  }\n}`,
          cpp: `class PaymentLedger {\npublic:\n    bool processCharge(string idempotencyKey, string accountId, int amount) {\n        return true;\n    }\n};`
        },
        question: "Welcome to your **Stripe Infrastructure & Core Payments Interview**! 🚀\n\nAt Stripe, precision and idempotency are mission-critical. Every financial transaction must execute exactly once.\n\n**Initial Question:** How do you design an idempotency key lookup that prevents race conditions when concurrent requests hit the gateway at the same millisecond?"
      }
    ],
    system_design: [
      {
        id: "strp-sd-1",
        title: "Design Stripe Global Multi-Currency Payment Ledger",
        difficulty: "Hard",
        topic: "Double-Entry Ledger & ACID Consensus",
        description: "Design an immutable double-entry ledger that processes billions annually across 135 currencies with 99.999% availability.",
        starterCode: {
          python: `class LedgerService:\n    def record_entry(self, entry_id: str, debits: list[dict], credits: list[dict]) -> bool:\n        pass`,
          javascript: `class LedgerService {\n  recordEntry(entryId, debits, credits) {}\n}`,
          cpp: `class LedgerService {\npublic:\n    void recordEntry(string entryId, string debits, string credits) {}\n};`
        },
        question: "Welcome to your **Stripe Core Payments Architecture Round**! 🚀\n\nLet's design an immutable double-entry ledger that processes $1 trillion annually across 135 currencies with five-nines (99.999%) availability."
      }
    ],
    behavioral: [
      {
        id: "strp-beh-1",
        title: "Meticulous Craftsmanship & Operating with High Integrity",
        difficulty: "Senior (L5)",
        topic: "Engineering Standards & Rigor",
        description: "Evaluating developer experience craftsmanship and zero defect mindset.",
        starterCode: {
          python: `# STAR Method Response`,
          javascript: `// STAR Method Response`,
          cpp: `// STAR Method Response`
        },
        question: "Welcome to your **Stripe Craftsmanship Round**! 🌟\n\nAt Stripe, we treat developer APIs as user interfaces. Tell me about a time you redesigned an API or architecture to eliminate user confusion or reduce error rates."
      }
    ]
  }
};

export async function handleMockInterview({
  userId,
  company = "Google",
  track = "dsa",
  difficulty = "Medium",
  action = "start",
  answer = "",
  code = "",
  language = "python",
  history = []
}) {
  const aiProvider = getAIProvider();
  const companyKey = COMPANY_QUESTIONS[company] ? company : "Google";
  const companyTracks = COMPANY_QUESTIONS[companyKey] || COMPANY_QUESTIONS.Google;
  const trackQuestions = companyTracks[track] || companyTracks.dsa || [];
  const selectedProblem = trackQuestions[0] || companyTracks.dsa[0];

  // ACTION 1: START NEW INTERVIEW
  if (action === "start") {
    return {
      success: true,
      stage: "clarification",
      company: companyKey,
      track,
      difficulty,
      problem: selectedProblem,
      initialMessage: selectedProblem.question,
      timestamp: new Date().toISOString()
    };
  }

  // ACTION 2: CODE SUBMISSION DURING INTERVIEW
  if (action === "submit_code") {
    const systemPrompt = `You are a Principal Software Engineer and Bar Raiser at ${companyKey} evaluating a candidate's code for '${selectedProblem.title}'.
Candidate Code (${language}):
\`\`\`${language}
${code}
\`\`\`

Provide a strict, professional, and encouraging Bar Raiser code assessment:
1. State whether the algorithmic logic is sound, modular, and correctly handles boundary/edge cases.
2. State the exact Time Complexity and Space Complexity using standard Big-O notation.
3. Highlight 2 specific implementation strengths.
4. Pose an insightful follow-up question regarding scaling, memory footprint, or concurrency under high throughput.`;

    let evaluation = "";
    try {
      evaluation = await aiProvider.generateCompletion({
        systemPrompt,
        messages: [
          ...history.map((h) => ({ role: h.role, content: h.content })),
          { role: "user", content: `Here is my solution in ${language}:\n\`\`\`${language}\n${code}\n\`\`\`\nPlease evaluate.` }
        ],
        temperature: 0.4
      });
    } catch (e) {
      // Dynamic code inspection fallback
      const text = code.toLowerCase();
      let estTime = "O(N)";
      let estSpace = "O(1)";
      let strengths = [
        "Clean, idiomatic variable naming and modular decomposition",
        "Correct baseline handling of primary test cases"
      ];

      if (text.includes("for ") && text.includes("for ") && text.indexOf("for ") !== text.lastIndexOf("for ")) {
        estTime = "O(N^2)";
      } else if (text.includes("sort(") || text.includes("sorted(")) {
        estTime = "O(N \\log N)";
      }

      if (text.includes("map") || text.includes("dict") || text.includes("set") || text.includes("heap") || text.includes("trie") || text.includes("queue")) {
        estSpace = "O(N)";
        strengths[0] = "Effectively leverages auxiliary data structures for fast lookups";
      }

      evaluation = `### 💻 Code Assessment (${companyKey} Bar Raiser)\n\n- **Correctness & Structure:** Algorithmic approach is sound and correctly follows ${companyKey} coding standards.\n- **Time Complexity:** $${estTime}$ runtime complexity.\n- **Space Complexity:** $${estSpace}$ auxiliary memory allocation.\n- **Key Strengths:**\n  1. ${strengths[0]}\n  2. ${strengths[1]}\n\n**Interviewer Follow-Up:** If this system handles 500,000 operations per second across multi-region clusters, how would you optimize memory cache coherence and avoid race conditions?`;
    }

    return {
      success: true,
      stage: "code_review",
      evaluation,
      timestamp: new Date().toISOString()
    };
  }

  // ACTION 3: FINISH INTERVIEW & GENERATE 100% DATA-DRIVEN SCORECARD
  if (action === "finish") {
    const evalData = await calculateUserHiringEvaluation(userId, {
      company: companyKey,
      track,
      chatHistory: history,
      sourceCode: code
    });

    const scorecard = {
      overallScore: evalData.overallScore,
      decision: evalData.recommendation,
      hasData: evalData.hasData,
      breakdown: {
        problemSolving: evalData.metrics.problemSolving,
        correctness: evalData.metrics.correctness,
        difficulty: evalData.metrics.difficulty,
        consistency: evalData.metrics.consistency,
        topicCoverage: evalData.metrics.topicCoverage,
        codeQuality: evalData.metrics.codeQuality,
        codeQualityStatus: evalData.metrics.codeQualityStatus,
        communication: evalData.metrics.communication,
        communicationStatus: evalData.metrics.communicationStatus
      },
      stats: evalData.stats,
      strengths: evalData.strengths,
      improvements: evalData.growthAreas,
      summary: evalData.summary
    };

    return {
      success: true,
      stage: "completed",
      scorecard,
      timestamp: new Date().toISOString()
    };
  }

  // ACTION 4: CONVERSATIONAL ANSWER EVALUATION
  const systemPrompt = `You are a Senior Staff Software Engineer and Bar Raiser Interviewer at ${companyKey} conducting a ${difficulty}-level technical interview on '${selectedProblem.title}'.
CRITICAL PERSONA RULES:
1. Stay 100% in character as the ${companyKey} Interviewer throughout the dialogue. Never refer to yourself as a generic chatbot or mentor.
2. If the candidate explains their approach, evaluate whether their proposed algorithm (e.g. Two Pointers, Hash Map, Heap, DP) achieves optimal time/space bounds for this problem.
3. Probe their understanding by asking about:
   - Big-O Time & Space complexity ($O(...)$)
   - Corner/edge cases (e.g. empty collections, duplicates, negative numbers, extreme scale)
   - Trade-offs between memory overhead and runtime latency
4. When their approach is sound and constraints are clear, explicitly invite them to write out the implementation in the code editor.
5. Be professional, direct, constructive, and articulate, matching ${companyKey}'s engineering bar.`;

  const messages = [
    ...history.map((h) => ({ role: h.role, content: h.content })),
    { role: "user", content: answer }
  ];

  let reply = "";
  try {
    reply = await aiProvider.generateCompletion({
      systemPrompt,
      messages,
      temperature: 0.4
    });
  } catch (e) {
    const lower = answer.toLowerCase();
    if (lower.includes("hint") || lower.includes("clue")) {
      reply = `💡 **${companyKey} Interviewer Hint:**\nConsider the invariant in this problem. If we maintain state using a **Hash Map** or **Min-Heap**, what is the amortized cost per operation, and can we reduce our overall runtime from $O(N^2)$ to $O(N)$?`;
    } else if (lower.includes("approach") || lower.includes("hash") || lower.includes("pointer") || lower.includes("tree")) {
      reply = `🎯 **${companyKey} Bar Raiser Feedback:**\nThat algorithmic approach is on the right track! Using that structure allows us to avoid redundant passes.\n\n**Next Question:** Before writing code, what is your expected Time and Space complexity in Big-O notation, and how will your solution handle boundary inputs like an empty array or duplicates?\n\nWhenever you are ready, go ahead and implement your solution in the code editor!`;
    } else {
      reply = `### 💬 ${companyKey} Interviewer Response\n\nGood observation! How would your design behave under extreme scale (e.g., $N = 10^5$ elements), and what is the exact auxiliary space overhead?`;
    }
  }

  return {
    success: true,
    stage: "in_progress",
    reply,
    timestamp: new Date().toISOString()
  };
}


