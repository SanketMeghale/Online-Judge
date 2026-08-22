import mongoose from "mongoose";
import { connectDatabase, isDatabaseConnected } from "../lib/db.js";
import { Company } from "../models/Company.js";
import { Problem } from "../models/Problem.js";
import { User } from "../models/User.js";
import { Submission } from "../models/Submission.js";
import { seedCompanies } from "../data/companies.seed.js";
import { problems as seedProblems } from "../data/problems.js";
import { findUserById } from "../lib/userStore.js";
import { listSubmissionRecords } from "../lib/submissionStore.js";
import { getAIProvider } from "./aiProvider.service.js";

/**
 * Ensures seed companies exist in MongoDB
 */
async function syncSeedCompanies() {
  if (!isDatabaseConnected()) return;
  try {
    for (const seed of seedCompanies) {
      await Company.updateOne(
        { id: seed.id },
        { $setOnInsert: seed },
        { upsert: true }
      ).catch(() => {});
    }
  } catch (err) {
    console.warn("[CompanyService] Seed sync warning:", err.message);
  }
}

/**
 * Fetch all companies with dynamic user progress
 */
export async function getAllCompaniesWithUserProgress(userId = null) {
  await connectDatabase();
  await syncSeedCompanies();

  let companies = seedCompanies;
  if (isDatabaseConnected()) {
    try {
      const dbCompanies = await Company.find({ isActive: true }).lean();
      if (dbCompanies && dbCompanies.length > 0) {
        companies = dbCompanies;
      }
    } catch (e) {
      console.warn("[CompanyService] DB fetch error, using seeds:", e.message);
    }
  }

  // If no user, return company cards with 0 progress
  if (!userId) {
    return companies.map((c) => ({
      ...c,
      totalProblems: c.problems?.length || 0,
      solvedCount: 0,
      attemptedCount: 0,
      completionPercentage: 0,
      accuracy: 0
    }));
  }

  const cleanUserId = String(userId);
  let userDoc = null;
  let userSubmissions = [];

  if (isDatabaseConnected()) {
    try {
      const isObjId = mongoose.Types.ObjectId.isValid(cleanUserId);
      const userQuery = isObjId ? { $or: [{ id: cleanUserId }, { _id: cleanUserId }] } : { id: cleanUserId };
      userDoc = await User.findOne(userQuery).lean();

      const subQuery = isObjId
        ? { $or: [{ userId: cleanUserId }, { userId: String(userDoc?._id || "") }, { user: cleanUserId }] }
        : { userId: cleanUserId };
      userSubmissions = await Submission.find(subQuery).lean();
    } catch (err) {
      console.warn("[CompanyService] User fetch DB warning:", err.message);
    }
  }

  if (!userDoc) {
    userDoc = await findUserById(cleanUserId);
  }

  if (!userSubmissions || userSubmissions.length === 0) {
    const memorySubs = await listSubmissionRecords();
    userSubmissions = memorySubs.filter(
      (s) => String(s.userId) === cleanUserId || String(s.user) === cleanUserId || String(s.userId) === String(userDoc?.id)
    );
  }

  const solvedSet = new Set(
    (userDoc?.solvedProblemIds || []).concat(
      userSubmissions.filter((s) => s.status === "ACCEPTED" || s.verdict === "ACCEPTED" || s.verdict === "AC").map((s) => s.problemId || s.problem)
    )
  );

  const attemptedSet = new Set(
    (userDoc?.attemptedProblemIds || []).concat(userSubmissions.map((s) => s.problemId || s.problem))
  );

  return companies.map((comp) => {
    const compProblemIds = (comp.problems || []).map((p) => p.problemId);
    const totalProblems = compProblemIds.length;

    let solvedCount = 0;
    let attemptedCount = 0;

    for (const pid of compProblemIds) {
      if (solvedSet.has(pid)) solvedCount++;
      else if (attemptedSet.has(pid)) attemptedCount++;
    }

    const companySubs = userSubmissions.filter((s) => compProblemIds.includes(s.problemId || s.problem));
    const acSubs = companySubs.filter((s) => s.status === "ACCEPTED" || s.verdict === "ACCEPTED" || s.verdict === "AC").length;
    const accuracy = companySubs.length > 0 ? Math.round((acSubs / companySubs.length) * 100) : 0;
    const completionPercentage = totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

    return {
      ...comp,
      totalProblems,
      solvedCount,
      attemptedCount,
      completionPercentage,
      accuracy
    };
  });
}

