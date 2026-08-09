export const seedCompanies = [
  {
    id: "google",
    name: "Google",
    slug: "google",
    category: "FAANG",
    difficulty: "Hard",
    tier: "Tier 1 FAANG",
    description: "Focuses heavily on algorithmic complexity, graph traversals, dynamic programming invariants, and tree manipulation with zero tolerance for suboptimal $O(N^2)$ approaches.",
    frequentTopics: ["Dynamic Programming", "Graphs", "Trees", "Binary Search", "Sliding Window", "Arrays"],
    problems: [
      { problemId: "two-sum", frequency: 5, interviewTags: ["Phone Screen", "Warmup"], year: "2025-2026", source: "Online Assessment" },
      { problemId: "merge-islands", frequency: 5, interviewTags: ["Onsite Round 2", "Graph BFS"], year: "2025-2026", source: "Onsite Technical Round" },
      { problemId: "binary-lift", frequency: 4, interviewTags: ["Onsite Round 1", "Binary Lifting"], year: "2025-2026", source: "L5 Bar Raiser" },
      { problemId: "climbing-stairs", frequency: 4, interviewTags: ["Screening", "DP State"], year: "2024-2025", source: "Technical Phone Screen" },
      { problemId: "best-time-to-buy-and-sell-stock", frequency: 5, interviewTags: ["Array Greedy", "Trading"], year: "2025-2026", source: "Onsite Coding" },
      { problemId: "valid-parentheses", frequency: 4, interviewTags: ["Stack Invariant", "Parsing"], year: "2025-2026", source: "Phone Screen" }
    ]
  },
  {
    id: "meta",
    name: "Meta",
    slug: "meta",
    category: "FAANG",
    difficulty: "Hard",
    tier: "Tier 1 FAANG",
    description: "High-speed coding rounds with strict 2-problem per 45-minute format. Focuses heavily on Binary Trees, Hash Maps, Prefix Sums, and Multi-Source BFS.",
    frequentTopics: ["Trees", "Arrays", "Hashing", "Strings", "Graphs", "Two Pointers"],
    problems: [
      { problemId: "two-sum", frequency: 5, interviewTags: ["Speed Round", "Hash Map"], year: "2025-2026", source: "Screening" },
      { problemId: "valid-parentheses", frequency: 5, interviewTags: ["Stack", "Grammar"], year: "2025-2026", source: "E4/E5 Round" },
      { problemId: "reverse-string", frequency: 4, interviewTags: ["Two Pointers", "In-Place"], year: "2024-2025", source: "Screening" },
      { problemId: "merge-islands", frequency: 5, interviewTags: ["Social Graph", "Connected Components"], year: "2025-2026", source: "Onsite Coding 1" },
      { problemId: "cache-stampede", frequency: 4, interviewTags: ["Feed Cache", "Concurrency"], year: "2025-2026", source: "Systems Coding" }
    ]
  },
  {
    id: "amazon",
    name: "Amazon",
    slug: "amazon",
    category: "FAANG",
    difficulty: "Medium-Hard",
    tier: "Tier 1 FAANG",
    description: "Evaluates Leadership Principles alongside Sliding Window, Min-Heaps, Multi-Source BFS, and Hash Maps with focus on customer-scale data structures.",
    frequentTopics: ["Arrays", "Strings", "Trees", "Hashing", "Graphs", "Heap"],
    problems: [
      { problemId: "two-sum", frequency: 5, interviewTags: ["Warehouse Inventory", "Hash Map"], year: "2025-2026", source: "OA2" },
      { problemId: "best-time-to-buy-and-sell-stock", frequency: 5, interviewTags: ["Price Prediction", "Greedy"], year: "2025-2026", source: "Onsite Round" },
      { problemId: "single-number", frequency: 4, interviewTags: ["Bitwise XOR", "ID Match"], year: "2024-2025", source: "SDE-1 Screening" },
      { problemId: "palindrome-number", frequency: 4, interviewTags: ["Math", "Reverse"], year: "2024-2025", source: "OA1" },
      { problemId: "valid-parentheses", frequency: 5, interviewTags: ["JSON Parsing", "Stack"], year: "2025-2026", source: "Bar Raiser" }
    ]
  },
  {
    id: "microsoft",
    name: "Microsoft",
    slug: "microsoft",
    category: "Product Based",
    difficulty: "Medium-Hard",
    tier: "Tier 1 Global",
    description: "Emphasizes clean modular code, Binary Search Trees, Matrix boundary traversals, and Doubly Linked Lists.",
    frequentTopics: ["Strings", "Trees", "Arrays", "Linked List", "Dynamic Programming"],
    problems: [
      { problemId: "two-sum", frequency: 5, interviewTags: ["Warmup", "Lookup"], year: "2025-2026", source: "Round 1" },
      { problemId: "binary-lift", frequency: 4, interviewTags: ["Azure Directory", "Tree Ancestors"], year: "2025-2026", source: "L63 Technical" },
      { problemId: "reverse-string", frequency: 4, interviewTags: ["String Manipulation", "Pointers"], year: "2024-2025", source: "Campus Round" },
      { problemId: "single-number", frequency: 4, interviewTags: ["Low-Level OS", "Bitwise"], year: "2025-2026", source: "Core OS Round" }
    ]
  },
  {
    id: "apple",
    name: "Apple",
    slug: "apple",
    category: "FAANG",
    difficulty: "Medium-Hard",
    tier: "Tier 1 FAANG",
    description: "Focuses on memory management, hardware-level trade-offs, pointer arithmetic, and rigorous boundary-condition correctness.",
    frequentTopics: ["Arrays", "Two Pointers", "Bit Manipulation", "Strings", "Trees"],
    problems: [
      { problemId: "best-time-to-buy-and-sell-stock", frequency: 5, interviewTags: ["Two Pointers", "State Tracking"], year: "2025-2026", source: "Onsite Round" },
      { problemId: "single-number", frequency: 5, interviewTags: ["Core OS", "Bitwise Engine"], year: "2025-2026", source: "Systems Round" },
      { problemId: "palindrome-number", frequency: 4, interviewTags: ["Numerical Safety", "Overflow"], year: "2024-2025", source: "Phone Screen" }
    ]
  },
  {
    id: "adobe",
    name: "Adobe",
    slug: "adobe",
    category: "Product Based",
    difficulty: "Medium-Hard",
    tier: "Tier 1 Global",
    description: "High prevalence of mathematical geometry, Dynamic Programming, String Parsing, and Complex Tree traversals.",
    frequentTopics: ["Dynamic Programming", "Strings", "Math", "Arrays", "Trees"],
    problems: [
      { problemId: "climbing-stairs", frequency: 5, interviewTags: ["DP Memoization", "Combinatorics"], year: "2025-2026", source: "Member of Tech Staff" },
      { problemId: "palindrome-number", frequency: 5, interviewTags: ["Math Parsing", "Logic"], year: "2025-2026", source: "OA Round" },
      { problemId: "valid-parentheses", frequency: 4, interviewTags: ["Syntax Tree", "Stack"], year: "2024-2025", source: "Round 2" }
    ]
  },
  {
    id: "uber",
    name: "Uber",
    slug: "uber",
    category: "Product Based",
    difficulty: "Hard",
    tier: "Tier 1 Unicorn",
    description: "Heavy emphasis on Graph algorithms (Dijkstra, Shortest Path), Distributed Caching, Sliding Windows, and GeoSpatial Proximity indexing.",
    frequentTopics: ["Graphs", "Hashing", "Heap", "Sliding Window", "Dynamic Programming"],
    problems: [
      { problemId: "cache-stampede", frequency: 5, interviewTags: ["Surge Pricing Cache", "Concurrency"], year: "2025-2026", source: "L5 System Coding" },
      { problemId: "merge-islands", frequency: 5, interviewTags: ["Driver Grid Index", "Connected Regions"], year: "2025-2026", source: "Onsite Round 1" },
      { problemId: "best-time-to-buy-and-sell-stock", frequency: 4, interviewTags: ["Dynamic Pricing", "Array"], year: "2024-2025", source: "Screening" }
    ]
  },
  {
    id: "atlassian",
    name: "Atlassian",
    slug: "atlassian",
    category: "Product Based",
    difficulty: "Medium-Hard",
    tier: "Tier 1 Global",
    description: "Known for clean object-oriented architecture, Rate Limiting data structures, Trie Autocomplete, and Tree traversals.",
    frequentTopics: ["Hashing", "Strings", "Trees", "Design", "Arrays"],
    problems: [
      { problemId: "cache-stampede", frequency: 5, interviewTags: ["Jira Cache", "Rate Limiter"], year: "2025-2026", source: "Onsite Architecture" },
      { problemId: "valid-parentheses", frequency: 5, interviewTags: ["Markdown Parsing", "Stack"], year: "2025-2026", source: "Core Coding" },
      { problemId: "two-sum", frequency: 4, interviewTags: ["Warmup", "Lookup Map"], year: "2024-2025", source: "Screening" }
    ]
  },
  {
    id: "goldman-sachs",
    name: "Goldman Sachs",
    slug: "goldman-sachs",
    category: "Product Based",
    difficulty: "Medium-Hard",
    tier: "Tier 1 FinTech",
    description: "High volume of mathematical number theory, Subarray sums, Dynamic Programming, and High-Frequency Ledger simulations.",
    frequentTopics: ["Math", "Dynamic Programming", "Arrays", "Hashing", "Strings"],
    problems: [
      { problemId: "best-time-to-buy-and-sell-stock", frequency: 5, interviewTags: ["Quantitative Trading", "Max Profit"], year: "2025-2026", source: "CoderPad Round" },
      { problemId: "palindrome-number", frequency: 4, interviewTags: ["Number Theory", "Math"], year: "2025-2026", source: "Round 1" },
      { problemId: "climbing-stairs", frequency: 4, interviewTags: ["Fibonacci Sequence", "DP"], year: "2024-2025", source: "Superday" }
    ]
  },
  {
    id: "jpmorgan",
    name: "JPMorgan Chase",
    slug: "jpmorgan",
    category: "Product Based",
    difficulty: "Medium",
    tier: "Tier 1 Banking",
    description: "Tests core Data Structures, SQL, String sanitization, and Banking Transaction validation.",
    frequentTopics: ["Arrays", "Strings", "Hashing", "Linked List", "Math"],
    problems: [
      { problemId: "two-sum", frequency: 5, interviewTags: ["Ledger Match", "Hash Map"], year: "2025-2026", source: "CodeVue Assessment" },
      { problemId: "valid-parentheses", frequency: 5, interviewTags: ["Transaction Validator", "Stack"], year: "2025-2026", source: "Superday" },
      { problemId: "palindrome-number", frequency: 4, interviewTags: ["Routing Number Check", "Math"], year: "2024-2025", source: "Technical Round" }
    ]
  },
  {
    id: "walmart",
    name: "Walmart Global Tech",
    slug: "walmart",
    category: "Product Based",
    difficulty: "Medium",
    tier: "Tier 1 Retail",
    description: "Focuses on Inventory Multi-source BFS, Cart management, Two Pointers, and String operations.",
    frequentTopics: ["Arrays", "Hashing", "Graphs", "Dynamic Programming", "Strings"],
    problems: [
      { problemId: "two-sum", frequency: 5, interviewTags: ["Cart Discount", "Hash Map"], year: "2025-2026", source: "HackerEarth OA" },
      { problemId: "best-time-to-buy-and-sell-stock", frequency: 5, interviewTags: ["Price Drop Alert", "Array"], year: "2025-2026", source: "Round 1" },
      { problemId: "climbing-stairs", frequency: 4, interviewTags: ["Optimal Pathway", "DP"], year: "2024-2025", source: "Technical Interview" }
    ]
  },
  {
    id: "flipkart",
    name: "Flipkart",
    slug: "flipkart",
    category: "Indian Product Companies",
    difficulty: "Medium-Hard",
    tier: "Indian Unicorn",
    description: "Famous for machine coding rounds, Big-O trade-offs, Graph logistics, and Dynamic Programming.",
    frequentTopics: ["Dynamic Programming", "Graphs", "Arrays", "Trees", "Hashing"],
    problems: [
      { problemId: "merge-islands", frequency: 5, interviewTags: ["Supply Hub Clusters", "Graphs"], year: "2025-2026", source: "Onsite Round" },
      { problemId: "climbing-stairs", frequency: 5, interviewTags: ["Flash Sale DP", "Combinatorics"], year: "2025-2026", source: "Problem Solving" },
      { problemId: "two-sum", frequency: 4, interviewTags: ["Coupon Match", "Hash Map"], year: "2024-2025", source: "Screening" }
    ]
  },
  {
    id: "razorpay",
    name: "Razorpay",
    slug: "razorpay",
    category: "Indian Product Companies",
    difficulty: "Medium-Hard",
    tier: "FinTech Unicorn",
    description: "Tests concurrency, idempotent ledger double-spend prevention, caching, and tree hierarchies.",
    frequentTopics: ["Hashing", "Arrays", "Trees", "Strings", "Design"],
    problems: [
      { problemId: "cache-stampede", frequency: 5, interviewTags: ["Idempotent Webhook Cache", "Hashing"], year: "2025-2026", source: "Technical Round 1" },
      { problemId: "valid-parentheses", frequency: 5, interviewTags: ["Signature Validation", "Stack"], year: "2025-2026", source: "Core Coding" },
      { problemId: "two-sum", frequency: 4, interviewTags: ["Payment Split", "Hash Map"], year: "2024-2025", source: "Screening" }
    ]
  },
  {
    id: "tcs",
    name: "TCS",
    slug: "tcs",
    category: "Service Based",
    difficulty: "Easy-Medium",
    tier: "IT Services",
    description: "Focuses on fundamental math, string reversing, array manipulation, and basic searching in TCS NQT & Digital tracks.",
    frequentTopics: ["Arrays", "Strings", "Math", "Bit Manipulation"],
    problems: [
      { problemId: "reverse-string", frequency: 5, interviewTags: ["TCS NQT", "Strings"], year: "2025-2026", source: "Digital Assessment" },
      { problemId: "palindrome-number", frequency: 5, interviewTags: ["NQT Math", "Conditionals"], year: "2025-2026", source: "Technical Round" },
      { problemId: "single-number", frequency: 4, interviewTags: ["Ninja/Digital", "Arrays"], year: "2024-2025", source: "Digital Interview" }
    ]
  },
  {
    id: "infosys",
    name: "Infosys",
    slug: "infosys",
    category: "Service Based",
    difficulty: "Easy-Medium",
    tier: "IT Services",
    description: "Evaluates core programming logic, array operations, recursion, and string manipulation for InfyTQ & Specialist Programmer roles.",
    frequentTopics: ["Arrays", "Strings", "Math", "Dynamic Programming"],
    problems: [
      { problemId: "two-sum", frequency: 5, interviewTags: ["InfyTQ", "Hash Map"], year: "2025-2026", source: "SP Coding Assessment" },
      { problemId: "climbing-stairs", frequency: 5, interviewTags: ["Specialist Programmer", "DP"], year: "2025-2026", source: "DSE Round" },
      { problemId: "reverse-string", frequency: 4, interviewTags: ["Foundation", "Strings"], year: "2024-2025", source: "HR Technical" }
    ]
  },
  {
    id: "accenture",
    name: "Accenture",
    slug: "accenture",
    category: "Service Based",
    difficulty: "Easy-Medium",
    tier: "Global Consulting",
    description: "Assesses coding logic, Bit Manipulation, String operations, and Arrays in the Accenture Advanced Technical Assessment.",
    frequentTopics: ["Strings", "Bit Manipulation", "Arrays", "Math"],
    problems: [
      { problemId: "single-number", frequency: 5, interviewTags: ["Advanced Technical", "Bitwise"], year: "2025-2026", source: "Coding Assessment" },
      { problemId: "valid-parentheses", frequency: 5, interviewTags: ["Logic Round", "Stack"], year: "2025-2026", source: "Technical Interview" },
      { problemId: "palindrome-number", frequency: 4, interviewTags: ["Core Math", "Algorithms"], year: "2024-2025", source: "Campus Hiring" }
    ]
  },
  {
    id: "cognizant",
    name: "Cognizant",
    slug: "cognizant",
    category: "Service Based",
    difficulty: "Easy-Medium",
    tier: "IT Services",
    description: "GenC Next and Elevate tracks focus on Array manipulation, basic Dynamic Programming, and String parsing.",
    frequentTopics: ["Arrays", "Strings", "Math", "Hashing"],
    problems: [
      { problemId: "two-sum", frequency: 5, interviewTags: ["GenC Next", "Array Lookup"], year: "2025-2026", source: "GenC Elevate Assessment" },
      { problemId: "reverse-string", frequency: 5, interviewTags: ["GenC", "Strings"], year: "2025-2026", source: "Technical Round" },
      { problemId: "best-time-to-buy-and-sell-stock", frequency: 4, interviewTags: ["GenC Next", "Greedy"], year: "2024-2025", source: "Advanced Coding" }
    ]
  },
  {
    id: "netflix",
    name: "Netflix",
    slug: "netflix",
    category: "FAANG",
    difficulty: "Hard",
    tier: "Tier 1 FAANG",
    description: "Evaluates high-scale distributed data structures, chunking, concurrency, caching, and monotonic deques for Senior Engineers.",
    frequentTopics: ["Hashing", "Graphs", "Heap", "Sliding Window", "Trees"],
    problems: [
      { problemId: "cache-stampede", frequency: 5, interviewTags: ["Video Buffer Cache", "Concurrency"], year: "2025-2026", source: "Senior SWE Round" },
      { problemId: "merge-islands", frequency: 5, interviewTags: ["CDN Region Mesh", "Graphs"], year: "2025-2026", source: "Onsite Architecture" },
      { problemId: "binary-lift", frequency: 4, interviewTags: ["Hierarchy Tree", "Binary Lifting"], year: "2024-2025", source: "Technical Assessment" }
    ]
  }
];
