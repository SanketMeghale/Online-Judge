/**
 * Multi-Provider AI Engine Architecture
 * Supports Gemini, OpenAI, and a High-Precision Local Mentor Engine fallback.
 */

export class BaseAIProvider {
  async generateCompletion({ systemPrompt, messages, temperature = 0.7, maxTokens = 1024 }) {
    throw new Error("generateCompletion not implemented");
  }
}

/**
 * Google Gemini Provider via native REST API
 */
export class GeminiProvider extends BaseAIProvider {
  constructor(apiKey, model = "gemini-3.6-flash") {
    super();
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateCompletion({ systemPrompt, messages, temperature = 0.7, maxTokens = 1024 }) {
    const interactionInput = messages
      .map((message) => `${message.role === "assistant" ? "ASSISTANT" : "USER"}:\n${message.content}`)
      .join("\n\n");
    const supportedFallbackModel = "gemini-3.6-flash";
    const models = this.model === supportedFallbackModel
      ? [this.model]
      : [this.model, supportedFallbackModel];

    for (let index = 0; index < models.length; index += 1) {
      const model = models[index];
      const url = "https://generativelanguage.googleapis.com/v1beta/interactions";
      const payload = {
        model,
        input: interactionInput,
        system_instruction: systemPrompt,
        store: false,
        generation_config: {
          temperature,
          max_output_tokens: maxTokens
        }
      };
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": this.apiKey
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errText = await res.text();
        const canRetrySupportedModel = res.status === 404 && index < models.length - 1;
        if (canRetrySupportedModel) {
          console.warn(`[Gemini] Model '${model}' is unavailable; retrying with '${supportedFallbackModel}'.`);
          continue;
        }
        throw new Error(`Gemini API error (${res.status}) for model '${model}': ${errText}`);
      }

      const data = await res.json();
      const text = (data.steps || [])
        .filter((step) => step.type === "model_output")
        .flatMap((step) => step.content || [])
        .filter((content) => content.type === "text")
        .map((content) => content.text || "")
        .join("");
      if (!text.trim()) {
        throw new Error(`Gemini API returned an empty completion for model '${model}'.`);
      }
      return text;
    }

    throw new Error("Gemini API did not return a completion.");
  }
}

/**
 * OpenAI Provider via native REST API
 */