/**
 * Fetch detailed company preparation sheet with topics, problem list, readiness, and roadmap
 */
export async function getCompanyDetailSheet(companyIdOrSlug, userId = null) {
  await connectDatabase();
  await syncSeedCompanies();

  const target = String(companyIdOrSlug || "").toLowerCase().trim();
  let company = seedCompanies.find((c) => c.id === target || c.slug === target);

  if (isDatabaseConnected()) {
    try {
      const dbComp = await Company.findOne({
        $or: [{ id: target }, { slug: target }, { name: new RegExp(`^${target}$`, "i") }]
      }).lean();
      if (dbComp) company = dbComp;
    } catch (e) {
      console.warn("[CompanyService] DB query error:", e.message);
    }
  }

  if (!company) {
    company = seedCompanies[0]; // Default to Google
  }

  // Fetch full problem metadata catalog
  let allProblems = seedProblems;
  if (isDatabaseConnected()) {
    try {
      const dbProbs = await Problem.find().lean();
      if (dbProbs && dbProbs.length > 0) allProblems = dbProbs;
    } catch (e) {}
  }
  const problemMap = new Map(allProblems.map((p) => [p.id, p]));

  // Fetch user data & submissions
  const cleanUserId = String(userId || "");
  let userDoc = null;
  let userSubmissions = [];

  if (cleanUserId && isDatabaseConnected()) {
    try {
      const isObjId = mongoose.Types.ObjectId.isValid(cleanUserId);
      const userQuery = isObjId ? { $or: [{ id: cleanUserId }, { _id: cleanUserId }] } : { id: cleanUserId };
      userDoc = await User.findOne(userQuery).lean();

      const subQuery = isObjId
        ? { $or: [{ userId: cleanUserId }, { userId: String(userDoc?._id || "") }, { user: cleanUserId }] }
        : { userId: cleanUserId };
      userSubmissions = await Submission.find(subQuery).sort({ createdAt: -1 }).lean();
    } catch (err) {}
  }

  if (cleanUserId && !userDoc) {
    userDoc = await findUserById(cleanUserId);
  }

  if (cleanUserId && (!userSubmissions || userSubmissions.length === 0)) {
    const memorySubs = await listSubmissionRecords();
    userSubmissions = memorySubs.filter(
      (s) => String(s.userId) === cleanUserId || String(s.user) === cleanUserId || String(s.userId) === String(userDoc?.id)
    );
  }

  const solvedSet = new Set(
    (userDoc?.solvedProblemIds || []).concat(
      userSubmissions.filter((s) => s.status === "ACCEPTED" || s.verdict === "ACCEPTED" || s.verdict === "AC").map((s) => s.problemId || s.problem)
    )
  );

  const attemptedSet = new Set(
    (userDoc?.attemptedProblemIds || []).concat(userSubmissions.map((s) => s.problemId || s.problem))
  );

  // Group latest submission per problem for lastAttempt & verdict
  const lastSubMap = new Map();
  for (const s of userSubmissions) {
    const pid = s.problemId || s.problem;
    if (!lastSubMap.has(pid)) {
      lastSubMap.set(pid, s);
    }
  }

  // 1. Build Problem List Table Data
  const compProblems = company.problems || [];
  const problemList = [];
  const topicStats = {}; // { [topic]: { total: 0, solved: 0, subs: 0, acSubs: 0, frequency: "High" } }

  let easyTotal = 0, easySolved = 0;
  let mediumTotal = 0, mediumSolved = 0;
  let hardTotal = 0, hardSolved = 0;

  for (const cp of compProblems) {
    const meta = problemMap.get(cp.problemId) || {
      id: cp.problemId,
      title: cp.problemId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      difficulty: "Medium",
      topic: "Arrays",
      acceptance: 75,
      points: 10
    };

    const isSolved = solvedSet.has(cp.problemId);
    const isAttempted = attemptedSet.has(cp.problemId);
    const status = isSolved ? "Solved" : isAttempted ? "Attempted" : "Not Started";
    const lastSub = lastSubMap.get(cp.problemId);

    const diff = (meta.difficulty || "Medium").toLowerCase();
    if (diff === "easy") {
      easyTotal++;
      if (isSolved) easySolved++;
    } else if (diff === "hard") {
      hardTotal++;
      if (isSolved) hardSolved++;
    } else {
      mediumTotal++;
      if (isSolved) mediumSolved++;
    }

    const topic = meta.topic || meta.category || "General";
    if (!topicStats[topic]) {
      topicStats[topic] = {
        topic,
        total: 0,
        solved: 0,
        subs: 0,
        acSubs: 0,
        frequencyScore: 0
      };
    }
    topicStats[topic].total++;
    topicStats[topic].frequencyScore += cp.frequency || 4;
    if (isSolved) topicStats[topic].solved++;

    const probSubs = userSubmissions.filter((s) => (s.problemId || s.problem) === cp.problemId);
    topicStats[topic].subs += probSubs.length;
    topicStats[topic].acSubs += probSubs.filter((s) => s.status === "ACCEPTED" || s.verdict === "ACCEPTED" || s.verdict === "AC").length;

    problemList.push({
      id: cp.problemId,
      title: meta.title,
      difficulty: meta.difficulty || "Medium",
      topic,
      companyFrequency: cp.frequency || 5,
      status,
      lastAttempt: lastSub ? lastSub.createdAt || lastSub.submittedAt : null,
      interviewTags: cp.interviewTags || ["Technical Round"],
      source: cp.source || "Onsite Interview",
      year: cp.year || "2025-2026",
      acceptance: meta.acceptance || 75,
      points: meta.points || 10
    });
  }

  // 2. Build Topic Breakdown
  const topicBreakdown = Object.values(topicStats).map((t) => {
    const avgFreq = t.total > 0 ? t.frequencyScore / t.total : 4;
    const frequency = avgFreq >= 4.5 ? "Very High" : avgFreq >= 3.5 ? "High" : "Medium";
    const accuracy = t.subs > 0 ? Math.round((t.acSubs / t.subs) * 100) : 0;
    const progressPercent = t.total > 0 ? Math.round((t.solved / t.total) * 100) : 0;

    return {
      topicName: t.topic,
      frequency,
      problemsAvailable: t.total,
      userSolved: t.solved,
      accuracy,
      progressPercent
    };
  }).sort((a, b) => b.problemsAvailable - a.problemsAvailable);

  // 3. Top Stats
  const totalProblems = compProblems.length;
  const solvedCount = problemList.filter((p) => p.status === "Solved").length;
  const attemptedCount = problemList.filter((p) => p.status === "Attempted").length;
  const compSubmissions = userSubmissions.filter((s) => compProblems.some((cp) => cp.problemId === (s.problemId || s.problem)));
  const compAcCount = compSubmissions.filter((s) => s.status === "ACCEPTED" || s.verdict === "ACCEPTED" || s.verdict === "AC").length;
  const accuracy = compSubmissions.length > 0 ? Math.round((compAcCount / compSubmissions.length) * 100) : 0;
  const completionPercentage = totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

  // 4. Personalized Company Readiness Score (0-100)
  let readinessScore = 0;
  if (totalProblems > 0) {
    const solveWeight = (solvedCount / totalProblems) * 55;
    const accuracyWeight = (accuracy / 100) * 25;
    const depthWeight = Math.min(20, (mediumSolved * 2.0 + hardSolved * 4.0) * 2);
    readinessScore = Math.min(100, Math.max(0, Math.round(solveWeight + accuracyWeight + depthWeight)));
  }

  const strongTopics = [];
  const weakTopics = [];
  const recommendedNext = [];

  for (const t of topicBreakdown) {
    if (t.progressPercent >= 60 || (t.userSolved >= 2 && t.accuracy >= 75)) {
      strongTopics.push(t.topicName);
    } else if (t.userSolved === 0 || t.accuracy < 60) {
      weakTopics.push(t.topicName);
      if (recommendedNext.length < 3) {
        recommendedNext.push(`Practice ${t.topicName}`);
      }
    }
  }

  if (recommendedNext.length === 0) {
    recommendedNext.push(`Practice ${company.name} Hard Algorithmic Challenges`);
    recommendedNext.push(`Conduct a Mock ${company.name} Interview Round`);
  }

  // 5. Dynamic Preparation Roadmap
  const standardRoadmapSteps = [
    { step: 1, topic: "Arrays", description: "Array lookups, prefix sums, and two-pointer sweeps." },
    { step: 2, topic: "Hashing", description: "O(1) dictionary state tracking and cache invariants." },
    { step: 3, topic: "Strings", description: "Sliding window substrings, string parsing, and anagrams." },
    { step: 4, topic: "Trees", description: "Binary trees, lowest common ancestors, and recursion." },
    { step: 5, topic: "Graphs", description: "Multi-source BFS, Dijkstra shortest paths, and cycles." },
    { step: 6, topic: "Dynamic Programming", description: "State transitions, memoization, and optimal substructure." }
  ];

  let unlockedPrev = true;
  const preparationRoadmap = standardRoadmapSteps.map((s) => {
    const stat = topicStats[s.topic];
    const solved = stat?.solved || 0;
    const total = stat?.total || 1;
    const isMastered = solved >= Math.max(1, Math.floor(total * 0.6));

    let status = "Locked";
    if (isMastered) {
      status = "Mastered";
    } else if (unlockedPrev) {
      status = "In Progress";
      unlockedPrev = false; // Next ones locked until this is mastered or previous is ready
    } else {
      status = "Locked";
    }

    return {
      ...s,
      status,
      solvedCount: solved,
      totalCount: total
    };
  });

  return {
    success: true,
    company: {
      id: company.id,
      name: company.name,
      slug: company.slug,
      logo: company.logo || "",
      category: company.category,
      difficulty: company.difficulty,
      description: company.description,
      tier: company.tier,
      frequentTopics: company.frequentTopics || []
    },
    stats: {
      totalProblems,
      solvedCount,
      attemptedCount,
      accuracy,
      completionPercentage,
      difficultyProgress: {
        easy: { solved: easySolved, total: easyTotal },
        medium: { solved: mediumSolved, total: mediumTotal },
        hard: { solved: hardSolved, total: hardTotal }
      }
    },
    readiness: {
      score: readinessScore,
      strongTopics: strongTopics.slice(0, 4),
      weakTopics: weakTopics.slice(0, 4),
      recommendedNext
    },
    topicBreakdown,
    problemList,
    preparationRoadmap,
    timestamp: new Date().toISOString()
  };
}

/**
 * Company-Tailored AI Mentor Chat
 */
export async function chatWithCompanyAI(companyIdOrSlug, userId, message, context = {}) {
  const sheetData = await getCompanyDetailSheet(companyIdOrSlug, userId);
  const company = sheetData.company;
  const stats = sheetData.stats;
  const readiness = sheetData.readiness;

  const aiProvider = getAIProvider();
  const systemPrompt = `You are a Senior Principal Interviewer and Staff Bar Raiser at ${company.name}.
You are coaching a candidate preparing specifically for the ${company.name} Technical Software Engineering Interview.

Candidate Real Profile for ${company.name}:
- Company: ${company.name} (${company.category} - ${company.difficulty} Interview Bar)
- Problems Solved: ${stats.solvedCount} / ${stats.totalProblems} (${stats.completionPercentage}% Complete)
- Accuracy on ${company.name} Problems: ${stats.accuracy}%
- Candidate Readiness Score: ${readiness.score}/100
- Strong Topics: ${readiness.strongTopics.join(", ") || "Initial stage"}
- Weak / Priority Topics: ${readiness.weakTopics.join(", ") || "None"}

Instructions:
1. Provide concrete, highly tailored guidance matching ${company.name}'s actual interview criteria.
2. Directly reference their solved problem count, accuracy, and weak topics.
3. If they ask for a preparation plan, provide a structured day-by-day roadmap targeting their specific weak topics.
4. Format with crisp Markdown, bold emphasis (**like this**), bullet points, and code snippets where relevant.`;

  const messages = [
    ...(context.history || []).map((h) => ({ role: h.role, content: h.content })),
    { role: "user", content: message }
  ];

  try {
    const reply = await aiProvider.generateCompletion({
      systemPrompt,
      messages,
      temperature: 0.5,
      maxTokens: 4096
    });
    return {
      success: true,
      reply,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.warn("[CompanyService] AI Provider fallback:", err.message);
    let fallbackReply = `### 🎯 ${company.name} Interview Preparation Guidance\n\nBased on your current progress (**${stats.solvedCount}/${stats.totalProblems} solved** with **${stats.accuracy}% accuracy** and a **${readiness.score}/100 readiness score**):\n\n- **Immediate Priority:** Focus on **${readiness.weakTopics[0] || "Dynamic Programming & Graphs"}** which are heavily weighted in ${company.name} Onsite rounds.\n- **Recommended Next Step:** ${readiness.recommendedNext[0] || "Practice Medium & Hard challenges"}.\n- **Interview Strategy:** Always state your time and space complexity upfront before typing code.`;
    return {
      success: true,
      reply: fallbackReply,
      timestamp: new Date().toISOString()
    };
  }
}