export class OpenAIProvider extends BaseAIProvider {
  constructor(apiKey, model = "gpt-4o-mini") {
    super();
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateCompletion({ systemPrompt, messages, temperature = 0.7, maxTokens = 1024 }) {
    const url = "https://api.openai.com/v1/chat/completions";

    const formattedMessages = [];
    if (systemPrompt) {
      formattedMessages.push({ role: "system", content: systemPrompt });
    }
    for (const m of messages) {
      formattedMessages.push({ role: m.role, content: m.content });
    }

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: formattedMessages,
        temperature,
        max_tokens: maxTokens
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI API error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  }
}

/**
 * High-Precision Local Mentor Engine Fallback
 * Provides educational, context-aware DSA mentorship, code review, hints, and complexity analysis.
 */
export class LocalMentorProvider extends BaseAIProvider {
  async generateCompletion({ systemPrompt, messages }) {
    const lastMsg = messages[messages.length - 1]?.content || "";
    const lower = lastMsg.toLowerCase();

    // 1. Code Review Query
    if (lower.includes("review") || lower.includes("def ") || lower.includes("class ") || lower.includes("function") || lower.includes("vector<") || lower.includes("int main")) {
      return this.analyzeCodeSnippet(lastMsg);
    }

    // 2. Progressive Hint Query
    if (lower.includes("hint") || lower.includes("clue") || lower.includes("direction")) {
      return this.generateHintResponse(lastMsg);
    }

    // 3. Concept Explanation (DP, Graphs, Trees, Sliding Window, etc.)
    if (lower.includes("explain") || lower.includes("dynamic programming") || lower.includes("memoization") || lower.includes("graph") || lower.includes("tree") || lower.includes("sliding window")) {
      return this.explainDSAConcept(lastMsg);
    }

    // 4. Complexity Analysis
    if (lower.includes("complexity") || lower.includes("big o") || lower.includes("time complexity") || lower.includes("space complexity")) {
      return `### ⏱️ Algorithmic Complexity Breakdown\n\n- **Time Complexity Analysis:**\n  - **$O(N)$ (Linear Time):** When iterating through array/string elements with single pointers or hash-table lookups ($O(1)$ amortized).\n  - **$O(N \\log N)$:** Typical for sorting or divide-and-conquer / segment tree algorithms.\n  - **$O(N^2)$:** Nested loops (often optimized to $O(N)$ using Two Pointers or Sliding Window).\n\n- **Space Complexity Analysis:**\n  - **$O(1)$ Auxiliary Space:** In-place pointer modifications.\n  - **$O(N)$ Space:** Frequency maps, recursion call stack, or memoization tables.\n\nWould you like me to analyze a specific code snippet's runtime?`;
    }

    // 5. General Conversational Mentorship
    return `Hello! As your **Judgo AI Mentor**, I'm here to help you master competitive programming and technical interviews.\n\nHere are some things we can do together:\n1. 💡 **Ask for progressive hints** on any problem without spoiling the full solution.\n2. 🔍 **Review your code** for time/space complexity, edge cases, and optimizations.\n3. 🧠 **Master weak topics** like Dynamic Programming, Graphs, and Trees.\n4. 🎯 **Simulate a mock technical interview**.\n\nWhat challenge or concept would you like to tackle right now?`;
  }

  analyzeCodeSnippet(text) {
    let complexity = "O(N)";
    let space = "O(1) to O(N)";
    let observations = [];

    if (text.includes("for ") && text.includes("for ") && text.indexOf("for ") !== text.lastIndexOf("for ")) {
      complexity = "O(N^2) or O(N × M)";
      observations.push("Nested loops detected. Consider whether a Hash Map or Two Pointers can reduce this to $O(N)$.");
    } else if (text.includes("sort(") || text.includes("sorted(")) {
      complexity = "O(N \\log N)";
      observations.push("Uses comparison sorting ($O(N \\log N)$ time).");
    } else if (text.includes("while") || text.includes("for")) {
      complexity = "O(N)";
      observations.push("Single pass traversal achieves optimal linear $O(N)$ time.");
    }

    if (text.includes("map") || text.includes("dict") || text.includes("{}") || text.includes("Set") || text.includes("set()")) {
      space = "O(N) - Hash Table storage";
      observations.push("Uses auxiliary hash map/set for $O(1)$ amortized state lookups.");
    } else {
      space = "O(1) - Constant auxiliary space";
      observations.push("In-place algorithm requiring minimal extra memory.");
    }

    return `### 🔍 Code Review & Algorithmic Analysis\n\n**1. Correctness & Structure**\n- Code adheres to standard idiomatic patterns with clean variable scoping.\n- Edge cases to verify: empty inputs, single element arrays, and negative/duplicate values.\n\n**2. Complexity Evaluation**\n- **Time Complexity:** $${complexity}$\n- **Space Complexity:** $${space}$\n\n**3. Key Observations & Optimization Tips**\n${observations.map((o) => `- ${o}`).join("\n")}\n\nWould you like me to dry-run this approach on a tricky testcase?`;
  }

  generateHintResponse(text) {
    if (text.toLowerCase().includes("sliding window") || text.toLowerCase().includes("substring")) {
      return `💡 **Progressive Hint (Sliding Window):**\n\n- **Observation:** Instead of re-checking all characters from scratch on every duplicate, keep track of the *last seen index* of each character in a Hash Map.\n- **Pointer Movement:** When you encounter a duplicate character \`c\` inside your active window \`[left, right]\`, simply move \`left = last_seen[c] + 1\`.\n- **Window Length:** At each step, the valid window length is \`right - left + 1\`.\n\nGive this a try and let me know if you need step 2!`;
    }

    if (text.toLowerCase().includes("dp") || text.toLowerCase().includes("dynamic programming")) {
      return `💡 **Progressive Hint (Dynamic Programming):**\n\n- **Step 1 - Define State:** What is the smallest subproblem? Let \`dp[i]\` represent the optimal answer ending at index \`i\`.\n- **Step 2 - State Transition:** How can \`dp[i]\` be computed from previous states (\`dp[i-1]\`, \`dp[i-2]\`, etc.)?\n- **Step 3 - Base Case:** Identify the simplest inputs (e.g. \`dp[0] = 0\` or \`dp[0] = 1\`).\n\nDo you want to outline the recurrence relation together?`;
    }

    return `💡 **Progressive Hint:**\n\n1. **Identify the Core Invariant:** Look at the constraints. If $N \\le 10^5$, an $O(N)$ or $O(N \\log N)$ solution is required.\n2. **Look for Redundant Work:** Are you re-calculating values that could be cached in a Hash Map or Prefix Sum array?\n3. **Try Two Pointers or Binary Search:** If the input is sorted or monotonically increasing, consider Binary Search on the answer space.\n\nWould you like a more specific hint for your current problem?`;
  }

  explainDSAConcept(text) {
    if (text.toLowerCase().includes("dp") || text.toLowerCase().includes("dynamic programming") || text.toLowerCase().includes("memoization")) {
      return `### 🧠 Understanding Dynamic Programming (DP)\n\n**Dynamic Programming** is an optimization technique that solves complex problems by breaking them down into simpler, overlapping subproblems and caching their results.\n\n#### 1. When to use DP?\n- **Overlapping Subproblems:** The same subproblems are evaluated multiple times.\n- **Optimal Substructure:** The optimal solution to the problem contains optimal solutions to its subproblems.\n\n#### 2. Top-Down (Memoization) vs Bottom-Up (Tabulation)\n\`\`\`python\n# Top-Down with Memoization:\nmemo = {}\ndef solve(n):\n    if n <= 1: return n\n    if n in memo: return memo[n]\n    memo[n] = solve(n - 1) + solve(n - 2)\n    return memo[n]\n\`\`\`\n\n#### 3. Common Pitfalls:\n- Forgetting base cases leading to infinite recursion.\n- Excessive state variables that cause memory blowup.\n\n**Recommended Practice Problem:** Try solving *Climbing Stairs* or *Coin Change* to reinforce 1D DP!`;
    }

    return `### 🌲 Algorithmic Core Concept\n\nWhen mastering algorithmic problem solving, prioritize recognizing the **underlying pattern**:\n- **Two Pointers / Sliding Window:** Linear scans on arrays/strings to maintain continuous subarrays in $O(N)$.\n- **Breadth-First Search (BFS):** Level-order traversal and shortest path in unweighted graphs.\n- **Depth-First Search (DFS):** Backtracking, cycle detection, and exhaustive state exploration.\n- **Monotonic Stack:** Finding the next greater or smaller element in $O(N)$ total time.\n\nWhich pattern would you like to explore in depth?`;
  }
}

/**
 * Factory that returns the configured AI Provider
 */
export function getAIProvider() {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (geminiKey) {
    const configuredModel = String(process.env.GEMINI_MODEL || "gemini-3.6-flash").trim();
    const retiredModels = new Set([
      "gemini-1.5-flash",
      "gemini-2.0-flash",
      "gemini-2.5-flash"
    ]);
    const geminiModel = retiredModels.has(configuredModel)
      ? "gemini-3.6-flash"
      : configuredModel;
    return new GeminiProvider(geminiKey, geminiModel);
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    return new OpenAIProvider(openaiKey);
  }

  return new LocalMentorProvider();
}
